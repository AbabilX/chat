import { useCallback, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchMessages } from '../api/messages';
import { messagesKey, prependOlder } from './messageCache';
import { queryClient } from '../queryClient';
import type { Message } from '../api/types';

const PAGE = 50;

// Latest page as an ascending array, plus lazy older-page loading.
export function useMessages(conversationId: string) {
  const query = useQuery({
    queryKey: messagesKey(conversationId),
    queryFn: async () => {
      const desc = await fetchMessages(conversationId, 0, PAGE);
      return [...desc].reverse();
    },
  });

  const [hasMore, setHasMore] = useState(true);
  const loading = useRef(false);

  const loadOlder = useCallback(async () => {
    if (loading.current || !hasMore) return;
    const current = queryClient.getQueryData<Message[]>(messagesKey(conversationId));
    const firstSeq = current?.[0]?.seq;
    if (!firstSeq) return;
    loading.current = true;
    try {
      const older = await fetchMessages(conversationId, firstSeq, PAGE);
      if (older.length < PAGE) setHasMore(false);
      if (older.length) prependOlder(conversationId, older);
    } finally {
      loading.current = false;
    }
  }, [conversationId, hasMore]);

  return { ...query, loadOlder, hasMore };
}
