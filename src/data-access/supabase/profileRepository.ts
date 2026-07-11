import type { UserProfile } from '@/domain';
import type { ProfileRepository } from '../types';
import { db, currentUserId, readFallback } from './helpers';

export const supabaseProfileRepository: ProfileRepository = {
  async get() {
    const { data, error } = await db().from('profiles').select('data').maybeSingle();
    if (error) return readFallback('profiles.get', error, null);
    return (data?.data as UserProfile) ?? null;
  },

  async save(profile) {
    const user_id = await currentUserId();
    const { error } = await db()
      .from('profiles')
      .upsert({ user_id, data: profile, updated_at: new Date().toISOString() });
    if (error) throw error;
  },
};
