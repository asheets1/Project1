import React from 'react';
import { useWorkoutContext } from '../../context/WorkoutContext';
import { useAppContext } from '../../context/AppContext';
import {
  computeMuscleRecovery,
  computeReadiness,
  formatTimeUntil,
} from '../../utils/recovery';
import { calculateCardioExertion, effortLevelLabel } from '../../utils/calculations';
import { ShieldCheck, AlertTriangle, BedDouble, Clock, HeartPulse } from 'lucide-react';
import type { MuscleGroup } from '../../types';
import { MUSCLE_GROUPS } from '../../utils/constants';

const muscleLabel = (m: MuscleGroup) =>
  MUSCLE_GROUPS.find((g) => g.value === m)?.label ?? m;

const READINESS_STYLES = {
  ready: {
    icon: ShieldCheck,
    ring: 'border-green-500/40',
    text: 'text-green-600',
    bg: 'bg-green-500/10',
    title: 'Ready to Train',
  },
  caution: {
    icon: AlertTriangle,
    ring: 'border-amber-500/40',
    text: 'text-amber-600',
    bg: 'bg-amber-500/10',
    title: 'Train with Caution',
  },
  rest: {
    icon: BedDouble,
    ring: 'border-red-500/40',
    text: 'text-red-600',
    bg: 'bg-red-500/10',
    title: 'Rest Recommended',
  },
} as const;

const RECOVERY_BADGE: Record<string, string> = {
  recovered: 'badge-success',
  recovering: 'badge-warning',
  fatigued: 'badge-danger',
};

export const RecoveryDashboard: React.FC = () => {
  const { cardioSessions, machineExercises } = useWorkoutContext();
  const { userProfile } = useAppContext();

  const readiness = computeReadiness(cardioSessions, machineExercises, userProfile);
  const muscleRecovery = computeMuscleRecovery(machineExercises, userProfile);

  // Recent cardio (last 48h) with computed effort, newest first.
  const cutoff = Date.now() - 48 * 60 * 60 * 1000;
  const recentCardio = cardioSessions
    .filter((s) => new Date(s.loggedAt ?? `${s.date}T12:00:00`).getTime() >= cutoff)
    .sort(
      (a, b) =>
        new Date(b.loggedAt ?? b.date).getTime() - new Date(a.loggedAt ?? a.date).getTime()
    );

  const style = READINESS_STYLES[readiness.status];
  const ReadinessIcon = style.icon;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Recovery</h1>
        <p className="text-text/60">
          How long to rest, based on your recent training load and which muscles you've worked.
        </p>
      </div>

      {/* Overall readiness */}
      <div className={`card p-6 border-2 ${style.ring} ${style.bg}`}>
        <div className="flex items-start gap-4">
          <ReadinessIcon className={`${style.text} flex-shrink-0`} size={40} />
          <div className="flex-1">
            <h2 className={`text-2xl font-bold ${style.text}`}>{style.title}</h2>
            <p className="text-text/70 mt-1">{readiness.message}</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-5">
              <div className="rounded-lg bg-background/60 p-3 text-center">
                <p className="text-2xl font-bold">{readiness.recommendedRestHours}h</p>
                <p className="text-xs text-text/60">Suggested rest</p>
              </div>
              <div className="rounded-lg bg-background/60 p-3 text-center">
                <p className="text-2xl font-bold">
                  {readiness.recommendedRestDays} day{readiness.recommendedRestDays > 1 ? 's' : ''}
                </p>
                <p className="text-xs text-text/60">Until next hard session</p>
              </div>
              <div className="rounded-lg bg-background/60 p-3 text-center col-span-2 sm:col-span-1">
                <p className="text-2xl font-bold">{readiness.recentLoad}</p>
                <p className="text-xs text-text/60">48h training load</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Per-muscle recovery */}
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Clock size={22} /> Muscle Recovery Windows
        </h2>
        {muscleRecovery.length === 0 ? (
          <div className="card p-10 text-center text-text/60">
            No strength work logged yet. Log sets in the Workouts tab to see per-muscle recovery.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {muscleRecovery.map((r) => (
              <div key={r.muscle} className="card p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-lg">{muscleLabel(r.muscle)}</h4>
                  <span className={RECOVERY_BADGE[r.status]}>
                    {r.status === 'recovered' ? 'Ready' : formatTimeUntil(r.readyAt)}
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-primary/10 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      r.status === 'recovered'
                        ? 'bg-green-500'
                        : r.status === 'fatigued'
                        ? 'bg-red-500'
                        : 'bg-amber-500'
                    }`}
                    style={{ width: `${r.percentRecovered}%` }}
                  />
                </div>
                <p className="text-xs text-text/60 mt-2">
                  {r.percentRecovered}% recovered · full recovery {r.recoveryHours}h
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent cardio effort */}
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <HeartPulse size={22} /> Recent Cardio Effort
        </h2>
        {recentCardio.length === 0 ? (
          <div className="card p-10 text-center text-text/60">
            No cardio in the last 48 hours.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentCardio.map((s) => {
              const ex = calculateCardioExertion(s, userProfile);
              return (
                <div key={s.id} className="card p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold capitalize">
                      {s.type === 'running' ? '🏃' : '🚴'} {s.type}
                    </h4>
                    <span className="text-sm text-text/60">{s.date}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center mt-3">
                    <div>
                      <p className="text-lg font-bold text-primary">{ex.trimp}</p>
                      <p className="text-[11px] text-text/60">Exertion</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-secondary">
                        {effortLevelLabel(ex.effortLevel)}
                      </p>
                      <p className="text-[11px] text-text/60">Effort</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-accent">{ex.recoveryHours}h</p>
                      <p className="text-[11px] text-text/60">Recover</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
