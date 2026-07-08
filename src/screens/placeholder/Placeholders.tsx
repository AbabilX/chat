import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../components/common/Screen';
import { colors, spacing, typography } from '../../theme';

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

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  title: { ...typography.title, color: colors.text, marginBottom: spacing.sm },
  subtitle: { ...typography.body, color: colors.textMuted, textAlign: 'center' },
});
