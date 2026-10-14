/**
 * src/hooks/usePosts.ts
 * ------------------------------------------------------------------
 * React Query hooks = our "client-side data management strategy".
 *
 * INTERVIEW TERMINOLOGY you should be able to say out loud:
 *  - "Server state vs. client state": data that lives on the backend
 *    (posts, chat) is SERVER STATE. React Query manages it — caching,
 *    refetching, loading/error flags — so we don't hand-roll useEffect
 *    + useState for every fetch.
 *  - "Query key": the cache identity of a piece of data (['posts']).
 *  - "Invalidation": telling the cache "this is stale, refetch it".
 *  - "Optimistic update": update the UI immediately (before the server
 *    confirms) for instant feedback, then roll back if the call fails.
 *    This is exactly what a "like" button needs to feel snappy.
 * ------------------------------------------------------------------
 */

import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  createPostRemote,
  fetchPosts,
  likePostRemote,
} from '../api/mockApi';
import { Post } from '../domain/types';

/** The one place the "posts" cache key is defined. */
export const postsKey = ['posts'] as const;

/** Read the feed. React Query handles caching + loading/error state. */
export function usePosts() {
  return useQuery({
    queryKey: postsKey,
    queryFn: fetchPosts,
  });
}

/** Create a post, then invalidate the feed so it refetches with it. */
export function useCreatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPostRemote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postsKey });
    },
  });
}

/**
 * Like/unlike a post with an OPTIMISTIC UPDATE.
 *
 * Flow:
 *  1. onMutate: cancel in-flight refetches, snapshot the current cache,
 *     then write the toggled state into the cache immediately.
 *  2. If the server call fails, onError restores the snapshot (rollback).
 *  3. onSettled: refetch to make sure client and server agree.
 */
export function useToggleLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: likePostRemote,
    onMutate: async (postId: string) => {
      await queryClient.cancelQueries({ queryKey: postsKey });
      const previous = queryClient.getQueryData<Post[]>(postsKey);

      queryClient.setQueryData<Post[]>(postsKey, (old) =>
        (old ?? []).map((p) =>
          p.id === postId
            ? {
                ...p,
                likedByMe: !p.likedByMe,
                likes: p.likedByMe ? p.likes - 1 : p.likes + 1,
              }
            : p
        )
      );

      // Returned value becomes `context` in onError/onSettled.
      return { previous };
    },
    onError: (_err, _postId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(postsKey, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: postsKey });
    },
  });
}
