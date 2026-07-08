import { request } from './client';
import type { ConversationSummary, Message } from './types';

export type SyncResponse = {
  conversations: ConversationSummary[];
  messages: Record<string, Message[]>;
  statuses: Record<string, unknown[]>;
};

// One catch-up call for the whole account: given the highest seq the client
// already holds per conversation, the server returns everything newer plus the
// fresh conversation list. This is the single "everything for one user" endpoint.
export function postSync(cursors: Record<string, number>): Promise<SyncResponse> {
  return request<SyncResponse>('/sync', { method: 'POST', body: { cursors } });
}
