import { useQuery } from '@tanstack/react-query';
import { fetchActivity } from '../api/activity';

export const activityKey = ['activity'] as const;

export function useActivity() {
  return useQuery({
    queryKey: activityKey,
    queryFn: fetchActivity,
    staleTime: 10_000,
  });
}
