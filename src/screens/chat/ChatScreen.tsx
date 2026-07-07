import React from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { MessageList } from '../../components/chat/MessageList';
import { Composer } from '../../components/chat/Composer';
import { EmptyState } from '../../components/common/EmptyState';
import { useMessages } from '../../hooks/useMessages';
import { useSendMessage } from '../../hooks/useSendMessage';
import { useMembers } from '../../hooks/useMembers';
import { colors } from '../../theme';
import type { ScreenProps } from '../../navigation/types';

export function ChatScreen({ route, navigation }: ScreenProps<'Chat'>) {
  const { conversationId, title } = route.params;
  const { data, isLoading, loadOlder } = useMessages(conversationId);
  const send = useSendMessage(conversationId);
  const resolve = useMembers(conversationId);

  return (
    <KeyboardAvoidingView
      style={styles.fill}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.list}>
        {isLoading ? (
          <ActivityIndicator style={styles.loader} color={colors.textMuted} />
        ) : data && data.length ? (
          <MessageList
            messages={data}
            resolve={resolve}
            onLoadOlder={loadOlder}
            onPressMessage={(m) =>
              navigation.navigate('Thread', {
                conversationId,
                parentId: m.id,
                title,
              })
            }
          />
        ) : (
          <EmptyState
            title={`This is the start of your chat with ${title}`}
            subtitle="Say hello 👋"
          />
        )}
      </View>
      <Composer placeholder={`Message ${title}`} onSend={send} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.bg },
  list: { flex: 1 },
  loader: { marginTop: 40 },
});
