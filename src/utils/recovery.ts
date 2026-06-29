import type {
  CardioSession,
  MachineExercise,
  MuscleGroup,
  MuscleRecovery,
  ReadinessSummary,
  UserProfile,
} from '../types';
import { MUSCLE_RECOVERY_BASE_HOURS } from './constants';
import { calculateCardioExertion } from './calculations';

/** Resolve the best-available timestamp for a logged entry. */
const entryTimestamp = (entry: { loggedAt?: string; date: string }): number => {
  const iso = entry.loggedAt ?? `${entry.date}T12:00:00`;
  const t = new Date(iso).getTime();
  return Number.isNaN(t) ? Date.now() : t;
};

/**
 * Relative volume of a strength entry vs. a "moderate" reference session
 * (≈3 sets at half bodyweight). Used to scale recovery time and training load.
 * Falls back to an absolute scale when bodyweight is unknown.
 */
export const strengthVolumeFactor = (
  entry: MachineExercise,
  profile: UserProfile | null
): number => {
  const bodyweight = profile?.weight && profile.weight > 0 ? profile.weight : 0;
  const intensity = bodyweight > 0 ? entry.weight / bodyweight : entry.weight / 100;
  const volumeScore = entry.sets * Math.max(0.1, intensity);
  const referenceModerate = 1.5; // 3 sets * 0.5 bodyweight
  return volumeScore / referenceModerate;
};

/** A single-number training-load contribution for a strength entry. */
export const strengthLoad = (entry: MachineExercise, profile: UserProfile | null): number => {
  // Each muscle group worked shares the volume; ~20 load units per moderate session.
  return Math.round(strengthVolumeFactor(entry, profile) * 20);
};

/**
 * Compute per-muscle-group recovery state from logged strength work.
 * For each muscle, the most recent session that trained it sets the clock;
 * recovery time scales with that session's relative volume.
 */
export const computeMuscleRecovery = (
  machineExercises: MachineExercise[],
  profile: UserProfile | null,
  now: number = Date.now()
): MuscleRecovery[] => {
  // Track, per muscle, the latest training timestamp and the volume factor then.
  const latest = new Map<MuscleGroup, { ts: number; factor: number }>();

  for (const entry of machineExercises) {
    if (!entry.muscleGroups?.length) continue;
    const ts = entryTimestamp(entry);
    const factor = strengthVolumeFactor(entry, profile);
    for (const muscle of entry.muscleGroups) {
      const existing = latest.get(muscle);
      if (!existing || ts > existing.ts) {
        latest.set(muscle, { ts, factor });
      }
    }
  }

  const result: MuscleRecovery[] = [];
  for (const [muscle, { ts, factor }] of latest.entries()) {
    const base = MUSCLE_RECOVERY_BASE_HOURS[muscle];
    // Clamp scaling so a single light/heavy session stays in a sane band.
    const scaled = base * Math.min(1.6, Math.max(0.6, factor));
    const recoveryHours = Math.round(scaled);

    const elapsedHours = (now - ts) / (1000 * 60 * 60);
    const percentRecovered = Math.min(100, Math.round((elapsedHours / recoveryHours) * 100));
    const readyAt = new Date(ts + recoveryHours * 60 * 60 * 1000).toISOString();

    let status: MuscleRecovery['status'] = 'recovering';
    if (percentRecovered >= 100) status = 'recovered';
    else if (percentRecovered < 34) status = 'fatigued';

    result.push({
      muscle,
      lastTrained: new Date(ts).toISOString(),
      recoveryHours,
      readyAt,
      percentRecovered,
      status,
    });
  }

  // Most fatigued first.
  return result.sort((a, b) => a.percentRecovered - b.percentRecovered);
};

/**
 * Aggregate recent (last 48h) training load from cardio + strength into a
 * whole-body readiness recommendation: how long to rest before the next hard
 * session, expressed in both hours and days.
 */
export const computeReadiness = (
  cardioSessions: CardioSession[],
  machineExercises: MachineExercise[],
  profile: UserProfile | null,
  now: number = Date.now()
): ReadinessSummary => {
  const windowMs = 48 * 60 * 60 * 1000;
  const cutoff = now - windowMs;

  let load = 0;

  for (const session of cardioSessions) {
    if (entryTimestamp(session) < cutoff) continue;
    load += calculateCardioExertion(session, profile).trimp;
  }

  for (const entry of machineExercises) {
    if (entryTimestamp(entry) < cutoff) continue;
    load += strengthLoad(entry, profile);
  }

  const recentLoad = Math.round(load);

  let status: ReadinessSummary['status'];
  let recommendedRestHours: number;
  let message: string;

  if (recentLoad < 60) {
    status = 'ready';
    recommendedRestHours = 12;
    message = 'Recovered and ready — you can train hard today.';
  } else if (recentLoad < 150) {
    status = 'caution';
    recommendedRestHours = 24;
    message = 'Moderate recent load — keep today light to moderate, or rest a day.';
  } else {
    status = 'rest';
    recommendedRestHours = 48;
    message = 'High recent training load — prioritise rest before your next hard session.';
  }

  return {
    status,
    recommendedRestHours,
    recommendedRestDays: Math.max(1, Math.round(recommendedRestHours / 24)),
    recentLoad,
    message,
  };
};

/** Format an ISO timestamp into a short "ready in" string. */
export const formatTimeUntil = (readyAtIso: string, now: number = Date.now()): string => {
  const diffMs = new Date(readyAtIso).getTime() - now;
  if (diffMs <= 0) return 'Ready now';
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    const remHours = hours % 24;
    return `${days}d ${remHours}h`;
  }
  return `${hours}h ${minutes}m`;
};
