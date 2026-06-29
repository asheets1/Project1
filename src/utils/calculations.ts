import type {
  BMRTDEEData,
  CardioExertion,
  CardioSession,
  EffortLevel,
  HealthGoal,
  UnitSystem,
  UserProfile,
} from '../types';
import { ACTIVITY_MULTIPLIERS, HEALTH_GOALS, TRIMP_RECOVERY_TIERS } from './constants';

export const convertToMetric = (value: number, system: UnitSystem, type: 'weight' | 'height'): number => {
  if (system === 'metric') return value;
  if (type === 'weight') return value * 0.453592; // lbs to kg
  return value * 2.54; // inches to cm
};

export const convertFromMetric = (value: number, system: UnitSystem, type: 'weight' | 'height'): number => {
  if (system === 'metric') return value;
  if (type === 'weight') return value / 0.453592; // kg to lbs
  return value / 2.54; // cm to inches
};

export const calculateBMR = (
  age: number,
  weight: number,
  height: number,
  gender: 'male' | 'female' = 'male',
  unitSystem: UnitSystem = 'imperial'
): number => {
  const weightKg = convertToMetric(weight, unitSystem, 'weight');
  const heightCm = convertToMetric(height, unitSystem, 'height');

  // Mifflin-St Jeor formula
  if (gender === 'male') {
    return 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  } else {
    return 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  }
};

export const calculateTDEE = (
  bmr: number,
  goal: HealthGoal
): BMRTDEEData => {
  const goalConfig = HEALTH_GOALS.find(g => g.value === goal);
  const multiplierKey = goalConfig?.activityMultiplier || 'moderate';
  const activityMultiplier = ACTIVITY_MULTIPLIERS[multiplierKey as keyof typeof ACTIVITY_MULTIPLIERS];

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(bmr * activityMultiplier),
    activityMultiplier,
  };
};

// Atwater energy values — calories per gram of each macronutrient.
export const CALORIES_PER_GRAM = { protein: 4, carbs: 4, fat: 9 } as const;

// Share of total daily calories allocated to each macro, per goal.
// Each set sums to 1.0 (100% of calories).
const MACRO_SPLITS: Record<HealthGoal, { protein: number; carbs: number; fat: number }> = {
  strength: { protein: 0.3, carbs: 0.45, fat: 0.25 },
  hypertrophy: { protein: 0.35, carbs: 0.45, fat: 0.2 },
  endurance: { protein: 0.25, carbs: 0.6, fat: 0.15 },
  crosstraining: { protein: 0.28, carbs: 0.5, fat: 0.22 },
};

/**
 * Daily macro targets in GRAMS for a given calorie budget (TDEE) and goal.
 * Each macro's calorie share is converted to grams via its calories-per-gram
 * value (protein/carbs = 4, fat = 9) — not returned as raw calories.
 */
export const calculateMacroTargets = (
  tdee: number,
  goal: HealthGoal
): { protein: number; carbs: number; fat: number } => {
  const split = MACRO_SPLITS[goal] ?? MACRO_SPLITS.strength;
  return {
    protein: Math.round((tdee * split.protein) / CALORIES_PER_GRAM.protein),
    carbs: Math.round((tdee * split.carbs) / CALORIES_PER_GRAM.carbs),
    fat: Math.round((tdee * split.fat) / CALORIES_PER_GRAM.fat),
  };
};

export const calculateCalorieDeficit = (tdee: number, consumedCalories: number): number => {
  return tdee - consumedCalories;
};

export const calculatePace = (distance: number, duration: number): string => {
  if (distance <= 0) return '0:00';
  const totalSeconds = duration * 60;
  const secondsPerUnit = totalSeconds / distance;
  const minutes = Math.floor(secondsPerUnit / 60);
  const seconds = Math.round(secondsPerUnit % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export const calculateAverageSpeed = (distance: number, duration: number): number => {
  if (duration <= 0) return 0;
  return Math.round((distance / duration) * 60 * 100) / 100;
};

/**
 * Estimate maximum heart rate from age using the Tanaka formula
 * (208 − 0.7 × age), which is more accurate across ages than 220 − age.
 */
export const estimateMaxHR = (age: number): number => Math.round(208 - 0.7 * age);

/** Sensible default resting HR when the user hasn't entered one. */
export const DEFAULT_RESTING_HR = 65;

/**
 * Heart-rate-reserve fraction (Karvonen): how hard the session was relative to
 * the gap between resting and max HR. Clamped to 0-1.
 */
export const heartRateReserveFraction = (
  avgHR: number,
  restingHR: number,
  maxHR: number
): number => {
  const reserve = maxHR - restingHR;
  if (reserve <= 0) return 0;
  return Math.min(1, Math.max(0, (avgHR - restingHR) / reserve));
};

const effortLevelFromTrimp = (trimp: number): { level: EffortLevel; recoveryHours: number } => {
  const tier = TRIMP_RECOVERY_TIERS.find((t) => trimp >= t.minTrimp) ?? TRIMP_RECOVERY_TIERS[TRIMP_RECOVERY_TIERS.length - 1];
  return { level: tier.level, recoveryHours: tier.recoveryHours };
};

/**
 * Score a cardio session's exertion using a Banister TRIMP model driven by
 * heart-rate reserve, then bump it for elevation gain (climbing costs effort
 * that pace alone misses). Returns the training-impulse score, the matching
 * effort tier and the recommended whole-body recovery window.
 */
export const calculateCardioExertion = (
  session: CardioSession,
  profile: UserProfile | null
): CardioExertion => {
  const age = profile?.age ?? 30;
  const restingHR = profile?.restingHeartRate ?? DEFAULT_RESTING_HR;
  const maxHR = estimateMaxHR(age);

  const hrrFraction = heartRateReserveFraction(session.avgHeartRate || 0, restingHR, maxHR);

  // Banister TRIMP (male coefficients): duration × HRR × 0.64 × e^(1.92 × HRR)
  const baseTrimp = session.duration * hrrFraction * 0.64 * Math.exp(1.92 * hrrFraction);

  // Elevation adjustment: every 100 units (ft/m) of gain adds ~4% effort, capped at +40%.
  const elevationFactor = 1 + Math.min(0.4, (session.elevationGain || 0) / 100 * 0.04);

  const trimp = Math.round(baseTrimp * elevationFactor);
  const { level, recoveryHours } = effortLevelFromTrimp(trimp);

  return {
    trimp,
    hrrFraction,
    effortLevel: level,
    recoveryHours,
  };
};

/** Human-friendly label for an effort tier. */
export const effortLevelLabel = (level: EffortLevel): string => {
  switch (level) {
    case 'light':
      return 'Light';
    case 'moderate':
      return 'Moderate';
    case 'hard':
      return 'Hard';
    case 'very_hard':
      return 'Very Hard';
    case 'severe':
      return 'Severe';
  }
};
