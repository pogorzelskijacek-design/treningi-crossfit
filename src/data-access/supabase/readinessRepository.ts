import type { ReadinessCheckin } from '@/domain';
import type { ReadinessRepository } from '../types';
import { db, currentUserId, readFallback } from './helpers';

export const supabaseReadinessRepository: ReadinessRepository = {
  async save(checkin) {
    const user_id = await currentUserId();
    const { error } = await db()
      .from('readiness_checkins')
      .upsert({ id: checkin.id, user_id, date: checkin.date, data: checkin });
    if (error) throw error;
  },

  async getById(id) {
    const { data, error } = await db().from('readiness_checkins').select('data').eq('id', id).maybeSingle();
    if (error) return readFallback('readiness_checkins.getById', error, null);
    return (data?.data as ReadinessCheckin) ?? null;
  },

  async getRecent(limit) {
    const { data, error } = await db()
      .from('readiness_checkins')
      .select('data')
      .order('date', { ascending: false })
      .limit(limit);
    if (error) return readFallback('readiness_checkins.getRecent', error, [] as ReadinessCheckin[]);
    return (data ?? []).map((r) => r.data as ReadinessCheckin);
  },
};
