import type { PersonalRecord } from '@/domain';
import type { PRRepository } from '../types';
import { db, currentUserId, readFallback } from './helpers';

export const supabasePRRepository: PRRepository = {
  async getAll() {
    const { data, error } = await db().from('personal_records').select('data').order('date', { ascending: false });
    if (error) return readFallback('personal_records.getAll', error, [] as PersonalRecord[]);
    return (data ?? []).map((r) => r.data as PersonalRecord);
  },

  async upsert(pr) {
    const user_id = await currentUserId();
    const { error } = await db()
      .from('personal_records')
      .upsert({ id: pr.id, user_id, type: pr.type, date: pr.date, data: pr });
    if (error) throw error;
  },

  async delete(id) {
    const { error } = await db().from('personal_records').delete().eq('id', id);
    if (error) throw error;
  },
};
