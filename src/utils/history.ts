import type {
  BodyweightExercise,
  CardioSession,
  CrossTrainingSession,
  DayActivity,
  ExerciseDifficulty,
  MachineExercise,
  Meal,
  UserProfile,
} from '../types';
import { calculateCardioExertion } from './calculations';
import { strengthLoad } from './recovery';
import { REST_DAY_LOAD_THRESHOLD } from './constants';

/** Local YYYY-MM-DD for a Date (avoids UTC off-by-one from toISOString). */
export const toDateKey = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

/** Shift a YYYY-MM-DD key by a number of days. */
export const addDays = (dateKey: string, delta: number): string => {
  const [y, m, d] = dateKey.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + delta);
  return toDateKey(dt);
};

const DIFFICULTY_FACTOR: Record<ExerciseDifficulty, number> = {
  beginner: 2,
  intermediate: 3,
  advanced: 5,
};

/** Rough training-load proxy for a bodyweight set entry. */
export const bodyweightLoad = (e: BodyweightExercise): number =>
  Math.round(e.sets * (DIFFICULTY_FACTOR[e.difficulty] ?? 3));

/** Rough training-load proxy for a cross-training session (duration-based). */
export const crossTrainingLoad = (s: CrossTrainingSession): number =>
  Math.round((s.totalDuration || 0) * 0.5);

export interface WorkoutData {
  cardio: CardioSession[];
  machine: MachineExercise[];
  bodyweight: BodyweightExercise[];
  cross: CrossTrainingSession[];
  meals: Meal[];
}

/**
 * Aggregate all logged data into a per-day activity map, then flag recommended
 * rest days. A day is a recommended rest day when the training load over the
 * previous two days meets/exceeds the rest threshold — i.e. you've accumulated
 * enough fatigue that resting is advised.
 */
export const buildDayActivityMap = (
  data: WorkoutData,
  profile: UserProfile | null
): Record<string, DayActivity> => {
  const map: Record<string, DayActivity> = {};

  const ensure = (date: string): DayActivity => {
    if (!map[date]) {
      map[date] = {
        date,
        cardioCount: 0,
        strengthCount: 0,
        bodyweightCount: 0,
        crossCount: 0,
        mealCount: 0,
        load: 0,
        restRecommended: false,
        hasActivity: false,
      };
    }
    return map[date];
  };

  for (const s of data.cardio) {
    const day = ensure(s.date);
    day.cardioCount += 1;
    day.load += calculateCardioExertion(s, profile).trimp;
  }
  for (const e of data.machine) {
    const day = ensure(e.date);
    day.strengthCount += 1;
    day.load += strengthLoad(e, profile);
  }
  for (const e of data.bodyweight) {
    const day = ensure(e.date);
    day.bodyweightCount += 1;
    day.load += bodyweightLoad(e);
  }
  for (const s of data.cross) {
    const day = ensure(s.date);
    day.crossCount += 1;
    day.load += crossTrainingLoad(s);
  }
  for (const m of data.meals) {
    ensure(m.date).mealCount += 1;
  }

  // Finalise flags now that loads are summed.
  for (const date of Object.keys(map)) {
    const day = map[date];
    day.load = Math.round(day.load);
    day.hasActivity =
      day.cardioCount + day.strengthCount + day.bodyweightCount + day.crossCount + day.mealCount > 0;
  }

  // Rest-day recommendation depends on the two preceding days' load.
  for (const date of Object.keys(map)) {
    map[date].restRecommended = isRestRecommended(map, date);
  }

  return map;
};

/**
 * Whether a date should be a recommended rest day, based on the training load
 * of the two preceding calendar days. Works for any date (even one absent from
 * the map), so the calendar can flag empty future/past days too.
 */
export const isRestRecommended = (
  map: Record<string, DayActivity>,
  dateKey: string
): boolean => {
  const prev1 = map[addDays(dateKey, -1)]?.load ?? 0;
  const prev2 = map[addDays(dateKey, -2)]?.load ?? 0;
  return prev1 + prev2 >= REST_DAY_LOAD_THRESHOLD;
};

/** Empty-but-valid activity record for a day with nothing logged. */
export const emptyDayActivity = (date: string): DayActivity => ({
  date,
  cardioCount: 0,
  strengthCount: 0,
  bodyweightCount: 0,
  crossCount: 0,
  mealCount: 0,
  load: 0,
  restRecommended: false,
  hasActivity: false,
});

/** Build the matrix of weeks (each a row of 7 date keys) covering a month. */
export const buildMonthGrid = (year: number, month: number): string[][] => {
  const first = new Date(year, month, 1);
  // Start grid on the Sunday on/before the 1st.
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());

  const weeks: string[][] = [];
  const cursor = new Date(start);
  for (let w = 0; w < 6; w++) {
    const week: string[] = [];
    for (let d = 0; d < 7; d++) {
      week.push(toDateKey(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
    // Stop early if the next week starts in a later month and we've passed it.
    if (cursor.getMonth() !== month && cursor > new Date(year, month + 1, 0)) break;
  }
  return weeks;
};
