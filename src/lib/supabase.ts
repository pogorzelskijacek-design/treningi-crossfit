import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Supabase config is committed directly. The anon key is PUBLIC and safe in
// client code (it is protected by Row-Level Security). We intentionally do NOT
// read Vercel env vars here: a stray non-ASCII character pasted into the
// dashboard made fetch throw "String contains non ISO-8859-1 code point", and a
// committed literal is guaranteed clean. NEVER commit the service_role/secret key.
const SUPABASE_URL = 'https://xdjlhklkhjbkfyneaved.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhkamxoa2xraGpia2Z5bmVhdmVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3NzE2NDcsImV4cCI6MjA5OTM0NzY0N30.Y-2P1eD95eWpQZ_3OTayZfP7kzwaIvthJii-9p_xnrE';

// Strip any accidental non-printable/non-ASCII characters as a safety net —
// HTTP header values (the api key) must be ISO-8859-1.
function sanitize(value: string): string {
  return value.replace(/[^\x21-\x7E]/g, '');
}

export const isSupabaseConfigured: boolean = true;

export const supabase: SupabaseClient = createClient(sanitize(SUPABASE_URL), sanitize(SUPABASE_ANON_KEY), {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/** Non-null accessor kept for call sites that guard on configuration. */
export function requireSupabase(): SupabaseClient {
  return supabase;
}
