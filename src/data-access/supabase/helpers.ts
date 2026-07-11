import { requireSupabase } from '@/lib/supabase';

/** The shared Supabase client (throws if not configured — only used when it is). */
export function db() {
  return requireSupabase();
}

/** Current user's id from the local session (no network round-trip). */
export async function currentUserId(): Promise<string> {
  const { data } = await requireSupabase().auth.getSession();
  const id = data.session?.user.id;
  if (!id) throw new Error('Not authenticated.');
  return id;
}

/**
 * Reads return a fallback (and log) on error so a transient glitch doesn't crash
 * a screen; writes should throw so the UI can surface the failure.
 */
export function readFallback<T>(label: string, error: unknown, fallback: T): T {
  console.error(`Supabase read failed (${label})`, error);
  return fallback;
}
