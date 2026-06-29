import type { BMRTDEEData, HealthGoal, UnitSystem } from '../types';
import { ACTIVITY_MULTIPLIERS, HEALTH_GOALS } from './constants';

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

export const calculateMacroTargets = (
  tdee: number,
  goal: HealthGoal
): { protein: number; carbs: number; fat: number } => {
  switch (goal) {
    case 'strength':
      return {
        protein: Math.round(tdee * 0.3), // 30% protein
        carbs: Math.round(tdee * 0.45), // 45% carbs
        fat: Math.round(tdee * 0.25), // 25% fat
      };
    case 'hypertrophy':
      return {
        protein: Math.round(tdee * 0.35), // 35% protein
        carbs: Math.round(tdee * 0.45), // 45% carbs
        fat: Math.round(tdee * 0.2), // 20% fat
      };
    case 'endurance':
      return {
        protein: Math.round(tdee * 0.25), // 25% protein
        carbs: Math.round(tdee * 0.6), // 60% carbs
        fat: Math.round(tdee * 0.15), // 15% fat
      };
    case 'crosstraining':
      return {
        protein: Math.round(tdee * 0.28), // 28% protein
        carbs: Math.round(tdee * 0.5), // 50% carbs
        fat: Math.round(tdee * 0.22), // 22% fat
      };
    default:
      return {
        protein: Math.round(tdee * 0.3),
        carbs: Math.round(tdee * 0.45),
        fat: Math.round(tdee * 0.25),
      };
  }
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
