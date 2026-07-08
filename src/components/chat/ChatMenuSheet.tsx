import React from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme';

type Props = { visible: boolean; onClose: () => void };

const OPTIONS = ['View contact info', 'Mute notifications', 'Search', 'Clear chat'];

// The 3-dot overflow menu for a chat (WhatsApp-style). Actions are stubs for now.
export function ChatMenuSheet({ visible, onClose }: Props) {
  const pick = (label: string) => () => {
    onClose();
    Alert.alert(label, 'Coming soon.');
  };
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View style={styles.menu}>
          {OPTIONS.map((o) => (
            <Pressable key={o} style={styles.item} onPress={pick(o)}>
              <Text style={styles.label}>{o}</Text>
            </Pressable>
          ))}
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: '#0006', alignItems: 'flex-end' },
  menu: {
    marginTop: 52,
    marginRight: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.xs,
    minWidth: 200,
  },
  item: { paddingVertical: spacing.md, paddingHorizontal: spacing.lg },
  label: { ...typography.body, color: colors.text },
});
