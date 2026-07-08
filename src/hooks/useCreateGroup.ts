import { useMutation } from '@tanstack/react-query';
import { createGroup } from '../api/conversations';
import { queryClient } from '../queryClient';
import { conversationsKey } from './useConversations';
import type { ConversationSummary } from '../api/types';

type Vars = { title: string; memberIds: string[] };

// Create a group, then seed the conversations cache so it appears instantly.
export function useCreateGroup() {
  return useMutation({
    mutationFn: ({ title, memberIds }: Vars) => createGroup(title, memberIds),
    onSuccess: ({ conversation, members }) => {
      queryClient.setQueryData<ConversationSummary[]>(conversationsKey, (prev) => {
        const summary: ConversationSummary = {
          ...conversation,
          unread: 0,
          last_message: null,
          members,
          last_read_seq: 0,
        };
        const rest = (prev ?? []).filter((c) => c.id !== conversation.id);
        return [summary, ...rest];
      });
    },
  });
}
