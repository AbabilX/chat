import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../components/common/Screen';
import { EmptyState } from '../../components/common/EmptyState';
import { ActivityFilterChips, ActivityFilter } from '../../components/activity/ActivityFilterChips';
import { ActivityRow } from '../../components/activity/ActivityRow';
import { useActivity } from '../../hooks/useActivity';
import { useConversations } from '../../hooks/useConversations';
import { useAuthStore } from '../../store/authStore';
import { convDisplay } from '../../utils/conversation';
import { colors, spacing, typography } from '../../theme';
import type { TabScreenProps } from '../../navigation/types';
import type { ActivityItem } from '../../api/types';

export function ActivityScreen({ navigation }: TabScreenProps<'Activity'>) {
  const meId = useAuthStore((s) => s.user)?.id ?? '';
  const { data: items, isLoading, refetch, isRefetching } = useActivity();
  const { data: convs } = useConversations();
  const [filter, setFilter] = useState<ActivityFilter>('all');

  const convById = useMemo(() => {
    const map = new Map((convs ?? []).map((c) => [c.id, c]));
    return map;
  }, [convs]);

  const feed = useMemo(() => {
    return (items ?? []).filter((item) => {
      if (filter === 'mentions') return item.kind === 'mention';
      if (filter === 'threads') return item.kind === 'thread';
      if (filter === 'dms') return convById.get(item.message.conversation_id)?.type === 'dm';
      return true;
    });
  }, [items, filter, convById]);

  const open = (item: ActivityItem) => {
    const conv = convById.get(item.message.conversation_id);
    const title = conv ? convDisplay(conv, meId).name : 'Conversation';
    if (item.kind === 'thread' && item.message.parent_id) {
      navigation.navigate('Thread', {
        conversationId: item.message.conversation_id,
        parentId: item.message.parent_id,
        title,
      });
    } else {
      navigation.navigate('Chat', { conversationId: item.message.conversation_id, title });
    }
  };

  return (
    <Screen edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Activity</Text>
      </View>
      <ActivityFilterChips value={filter} onChange={setFilter} />
      <FlatList
        data={feed}
        keyExtractor={(i) => i.message.id}
        refreshing={isRefetching}
        onRefresh={refetch}
        renderItem={({ item }) => {
          const conv = convById.get(item.message.conversation_id);
          const convName = conv ? convDisplay(conv, meId).name : 'Conversation';
          const sender = conv?.members.find((m) => m.id === item.message.sender_id);
          const senderName = sender?.display_name || sender?.username || '?';
          return (
            <ActivityRow
              item={item}
              senderName={senderName}
              senderAvatar={sender?.avatar_url}
              convName={convName}
              onPress={() => open(item)}
            />
          );
        }}
        ListEmptyComponent={
          isLoading ? null : (
            <EmptyState title="You're all caught up" subtitle="Mentions and threads land here." />
          )
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  title: { ...typography.title, color: colors.text },
});
