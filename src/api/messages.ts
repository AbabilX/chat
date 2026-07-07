import { request } from './client';
import type { Message } from './types';

// History returns newest-first (desc). before_seq=0 fetches the latest page.
export function fetchMessages(
  conversationId: string,
  beforeSeq = 0,
  limit = 50,
): Promise<Message[]> {
  const q = `before_seq=${beforeSeq}&limit=${limit}`;
  return request<{ messages: Message[] }>(
    `/conversations/${conversationId}/messages?${q}`,
  ).then((r) => r.messages);
}
