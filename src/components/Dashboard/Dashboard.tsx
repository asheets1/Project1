import React, { useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useWorkoutContext } from '../../context/WorkoutContext';
import { useDietContext } from '../../context/DietContext';
import { Dumbbell, Apple, Zap, AlertTriangle, HeartPulse } from 'lucide-react';
import { SafetyWarnings } from '../UserProfile/SafetyWarnings';
import { useSafetyCheck } from '../../hooks/useSafetyCheck';
import { calculateBMR, calculateTDEE } from '../../utils/calculations';
import { computeReadiness } from '../../utils/recovery';

export const Dashboard: React.FC = () => {
  const { userProfile } = useAppContext();
  const { bodyweightExercises, machineExercises, cardioSessions } = useWorkoutContext();
  const { getDailyNutrition } = useDietContext();

  const today = new Date().toISOString().split('T')[0];

  const todayStats = useMemo(() => {
    const bodyweightCount = bodyweightExercises.filter((e) => e.date === today).length;
    const machineCount = machineExercises.filter((e) => e.date === today).length;
    const cardioCount = cardioSessions.filter((s) => s.date === today).length;
    const dailyNutrition = getDailyNutrition(today);

    return {
      bodyweightCount,
      machineCount,
      cardioCount,
      totalExercises: bodyweightCount + machineCount + cardioCount,
      calories: dailyNutrition.totalCalories,
      protein: dailyNutrition.totalProtein,
      carbs: dailyNutrition.totalCarbs,
      fat: dailyNutrition.totalFat,
    };
  }, [bodyweightExercises, machineExercises, cardioSessions, getDailyNutrition, today]);

  const tdeeData = useMemo(() => {
    if (!userProfile) return null;
    const bmr = calculateBMR(
      userProfile.age,
      userProfile.weight,
      userProfile.height,
      'male',
      userProfile.unitSystem
    );
    return calculateTDEE(bmr, userProfile.goal);
  }, [userProfile]);

  const safetyWarnings = useSafetyCheck(
    userProfile,
    [...bodyweightExercises, ...machineExercises],
    tdeeData ? tdeeData.tdee - todayStats.calories : 0,
    cardioSessions
  );

  const readiness = useMemo(
    () => computeReadiness(cardioSessions, machineExercises, userProfile),
    [cardioSessions, machineExercises, userProfile]
  );

  const readinessStyle = {
    ready: { dot: 'bg-green-500', text: 'text-green-600', label: 'Ready' },
    caution: { dot: 'bg-amber-500', text: 'text-amber-600', label: 'Caution' },
    rest: { dot: 'bg-red-500', text: 'text-red-600', label: 'Rest' },
  }[readiness.status];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Welcome, {userProfile ? 'Athlete' : 'Friend'}!</h1>
        <p className="text-text/60">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      {/* Safety Warnings */}
      {safetyWarnings.warnings.length > 0 && (
        <div>
          <SafetyWarnings warnings={safetyWarnings.warnings} />
        </div>
      )}

      {/* User Profile Status */}
      {!userProfile && (
        <div className="card p-6 border-2 border-primary/20 bg-primary/5">
          <div className="flex gap-4 items-start">
            <AlertTriangle className="text-primary flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-lg mb-1">Complete Your Profile</h3>
              <p className="text-text/60 mb-4">
                Set up your profile to get personalized nutrition and training recommendations.
              </p>
              <button className="btn-primary">Go to Profile</button>
            </div>
          </div>
        </div>
      )}

      {/* Today's Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Workouts</h3>
            <Dumbbell className="text-primary" />
          </div>
          <p className="text-4xl font-bold text-primary mb-2">{todayStats.totalExercises}</p>
          <div className="text-xs text-text/60 space-y-1">
            <p>Bodyweight: {todayStats.bodyweightCount}</p>
            <p>Machines: {todayStats.machineCount}</p>
            <p>Cardio: {todayStats.cardioCount}</p>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Calories</h3>
            <Apple className="text-secondary" />
          </div>
          <p className="text-4xl font-bold text-secondary mb-2">{todayStats.calories}</p>
          {tdeeData && <p className="text-xs text-text/60">Target: {tdeeData.tdee} cal</p>}
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Protein</h3>
            <Zap className="text-accent" />
          </div>
          <p className="text-4xl font-bold text-accent mb-2">{todayStats.protein}g</p>
          <p className="text-xs text-text/60">Essential amino acids</p>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Recovery</h3>
            <HeartPulse className="text-red-500" />
          </div>
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-2.5 h-2.5 rounded-full ${readinessStyle.dot}`} />
            <p className={`text-xl font-bold ${readinessStyle.text}`}>{readinessStyle.label}</p>
          </div>
          <p className="text-xs text-text/60">
            Rest ~{readiness.recommendedRestHours}h · load {readiness.recentLoad}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button className="card p-6 hover:shadow-md transition-shadow text-left">
          <Dumbbell size={32} className="text-primary mb-3" />
          <h3 className="font-semibold text-lg">Log Workout</h3>
          <p className="text-sm text-text/60">Track your exercises</p>
        </button>

        <button className="card p-6 hover:shadow-md transition-shadow text-left">
          <Apple size={32} className="text-secondary mb-3" />
          <h3 className="font-semibold text-lg">Log Meal</h3>
          <p className="text-sm text-text/60">Track your nutrition</p>
        </button>
      </div>

      {/* Profile Summary */}
      {userProfile && (
        <div className="card p-6">
          <h3 className="font-semibold text-lg mb-4">Your Profile</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-sm text-text/60">Age</p>
              <p className="text-2xl font-bold">{userProfile.age}</p>
            </div>
            <div>
              <p className="text-sm text-text/60">Weight</p>
              <p className="text-2xl font-bold">{userProfile.weight}</p>
            </div>
            <div>
              <p className="text-sm text-text/60">Height</p>
              <p className="text-2xl font-bold">{userProfile.height}</p>
            </div>
            <div>
              <p className="text-sm text-text/60">Goal</p>
              <p className="text-2xl font-bold capitalize">{userProfile.goal.split('training')[0]}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
