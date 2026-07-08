import { request } from './client';
import type { ActivityItem } from './types';

// Mentions + thread replies across every conversation, newest first.
export function fetchActivity(): Promise<ActivityItem[]> {
  return request<{ items: ActivityItem[] }>('/activity').then((r) => r.items);
}
