import { useQuery } from '@tanstack/react-query';
import { getBranches } from '../api/repositories.api';

export const useBranches = (owner?: string, repo?: string) => {
  return useQuery({
    queryKey: ['repositories', owner, repo, 'branches'],
    queryFn: () => getBranches(owner!, repo!),
    enabled: !!owner && !!repo,
  });
};
