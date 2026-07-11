import type { GeneratedWorkout, TrainingDay, WorkoutLog } from '@/domain';
import type { WorkoutRepository } from '../types';
import { db, currentUserId, readFallback } from './helpers';

const LOGS = 'workout_logs';
const GENERATED = 'generated_workouts';

export const supabaseWorkoutRepository: WorkoutRepository = {
  async getAll() {
    const { data, error } = await db().from(LOGS).select('data').order('date', { ascending: false });
    if (error) return readFallback('workout_logs.getAll', error, [] as WorkoutLog[]);
    return (data ?? []).map((r) => r.data as WorkoutLog);
  },

  async getById(id) {
    const { data, error } = await db().from(LOGS).select('data').eq('id', id).maybeSingle();
    if (error) return readFallback('workout_logs.getById', error, null);
    return (data?.data as WorkoutLog) ?? null;
  },

  async getRecentByDay(day, limit) {
    const { data, error } = await db()
      .from(LOGS)
      .select('data')
      .eq('day', day)
      .order('date', { ascending: false })
      .limit(limit);
    if (error) return readFallback('workout_logs.getRecentByDay', error, [] as WorkoutLog[]);
    return (data ?? []).map((r) => r.data as WorkoutLog);
  },

  async save(log) {
    const user_id = await currentUserId();
    const { error } = await db()
      .from(LOGS)
      .upsert({ id: log.id, user_id, day: log.day, date: log.date, data: log });
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
      .upsert({ id: workout.id, user_id, day: workout.day, date: workout.date, data: workout });
    if (error) throw error;
  },

  async getGeneratedWorkoutById(id) {
    const { data, error } = await db().from(GENERATED).select('data').eq('id', id).maybeSingle();
    if (error) return readFallback('generated_workouts.getById', error, null);
    return (data?.data as GeneratedWorkout) ?? null;
  },

  async getRecentGeneratedByDay(day: TrainingDay, limit: number) {
    const { data, error } = await db()
      .from(GENERATED)
      .select('data')
      .eq('day', day)
      .order('date', { ascending: false })
      .limit(limit);
    if (error) return readFallback('generated_workouts.getRecentByDay', error, [] as GeneratedWorkout[]);
    return (data ?? []).map((r) => r.data as GeneratedWorkout);
  },
};
