import type { MuscleGroup } from '../types';

export const SAFETY_THRESHOLDS = {
  UNDERAGE_LIMIT: 18,
  MAX_HEAVY_SETS_PER_MUSCLE: 5,
  MIN_REST_BETWEEN_HEAVY_SETS_MS: 120000, // 2 minutes
  MIN_REST_BETWEEN_SETS_MS: 60000, // 1 minute
  MAX_CALORIC_DEFICIT_UNDERAGE: 500,
  MAX_CALORIC_DEFICIT_ADULT: 1000,
  MIN_DAILY_CALORIES: 1200,
  MIN_DAILY_CALORIES_UNDERAGE: 1500,
  // A cardio TRIMP above this in a single session is flagged as over-exertion
  // for developing (under-18) athletes.
  MAX_SESSION_TRIMP_UNDERAGE: 120,
  // Total daily training load above this triggers a general over-exertion alert.
  MAX_DAILY_LOAD_UNDERAGE: 180,
};

/**
 * If the training load accumulated over the two days *before* a given day meets
 * or exceeds this, that day is flagged on the calendar as a recommended rest day.
 */
export const REST_DAY_LOAD_THRESHOLD = 150;

export const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  veryActive: 1.9,
};

export const HEALTH_GOALS = [
  { value: 'strength', label: 'Strength Training', activityMultiplier: 'active' },
  { value: 'endurance', label: 'Endurance Training', activityMultiplier: 'veryActive' },
  { value: 'hypertrophy', label: 'Muscle Gain', activityMultiplier: 'active' },
  { value: 'crosstraining', label: 'Cross-Training', activityMultiplier: 'veryActive' },
];

/** Selectable muscle groups for strength/machine logging, with display labels. */
export const MUSCLE_GROUPS: { value: MuscleGroup; label: string }[] = [
  { value: 'chest', label: 'Chest' },
  { value: 'back', label: 'Back' },
  { value: 'shoulders', label: 'Shoulders' },
  { value: 'biceps', label: 'Biceps' },
  { value: 'triceps', label: 'Triceps' },
  { value: 'legs', label: 'Legs' },
  { value: 'glutes', label: 'Glutes' },
  { value: 'core', label: 'Core' },
  { value: 'calves', label: 'Calves' },
  { value: 'forearms', label: 'Forearms' },
];

/**
 * Baseline recovery time (hours) for a moderate-volume session per muscle group.
 * Larger muscle groups need longer; small stabilisers bounce back faster.
 * Scaled up/down by the session's relative volume.
 */
export const MUSCLE_RECOVERY_BASE_HOURS: Record<MuscleGroup, number> = {
  legs: 72,
  back: 72,
  glutes: 72,
  chest: 48,
  shoulders: 48,
  biceps: 48,
  triceps: 48,
  core: 24,
  calves: 24,
  forearms: 24,
};

/**
 * Maps a cardio TRIMP score to recommended whole-body recovery (hours).
 * Ordered high → low; first matching threshold wins.
 */
export const TRIMP_RECOVERY_TIERS: {
  minTrimp: number;
  level: 'severe' | 'very_hard' | 'hard' | 'moderate' | 'light';
  recoveryHours: number;
}[] = [
  { minTrimp: 150, level: 'severe', recoveryHours: 72 },
  { minTrimp: 100, level: 'very_hard', recoveryHours: 48 },
  { minTrimp: 60, level: 'hard', recoveryHours: 36 },
  { minTrimp: 30, level: 'moderate', recoveryHours: 24 },
  { minTrimp: 0, level: 'light', recoveryHours: 12 },
];

export const STORAGE_KEYS = {
  USER_PROFILE: 'wp_user_profile',
  BODYWEIGHT_EXERCISES: 'wp_bodyweight_exercises',
  MACHINE_EXERCISES: 'wp_machine_exercises',
  CARDIO_SESSIONS: 'wp_cardio_sessions',
  CROSS_TRAINING: 'wp_cross_training',
  MEALS: 'wp_meals',
  THEME: 'wp_theme',
  SAFETY_WARNINGS: 'wp_safety_warnings',
};

export const UNDERAGE_SAFETY_MESSAGES = {
  age: 'You are under 18. Fitness recommendations have been adjusted for your safety and development.',
  volume: 'Warning: High exercise volume detected. Ensure adequate recovery for your developing body.',
  rest: 'Critical: Insufficient rest detected. Young athletes require more recovery between heavy sessions (allow full muscle recovery before re-training).',
  deficit: 'Warning: Significant caloric deficit. Do not exceed 500 calories below TDEE during development.',
  exertion: 'Critical: Over-exertion detected. This training load is too high for a developing body — reduce intensity and prioritise rest.',
};
