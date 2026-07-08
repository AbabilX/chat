import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Avatar } from '../common/Avatar';
import { colors, spacing, typography } from '../../theme';
import type { User } from '../../api/types';

// Cover banner with the avatar overlapping it, then name / handle / email.
export function ProfileBanner({ user }: { user: User | null }) {
  const name = user?.display_name || user?.username || '?';
  return (
    <View>
      {user?.cover_url ? (
        <Image source={{ uri: user.cover_url }} style={styles.cover} />
      ) : (
        <View style={[styles.cover, styles.coverEmpty]} />
      )}
      <View style={styles.avatarWrap}>
        <Avatar name={name} uri={user?.avatar_url} size={96} />
      </View>
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.handle}>@{user?.username}</Text>
      {!!user?.email && <Text style={styles.email}>{user.email}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  cover: { height: 160, width: '100%' },
  coverEmpty: { backgroundColor: colors.surfaceAlt },
  avatarWrap: { marginTop: -48, marginLeft: spacing.lg },
  name: { ...typography.title, color: colors.text, marginTop: spacing.md, marginLeft: spacing.lg },
  handle: { ...typography.body, color: colors.textMuted, marginLeft: spacing.lg, marginTop: 2 },
  email: { ...typography.meta, color: colors.textFaint, marginLeft: spacing.lg, marginTop: 2 },
});
