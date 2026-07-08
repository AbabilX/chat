import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Avatar } from '../common/Avatar';
import { ReactionRow } from './ReactionRow';
import { colors, spacing, typography } from '../../theme';
import { fullTime } from '../../utils/time';
import type { Message } from '../../api/types';

type Props = {
  message: Message;
  name: string;
  avatarUri?: string | null;
  onLongPress?: () => void;
};

// Flat Slack-thread row: avatar + name + full date-time always shown, no grouping.
export function ThreadRow({ message, name, avatarUri, onLongPress }: Props) {
  return (
    <Pressable onLongPress={onLongPress} style={styles.row}>
      <Avatar name={name} uri={avatarUri} size={36} />
      <View style={styles.body}>
        <View style={styles.headerRow}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.time}>{fullTime(message.created_at)}</Text>
        </View>
        <Text style={[styles.text, message.pending && styles.pending]}>{message.body}</Text>
        <ReactionRow reactions={message.reactions} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  body: { flex: 1, marginLeft: spacing.md },
  headerRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  name: { ...typography.name, color: colors.text, fontWeight: '700' },
  time: { ...typography.meta, color: colors.textFaint, marginLeft: spacing.sm },
  text: { ...typography.body, color: colors.text, lineHeight: 21, marginTop: 2 },
  pending: { color: colors.textMuted },
});
