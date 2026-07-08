import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../../theme';
import type { Reaction } from '../../api/types';

type Props = { reactions?: Reaction[] };

// Emoji pill row shown under a message body (chat bubbles + thread rows).
export function ReactionRow({ reactions }: Props) {
  if (!reactions || reactions.length === 0) return null;
  return (
    <View style={styles.row}>
      {reactions.map((r) => (
        <View key={r.emoji} style={[styles.pill, r.reacted && styles.pillMine]}>
          <Text style={styles.pillText}>
            {r.emoji} {r.count}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing.xs, gap: spacing.xs },
  pill: {
    flexDirection: 'row',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 12,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pillMine: { borderColor: colors.accent, backgroundColor: colors.surface },
  pillText: { ...typography.meta, color: colors.text },
});
