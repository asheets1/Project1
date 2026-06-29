import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase is configured purely through Vite env vars so the app stays a
 * static bundle hostable on GitHub Pages. The anon key is safe to ship in the
 * client — data access is enforced server-side by Row Level Security.
 *
 * If the env vars are absent the app runs in local-only mode (no login, no
 * cross-device sync) and nothing breaks.
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl as string, supabaseAnonKey as string, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

/** Name of the single-row-per-user table holding the app data document. */
export const USER_DATA_TABLE = 'user_data';
