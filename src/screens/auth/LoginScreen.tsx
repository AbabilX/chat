import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../components/common/Screen';
import { TextField } from '../../components/common/TextField';
import { Button } from '../../components/common/Button';
import { colors, spacing, typography } from '../../theme';
import { login } from '../../api/auth';
import { useAuthStore } from '../../store/authStore';
import type { ScreenProps } from '../../navigation/types';

export function LoginScreen({ navigation }: ScreenProps<'Login'>) {
  const signIn = useAuthStore((s) => s.signIn);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await login(email.trim(), password);
      await signIn(res.token, res.user);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen style={styles.pad}>
      <Text style={styles.title}>Welcome back</Text>
      <TextField
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        placeholder="you@example.com"
      />
      <TextField
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="••••••••"
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button label="Log in" onPress={onSubmit} loading={loading} />
      <View style={styles.switchRow}>
        <Text style={styles.muted}>New here? </Text>
        <Text style={styles.link} onPress={() => navigation.navigate('Signup')}>
          Create an account
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  pad: { padding: spacing.xl, justifyContent: 'center' },
  title: { ...typography.title, color: colors.text, marginBottom: spacing.xl },
  error: { color: colors.danger, marginBottom: spacing.md },
  switchRow: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xl },
  muted: { ...typography.body, color: colors.textMuted },
  link: { ...typography.body, color: colors.accent, fontWeight: '600' },
});
