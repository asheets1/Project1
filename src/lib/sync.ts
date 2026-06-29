import { supabase, USER_DATA_TABLE } from './supabase';
import { STORAGE_KEYS } from '../utils/constants';
import { SYNC_HYDRATED_EVENT, LAST_MODIFIED_KEY } from '../hooks/useLocalStorage';

/**
 * The localStorage keys whose contents are synced to the cloud. Theme is
 * intentionally excluded — it's a per-device display preference.
 */
export const SYNCED_KEYS: string[] = [
  STORAGE_KEYS.USER_PROFILE,
  STORAGE_KEYS.BODYWEIGHT_EXERCISES,
  STORAGE_KEYS.MACHINE_EXERCISES,
  STORAGE_KEYS.CARDIO_SESSIONS,
  STORAGE_KEYS.CROSS_TRAINING,
  STORAGE_KEYS.MEALS,
  STORAGE_KEYS.SAFETY_WARNINGS,
];

/** Marker inside the cloud document holding the client's last-modified time. */
const MODIFIED_FIELD = '__modified';

export interface SyncDocument {
  [key: string]: unknown;
  [MODIFIED_FIELD]?: number;
}

/** Read the synced localStorage keys into a plain object for upload. */
export function snapshotLocal(): SyncDocument {
  const doc: SyncDocument = {};
  for (const key of SYNCED_KEYS) {
    const raw = window.localStorage.getItem(key);
    if (raw !== null) {
      try {
        doc[key] = JSON.parse(raw);
      } catch {
        doc[key] = raw;
      }
    }
  }
  doc[MODIFIED_FIELD] = localModified();
  return doc;
}

/** Write a cloud document back into localStorage and refresh the UI. */
export function applyToLocal(doc: SyncDocument): void {
  for (const key of SYNCED_KEYS) {
    if (key in doc && doc[key] !== undefined) {
      window.localStorage.setItem(key, JSON.stringify(doc[key]));
    }
  }
  const modified = typeof doc[MODIFIED_FIELD] === 'number' ? (doc[MODIFIED_FIELD] as number) : Date.now();
  window.localStorage.setItem(LAST_MODIFIED_KEY, String(modified));
  // Tell every useLocalStorage consumer to re-read from storage.
  window.dispatchEvent(new Event(SYNC_HYDRATED_EVENT));
}

/** The local last-modified timestamp (0 if never written). */
export function localModified(): number {
  return Number(window.localStorage.getItem(LAST_MODIFIED_KEY) || 0);
}

/** True if there is any real app data stored locally. */
export function hasLocalData(): boolean {
  return SYNCED_KEYS.some((key) => {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return false;
    return raw !== 'null' && raw !== '[]' && raw !== '{}' && raw !== '""';
  });
}

/** Remove synced data from localStorage (used on sign-out for privacy). */
export function clearLocalData(): void {
  for (const key of SYNCED_KEYS) window.localStorage.removeItem(key);
  window.localStorage.removeItem(LAST_MODIFIED_KEY);
  window.dispatchEvent(new Event(SYNC_HYDRATED_EVENT));
}

/** Fetch the user's cloud document, or null if none exists yet. */
export async function pullRemote(userId: string): Promise<SyncDocument | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from(USER_DATA_TABLE)
    .select('data')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) {
    console.error('Supabase pull failed:', error.message);
    return null;
  }
  return (data?.data as SyncDocument) ?? null;
}

/** Upsert the given document to the user's cloud row. */
export async function pushRemote(userId: string, doc: SyncDocument): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase
    .from(USER_DATA_TABLE)
    .upsert({ user_id: userId, data: doc }, { onConflict: 'user_id' });
  if (error) {
    console.error('Supabase push failed:', error.message);
    return false;
  }
  return true;
}

/**
 * Reconcile local and cloud state on sign-in using last-write-wins.
 * - Cloud newer than local → apply cloud locally.
 * - Otherwise, if we have local data → push it up as the source of truth.
 * Returns which direction won (for UI messaging).
 */
export async function reconcileOnLogin(
  userId: string
): Promise<'pulled' | 'pushed' | 'noop'> {
  const remote = await pullRemote(userId);
  const remoteModified =
    remote && typeof remote[MODIFIED_FIELD] === 'number' ? (remote[MODIFIED_FIELD] as number) : 0;
  const localMod = localModified();

  if (remote && remoteModified >= localMod && Object.keys(remote).length > 0) {
    applyToLocal(remote);
    return 'pulled';
  }

  if (hasLocalData()) {
    await pushRemote(userId, snapshotLocal());
    return 'pushed';
  }

  return 'noop';
}
