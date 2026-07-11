import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getRepositories, type Repositories } from '@/data-access';
import { DEFAULT_PROFILE } from '@/domain';

const RepositoryContext = createContext<Repositories | null>(null);

export function RepositoryProvider({ children }: { children: ReactNode }) {
  const repositories = useMemo(() => getRepositories(), []);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const existing = await repositories.profile.get();
      if (!existing) {
        await repositories.profile.save(DEFAULT_PROFILE);
      }
      if (!cancelled) setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [repositories]);

  if (!ready) {
    return <div className="min-h-svh bg-background" />;
  }

  return <RepositoryContext.Provider value={repositories}>{children}</RepositoryContext.Provider>;
}

export function useRepositories(): Repositories {
  const context = useContext(RepositoryContext);
  if (!context) throw new Error('useRepositories must be used within a RepositoryProvider');
  return context;
}
