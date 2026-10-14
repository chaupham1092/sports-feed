/**
 * src/hooks/useChat.ts
 * ------------------------------------------------------------------
 * React Query hooks for a post's chat thread. Same patterns as
 * usePosts, scoped per post via a parameterized query key:
 *   ['chat', postId]
 * Parameterized keys are how React Query caches many independent lists
 * (one per post) without them colliding.
 * ------------------------------------------------------------------
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchChat, sendChatRemote } from '../api/mockApi';
import { ChatMessage } from '../domain/types';

export const chatKey = (postId: string) => ['chat', postId] as const;

export function useChat(postId: string) {
  return useQuery({
    queryKey: chatKey(postId),
    queryFn: () => fetchChat(postId),
  });
}

export function useSendMessage(postId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: sendChatRemote,
    // Optimistically append the message so the chat feels instant.
    onMutate: async (msg: ChatMessage) => {
      await queryClient.cancelQueries({ queryKey: chatKey(postId) });
      const previous = queryClient.getQueryData<ChatMessage[]>(chatKey(postId));
      queryClient.setQueryData<ChatMessage[]>(chatKey(postId), (old) => [
        ...(old ?? []),
        msg,
      ]);
      return { previous };
    },
    onError: (_err, _msg, context) => {
      if (context?.previous) {
        queryClient.setQueryData(chatKey(postId), context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: chatKey(postId) });
    },
  });
}
