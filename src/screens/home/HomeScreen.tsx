import React, { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../components/common/Screen';
import { EmptyState } from '../../components/common/EmptyState';
import { FeedCard } from '../../components/home/FeedCard';
import { useConversations } from '../../hooks/useConversations';
import { useAuthStore } from '../../store/authStore';
import { colors, spacing, typography } from '../../theme';
import type { TabScreenProps } from '../../navigation/types';
import type { ConversationSummary } from '../../api/types';

// Aggregated activity feed: latest message from every conversation, newest first.
export function HomeScreen({ navigation }: TabScreenProps<'Home'>) {
  const me = useAuthStore((s) => s.user);
  const meId = me?.id ?? '';
  const { data, isLoading, refetch, isRefetching } = useConversations();

  const feed = useMemo(() => {
    const withMsg = (data ?? []).filter((c) => c.last_message);
    return [...withMsg].sort(
      (a, b) =>
        new Date(b.last_message!.created_at).getTime() -
        new Date(a.last_message!.created_at).getTime(),
    );
  }, [data]);

  const open = (c: ConversationSummary) => {
    const title = c.type === 'group' ? c.title || 'Group' : undefined;
    navigation.navigate('Chat', {
      conversationId: c.id,
      title: title ?? c.members.find((m) => m.id !== meId)?.display_name ?? 'Direct message',
    });
  };

  return (
    <Screen edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Home</Text>
      </View>
      <FlatList
        data={feed}
        keyExtractor={(c) => c.id}
        refreshing={isRefetching}
        onRefresh={refetch}
        renderItem={({ item }) => (
          <FeedCard conv={item} meId={meId} onReply={() => open(item)} />
        )}
        ListEmptyComponent={
          isLoading ? null : (
            <EmptyState title="All caught up" subtitle="New activity will show up here." />
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
