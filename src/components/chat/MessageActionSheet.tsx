import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { QuickReactions } from './QuickReactions';
import { colors, radius, spacing, typography } from '../../theme';

type Props = {
  visible: boolean;
  onClose: () => void;
  onReact: (emoji: string) => void;
  onReply: () => void;
  onCopy: () => void;
  showReply?: boolean;
};

// Slack-style long-press sheet: quick reactions + Reply/Copy.
export function MessageActionSheet({
  visible,
  onClose,
  onReact,
  onReply,
  onCopy,
  showReply = true,
}: Props) {
  const run = (fn: () => void) => () => {
    fn();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.grip} />
          <QuickReactions onPick={(e) => run(() => onReact(e))()} />
          <View style={styles.actionsRow}>
            {showReply ? (
              <Pressable style={styles.action} onPress={run(onReply)}>
                <Text style={styles.actionLabel}>Reply</Text>
              </Pressable>
            ) : null}
            <Pressable style={styles.action} onPress={run(onCopy)}>
              <Text style={styles.actionLabel}>Copy message</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.surfaceAlt,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingBottom: spacing.xl,
    paddingTop: spacing.sm,
  },
  grip: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  actionsRow: { flexDirection: 'row', paddingHorizontal: spacing.lg, gap: spacing.md },
  action: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  actionLabel: { ...typography.body, color: colors.text, fontWeight: '600' },
});
