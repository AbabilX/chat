import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Avatar } from '../common/Avatar';
import { useConversations } from '../../hooks/useConversations';
import { useAuthStore } from '../../store/authStore';
import { convDisplay } from '../../utils/conversation';
import { colors, spacing, typography } from '../../theme';

type Props = { conversationId: string; title: string; onPress: () => void };

// WhatsApp-style header content: avatar + name, tappable to open chat info.
export function ChatHeaderTitle({ conversationId, title, onPress }: Props) {
  const meId = useAuthStore((s) => s.user)?.id ?? '';
  const { data } = useConversations();
  const conv = data?.find((c) => c.id === conversationId);
  const d = conv ? convDisplay(conv, meId) : { name: title, uri: null };
  const sub = conv?.type === 'group' ? 'Group' : 'tap here for contact info';

  return (
    <Pressable style={styles.row} onPress={onPress}>
      <Avatar name={d.name} uri={d.uri} size={36} />
      <View style={styles.text}>
        <Text style={styles.name} numberOfLines={1}>{d.name}</Text>
        <Text style={styles.sub} numberOfLines={1}>{sub}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, maxWidth: 240 },
  text: { flexShrink: 1 },
  name: { ...typography.header, color: colors.text },
  sub: { ...typography.meta, color: colors.textMuted },
});
