import { useMutation } from '@tanstack/react-query';
import { createDM } from '../api/conversations';
import { queryClient } from '../queryClient';
import { conversationsKey } from './useConversations';
import type { ConversationSummary } from '../api/types';

// Create (or find) a DM, then seed the conversations cache so the chat screen
// can resolve member names immediately.
export function useCreateDM() {
  return useMutation({
    mutationFn: (userId: string) => createDM(userId),
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
