import type { Repositories } from './types';
import { isSupabaseConfigured } from '@/lib/supabase';
import { localWorkoutRepository } from './localStorage/workoutRepository';
import { localProfileRepository } from './localStorage/profileRepository';
import { localPRRepository } from './localStorage/prRepository';
import { localReadinessRepository } from './localStorage/readinessRepository';
import { supabaseWorkoutRepository } from './supabase/workoutRepository';
import { supabaseProfileRepository } from './supabase/profileRepository';
import { supabasePRRepository } from './supabase/prRepository';
import { supabaseReadinessRepository } from './supabase/readinessRepository';

export type * from './types';

/**
 * Single swap point for persistence. When Supabase is configured (env vars set),
 * data is stored per-user in the cloud; otherwise it falls back to the offline
 * localStorage implementations. Call sites are identical either way.
 */
export function getRepositories(): Repositories {
  if (isSupabaseConfigured) {
    return {
      workouts: supabaseWorkoutRepository,
      profile: supabaseProfileRepository,
      prs: supabasePRRepository,
      readiness: supabaseReadinessRepository,
    };
  }
  return {
    workouts: localWorkoutRepository,
    profile: localProfileRepository,
    prs: localPRRepository,
    readiness: localReadinessRepository,
  };
}
