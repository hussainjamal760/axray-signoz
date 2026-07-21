import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createBranch } from '../api/repositories.api';
import { CreateBranchOptions } from '../types/repositories.types';

export const useCreateBranch = (owner?: string, repo?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBranchOptions) => createBranch(owner!, repo!, data),
    onSuccess: async () => {
      if (owner && repo) {
        await queryClient.invalidateQueries({
          queryKey: ['repositories', owner, repo, 'branches'],
        });
      }
    },
  });
};
