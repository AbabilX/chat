import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Avatar } from '../common/Avatar';
import { colors, spacing, typography } from '../../theme';
import { relativeTime } from '../../utils/time';
import type { ActivityItem } from '../../api/types';

type Props = {
  item: ActivityItem;
  senderName: string;
  senderAvatar?: string | null;
  convName: string;
  onPress: () => void;
};

// One Activity row: sender avatar + badge, "Mention/Thread in <conv>", preview, time + unread dot.
export function ActivityRow({ item, senderName, senderAvatar, convName, onPress }: Props) {
  const isMention = item.kind === 'mention';
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <View style={styles.avatarWrap}>
        <Avatar name={senderName} uri={senderAvatar} size={44} />
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{isMention ? '@' : '↩'}</Text>
        </View>
      </View>
      <View style={styles.body}>
        <View style={styles.top}>
          <Text style={styles.name} numberOfLines={1}>
            {senderName}
          </Text>
          <View style={styles.right}>
            <Text style={styles.time}>{relativeTime(item.message.created_at)}</Text>
            {item.unread ? <View style={styles.dot} /> : null}
          </View>
        </View>
        <Text style={styles.subtitle}>
          {isMention ? 'Mention in ' : 'Thread in '}
          {convName}
        </Text>
        <Text style={styles.preview} numberOfLines={2}>
          {item.message.body}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatarWrap: { marginRight: spacing.md },
  badge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { fontSize: 10, color: colors.text },
  body: { flex: 1 },
  top: { flexDirection: 'row', alignItems: 'center' },
  name: { ...typography.name, color: colors.text, flex: 1, fontWeight: '700' },
  right: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  time: { ...typography.meta, color: colors.textFaint },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent },
  subtitle: { ...typography.meta, color: colors.textMuted, marginTop: 2 },
  preview: { ...typography.body, color: colors.text, marginTop: 2 },
});
