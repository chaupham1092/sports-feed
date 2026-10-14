/**
 * src/components/PostCard.tsx
 * ------------------------------------------------------------------
 * One row in the feed. Shows author, message, optional bet, and a
 * like button + a "Chat" button.
 *
 * PERFORMANCE NOTE (JD: "performance optimization"):
 * This component is wrapped in React.memo. In a FlatList, memo stops a
 * row from re-rendering unless ITS OWN props change. Combined with
 * stable callbacks from the parent (useCallback), this prevents the
 * whole list from re-rendering every time one like count changes.
 * The industry phrase is "avoiding unnecessary re-renders".
 *
 * The animated heart uses react-native-reanimated — the JD lists
 * "animations" as required experience. We animate scale on press so a
 * like feels tactile.
 * ------------------------------------------------------------------
 */

import React, { memo, useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import { Post } from '../domain/types';
import { BetChip } from './BetChip';

interface Props {
  post: Post;
  onToggleLike: (postId: string) => void;
  onOpenChat: (postId: string) => void;
}

function PostCardComponent({ post, onToggleLike, onOpenChat }: Props) {
  // A "shared value" is reanimated's unit of animation state. It lives
  // on the UI thread, so animating it never blocks JS — that's why
  // reanimated animations stay smooth under load.
  const scale = useSharedValue(1);

  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // useCallback keeps this function reference stable across renders so
  // the Pressable below doesn't see a "new" onPress every render.
  const handleLike = useCallback(() => {
    // little pop: 1 -> 1.4 -> 1
    scale.value = withSequence(withSpring(1.4), withSpring(1));
    onToggleLike(post.id);
  }, [onToggleLike, post.id, scale]);

  const handleChat = useCallback(() => {
    onOpenChat(post.id);
  }, [onOpenChat, post.id]);

  return (
    <View style={styles.card} testID={`post-${post.id}`}>
      <Text style={styles.author}>{post.author}</Text>
      <Text style={styles.message}>{post.message}</Text>

      {post.bet ? <BetChip bet={post.bet} /> : null}

      <View style={styles.actions}>
        <Pressable
          onPress={handleLike}
          testID={`like-button-${post.id}`}
          accessibilityRole="button"
          accessibilityLabel={
            post.likedByMe ? 'Unlike this post' : 'Like this post'
          }
          hitSlop={8}
          style={styles.action}
        >
          <Animated.Text style={[styles.heart, heartStyle]}>
            {post.likedByMe ? '❤️' : '🤍'}
          </Animated.Text>
          <Text style={styles.actionText} testID={`like-count-${post.id}`}>
            {post.likes}
          </Text>
        </Pressable>

        <Pressable
          onPress={handleChat}
          testID={`chat-button-${post.id}`}
          accessibilityRole="button"
          accessibilityLabel="Open chat for this post"
          hitSlop={8}
          style={styles.action}
        >
          <Text style={styles.actionText}>💬 Chat</Text>
        </Pressable>
      </View>
    </View>
  );
}

/**
 * Custom comparison for memo: only re-render when something visible
 * actually changed. This is the kind of micro-optimization an
 * interviewer loves to hear you reason about (and NOT over-apply).
 */
export const PostCard = memo(PostCardComponent, (prev, next) => {
  return (
    prev.post.id === next.post.id &&
    prev.post.likes === next.post.likes &&
    prev.post.likedByMe === next.post.likedByMe &&
    prev.post.message === next.post.message &&
    prev.onToggleLike === next.onToggleLike &&
    prev.onOpenChat === next.onOpenChat
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#111827',
    borderRadius: 14,
    padding: 14,
    marginHorizontal: 12,
    marginVertical: 6,
  },
  author: { color: '#60a5fa', fontWeight: '700', fontSize: 15 },
  message: { color: '#e5e7eb', fontSize: 15, marginTop: 4, lineHeight: 20 },
  actions: { flexDirection: 'row', marginTop: 12, gap: 20 },
  action: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  heart: { fontSize: 18 },
  actionText: { color: '#9ca3af', fontSize: 14, fontWeight: '600' },
});
