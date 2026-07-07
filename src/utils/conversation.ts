import type { ConversationSummary, User } from '../api/types';

// Resolve the display name + avatar for a conversation row / chat header.
// DMs have no title, so we show the other member (or "you" for self-DM).
export function convDisplay(conv: ConversationSummary, meId: string) {
  if (conv.type === 'group') {
    return { name: conv.title || 'Group', uri: conv.avatar_url };
  }
  const others = conv.members.filter((m) => m.id !== meId);
  const other: User | undefined = others[0] ?? conv.members[0];
  return {
    name: other ? other.display_name || other.username : 'Direct message',
    uri: other?.avatar_url ?? null,
  };
}

// Preview line for the last message ("You: hi" / "hi").
export function lastPreview(conv: ConversationSummary, meId: string): string {
  const m = conv.last_message;
  if (!m) return 'No messages yet';
  const mine = m.sender_id === meId;
  const body = m.kind === 'text' ? m.body : m.body || 'Attachment';
  return mine ? `You: ${body}` : body;
}
