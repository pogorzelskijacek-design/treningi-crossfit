import type { Repositories } from './types';
import { localWorkoutRepository } from './localStorage/workoutRepository';
import { localProfileRepository } from './localStorage/profileRepository';
import { localPRRepository } from './localStorage/prRepository';
import { localReadinessRepository } from './localStorage/readinessRepository';

export type * from './types';

/**
 * Single swap point for persistence. Today this always returns the localStorage
 * implementations; a future backend (Supabase/Postgres/Firebase) is added by
 * implementing the same interfaces in a sibling folder and branching here.
 */
export function getRepositories(): Repositories {
  return {
    workouts: localWorkoutRepository,
    profile: localProfileRepository,
    prs: localPRRepository,
    readiness: localReadinessRepository,
  };
}
