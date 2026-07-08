import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Avatar } from '../common/Avatar';
import { colors, spacing, typography } from '../../theme';
import type { User } from '../../api/types';

type Props = { user: User; selected: boolean; onToggle: () => void };

// One search result with a checkbox, used when building a group.
export function SelectableUserRow({ user, selected, onToggle }: Props) {
  const name = user.display_name || user.username;
  return (
    <Pressable style={styles.row} onPress={onToggle}>
      <Avatar name={name} uri={user.avatar_url} size={40} />
      <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.handle}>@{user.username}</Text>
      </View>
      <View style={[styles.check, selected && styles.checkOn]}>
        {selected ? <Text style={styles.tick}>✓</Text> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  info: { flex: 1, marginLeft: spacing.md },
  name: { ...typography.name, color: colors.text },
  handle: { ...typography.meta, color: colors.textMuted, marginTop: 2 },
  check: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  tick: { color: colors.text, fontSize: 14, fontWeight: '700' },
});
