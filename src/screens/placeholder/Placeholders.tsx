import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../components/common/Screen';
import { useAuthStore } from '../../store/authStore';
import { colors, radius, spacing, typography } from '../../theme';

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

export const HomeScreen = () => (
  <Stub title="Home" subtitle="Your channels and activity land here soon." />
);
export const ActivityScreen = () => (
  <Stub title="Activity" subtitle="Mentions and reactions land here soon." />
);
export const SearchScreen = () => (
  <Stub title="Search" subtitle="Search people and messages here soon." />
);

export function MoreScreen() {
  const signOut = useAuthStore((s) => s.signOut);
  return (
    <Screen edges={['top']}>
      <View style={styles.center}>
        <Text style={styles.title}>More</Text>
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
