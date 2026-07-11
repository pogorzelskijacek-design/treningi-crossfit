import type { UserProfile } from '@/domain';
import type { ProfileRepository } from '../types';
import { STORAGE_KEYS, getJSON, setJSON } from './localStorageClient';

export const localProfileRepository: ProfileRepository = {
  async get() {
    return getJSON<UserProfile | null>(STORAGE_KEYS.profile, null);
  },

  async save(profile) {
    setJSON(STORAGE_KEYS.profile, profile);
  },
};
