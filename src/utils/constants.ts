export const SAFETY_THRESHOLDS = {
  UNDERAGE_LIMIT: 18,
  MAX_HEAVY_SETS_PER_MUSCLE: 5,
  MIN_REST_BETWEEN_HEAVY_SETS_MS: 120000, // 2 minutes
  MIN_REST_BETWEEN_SETS_MS: 60000, // 1 minute
  MAX_CALORIC_DEFICIT_UNDERAGE: 500,
  MAX_CALORIC_DEFICIT_ADULT: 1000,
  MIN_DAILY_CALORIES: 1200,
  MIN_DAILY_CALORIES_UNDERAGE: 1500,
};

export const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  veryActive: 1.9,
};

export const RECOVERY_TIMER_PRESETS = {
  hypertrophy: { min: 60, max: 90, label: 'Hypertrophy Rest' },
  strength: { min: 180, max: 300, label: 'Strength Rest' },
  cardio: { min: 300, max: 600, label: 'Cardio Recovery' },
  restDay: { min: 1800, max: 3600, label: 'Rest Day' },
};

export const HEALTH_GOALS = [
  { value: 'strength', label: 'Strength Training', activityMultiplier: 'active' },
  { value: 'endurance', label: 'Endurance Training', activityMultiplier: 'veryActive' },
  { value: 'hypertrophy', label: 'Muscle Gain', activityMultiplier: 'active' },
  { value: 'crosstraining', label: 'Cross-Training', activityMultiplier: 'veryActive' },
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
  rest: 'Critical: Insufficient rest detected. Young athletes require more recovery between heavy sets (minimum 2-3 minutes).',
  deficit: 'Warning: Significant caloric deficit. Do not exceed 500 calories below TDEE during development.',
};
