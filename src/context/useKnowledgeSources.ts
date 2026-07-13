import { useCallback, useEffect, useMemo, useState } from 'react';
import type { KnowledgeSource } from '@/domain';
import { SEED_KNOWLEDGE_SOURCES } from '@/data';
import { useRepositories } from './RepositoryProvider';

/**
 * Merges the built-in curated seed sources (read-only) with the athlete's own
 * added sources (persisted). The seed set is static so it never needs syncing;
 * only user sources hit the repository.
 */
export function useKnowledgeSources() {
  const { knowledge } = useRepositories();
  const [userSources, setUserSources] = useState<KnowledgeSource[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    setUserSources(await knowledge.getAll());
    setLoading(false);
  }, [knowledge]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const add = useCallback(
    async (source: KnowledgeSource) => {
      await knowledge.save(source);
      await refresh();
    },
    [knowledge, refresh]
  );

  const remove = useCallback(
    async (id: string) => {
      await knowledge.delete(id);
      await refresh();
    },
    [knowledge, refresh]
  );

  const all = useMemo(() => [...SEED_KNOWLEDGE_SOURCES, ...userSources], [userSources]);

  return { all, seedSources: SEED_KNOWLEDGE_SOURCES, userSources, loading, add, remove, refresh };
}
