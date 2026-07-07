import { useQuery } from '@tanstack/react-query';
import { listConversations } from '../api/conversations';

export const conversationsKey = ['conversations'] as const;

export function useConversations() {
  return useQuery({
    queryKey: conversationsKey,
    queryFn: listConversations,
    staleTime: 10_000,
  });
}
