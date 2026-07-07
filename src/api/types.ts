// Shared domain types mirroring the Go backend JSON shapes.

export type User = {
  id: string;
  email: string;
  username: string;
  phone: string;
  display_name: string;
  avatar_url: string | null;
  created_at: string;
};

export type Message = {
  id: string;
  conversation_id: string;
  seq: number;
  sender_id: string;
  parent_id: string | null;
  kind: string;
  body: string;
  reply_count: number;
  created_at: string;
  // client-only: optimistic send state before server ack.
  pending?: boolean;
  client_id?: string;
};

export type Conversation = {
  id: string;
  type: 'dm' | 'group';
  title: string | null;
  avatar_url: string | null;
  last_seq: number;
  created_at: string;
};

export type ConversationSummary = Conversation & {
  unread: number;
  last_message: Message | null;
  members: User[];
  last_read_seq: number;
};

export type AuthResponse = { token: string; user: User };
