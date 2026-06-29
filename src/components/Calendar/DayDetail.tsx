import React from 'react';
import { useWorkoutContext } from '../../context/WorkoutContext';
import { useDietContext } from '../../context/DietContext';
import { useAppContext } from '../../context/AppContext';
import { calculateCardioExertion, effortLevelLabel } from '../../utils/calculations';
import { MUSCLE_GROUPS } from '../../utils/constants';
import type { DayActivity, MuscleGroup } from '../../types';
import { Moon, HeartPulse, Dumbbell, Activity, Apple, Flame } from 'lucide-react';

interface DayDetailProps {
  date: string; // YYYY-MM-DD
  activity: DayActivity;
}

const muscleLabel = (m: MuscleGroup) =>
  MUSCLE_GROUPS.find((g) => g.value === m)?.label ?? m;

const formatDate = (date: string) => {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

export const DayDetail: React.FC<DayDetailProps> = ({ date, activity }) => {
  const { cardioSessions, machineExercises, bodyweightExercises, crossTrainingSessions } =
    useWorkoutContext();
  const { getDailyNutrition } = useDietContext();
  const { userProfile } = useAppContext();

  const weightUnit = userProfile?.unitSystem === 'metric' ? 'kg' : 'lbs';
  const distanceUnit = userProfile?.unitSystem === 'metric' ? 'km' : 'miles';

  const cardio = cardioSessions.filter((s) => s.date === date);
  const strength = machineExercises.filter((e) => e.date === date);
  const bodyweight = bodyweightExercises.filter((e) => e.date === date);
  const cross = crossTrainingSessions.filter((s) => s.date === date);
  const nutrition = getDailyNutrition(date);

  const nothingLogged =
    !activity.hasActivity && cardio.length + strength.length + bodyweight.length + cross.length === 0;

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold">{formatDate(date)}</h3>
          {activity.load > 0 && (
            <p className="text-sm text-text/60 flex items-center gap-1.5 mt-1">
              <Flame size={14} className="text-orange-500" /> Training load: {activity.load}
            </p>
          )}
        </div>
      </div>

      {activity.restRecommended && (
        <div className="rounded-lg bg-indigo-500/10 border border-indigo-500/20 p-3 mb-4 flex items-center gap-2">
          <Moon size={18} className="text-indigo-500 flex-shrink-0" />
          <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">
            Recommended rest day — high training load over the previous two days.
          </p>
        </div>
      )}

      {nothingLogged && !activity.restRecommended && (
        <p className="text-text/60 text-sm">Nothing logged this day.</p>
      )}
      {nothingLogged && activity.restRecommended && (
        <p className="text-text/60 text-sm">Rest day — nothing logged. Nice recovery! 💤</p>
      )}

      <div className="space-y-4">
        {cardio.length > 0 && (
          <section>
            <h4 className="font-semibold flex items-center gap-2 mb-2">
              <HeartPulse size={16} className="text-red-500" /> Cardio
            </h4>
            <div className="space-y-2">
              {cardio.map((s) => {
                const ex = calculateCardioExertion(s, userProfile);
                return (
                  <div key={s.id} className="rounded-lg bg-surface p-3 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium capitalize">
                        {s.type === 'running' ? '🏃' : '🚴'} {s.type}
                      </span>
                      <span className="badge-primary">{effortLevelLabel(ex.effortLevel)}</span>
                    </div>
                    <p className="text-text/60 mt-1">
                      {s.distance} {distanceUnit} · {s.duration} min · {s.avgHeartRate} bpm ·{' '}
                      {s.elevationGain} {weightUnit === 'kg' ? 'm' : 'ft'} gain
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {strength.length > 0 && (
          <section>
            <h4 className="font-semibold flex items-center gap-2 mb-2">
              <Dumbbell size={16} className="text-primary" /> Strength
            </h4>
            <div className="space-y-2">
              {strength.map((e) => (
                <div key={e.id} className="rounded-lg bg-surface p-3 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">{e.machineName || 'Strength set'}</span>
                    <span className="text-text/60">
                      {e.sets} sets · {e.weight} {weightUnit}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {e.muscleGroups.map((m) => (
                      <span key={m} className="badge-primary">{muscleLabel(m)}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {bodyweight.length > 0 && (
          <section>
            <h4 className="font-semibold flex items-center gap-2 mb-2">
              <Activity size={16} className="text-green-500" /> Bodyweight
            </h4>
            <div className="space-y-2">
              {bodyweight.map((e) => (
                <div key={e.id} className="rounded-lg bg-surface p-3 text-sm flex justify-between">
                  <span className="font-medium">{e.name}</span>
                  <span className="text-text/60">
                    {e.sets} × {e.reps} · {e.difficulty}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {cross.length > 0 && (
          <section>
            <h4 className="font-semibold flex items-center gap-2 mb-2">
              <Activity size={16} className="text-purple-500" /> Cross-Training
            </h4>
            <div className="space-y-2">
              {cross.map((s) => (
                <div key={s.id} className="rounded-lg bg-surface p-3 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">{s.name}</span>
                    <span className="text-text/60">{s.totalDuration} min</span>
                  </div>
                  {s.description && <p className="text-text/60 mt-1 italic">{s.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {nutrition.meals.length > 0 && (
          <section>
            <h4 className="font-semibold flex items-center gap-2 mb-2">
              <Apple size={16} className="text-secondary" /> Nutrition
            </h4>
            <div className="rounded-lg bg-surface p-3 text-sm">
              <p className="font-medium">{nutrition.totalCalories} cal</p>
              <p className="text-text/60 mt-1">
                P {nutrition.totalProtein}g · C {nutrition.totalCarbs}g · F {nutrition.totalFat}g ·{' '}
                {nutrition.meals.length} meal{nutrition.meals.length > 1 ? 's' : ''}
              </p>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
