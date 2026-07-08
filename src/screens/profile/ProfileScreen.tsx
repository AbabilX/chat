import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Screen } from '../../components/common/Screen';
import { ProfileBanner } from '../../components/profile/ProfileBanner';
import { ProfileActionRow } from '../../components/profile/ProfileActionRow';
import { useAuthStore } from '../../store/authStore';
import { colors, spacing } from '../../theme';
import type { TabScreenProps } from '../../navigation/types';

// The "More" tab: full profile page (banner + avatar) with account actions.
export function ProfileScreen({ navigation }: TabScreenProps<'More'>) {
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);

  return (
    <Screen edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <ProfileBanner user={user} />
        <ProfileActionRow
          icon="edit"
          label="Edit profile"
          onPress={() => navigation.navigate('EditProfile')}
        />
        <ProfileActionRow icon="logout" label="Log out" danger onPress={signOut} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: spacing.xxl, backgroundColor: colors.bg },
});
