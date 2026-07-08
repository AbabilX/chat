import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon, IconName } from '../common/Icon';
import { colors, spacing, typography } from '../../theme';

type Props = {
  icon: IconName;
  label: string;
  onPress: () => void;
  danger?: boolean;
};

// One tappable settings-style row: icon + label.
export function ProfileActionRow({ icon, label, onPress, danger }: Props) {
  const tint = danger ? colors.danger : colors.text;
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <Icon name={icon} color={tint} size={22} />
      <Text style={[styles.label, { color: tint }]}>{label}</Text>
      <View style={styles.spacer} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  label: { ...typography.body },
  spacer: { flex: 1 },
});
