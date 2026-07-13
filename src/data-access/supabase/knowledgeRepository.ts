import type { KnowledgeSource } from '@/domain';
import type { KnowledgeRepository } from '../types';
import { db, currentUserId, readFallback } from './helpers';

export const supabaseKnowledgeRepository: KnowledgeRepository = {
  async getAll() {
    const { data, error } = await db()
      .from('knowledge_sources')
      .select('data')
      .order('added_at', { ascending: false });
    if (error) return readFallback('knowledge_sources.getAll', error, [] as KnowledgeSource[]);
    return (data ?? []).map((r) => r.data as KnowledgeSource);
  },

  async save(source) {
    const user_id = await currentUserId();
    const { error } = await db()
      .from('knowledge_sources')
      .upsert({
        id: source.id,
        user_id,
        category: source.category,
        title: source.title,
        added_at: source.addedAt,
        data: source,
      });
    if (error) throw error;
  },

  async delete(id) {
    const { error } = await db().from('knowledge_sources').delete().eq('id', id);
    if (error) throw error;
  },
};
