import { ChatSocket } from './socket';
import type { SendPayload } from './frames';

// Holds the one live socket so any hook can send without prop-drilling it.
let current: ChatSocket | null = null;

export function setSocket(socket: ChatSocket | null) {
  current = socket;
}

// Send a message frame. Returns false if the socket is not open.
export function sendMessage(payload: SendPayload): boolean {
  return current?.send('send', payload) ?? false;
}
