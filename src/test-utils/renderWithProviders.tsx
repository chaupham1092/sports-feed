/**
 * src/test-utils/renderWithProviders.tsx
 * ------------------------------------------------------------------
 * A custom render helper. Components that use React Query hooks need a
 * QueryClientProvider around them, or they throw. Rather than repeat
 * that wrapper in every test, we wrap once here.
 *
 * This is a VERY common interview-level pattern: "we wrap render() so
 * every test gets the providers the app needs". Testing Library even
 * documents this as the recommended approach.
 * ------------------------------------------------------------------
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react-native';
import React, { ReactElement } from 'react';

/**
 * Each test gets a FRESH QueryClient so cached data from one test can't
 * leak into another (test isolation). We also turn off retries so a
 * failed query fails fast instead of retrying during the test.
 */
export function renderWithProviders(ui: ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return {
    queryClient,
    ...render(
      <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
    ),
  };
}
