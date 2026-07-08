import React from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme';

type Props = { visible: boolean; label?: string };

// Blocking spinner card shown while an image uploads to R2.
export function UploadingModal({ visible, label = 'Processing image…' }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <ActivityIndicator color={colors.accent} />
          <Text style={styles.label}>{label}</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: '#000A', alignItems: 'center', justifyContent: 'center' },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    gap: spacing.md,
    minWidth: 180,
  },
  label: { ...typography.body, color: colors.text },
});
