import { create } from 'zustand';

export type WsStatus = 'idle' | 'connecting' | 'open' | 'closed';

type LiveState = {
  status: WsStatus;
  setStatus: (status: WsStatus) => void;
};

// Connection status for the WebSocket, surfaced in the chat header.
export const useLiveStore = create<LiveState>((set) => ({
  status: 'idle',
  setStatus: (status) => set({ status }),
}));
