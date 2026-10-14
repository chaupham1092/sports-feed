/**
 * App.tsx — the root of the app.
 * ------------------------------------------------------------------
 * Wraps the tree in the three providers every feature depends on:
 *  1. GestureHandlerRootView — required by react-native-gesture-handler.
 *  2. SafeAreaProvider — powers useSafeAreaInsets() so our UI dodges
 *     notches and Android's on-screen nav bar.
 *  3. QueryClientProvider — makes the React Query cache available to all
 *     the usePosts/useChat hooks below it.
 * ------------------------------------------------------------------
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { FeedScreen } from './src/screens/FeedScreen';

// One QueryClient for the whole app. Defaults tuned lightly: don't
// hammer refetch on every window focus in a mobile app.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="light" />
          <FeedScreen />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
