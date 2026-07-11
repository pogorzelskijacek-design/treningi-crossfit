import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * True when both Supabase env vars are present. When false the app falls back
 * to the offline localStorage repositories and skips auth entirely, so the
 * project keeps working (single-user) before/without a backend configured.
 */
export const isSupabaseConfigured = Boolean(url && anonKey);

/** Shared Supabase client, or null when not configured. */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url!, anonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

/** Non-null accessor for code paths that only run when Supabase is configured. */
export function requireSupabase(): SupabaseClient {
  if (!supabase) throw new Error('Supabase is not configured.');
  return supabase;
}
