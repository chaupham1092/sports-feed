/**
 * usePosts.test.tsx — testing React Query HOOKS in isolation.
 * ------------------------------------------------------------------
 * Shows:
 *  - renderHook: render a hook without a component.
 *  - A wrapper that provides the QueryClient the hook needs.
 *  - waitFor: async assertion that retries until it passes or times out
 *    (because queries resolve asynchronously).
 *  - jest.mock at the module boundary: we replace the whole mockApi so
 *    the hook talks to our controlled fake instead of the "network".
 * ------------------------------------------------------------------
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';
import { Post } from '../../domain/types';
import { useToggleLike, usePosts } from '../usePosts';

// Replace the API module. Every function becomes a jest.fn() we control.
jest.mock('../../api/mockApi');
import * as api from '../../api/mockApi';

const mockedApi = api as jest.Mocked<typeof api>;

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

const basePost: Post = {
  id: 'p1',
  author: 'Jordan',
  message: 'hi',
  createdAt: 1,
  likes: 5,
  likedByMe: false,
};

describe('usePosts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches and returns posts', async () => {
    mockedApi.fetchPosts.mockResolvedValue([basePost]);

    const { result } = renderHook(() => usePosts(), { wrapper });

    // Initially loading, no data.
    expect(result.current.isLoading).toBe(true);

    // waitFor retries the assertion until the query resolves.
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([basePost]);
  });
});

describe('useToggleLike (optimistic update)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('optimistically updates the like in the cache before the server responds', async () => {
    mockedApi.fetchPosts.mockResolvedValue([basePost]);
    // Make the server call hang so we can observe the OPTIMISTIC state.
    let resolveLike!: (p: Post) => void;
    mockedApi.likePostRemote.mockReturnValue(
      new Promise<Post>((resolve) => {
        resolveLike = resolve;
      })
    );

    const { result } = renderHook(
      () => ({ posts: usePosts(), like: useToggleLike() }),
      { wrapper }
    );

    await waitFor(() => expect(result.current.posts.isSuccess).toBe(true));

    // Fire the like. Because onMutate runs synchronously-ish, the cache
    // should reflect the toggle immediately, before resolveLike() is called.
    act(() => {
      result.current.like.mutate('p1');
    });

    await waitFor(() => {
      expect(result.current.posts.data?.[0].likedByMe).toBe(true);
      expect(result.current.posts.data?.[0].likes).toBe(6);
    });

    // Now let the server respond, which triggers a refetch (onSettled).
    mockedApi.fetchPosts.mockResolvedValue([
      { ...basePost, likedByMe: true, likes: 6 },
    ]);
    act(() => {
      resolveLike({ ...basePost, likedByMe: true, likes: 6 });
    });

    await waitFor(() => expect(result.current.posts.data?.[0].likes).toBe(6));
  });

  it('rolls back the optimistic update if the server call fails', async () => {
    mockedApi.fetchPosts.mockResolvedValue([basePost]);
    mockedApi.likePostRemote.mockRejectedValue(new Error('network down'));

    const { result } = renderHook(
      () => ({ posts: usePosts(), like: useToggleLike() }),
      { wrapper }
    );

    await waitFor(() => expect(result.current.posts.isSuccess).toBe(true));

    act(() => {
      result.current.like.mutate('p1');
    });

    // After the failure + rollback + refetch, the like count returns to 5.
    await waitFor(() => {
      expect(result.current.posts.data?.[0].likes).toBe(5);
      expect(result.current.posts.data?.[0].likedByMe).toBe(false);
    });
  });
});
