import React, { useMemo } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../components/common/Screen';
import { ThreadRow } from '../../components/chat/ThreadRow';
import { Composer } from '../../components/chat/Composer';
import { MessageActionSheet } from '../../components/chat/MessageActionSheet';
import { EmptyState } from '../../components/common/EmptyState';
import { useMessages } from '../../hooks/useMessages';
import { useSendMessage } from '../../hooks/useSendMessage';
import { useMembers } from '../../hooks/useMembers';
import { useMessageActions } from '../../hooks/useMessageActions';
import { colors, spacing, typography } from '../../theme';
import type { ScreenProps } from '../../navigation/types';
import type { Message } from '../../api/types';

export function ThreadScreen({ route }: ScreenProps<'Thread'>) {
  const { conversationId, parentId } = route.params;
  const { data } = useMessages(conversationId);
  const send = useSendMessage(conversationId, parentId);
  const resolve = useMembers(conversationId);
  const actions = useMessageActions(conversationId, () => {});

  const parent = useMemo(() => (data ?? []).find((m) => m.id === parentId), [data, parentId]);
  const replies = useMemo(
    () => (data ?? []).filter((m) => m.parent_id === parentId).sort((a, b) => a.seq - b.seq),
    [data, parentId],
  );

  const renderRow = (message: Message) => {
    const info = resolve(message.sender_id);
    return (
      <ThreadRow
        message={message}
        name={info.name}
        avatarUri={info.uri}
        onLongPress={() => actions.open(message)}
      />
    );
  };

  return (
    <Screen edges={['bottom']} style={styles.fill}>
      <KeyboardAvoidingView
        style={styles.fill}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {parent ? (
          <FlatList
            data={replies}
            keyExtractor={(m) => m.id}
            ListHeaderComponent={
              <>
                {renderRow(parent)}
                <View style={styles.repliesLabel}>
                  <Text style={styles.repliesText}>
                    {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
                  </Text>
                </View>
              </>
            }
            renderItem={({ item }) => renderRow(item)}
          />
        ) : (
          <EmptyState title="Thread" subtitle="Loading messages…" />
        )}
        <Composer placeholder="Add a reply" onSend={send} />
      </KeyboardAvoidingView>
      <MessageActionSheet
        visible={!!actions.target}
        onClose={actions.close}
        onReact={actions.onReact}
        onReply={actions.onReply}
        onCopy={actions.onCopy}
        showReply={false}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.bg },
  repliesLabel: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  repliesText: { ...typography.name, color: colors.text },
});
