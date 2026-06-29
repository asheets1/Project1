export const validateAge = (age: number): { valid: boolean; error?: string } => {
  if (age < 1 || age > 120) {
    return { valid: false, error: 'Age must be between 1 and 120' };
  }
  return { valid: true };
};

export const validateWeight = (weight: number): { valid: boolean; error?: string } => {
  if (weight < 20 || weight > 500) {
    return { valid: false, error: 'Weight must be between 20 and 500' };
  }
  return { valid: true };
};

export const validateHeight = (height: number): { valid: boolean; error?: string } => {
  if (height < 50 || height > 250) {
    return { valid: false, error: 'Height must be between 50cm and 250cm' };
  }
  return { valid: true };
};

export const validateExerciseReps = (reps: number): { valid: boolean; error?: string } => {
  if (reps < 1 || reps > 100) {
    return { valid: false, error: 'Reps must be between 1 and 100' };
  }
  return { valid: true };
};

export const validateExerciseSets = (sets: number): { valid: boolean; error?: string } => {
  if (sets < 1 || sets > 20) {
    return { valid: false, error: 'Sets must be between 1 and 20' };
  }
  return { valid: true };
};

export const validateLoad = (load: number): { valid: boolean; error?: string } => {
  if (load < 0 || load > 1000) {
    return { valid: false, error: 'Load must be between 0 and 1000' };
  }
  return { valid: true };
};

export const validateCalories = (calories: number): { valid: boolean; error?: string } => {
  if (calories < 0 || calories > 5000) {
    return { valid: false, error: 'Calories must be between 0 and 5000' };
  }
  return { valid: true };
};

export const validateMacro = (macro: number): { valid: boolean; error?: string } => {
  if (macro < 0 || macro > 500) {
    return { valid: false, error: 'Macro value must be between 0 and 500' };
  }
  return { valid: true };
};

export const validateDistance = (distance: number): { valid: boolean; error?: string } => {
  if (distance <= 0 || distance > 100) {
    return { valid: false, error: 'Distance must be between 0 and 100' };
  }
  return { valid: true };
};

export const validateDuration = (duration: number): { valid: boolean; error?: string } => {
  if (duration <= 0 || duration > 600) {
    return { valid: false, error: 'Duration must be between 0 and 600 minutes' };
  }
  return { valid: true };
};

export const validateRestingHeartRate = (hr: number): { valid: boolean; error?: string } => {
  if (hr < 30 || hr > 120) {
    return { valid: false, error: 'Resting heart rate must be between 30 and 120 bpm' };
  }
  return { valid: true };
};

export const validateAvgHeartRate = (hr: number): { valid: boolean; error?: string } => {
  if (hr < 40 || hr > 220) {
    return { valid: false, error: 'Average heart rate must be between 40 and 220 bpm' };
  }
  return { valid: true };
};

export const validateElevation = (elevation: number): { valid: boolean; error?: string } => {
  if (elevation < 0 || elevation > 30000) {
    return { valid: false, error: 'Elevation gain must be between 0 and 30000' };
  }
  return { valid: true };
};
