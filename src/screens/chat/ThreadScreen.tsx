import React, { useMemo } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { MessageList } from '../../components/chat/MessageList';
import { Composer } from '../../components/chat/Composer';
import { EmptyState } from '../../components/common/EmptyState';
import { useMessages } from '../../hooks/useMessages';
import { useSendMessage } from '../../hooks/useSendMessage';
import { useMembers } from '../../hooks/useMembers';
import { colors } from '../../theme';
import type { ScreenProps } from '../../navigation/types';

export function ThreadScreen({ route }: ScreenProps<'Thread'>) {
  const { conversationId, parentId } = route.params;
  const { data } = useMessages(conversationId);
  const send = useSendMessage(conversationId, parentId);
  const resolve = useMembers(conversationId);

  // Thread = the parent message plus every reply pointing at it.
  const thread = useMemo(() => {
    const all = data ?? [];
    const parent = all.find((m) => m.id === parentId);
    const replies = all.filter((m) => m.parent_id === parentId);
    return [...(parent ? [parent] : []), ...replies].sort((a, b) => a.seq - b.seq);
  }, [data, parentId]);

  return (
    <KeyboardAvoidingView
      style={styles.fill}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.list}>
        {thread.length ? (
          <MessageList messages={thread} resolve={resolve} onLoadOlder={() => {}} />
        ) : (
          <EmptyState title="Thread" subtitle="Loading messages…" />
        )}
      </View>
      <Composer placeholder="Reply…" onSend={send} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.bg },
  list: { flex: 1 },
});
