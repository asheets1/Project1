import { useMemo } from 'react';
import type {
  UserProfile,
  SafetyWarning,
  BodyweightExercise,
  MachineExercise,
  CardioSession,
} from '../types';
import { SAFETY_THRESHOLDS, UNDERAGE_SAFETY_MESSAGES } from '../utils/constants';
import { calculateCardioExertion } from '../utils/calculations';
import { strengthLoad } from '../utils/recovery';

export function useSafetyCheck(
  userProfile: UserProfile | null,
  workouts: (BodyweightExercise | MachineExercise)[],
  dailyCalorieDeficit: number,
  cardioSessions: CardioSession[] = []
) {
  return useMemo(() => {
    const warnings: SafetyWarning[] = [];

    if (!userProfile) {
      return {
        isSafetyMode: false,
        warnings,
        hasUnderageWarning: false,
      };
    }

    const isUnderage = userProfile.age < SAFETY_THRESHOLDS.UNDERAGE_LIMIT;

    if (isUnderage) {
      warnings.push({
        id: 'age-warning',
        type: 'age',
        message: UNDERAGE_SAFETY_MESSAGES.age,
        severity: 'warning',
      });

      const isToday = (dateStr: string) =>
        new Date(dateStr).toDateString() === new Date().toDateString();

      // Heavy-volume check: heavy strength sets relative to bodyweight, or
      // advanced bodyweight progressions.
      const todayWorkouts = workouts.filter((w) => isToday(w.date));
      const heavySets = todayWorkouts.reduce((sum, w) => {
        const isHeavy =
          ('weight' in w && w.weight > userProfile.weight * 1.5) ||
          ('difficulty' in w && w.difficulty === 'advanced');
        return sum + (isHeavy ? w.sets : 0);
      }, 0);

      if (heavySets > SAFETY_THRESHOLDS.MAX_HEAVY_SETS_PER_MUSCLE) {
        warnings.push({
          id: 'volume-warning',
          type: 'volume',
          message: UNDERAGE_SAFETY_MESSAGES.volume,
          severity: 'warning',
        });
      }

      // Over-exertion check: total training load today (cardio TRIMP + strength)
      // or any single very-hard cardio session.
      const todayCardio = cardioSessions.filter((s) => isToday(s.date));
      const cardioLoad = todayCardio.reduce(
        (sum, s) => sum + calculateCardioExertion(s, userProfile).trimp,
        0
      );
      const strengthLoadTotal = todayWorkouts.reduce(
        (sum, w) => ('weight' in w ? sum + strengthLoad(w as MachineExercise, userProfile) : sum),
        0
      );
      const hasSevereCardio = todayCardio.some(
        (s) => calculateCardioExertion(s, userProfile).trimp >
          SAFETY_THRESHOLDS.MAX_SESSION_TRIMP_UNDERAGE
      );

      if (
        hasSevereCardio ||
        cardioLoad + strengthLoadTotal > SAFETY_THRESHOLDS.MAX_DAILY_LOAD_UNDERAGE
      ) {
        warnings.push({
          id: 'exertion-warning',
          type: 'exertion',
          message: UNDERAGE_SAFETY_MESSAGES.exertion,
          severity: 'critical',
        });
      }

      // Caloric deficit check.
      if (dailyCalorieDeficit > SAFETY_THRESHOLDS.MAX_CALORIC_DEFICIT_UNDERAGE) {
        warnings.push({
          id: 'deficit-warning',
          type: 'deficit',
          message: UNDERAGE_SAFETY_MESSAGES.deficit,
          severity: 'critical',
        });
      }
    }

    return {
      isSafetyMode: isUnderage,
      warnings,
      hasUnderageWarning: warnings.some((w) => w.type === 'age'),
    };
  }, [userProfile, workouts, dailyCalorieDeficit, cardioSessions]);
}
