import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme';

export type ActivityFilter = 'all' | 'dms' | 'mentions' | 'threads';
const CHIPS: { key: ActivityFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'dms', label: 'DMs' },
  { key: 'mentions', label: 'Mentions' },
  { key: 'threads', label: 'Threads' },
];

type Props = { value: ActivityFilter; onChange: (f: ActivityFilter) => void };

export function ActivityFilterChips({ value, onChange }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}>
      {CHIPS.map((c) => {
        const active = c.key === value;
        return (
          <Pressable
            key={c.key}
            onPress={() => onChange(c.key)}
            style={[styles.chip, active && styles.chipActive]}>
            <Text style={[styles.label, active && styles.labelActive]}>{c.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { paddingHorizontal: spacing.lg, gap: spacing.sm, paddingBottom: spacing.md },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.surfaceAlt, borderColor: colors.surfaceAlt },
  label: { ...typography.body, color: colors.textMuted },
  labelActive: { color: colors.text, fontWeight: '600' },
});
