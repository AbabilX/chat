import { queryClient } from '../queryClient';
import { conversationsKey } from './useConversations';
import type { Message } from '../api/types';
import type { AckPayload } from '../ws/frames';

// Cache holds an ascending (oldest -> newest) array per conversation.
export const messagesKey = (convId: string) => ['messages', convId] as const;

function setMessages(convId: string, fn: (prev: Message[]) => Message[]) {
  queryClient.setQueryData<Message[]>(messagesKey(convId), (prev) =>
    fn(prev ?? []),
  );
}

// Add an incoming/optimistic message, de-duping by id and client_id.
export function appendMessage(convId: string, msg: Message) {
  setMessages(convId, (prev) => {
    if (prev.some((m) => m.id === msg.id)) return prev;
    if (msg.client_id && prev.some((m) => m.client_id === msg.client_id)) {
      return prev.map((m) => (m.client_id === msg.client_id ? msg : m));
    }
    return [...prev, msg];
  });
  queryClient.invalidateQueries({ queryKey: conversationsKey });
}

// Reconcile an optimistic message once the server acks it.
export function reconcileAck(convId: string, ack: AckPayload) {
  setMessages(convId, (prev) =>
    prev.map((m) =>
      m.client_id === ack.client_id
        ? { ...m, id: ack.message_id, seq: ack.seq, created_at: ack.created_at, pending: false }
        : m,
    ),
  );
}

// Prepend an older page fetched via before_seq.
export function prependOlder(convId: string, olderDesc: Message[]) {
  const asc = [...olderDesc].reverse();
  setMessages(convId, (prev) => {
    const seen = new Set(prev.map((m) => m.id));
    return [...asc.filter((m) => !seen.has(m.id)), ...prev];
  });
}
