import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../components/common/Screen';
import { useAuthStore } from '../../store/authStore';
import { colors, radius, spacing, typography } from '../../theme';
import type { TabScreenProps } from '../../navigation/types';

// Simple centered stub used by tabs that aren't built yet in v1.
function Stub({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <Screen edges={['top']}>
      <View style={styles.center}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </Screen>
  );
}

export const SearchScreen = () => (
  <Stub title="Search" subtitle="Search people and messages here soon." />
);

export function MoreScreen({ navigation }: TabScreenProps<'More'>) {
  const signOut = useAuthStore((s) => s.signOut);
  return (
    <Screen edges={['top']}>
      <View style={styles.center}>
        <Text style={styles.title}>More</Text>
        <Pressable style={styles.action} onPress={() => navigation.navigate('EditProfile')}>
          <Text style={styles.actionText}>Edit profile</Text>
        </Pressable>
        <Pressable style={styles.logout} onPress={signOut}>
          <Text style={styles.logoutText}>Log out</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  title: { ...typography.title, color: colors.text, marginBottom: spacing.sm },
  subtitle: { ...typography.body, color: colors.textMuted, textAlign: 'center' },
  action: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionText: { ...typography.button, color: colors.text },
  logout: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  logoutText: { ...typography.button, color: colors.danger },
});
