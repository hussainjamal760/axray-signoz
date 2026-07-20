import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { logout } from '../api/auth.api';

export const useLogout = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      // Clear all queries under 'auth' cache space (including auth/me, permissions, etc.)
      queryClient.removeQueries({ queryKey: ['auth'] });

      // Navigate using replace to prevent browser back-button history entries
      router.replace('/auth');
    },
    onError: (error) => {
      console.error('Logout failed:', error);
    },
  });
};
