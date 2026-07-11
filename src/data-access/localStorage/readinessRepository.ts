import type { ReadinessCheckin } from '@/domain';
import type { ReadinessRepository } from '../types';
import { STORAGE_KEYS, getJSON, setJSON } from './localStorageClient';

function readCheckins(): ReadinessCheckin[] {
  return getJSON<ReadinessCheckin[]>(STORAGE_KEYS.readiness, []);
}

export const localReadinessRepository: ReadinessRepository = {
  async save(checkin) {
    const checkins = readCheckins();
    const index = checkins.findIndex((c) => c.id === checkin.id);
    if (index >= 0) {
      checkins[index] = checkin;
    } else {
      checkins.push(checkin);
    }
    setJSON(STORAGE_KEYS.readiness, checkins);
  },

  async getById(id) {
    return readCheckins().find((c) => c.id === id) ?? null;
  },

  async getRecent(limit) {
    return [...readCheckins()].sort((a, b) => b.date.localeCompare(a.date)).slice(0, limit);
  },
};
