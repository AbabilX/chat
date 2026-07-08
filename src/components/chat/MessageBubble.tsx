import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Avatar } from '../common/Avatar';
import { ReactionRow } from './ReactionRow';
import { colors, spacing, typography } from '../../theme';
import { clockTime } from '../../utils/time';
import type { Message } from '../../api/types';

type Props = {
  message: Message;
  name: string;
  avatarUri?: string | null;
  showHeader: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
};

export function MessageBubble({
  message,
  name,
  avatarUri,
  showHeader,
  onPress,
  onLongPress,
}: Props) {
  return (
    <Pressable onPress={onPress} onLongPress={onLongPress} style={styles.row}>
      <View style={styles.gutter}>
        {showHeader ? <Avatar name={name} uri={avatarUri} size={36} /> : null}
      </View>
      <View style={styles.body}>
        {showHeader ? (
          <View style={styles.headerRow}>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.time}>{clockTime(message.created_at)}</Text>
          </View>
        ) : null}
        <Text style={[styles.text, message.pending && styles.pending]}>
          {message.body}
        </Text>
        <ReactionRow reactions={message.reactions} />
        {message.reply_count > 0 ? (
          <Text style={styles.replies}>{message.reply_count} replies</Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', paddingHorizontal: spacing.lg, paddingVertical: 2 },
  gutter: { width: 36, marginRight: spacing.md, alignItems: 'center' },
  body: { flex: 1 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm },
  name: { ...typography.name, color: colors.text },
  time: { ...typography.meta, color: colors.textFaint, marginLeft: spacing.sm },
  text: { ...typography.body, color: colors.text, lineHeight: 21 },
  pending: { color: colors.textMuted },
  replies: { ...typography.meta, color: colors.accent, marginTop: 2 },
});
