import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../../theme';

const QUICK_EMOJIS = ['✅', '👀', '😍', '❤️', '👍'];

type Props = { onPick: (emoji: string) => void };

export function QuickReactions({ onPick }: Props) {
  return (
    <View style={styles.row}>
      {QUICK_EMOJIS.map((e) => (
        <Pressable key={e} style={styles.button} onPress={() => onPick(e)}>
          <Text style={styles.emoji}>{e}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  button: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 22 },
});
