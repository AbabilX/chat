import type { Message, User } from '../api/types';

// Wire envelope shared by both directions: { t: type, d: payload }.
export type Frame = { t: string; d?: unknown };

// Outbound (client -> server).
export type SendPayload = {
  client_id: string;
  conversation_id: string;
  parent_id?: string;
  kind: 'text';
  body: string;
};

// Inbound (server -> client) payloads.
export type AckPayload = {
  client_id: string;
  message_id: string;
  seq: number;
  created_at: string;
};

export type MessagePayload = { message: Message; sender: User };
export type ConvPayload = { conversation_id: string };
export type ErrorPayload = { client_id: string; code: string; message: string };
