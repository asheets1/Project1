export type HealthGoal = 'strength' | 'endurance' | 'hypertrophy' | 'crosstraining';
export type UnitSystem = 'metric' | 'imperial';
export type ExerciseDifficulty = 'beginner' | 'intermediate' | 'advanced';

export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'legs'
  | 'glutes'
  | 'core'
  | 'calves'
  | 'forearms';

/** Effort tiers derived from a session's exertion score. */
export type EffortLevel = 'light' | 'moderate' | 'hard' | 'very_hard' | 'severe';

export interface UserProfile {
  age: number;
  weight: number;
  height: number;
  goal: HealthGoal;
  unitSystem: UnitSystem;
  /** Resting heart rate (bpm), used for Heart-Rate-Reserve exertion scoring. */
  restingHeartRate?: number;
  createdAt: string;
}

export interface BMRTDEEData {
  bmr: number;
  tdee: number;
  activityMultiplier: number;
}

export interface BodyweightExercise {
  id: string;
  date: string;
  /** Full ISO timestamp the entry was logged. */
  loggedAt?: string;
  name: string;
  reps: number;
  sets: number;
  difficulty: ExerciseDifficulty;
  notes?: string;
}

/**
 * Simplified strength entry: which muscle groups were worked, how many sets,
 * and how much weight. No reps/duration — exertion is derived from volume.
 */
export interface MachineExercise {
  id: string;
  date: string;
  /** Full ISO timestamp the entry was logged (for recovery countdowns). */
  loggedAt?: string;
  /** Optional free-text label (e.g. "Leg Press"). */
  machineName?: string;
  muscleGroups: MuscleGroup[];
  sets: number;
  /** Working weight in the user's unit system (lbs or kg). */
  weight: number;
  notes?: string;
}

/**
 * Simplified cardio entry: distance, time, average HR and elevation gain.
 * Effort / exertion and recommended recovery are computed from these plus
 * the user's profile (age + resting HR).
 */
export interface CardioSession {
  id: string;
  date: string;
  /** Full ISO timestamp the entry was logged (for recovery countdowns). */
  loggedAt?: string;
  type: 'running' | 'cycling';
  /** Distance in miles or km depending on unit system. */
  distance: number;
  /** Duration in minutes. */
  duration: number;
  /** Average heart rate in bpm. */
  avgHeartRate: number;
  /** Elevation gain in feet or metres depending on unit system. */
  elevationGain: number;
  notes?: string;
}

export interface CrossTrainingSession {
  id: string;
  date: string;
  /** Full ISO timestamp the entry was logged. */
  loggedAt?: string;
  name: string;
  /** Free-text description of exercises included in the session. */
  description?: string;
  exercises: (BodyweightExercise | MachineExercise | CardioSession)[];
  totalDuration: number;
  notes?: string;
}

export interface Meal {
  id: string;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foodName: string;
  quantity: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface DailyNutrition {
  date: string;
  meals: Meal[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

export interface SafetyWarning {
  id: string;
  type: 'age' | 'volume' | 'rest' | 'deficit' | 'exertion';
  message: string;
  severity: 'warning' | 'critical';
}

/** Result of scoring a single cardio session. */
export interface CardioExertion {
  /** Banister TRIMP-style training-impulse score. */
  trimp: number;
  /** Average HR expressed as a fraction (0-1) of heart-rate reserve. */
  hrrFraction: number;
  effortLevel: EffortLevel;
  /** Recommended whole-body recovery in hours before the next hard session. */
  recoveryHours: number;
}

/** Recovery state for a single muscle group. */
export interface MuscleRecovery {
  muscle: MuscleGroup;
  lastTrained: string;
  recoveryHours: number;
  /** ISO timestamp the muscle is estimated to be fully recovered. */
  readyAt: string;
  /** Percentage recovered right now (0-100). */
  percentRecovered: number;
  status: 'recovered' | 'recovering' | 'fatigued';
}

/** Aggregated training activity for a single calendar day. */
export interface DayActivity {
  date: string; // YYYY-MM-DD
  cardioCount: number;
  strengthCount: number;
  bodyweightCount: number;
  crossCount: number;
  mealCount: number;
  /** Total training load logged that day. */
  load: number;
  /** Whether accumulated fatigue makes this a recommended rest day. */
  restRecommended: boolean;
  hasActivity: boolean;
}

/** Aggregate, whole-body readiness recommendation. */
export interface ReadinessSummary {
  status: 'ready' | 'caution' | 'rest';
  /** Recommended rest before the next hard session, in hours. */
  recommendedRestHours: number;
  /** The same recommendation expressed in (rounded) days. */
  recommendedRestDays: number;
  /** Total recent training load driving the recommendation. */
  recentLoad: number;
  message: string;
}
