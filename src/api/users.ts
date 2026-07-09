import { request } from './client';
import type { User } from './types';

// Backend requires at least 2 characters; returns up to 20 matches.
export function searchUsers(q: string): Promise<User[]> {
  if (q.trim().length < 2) return Promise.resolve([]);
  return request<{ users: User[] }>(
    `/users/search?q=${encodeURIComponent(q.trim())}`,
  ).then((r) => r.users);
}

// PATCH /me — update avatar and/or cover URL, returns the fresh user.
export function updateProfile(body: {
  avatar_url?: string;
  cover_url?: string;
}): Promise<User> {
  return request<User>('/me', { method: 'PATCH', body });
}

// DELETE /me — schedules account deletion. The account enters a 7-day grace
// period (logging back in cancels it); a backend reaper then permanently
// purges DB rows and R2-stored avatar/cover/attachments.
export function deleteAccount(): Promise<{
  scheduled: boolean;
  purge_at: string;
  grace_seconds: number;
}> {
  return request('/me', { method: 'DELETE' });
}
