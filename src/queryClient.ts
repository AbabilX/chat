import { QueryClient } from '@tanstack/react-query';

// Shared client so WS handlers can update the cache outside React components.
export const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});
