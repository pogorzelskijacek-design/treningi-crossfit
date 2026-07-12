import type { GeneratedWorkout, WorkoutLog } from '@/domain';
import { focusesSignature, normalizeGeneratedWorkout, normalizeWorkoutLog } from '@/domain';
import type { WorkoutRepository } from '../types';
import { db, currentUserId, readFallback } from './helpers';

const LOGS = 'workout_logs';
const GENERATED = 'generated_workouts';

export const supabaseWorkoutRepository: WorkoutRepository = {
  async getAll() {
    const { data, error } = await db().from(LOGS).select('data').order('date', { ascending: false });
    if (error) return readFallback('workout_logs.getAll', error, [] as WorkoutLog[]);
    return (data ?? []).map((r) => normalizeWorkoutLog(r.data as WorkoutLog));
  },

  async getById(id) {
    const { data, error } = await db().from(LOGS).select('data').eq('id', id).maybeSingle();
    if (error) return readFallback('workout_logs.getById', error, null);
    return data ? normalizeWorkoutLog(data.data as WorkoutLog) : null;
  },

  async save(log) {
    const user_id = await currentUserId();
    const { error } = await db()
      .from(LOGS)
      .upsert({ id: log.id, user_id, day: focusesSignature(log.focuses), date: log.date, data: log });
    if (error) throw error;
  },

  async delete(id) {
    const { error } = await db().from(LOGS).delete().eq('id', id);
    if (error) throw error;
  },

  async saveGeneratedWorkout(workout) {
    const user_id = await currentUserId();
    const { error } = await db()
      .from(GENERATED)
      .upsert({ id: workout.id, user_id, day: focusesSignature(workout.focuses), date: workout.date, data: workout });
    if (error) throw error;
  },

  async getGeneratedWorkoutById(id) {
    const { data, error } = await db().from(GENERATED).select('data').eq('id', id).maybeSingle();
    if (error) return readFallback('generated_workouts.getById', error, null);
    return data ? normalizeGeneratedWorkout(data.data as GeneratedWorkout) : null;
  },

  async getRecentGenerated(limit: number) {
    const { data, error } = await db()
      .from(GENERATED)
      .select('data')
      .order('date', { ascending: false })
      .limit(limit);
    if (error) return readFallback('generated_workouts.getRecent', error, [] as GeneratedWorkout[]);
    return (data ?? []).map((r) => normalizeGeneratedWorkout(r.data as GeneratedWorkout));
  },
};
