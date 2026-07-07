import { useMemo } from 'react';
import { queryClient } from '../queryClient';
import { conversationsKey } from './useConversations';
import { useAuthStore } from '../store/authStore';
import type { ConversationSummary, User } from '../api/types';

export type MemberInfo = { name: string; uri: string | null };

// Resolve a sender id -> display name/avatar using the conversation members
// already in cache, plus the logged-in user.
export function useMembers(conversationId: string) {
  const me = useAuthStore((s) => s.user);

  return useMemo(() => {
    const map = new Map<string, User>();
    if (me) map.set(me.id, me);
    const list = queryClient.getQueryData<ConversationSummary[]>(conversationsKey);
    const conv = list?.find((c) => c.id === conversationId);
    conv?.members.forEach((m) => map.set(m.id, m));

    return (id: string): MemberInfo => {
      const u = map.get(id);
      return {
        name: u ? u.display_name || u.username : 'User',
        uri: u?.avatar_url ?? null,
      };
    };
  }, [conversationId, me]);
}
