import { useEffect } from 'react';
import { ChatSocket } from './socket';
import { setSocket } from './manager';
import { useAuthStore } from '../store/authStore';
import { useLiveStore } from '../store/liveStore';
import { queryClient } from '../queryClient';
import { appendMessage, reconcileAck } from '../hooks/messageCache';
import type { Frame, AckPayload, MessagePayload } from './frames';

// Opens the WebSocket while logged in and routes frames into the query cache.
export function useSocket() {
  const token = useAuthStore((s) => s.token);
  const setStatus = useLiveStore((s) => s.setStatus);

  useEffect(() => {
    if (!token) return;
    const socket = new ChatSocket(token, {
      onStatus: setStatus,
      onFrame: routeFrame,
    });
    setSocket(socket);
    socket.connect();
    return () => {
      socket.close();
      setSocket(null);
      setStatus('idle');
    };
  }, [token, setStatus]);
}

function routeFrame(frame: Frame) {
  if (frame.t === 'message') {
    const { message } = frame.d as MessagePayload;
    appendMessage(message.conversation_id, message);
  } else if (frame.t === 'ack') {
    reconcileAckAllConvs(frame.d as AckPayload);
  }
}

// The ack has no conversation id, so apply it wherever the client_id matches.
function reconcileAckAllConvs(ack: AckPayload) {
  const entries = queryClient.getQueriesData<unknown>({ queryKey: ['messages'] });
  for (const [key] of entries) {
    reconcileAck(String((key as unknown[])[1]), ack);
  }
}
