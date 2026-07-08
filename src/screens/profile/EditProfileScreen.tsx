import React from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../components/common/Screen';
import { Avatar } from '../../components/common/Avatar';
import { useAuthStore } from '../../store/authStore';
import { useProfileImage } from '../../hooks/useProfileImage';
import { colors, radius, spacing, typography } from '../../theme';

export function EditProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const { busy, changeAvatar, changeCover } = useProfileImage();
  const name = user?.display_name || user?.username || '?';

  return (
    <Screen edges={['bottom']}>
      <Pressable style={styles.cover} onPress={changeCover} disabled={!!busy}>
        {user?.cover_url ? (
          <Image source={{ uri: user.cover_url }} style={styles.coverImg} />
        ) : (
          <View style={styles.coverEmpty} />
        )}
        <View style={styles.editPill}>
          <Text style={styles.editText}>{busy === 'cover_url' ? '…' : 'Edit cover'}</Text>
        </View>
      </Pressable>

      <View style={styles.avatarWrap}>
        <Pressable onPress={changeAvatar} disabled={!!busy}>
          <Avatar name={name} uri={user?.avatar_url} size={88} />
          <View style={styles.avatarBadge}>
            {busy === 'avatar_url' ? (
              <ActivityIndicator size="small" color={colors.text} />
            ) : (
              <Text style={styles.avatarBadgeText}>+</Text>
            )}
          </View>
        </Pressable>
      </View>

      <Text style={styles.name}>{name}</Text>
      <Text style={styles.handle}>@{user?.username}</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  cover: { height: 160, backgroundColor: colors.surface },
  coverImg: { width: '100%', height: '100%' },
  coverEmpty: { flex: 1, backgroundColor: colors.surfaceAlt },
  editPill: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.md,
    backgroundColor: colors.bg,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  editText: { ...typography.meta, color: colors.text },
  avatarWrap: { marginTop: -44, marginLeft: spacing.lg },
  avatarBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 2,
    borderColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarBadgeText: { fontSize: 18, color: colors.text, marginTop: -2 },
  name: { ...typography.title, color: colors.text, marginTop: spacing.md, marginLeft: spacing.lg },
  handle: { ...typography.body, color: colors.textMuted, marginLeft: spacing.lg, marginTop: 2 },
});
