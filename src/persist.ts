import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';

// Writes the whole query cache to disk so conversations and messages paint
// instantly on the next launch (WhatsApp/Signal-style), then refresh in the
// background. Restored automatically by PersistQueryClientProvider in App.tsx.
export const persister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'ababil.rq-cache',
});

export const CACHE_MAX_AGE = 1000 * 60 * 60 * 24 * 7; // keep 7 days offline
