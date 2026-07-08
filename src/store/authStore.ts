import { create } from 'zustand';
import type { User } from '../api/types';
import { setAuthToken } from '../api/client';
import { saveAuth, loadAuth, clearAuth } from '../utils/storage';

type AuthState = {
  token: string | null;
  user: User | null;
  hydrated: boolean; // true once we've checked storage on boot
  hydrate: () => Promise<void>;
  signIn: (token: string, user: User) => Promise<void>;
  setUser: (user: User) => Promise<void>;
  signOut: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  hydrated: false,

  hydrate: async () => {
    const stored = await loadAuth();
    if (stored) setAuthToken(stored.token);
    set({
      token: stored?.token ?? null,
      user: stored?.user ?? null,
      hydrated: true,
    });
  },

  signIn: async (token, user) => {
    setAuthToken(token);
    await saveAuth(token, user);
    set({ token, user });
  },

  setUser: async (user) => {
    const token = get().token;
    if (token) await saveAuth(token, user);
    set({ user });
  },

  signOut: async () => {
    setAuthToken(null);
    await clearAuth();
    set({ token: null, user: null });
  },
}));
