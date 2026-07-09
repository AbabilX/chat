import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet } from 'react-native';
import { Screen } from '../../components/common/Screen';
import { ProfileBanner } from '../../components/profile/ProfileBanner';
import { ProfileActionRow } from '../../components/profile/ProfileActionRow';
import { useAuthStore } from '../../store/authStore';
import { deleteAccount } from '../../api/users';
import { colors, spacing } from '../../theme';
import type { TabScreenProps } from '../../navigation/types';

// The "More" tab: full profile page (banner + avatar) with account actions.
export function ProfileScreen({ navigation }: TabScreenProps<'More'>) {
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const [deleting, setDeleting] = useState(false);

  const confirmDeleteAccount = () => {
    Alert.alert(
      'Delete account',
      'Your account will be permanently deleted after 7 days. Log in again before then to cancel. All your data (messages, photos) will be removed.',
      [
        { text: 'Keep account', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await deleteAccount();
              Alert.alert(
                'Account scheduled for deletion',
                'You have 7 days to change your mind — just log in again to cancel.',
              );
              await signOut();
            } catch (err) {
              setDeleting(false);
              Alert.alert('Delete failed', err instanceof Error ? err.message : 'Try again.');
            }
          },
        },
      ],
    );
  };

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
        <ProfileActionRow
          icon="delete"
          label={deleting ? 'Deleting account…' : 'Delete my account'}
          danger
          onPress={deleting ? () => {} : confirmDeleteAccount}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: spacing.xxl, backgroundColor: colors.bg },
});
