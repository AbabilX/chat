import { QueryClient } from '@tanstack/react-query';
import { CACHE_MAX_AGE } from './persist';

// Shared client so WS handlers can update the cache outside React components.
// gcTime must outlive the on-disk cache or restored data gets dropped at boot.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      gcTime: CACHE_MAX_AGE,
      staleTime: 30_000,
    },
  },
});
