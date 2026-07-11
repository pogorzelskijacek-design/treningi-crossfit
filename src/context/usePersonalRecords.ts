import { useCallback, useEffect, useMemo, useState } from 'react';
import type { PersonalRecord } from '@/domain';
import { useRepositories } from './RepositoryProvider';

export function usePersonalRecords() {
  const { prs } = useRepositories();
  const [records, setRecords] = useState<PersonalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    setRecords(await prs.getAll());
    setLoading(false);
  }, [prs]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const upsert = useCallback(
    async (pr: PersonalRecord) => {
      await prs.upsert(pr);
      await refresh();
    },
    [prs, refresh]
  );

  const remove = useCallback(
    async (id: string) => {
      await prs.delete(id);
      await refresh();
    },
    [prs, refresh]
  );

  const currentBests = useMemo(() => {
    const bests = new Map<string, PersonalRecord>();
    for (const pr of records) {
      const existing = bests.get(pr.type);
      if (!existing || (pr.valueKg ?? 0) > (existing.valueKg ?? 0)) {
        bests.set(pr.type, pr);
      }
    }
    return bests;
  }, [records]);

  return { records, currentBests, loading, upsert, remove, refresh };
}
