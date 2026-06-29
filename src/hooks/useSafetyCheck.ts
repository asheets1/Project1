import { useMemo } from 'react';
import type { UserProfile, SafetyWarning, BodyweightExercise, MachineExercise } from '../types';
import { SAFETY_THRESHOLDS, UNDERAGE_SAFETY_MESSAGES } from '../utils/constants';

export function useSafetyCheck(
  userProfile: UserProfile | null,
  workouts: (BodyweightExercise | MachineExercise)[],
  dailyCalorieDeficit: number
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

      // Check for excessive volume
      const todayWorkouts = workouts.filter(
        w => new Date(w.date).toDateString() === new Date().toDateString()
      );
      const heavySets = todayWorkouts.reduce((sum, w) => {
        const isHeavy =
          ('load' in w && w.load > userProfile.weight * 1.5) ||
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

      // Check caloric deficit
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
      hasUnderageWarning: warnings.some(w => w.type === 'age'),
    };
  }, [userProfile, workouts, dailyCalorieDeficit]);
}
