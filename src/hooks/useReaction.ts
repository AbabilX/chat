import { setReaction, deleteReaction } from '../api/messages';
import { applyMessageAction } from './messageCache';
import type { Message } from '../api/types';

// Tapping an emoji toggles it: add if not yet reacted, remove if it is.
export function useReaction(conversationId: string) {
  return async (message: Message, emoji: string) => {
    const mine = message.reactions?.find((r) => r.emoji === emoji && r.reacted);
    const result = mine
      ? await deleteReaction(message.id)
      : await setReaction(message.id, emoji);
    applyMessageAction(conversationId, result);
  };
}
