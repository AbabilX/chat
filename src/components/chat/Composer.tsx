import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme';

type Props = {
  placeholder: string;
  onSend: (body: string) => void;
};

// Bottom message input with a send button (matches the Slack composer bar).
export function Composer({ placeholder, onSend }: Props) {
  const [text, setText] = useState('');
  const submit = () => {
    const body = text.trim();
    if (!body) return;
    onSend(body);
    setText('');
  };
  return (
    <View style={styles.bar}>
      <TextInput
        style={styles.input}
        value={text}
        onChangeText={setText}
        placeholder={placeholder}
        placeholderTextColor={colors.textFaint}
        multiline
      />
      <Pressable
        style={[styles.send, !text.trim() && styles.sendOff]}
        onPress={submit}
        disabled={!text.trim()}>
        <Text style={styles.sendIcon}>➤</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bg,
  },
  input: {
    flex: 1,
    maxHeight: 120,
    minHeight: 44,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    fontSize: typography.body.fontSize,
  },
  send: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    marginLeft: spacing.sm,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendOff: { opacity: 0.4 },
  sendIcon: { color: colors.white, fontSize: 18 },
});
