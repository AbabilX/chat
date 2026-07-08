import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Avatar } from '../common/Avatar';
import { colors, radius, spacing, typography } from '../../theme';
import { relativeTime } from '../../utils/time';
import { convDisplay } from '../../utils/conversation';
import type { ConversationSummary } from '../../api/types';

type Props = { conv: ConversationSummary; meId: string; onReply: () => void };

// One "Home" feed card: conversation title + latest message + Reply.
export function FeedCard({ conv, meId, onReply }: Props) {
  const { name: convName } = convDisplay(conv, meId);
  const msg = conv.last_message;
  if (!msg) return null;
  const sender = conv.members.find((m) => m.id === msg.sender_id);
  const senderName = msg.sender_id === meId ? 'You' : sender?.display_name || sender?.username || '?';

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{convName}</Text>
      <View style={styles.row}>
        <Avatar name={senderName} uri={sender?.avatar_url} size={32} />
        <View style={styles.body}>
          <View style={styles.top}>
            <Text style={styles.name}>{senderName}</Text>
            <Text style={styles.time}>{relativeTime(msg.created_at)}</Text>
          </View>
          <Text style={styles.text} numberOfLines={3}>
            {msg.body}
          </Text>
        </View>
      </View>
      <Pressable style={styles.reply} onPress={onReply}>
        <Text style={styles.replyLabel}>Reply</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: { ...typography.name, color: colors.text, marginBottom: spacing.sm },
  row: { flexDirection: 'row' },
  body: { flex: 1, marginLeft: spacing.md },
  top: { flexDirection: 'row', alignItems: 'center' },
  name: { ...typography.name, fontSize: 14, color: colors.text, flex: 1 },
  time: { ...typography.meta, color: colors.textFaint, marginLeft: spacing.sm },
  text: { ...typography.body, color: colors.textMuted, marginTop: 2 },
  reply: {
    alignSelf: 'flex-start',
    marginTop: spacing.md,
    marginLeft: 44,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  replyLabel: { ...typography.body, color: colors.text, fontWeight: '600' },
});
