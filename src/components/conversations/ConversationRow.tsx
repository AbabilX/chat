import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Avatar } from '../common/Avatar';
import { colors, spacing, typography } from '../../theme';
import { relativeTime } from '../../utils/time';
import { convDisplay, lastPreview } from '../../utils/conversation';
import type { ConversationSummary } from '../../api/types';

type Props = {
  conv: ConversationSummary;
  meId: string;
  onPress: () => void;
};

export function ConversationRow({ conv, meId, onPress }: Props) {
  const { name, uri } = convDisplay(conv, meId);
  const unread = conv.unread > 0;
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <Avatar name={name} uri={uri} />
      <View style={styles.body}>
        <View style={styles.top}>
          <Text style={styles.name} numberOfLines={1}>{name}</Text>
          {conv.last_message ? (
            <Text style={styles.time}>{relativeTime(conv.last_message.created_at)}</Text>
          ) : null}
        </View>
        <Text
          style={[styles.preview, unread && styles.unread]}
          numberOfLines={2}>
          {lastPreview(conv, meId)}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', paddingVertical: spacing.md, paddingHorizontal: spacing.lg },
  body: { flex: 1, marginLeft: spacing.md, justifyContent: 'center' },
  top: { flexDirection: 'row', alignItems: 'center' },
  name: { ...typography.name, color: colors.text, flex: 1 },
  time: { ...typography.meta, color: colors.textFaint, marginLeft: spacing.sm },
  preview: { ...typography.body, color: colors.textMuted, marginTop: 2 },
  unread: { color: colors.text, fontWeight: '600' },
});
