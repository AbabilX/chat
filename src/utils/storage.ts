import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User } from '../api/types';

const TOKEN_KEY = 'auth.token';
const USER_KEY = 'auth.user';

export type StoredAuth = { token: string; user: User };

export async function saveAuth(token: string, user: User): Promise<void> {
  await AsyncStorage.setItem(TOKEN_KEY, token);
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
}

export async function loadAuth(): Promise<StoredAuth | null> {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  const rawUser = await AsyncStorage.getItem(USER_KEY);
  if (!token || !rawUser) return null;
  try {
    return { token, user: JSON.parse(rawUser) as User };
  } catch {
    return null;
  }
}

export async function clearAuth(): Promise<void> {
  await AsyncStorage.removeItem(TOKEN_KEY);
  await AsyncStorage.removeItem(USER_KEY);
}
