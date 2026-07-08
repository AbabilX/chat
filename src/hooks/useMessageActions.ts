import { useState } from 'react';
import Clipboard from '@react-native-clipboard/clipboard';
import { useReaction } from './useReaction';
import type { Message } from '../api/types';

// Long-press sheet state + the three wired actions (reply/copy/react).
export function useMessageActions(conversationId: string, onReply: (m: Message) => void) {
  const [target, setTarget] = useState<Message | null>(null);
  const react = useReaction(conversationId);

  return {
    target,
    open: (m: Message) => setTarget(m),
    close: () => setTarget(null),
    onReply: () => target && onReply(target),
    onCopy: () => target && Clipboard.setString(target.body),
    onReact: (emoji: string) => target && react(target, emoji),
  };
}
