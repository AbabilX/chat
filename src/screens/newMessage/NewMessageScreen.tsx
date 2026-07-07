import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Screen } from '../../components/common/Screen';
import { Avatar } from '../../components/common/Avatar';
import { EmptyState } from '../../components/common/EmptyState';
import { searchUsers } from '../../api/users';
import { useCreateDM } from '../../hooks/useCreateDM';
import { colors, spacing, typography } from '../../theme';
import type { ScreenProps } from '../../navigation/types';

export function NewMessageScreen({ navigation }: ScreenProps<'NewMessage'>) {
  const [q, setQ] = useState('');
  const createDM = useCreateDM();
  const { data } = useQuery({
    queryKey: ['userSearch', q],
    queryFn: () => searchUsers(q),
    enabled: q.trim().length >= 2,
  });

  const openDM = async (userId: string, name: string) => {
    const res = await createDM.mutateAsync(userId);
    navigation.replace('Chat', { conversationId: res.conversation.id, title: name });
  };

  return (
    <Screen edges={['bottom']}>
      <TextInput
        style={styles.search}
        value={q}
        onChangeText={setQ}
        autoFocus
        placeholder="Search people by name or username"
        placeholderTextColor={colors.textFaint}
      />
      <FlatList
        data={data ?? []}
        keyExtractor={(u) => u.id}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => {
          const name = item.display_name || item.username;
          return (
            <Pressable style={styles.row} onPress={() => openDM(item.id, name)}>
              <Avatar name={name} uri={item.avatar_url} size={40} />
              <View style={styles.info}>
                <Text style={styles.name}>{name}</Text>
                <Text style={styles.handle}>@{item.username}</Text>
              </View>
            </Pressable>
          );
        }}
        ListEmptyComponent={
          q.trim().length >= 2 ? (
            <EmptyState title="No people found" />
          ) : (
            <EmptyState title="Find someone" subtitle="Type at least 2 characters." />
          )
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  search: {
    backgroundColor: colors.surface,
    color: colors.text,
    margin: spacing.lg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.body.fontSize,
  },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  info: { marginLeft: spacing.md },
  name: { ...typography.name, color: colors.text },
  handle: { ...typography.meta, color: colors.textMuted, marginTop: 2 },
});
