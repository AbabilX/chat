import { sameDay, dayLabel } from './time';
import type { Message } from '../api/types';

export type Row =
  | { type: 'divider'; id: string; label: string }
  | { type: 'message'; id: string; message: Message; showHeader: boolean };

const GROUP_GAP_MS = 5 * 60 * 1000; // start a new header after a 5-min gap

// Turn an ascending message array into render rows with date dividers and
// Slack-style sender grouping (avatar/name only on the first of a run).
export function buildRows(messages: Message[]): Row[] {
  const rows: Row[] = [];
  let prev: Message | null = null;
  for (const m of messages) {
    if (!prev || !sameDay(prev.created_at, m.created_at)) {
      rows.push({ type: 'divider', id: `d-${m.id}`, label: dayLabel(m.created_at) });
    }
    const gap = prev ? new Date(m.created_at).getTime() - new Date(prev.created_at).getTime() : Infinity;
    const showHeader =
      !prev ||
      prev.sender_id !== m.sender_id ||
      !sameDay(prev.created_at, m.created_at) ||
      gap > GROUP_GAP_MS;
    rows.push({ type: 'message', id: m.id, message: m, showHeader });
    prev = m;
  }
  return rows;
}
