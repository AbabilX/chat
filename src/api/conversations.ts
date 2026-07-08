import { request } from './client';
import type { ConversationSummary, Conversation, User } from './types';

export function listConversations(): Promise<ConversationSummary[]> {
  return request<{ conversations: ConversationSummary[] }>('/conversations').then(
    (r) => r.conversations,
  );
}

export type CreatedConversation = { conversation: Conversation; members: User[] };

export function createDM(userId: string): Promise<CreatedConversation> {
  return request<CreatedConversation>('/conversations', {
    method: 'POST',
    body: { type: 'dm', user_id: userId },
  });
}

export function createGroup(
  title: string,
  memberIds: string[],
): Promise<CreatedConversation> {
  return request<CreatedConversation>('/conversations', {
    method: 'POST',
    body: { type: 'group', title, member_ids: memberIds },
  });
}
