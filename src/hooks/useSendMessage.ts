import { useCallback } from 'react';
import { uuid } from '../utils/id';
import { appendMessage } from './messageCache';
import { sendMessage } from '../ws/manager';
import { useAuthStore } from '../store/authStore';
import type { Message } from '../api/types';

// Optimistically append a text message and push it over the WebSocket.
// The backend uses our client_id as the message id, so the later ack simply
// flips `pending` off (see messageCache.reconcileAck).
export function useSendMessage(conversationId: string, parentId?: string) {
  const meId = useAuthStore((s) => s.user?.id ?? '');

  return useCallback(
    (body: string): boolean => {
      const text = body.trim();
      if (!text) return false;
      const clientId = uuid();
      const optimistic: Message = {
        id: clientId,
        client_id: clientId,
        conversation_id: conversationId,
        seq: Number.MAX_SAFE_INTEGER, // sort last until the ack sets real seq
        sender_id: meId,
        parent_id: parentId ?? null,
        kind: 'text',
        body: text,
        reply_count: 0,
        created_at: new Date().toISOString(),
        pending: true,
      };
      appendMessage(conversationId, optimistic);
      return sendMessage({
        client_id: clientId,
        conversation_id: conversationId,
        parent_id: parentId,
        kind: 'text',
        body: text,
      });
    },
    [conversationId, parentId, meId],
  );
}
