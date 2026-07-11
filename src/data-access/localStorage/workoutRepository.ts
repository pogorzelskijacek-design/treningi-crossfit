import type { GeneratedWorkout, TrainingDay, WorkoutLog } from '@/domain';
import type { WorkoutRepository } from '../types';
import { STORAGE_KEYS, getJSON, setJSON } from './localStorageClient';

function readLogs(): WorkoutLog[] {
  return getJSON<WorkoutLog[]>(STORAGE_KEYS.workouts, []);
}

function readGenerated(): GeneratedWorkout[] {
  return getJSON<GeneratedWorkout[]>(STORAGE_KEYS.generatedWorkouts, []);
}

function sortByDateDesc<T extends { date: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => b.date.localeCompare(a.date));
}

export const localWorkoutRepository: WorkoutRepository = {
  async getAll() {
    return sortByDateDesc(readLogs());
  },

  async getById(id) {
    return readLogs().find((log) => log.id === id) ?? null;
  },

  async getRecentByDay(day, limit) {
    return sortByDateDesc(readLogs().filter((log) => log.day === day)).slice(0, limit);
  },

  async save(log) {
    const logs = readLogs();
    const index = logs.findIndex((l) => l.id === log.id);
    if (index >= 0) {
      logs[index] = log;
    } else {
      logs.push(log);
    }
    setJSON(STORAGE_KEYS.workouts, logs);
  },

  async delete(id) {
    setJSON(
      STORAGE_KEYS.workouts,
      readLogs().filter((log) => log.id !== id)
    );
  },

  async saveGeneratedWorkout(workout) {
    const workouts = readGenerated();
    const index = workouts.findIndex((w) => w.id === workout.id);
    if (index >= 0) {
      workouts[index] = workout;
    } else {
      workouts.push(workout);
    }
    setJSON(STORAGE_KEYS.generatedWorkouts, workouts);
  },

  async getGeneratedWorkoutById(id) {
    return readGenerated().find((w) => w.id === id) ?? null;
  },

  async getRecentGeneratedByDay(day: TrainingDay, limit: number) {
    return sortByDateDesc(readGenerated().filter((w) => w.day === day)).slice(0, limit);
  },
};
