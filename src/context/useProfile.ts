import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_PROFILE, type UserProfile } from '@/domain';
import { useRepositories } from './RepositoryProvider';

export function useProfile() {
  const { profile: profileRepo } = useRepositories();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const existing = await profileRepo.get();
    if (existing) {
      setProfile(existing);
    } else {
      await profileRepo.save(DEFAULT_PROFILE);
      setProfile(DEFAULT_PROFILE);
    }
    setLoading(false);
  }, [profileRepo]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const save = useCallback(
    async (next: UserProfile) => {
      await profileRepo.save(next);
      setProfile(next);
    },
    [profileRepo]
  );

  return { profile, loading, save, refresh };
}
