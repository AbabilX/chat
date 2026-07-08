import React, { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { NewChatSheet } from './NewChatSheet';
import { colors, radius, spacing } from '../../theme';

type Props = { onNewMessage: () => void; onNewGroup: () => void };

// Floating + button that opens the new-chat sheet (direct message / group).
export function NewChatFab({ onNewMessage, onNewGroup }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Pressable style={styles.fab} onPress={() => setOpen(true)}>
        <Text style={styles.icon}>+</Text>
      </Pressable>
      <NewChatSheet
        visible={open}
        onClose={() => setOpen(false)}
        onNewMessage={onNewMessage}
        onNewGroup={onNewGroup}
      />
    </>
  );
}

const styles = StyleSheet.create({
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
  icon: { fontSize: 30, color: colors.text, marginTop: -2 },
});
