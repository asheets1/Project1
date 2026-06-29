export type HealthGoal = 'strength' | 'endurance' | 'hypertrophy' | 'crosstraining';
export type UnitSystem = 'metric' | 'imperial';
export type ExerciseDifficulty = 'beginner' | 'intermediate' | 'advanced';

export interface UserProfile {
  age: number;
  weight: number;
  height: number;
  goal: HealthGoal;
  unitSystem: UnitSystem;
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
  name: string;
  reps: number;
  sets: number;
  difficulty: ExerciseDifficulty;
  notes?: string;
}

export interface MachineExercise {
  id: string;
  date: string;
  machineName: string;
  load: number;
  reps: number;
  sets: number;
  duration: number;
  notes?: string;
}

export interface CardioSession {
  id: string;
  date: string;
  type: 'running' | 'cycling';
  distance: number;
  duration: number;
  pace?: number;
  cadence?: number;
  heartRate?: number;
  notes?: string;
}

export interface CrossTrainingSession {
  id: string;
  date: string;
  name: string;
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
  type: 'age' | 'volume' | 'rest' | 'deficit';
  message: string;
  severity: 'warning' | 'critical';
}

export interface RecoverySession {
  id: string;
  date: string;
  type: 'hypertrophy' | 'strength' | 'cardio' | 'rest';
  duration: number;
  startTime: string;
}
