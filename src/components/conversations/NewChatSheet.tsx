import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme';

type Props = {
  visible: boolean;
  onClose: () => void;
  onNewMessage: () => void;
  onNewGroup: () => void;
};

// Bottom sheet shown when tapping + : choose a direct message or a group.
export function NewChatSheet({ visible, onClose, onNewMessage, onNewGroup }: Props) {
  const pick = (fn: () => void) => () => {
    onClose();
    fn();
  };
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet}>
          <View style={styles.handle} />
          <Pressable style={styles.option} onPress={pick(onNewMessage)}>
            <Text style={styles.icon}>✉️</Text>
            <View>
              <Text style={styles.label}>New message</Text>
              <Text style={styles.sub}>Start a direct message</Text>
            </View>
          </Pressable>
          <Pressable style={styles.option} onPress={pick(onNewGroup)}>
            <Text style={styles.icon}>👥</Text>
            <View>
              <Text style={styles.label}>New group</Text>
              <Text style={styles.sub}>Chat with several people</Text>
            </View>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: '#0008', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  option: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md },
  icon: { fontSize: 24, marginRight: spacing.md },
  label: { ...typography.name, color: colors.text },
  sub: { ...typography.meta, color: colors.textMuted, marginTop: 2 },
});
