import { useQuery } from '@tanstack/react-query';
import { getRepositories } from '../api/repositories.api';

export const useRepositories = () => {
  return useQuery({
    queryKey: ['repositories'],
    queryFn: getRepositories,
  });
};
