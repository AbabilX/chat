import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../components/common/Screen';
import { TextField } from '../../components/common/TextField';
import { Button } from '../../components/common/Button';
import { colors, spacing, typography } from '../../theme';
import { signup } from '../../api/auth';
import { useAuthStore } from '../../store/authStore';
import type { ScreenProps } from '../../navigation/types';

export function SignupScreen({ navigation }: ScreenProps<'Signup'>) {
  const signIn = useAuthStore((s) => s.signIn);
  const [form, setForm] = useState({
    email: '',
    username: '',
    display_name: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const set = (k: keyof typeof form) => (v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await signup({
        email: form.email.trim(),
        username: form.username.trim(),
        password: form.password,
        display_name: form.display_name.trim() || undefined,
      });
      await signIn(res.token, res.user);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.pad}>
        <Text style={styles.title}>Create account</Text>
        <TextField label="Email" value={form.email} onChangeText={set('email')}
          keyboardType="email-address" placeholder="you@example.com" />
        <TextField label="Username" value={form.username}
          onChangeText={set('username')} placeholder="3-30 chars: a-z 0-9 _ ." />
        <TextField label="Display name" value={form.display_name}
          onChangeText={set('display_name')} autoCapitalize="sentences"
          placeholder="Optional" />
        <TextField label="Password" value={form.password}
          onChangeText={set('password')} secureTextEntry placeholder="Min 8 chars" />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button label="Sign up" onPress={onSubmit} loading={loading} />
        <View style={styles.switchRow}>
          <Text style={styles.muted}>Have an account? </Text>
          <Text style={styles.link} onPress={() => navigation.navigate('Login')}>
            Log in
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  pad: { padding: spacing.xl, flexGrow: 1, justifyContent: 'center' },
  title: { ...typography.title, color: colors.text, marginBottom: spacing.xl },
  error: { color: colors.danger, marginBottom: spacing.md },
  switchRow: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xl },
  muted: { ...typography.body, color: colors.textMuted },
  link: { ...typography.body, color: colors.accent, fontWeight: '600' },
});
