import { WS_URL } from '../config';
import type { Frame, SendPayload } from './frames';

type Handlers = {
  onFrame: (frame: Frame) => void;
  onStatus: (status: 'connecting' | 'open' | 'closed') => void;
};

// Single reconnecting WebSocket to the chat gateway. Auth via ?token=<jwt>.
export class ChatSocket {
  private ws: WebSocket | null = null;
  private token: string;
  private handlers: Handlers;
  private closedByUs = false;
  private retry: ReturnType<typeof setTimeout> | null = null;

  constructor(token: string, handlers: Handlers) {
    this.token = token;
    this.handlers = handlers;
  }

  connect() {
    this.closedByUs = false;
    this.handlers.onStatus('connecting');
    const ws = new WebSocket(`${WS_URL}?token=${this.token}`);
    this.ws = ws;
    ws.onopen = () => this.handlers.onStatus('open');
    ws.onmessage = (e) => {
      try {
        this.handlers.onFrame(JSON.parse(e.data) as Frame);
      } catch {}
    };
    ws.onclose = () => {
      this.handlers.onStatus('closed');
      if (!this.closedByUs) this.scheduleReconnect();
    };
    ws.onerror = () => ws.close();
  }

  private scheduleReconnect() {
    if (this.retry) return;
    this.retry = setTimeout(() => {
      this.retry = null;
      this.connect();
    }, 2000);
  }

  send(type: 'send', payload: SendPayload): boolean {
    if (this.ws?.readyState !== WebSocket.OPEN) return false;
    this.ws.send(JSON.stringify({ t: type, d: payload }));
    return true;
  }

  close() {
    this.closedByUs = true;
    if (this.retry) clearTimeout(this.retry);
    this.ws?.close();
  }
}
