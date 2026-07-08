import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Screen } from '../../components/common/Screen';
import { EmptyState } from '../../components/common/EmptyState';
import { SelectableUserRow } from '../../components/conversations/SelectableUserRow';
import { searchUsers } from '../../api/users';
import { useCreateGroup } from '../../hooks/useCreateGroup';
import { colors, radius, spacing, typography } from '../../theme';
import type { ScreenProps } from '../../navigation/types';

export function NewGroupScreen({ navigation }: ScreenProps<'NewGroup'>) {
  const [title, setTitle] = useState('');
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const createGroup = useCreateGroup();
  const { data } = useQuery({
    queryKey: ['userSearch', q],
    queryFn: () => searchUsers(q),
    enabled: q.trim().length >= 2,
  });

  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const canCreate = title.trim().length > 0 && selected.length > 0 && !createGroup.isPending;
  const create = async () => {
    const res = await createGroup.mutateAsync({ title: title.trim(), memberIds: selected });
    navigation.replace('Chat', { conversationId: res.conversation.id, title: title.trim() });
  };

  return (
    <Screen edges={['bottom']}>
      <View style={styles.top}>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Group name"
          placeholderTextColor={colors.textFaint}
        />
        <Pressable style={[styles.create, !canCreate && styles.disabled]} onPress={create} disabled={!canCreate}>
          <Text style={styles.createText}>Create ({selected.length})</Text>
        </Pressable>
      </View>
      <TextInput
        style={[styles.input, styles.search]}
        value={q}
        onChangeText={setQ}
        placeholder="Add people by name or username"
        placeholderTextColor={colors.textFaint}
      />
      <FlatList
        data={data ?? []}
        keyExtractor={(u) => u.id}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <SelectableUserRow user={item} selected={selected.includes(item.id)} onToggle={() => toggle(item.id)} />
        )}
        ListEmptyComponent={
          q.trim().length >= 2 ? <EmptyState title="No people found" /> : null
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingTop: spacing.md, gap: spacing.sm },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    color: colors.text,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.body.fontSize,
  },
  search: { marginHorizontal: spacing.lg, marginTop: spacing.md, flex: 0 },
  create: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  disabled: { opacity: 0.4 },
  createText: { ...typography.button, color: colors.text },
});
