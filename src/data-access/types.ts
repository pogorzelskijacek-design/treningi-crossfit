import type { GeneratedWorkout, PersonalRecord, ReadinessCheckin, UserProfile, WorkoutLog } from '@/domain';

/**
 * All repository methods are async even though the localStorage implementation
 * is synchronous under the hood. This lets a future Supabase/Postgres/Firebase
 * implementation swap in behind the same interface with zero call-site changes.
 */
export interface WorkoutRepository {
  getAll(): Promise<WorkoutLog[]>;
  getById(id: string): Promise<WorkoutLog | null>;
  save(log: WorkoutLog): Promise<void>;
  delete(id: string): Promise<void>;

  saveGeneratedWorkout(workout: GeneratedWorkout): Promise<void>;
  getGeneratedWorkoutById(id: string): Promise<GeneratedWorkout | null>;
  getRecentGenerated(limit: number): Promise<GeneratedWorkout[]>;
}

export interface ProfileRepository {
  get(): Promise<UserProfile | null>;
  save(profile: UserProfile): Promise<void>;
}

export interface PRRepository {
  getAll(): Promise<PersonalRecord[]>;
  upsert(pr: PersonalRecord): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface ReadinessRepository {
  save(checkin: ReadinessCheckin): Promise<void>;
  getById(id: string): Promise<ReadinessCheckin | null>;
  getRecent(limit: number): Promise<ReadinessCheckin[]>;
}

export interface Repositories {
  workouts: WorkoutRepository;
  profile: ProfileRepository;
  prs: PRRepository;
  readiness: ReadinessRepository;
}
