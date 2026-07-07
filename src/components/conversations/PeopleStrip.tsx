import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Avatar } from '../common/Avatar';
import { colors, spacing, typography } from '../../theme';

export type Person = { id: string; name: string; uri?: string | null };
type Props = { people: Person[]; onPress: (id: string) => void };

// Horizontal strip of recent people (Slack DM header row).
export function PeopleStrip({ people, onPress }: Props) {
  if (people.length === 0) return null;
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.strip}>
      {people.map((p) => (
        <Pressable key={p.id} style={styles.item} onPress={() => onPress(p.id)}>
          <View>
            <Avatar name={p.name} uri={p.uri} size={64} />
            <View style={styles.dot} />
          </View>
          <Text style={styles.name} numberOfLines={2}>
            {p.name}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  strip: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, gap: spacing.md },
  item: { width: 72, alignItems: 'center' },
  dot: {
    position: 'absolute',
    right: 2,
    bottom: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.online,
    borderWidth: 2,
    borderColor: colors.bg,
  },
  name: { ...typography.meta, color: colors.text, marginTop: spacing.xs, textAlign: 'center' },
});
