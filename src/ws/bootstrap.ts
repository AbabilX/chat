import { queryClient } from '../queryClient';
import { conversationsKey } from '../hooks/useConversations';
import { messagesKey, appendMessage } from '../hooks/messageCache';
import { postSync } from '../api/sync';
import type { ConversationSummary, Message } from '../api/types';

// Highest seq we already hold for a conversation, so /sync only sends newer.
function cursorFor(convId: string, conv: ConversationSummary): number {
  const cached = queryClient.getQueryData<Message[]>(messagesKey(convId));
  const localMax = cached?.length ? cached[cached.length - 1].seq : 0;
  return Math.max(localMax, conv.last_read_seq ?? 0);
}

// Run once whenever the socket (re)connects: refresh the conversation list and
// merge any messages missed while offline. Live frames handle the rest.
export async function bootstrapSync(): Promise<void> {
  const convs = queryClient.getQueryData<ConversationSummary[]>(conversationsKey) ?? [];
  const cursors: Record<string, number> = {};
  for (const c of convs) cursors[c.id] = cursorFor(c.id, c);

  try {
    const res = await postSync(cursors);
    queryClient.setQueryData(conversationsKey, res.conversations);
    for (const [convId, msgs] of Object.entries(res.messages)) {
      for (const m of msgs) appendMessage(convId, m);
    }
  } catch {
    // Offline or transient; the socket will retry and call this again.
  }
}
