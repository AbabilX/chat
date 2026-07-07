import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { colors, radius, typography } from '../../theme';

type Props = { name: string; uri?: string | null; size?: number };

// Rounded-square avatar (Slack style); falls back to an initial on colored tile.
export function Avatar({ name, uri, size = 44 }: Props) {
  const box = { width: size, height: size, borderRadius: radius.md };
  if (uri) return <Image source={{ uri }} style={[styles.img, box]} />;
  return (
    <View style={[styles.fallback, box]}>
      <Text style={[styles.initial, { fontSize: size * 0.42 }]}>
        {(name || '?').charAt(0).toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  img: { backgroundColor: colors.surfaceAlt },
  fallback: {
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: { ...typography.name, color: colors.text },
});
