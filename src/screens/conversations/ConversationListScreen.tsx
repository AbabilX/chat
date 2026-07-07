import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../components/common/Screen';
import { Avatar } from '../../components/common/Avatar';
import { EmptyState } from '../../components/common/EmptyState';
import { ConversationRow } from '../../components/conversations/ConversationRow';
import { PeopleStrip } from '../../components/conversations/PeopleStrip';
import { FilterChips, Filter } from '../../components/conversations/FilterChips';
import { useConversations } from '../../hooks/useConversations';
import { useAuthStore } from '../../store/authStore';
import { convDisplay } from '../../utils/conversation';
import { colors, radius, spacing, typography } from '../../theme';
import type { TabScreenProps } from '../../navigation/types';

export function ConversationListScreen({ navigation }: TabScreenProps<'DMs'>) {
  const me = useAuthStore((s) => s.user);
  const meId = me?.id ?? '';
  const { data, isLoading, refetch, isRefetching } = useConversations();
  const [filter, setFilter] = useState<Filter>('all');

  const convs = useMemo(() => data ?? [], [data]);
  const open = (id: string, title: string) =>
    navigation.navigate('Chat', { conversationId: id, title });

  const people = useMemo(
    () => convs.slice(0, 12).map((c) => ({ id: c.id, ...convDisplay(c, meId) })),
    [convs, meId],
  );
  const list = filter === 'unread' ? convs.filter((c) => c.unread > 0) : convs;

  return (
    <Screen edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Direct messages</Text>
        <Avatar name={me?.display_name || me?.username || '?'} uri={me?.avatar_url} size={36} />
      </View>
      <FlatList
        data={list}
        keyExtractor={(c) => c.id}
        refreshing={isRefetching}
        onRefresh={refetch}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            <PeopleStrip
              people={people}
              onPress={(id) => open(id, convDisplay(convs.find((c) => c.id === id)!, meId).name)}
            />
            <FilterChips value={filter} onChange={setFilter} />
          </>
        }
        renderItem={({ item }) => (
          <ConversationRow
            conv={item}
            meId={meId}
            onPress={() => open(item.id, convDisplay(item, meId).name)}
          />
        )}
        ListEmptyComponent={
          isLoading ? null : (
            <EmptyState title="No conversations yet" subtitle="Tap + to start a direct message." />
          )
        }
      />
      <Pressable style={styles.fab} onPress={() => navigation.navigate('NewMessage')}>
        <Text style={styles.fabIcon}>+</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  title: { ...typography.title, color: colors.text },
  listContent: { flexGrow: 1, paddingBottom: 24 },
  fab: {
    position: 'absolute',
    right: spacing.xl,
    bottom: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabIcon: { fontSize: 30, color: colors.text, marginTop: -2 },
});
