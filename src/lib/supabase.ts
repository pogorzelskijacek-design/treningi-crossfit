import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// The Supabase anon (publishable) key is designed to be PUBLIC — it is safe in
// client code and protected by Row-Level Security. We keep it as a committed
// fallback so the deployed app is always configured, while still letting an
// env var override it (e.g. after rotating keys or for another environment).
// NOTE: never commit the `service_role`/secret key — only this public anon key.
const FALLBACK_URL = 'https://xdjlhklkhjbkfyneaved.supabase.co';
const FALLBACK_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhkamxoa2xraGpia2Z5bmVhdmVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3NzE2NDcsImV4cCI6MjA5OTM0NzY0N30.Y-2P1eD95eWpQZ_3OTayZfP7kzwaIvthJii-9p_xnrE';

const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined) || FALLBACK_URL;
const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) || FALLBACK_ANON_KEY;

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
