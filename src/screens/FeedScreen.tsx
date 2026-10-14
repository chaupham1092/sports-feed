/**
 * src/screens/FeedScreen.tsx
 * ------------------------------------------------------------------
 * The main community feed. Shows posts in a FlatList, lets you like
 * them, open a chat, or share a new pick.
 *
 * PERFORMANCE (JD bullet) — why FlatList and not .map() in a ScrollView:
 *  - FlatList is "virtualized": it only renders rows near the viewport
 *    and recycles them as you scroll. A ScrollView renders ALL children
 *    up front, which kills performance on long feeds.
 *  - keyExtractor gives each row a stable identity so React can reuse it.
 *  - The row callbacks (handleToggleLike/handleOpenChat) are wrapped in
 *    useCallback so their references stay stable; combined with the
 *    memo'd PostCard, scrolling and liking don't re-render every row.
 * ------------------------------------------------------------------
 */

import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PostCard } from '../components/PostCard';
import { ShareBetForm } from '../components/ShareBetForm';
import { Post } from '../domain/types';
import { useCreatePost, usePosts, useToggleLike } from '../hooks/usePosts';
import { ChatScreen } from './ChatScreen';

const CURRENT_USER = 'You';

export function FeedScreen() {
  const insets = useSafeAreaInsets();
  const { data: posts, isLoading, isError, refetch } = usePosts();
  const toggleLike = useToggleLike();
  const createPost = useCreatePost();

  const [composerOpen, setComposerOpen] = useState(false);
  const [chatPostId, setChatPostId] = useState<string | null>(null);

  const handleToggleLike = useCallback(
    (postId: string) => toggleLike.mutate(postId),
    [toggleLike]
  );

  const handleOpenChat = useCallback((postId: string) => {
    setChatPostId(postId);
  }, []);

  const handleShare = useCallback(
    (post: Post) => {
      createPost.mutate(post);
      setComposerOpen(false);
    },
    [createPost]
  );

  const renderItem = useCallback(
    ({ item }: { item: Post }) => (
      <PostCard
        post={item}
        onToggleLike={handleToggleLike}
        onOpenChat={handleOpenChat}
      />
    ),
    [handleToggleLike, handleOpenChat]
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]} testID="feed-screen">
      <View style={styles.header}>
        <Text style={styles.title}>⚡ The Feed</Text>
        <Pressable
          testID="open-composer"
          onPress={() => setComposerOpen(true)}
          style={styles.newButton}
          accessibilityRole="button"
          accessibilityLabel="Share a new pick"
        >
          <Text style={styles.newButtonText}>+ Share</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <ActivityIndicator testID="feed-loading" style={styles.loading} size="large" />
      ) : isError ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>Could not load the feed.</Text>
          <Pressable testID="feed-retry" onPress={() => refetch()} style={styles.retry}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={posts ?? []}
          keyExtractor={(p) => p.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
          // Perf knobs an interviewer may ask about:
          initialNumToRender={6}
          windowSize={7}
          removeClippedSubviews
        />
      )}

      {/* Composer modal */}
      <Modal visible={composerOpen} animationType="slide" onRequestClose={() => setComposerOpen(false)}>
        <View style={[styles.modal, { paddingTop: insets.top }]}>
          <ShareBetForm
            author={CURRENT_USER}
            onSubmit={handleShare}
            onCancel={() => setComposerOpen(false)}
          />
        </View>
      </Modal>

      {/* Chat modal */}
      <Modal
        visible={chatPostId !== null}
        animationType="slide"
        onRequestClose={() => setChatPostId(null)}
      >
        <View style={[styles.modal, { paddingTop: insets.top }]}>
          {chatPostId ? (
            <ChatScreen
              postId={chatPostId}
              author={CURRENT_USER}
              onClose={() => setChatPostId(null)}
            />
          ) : null}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b1220' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: { color: '#f9fafb', fontSize: 24, fontWeight: '900' },
  newButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  newButtonText: { color: '#fff', fontWeight: '800' },
  loading: { marginTop: 40 },
  center: { alignItems: 'center', marginTop: 40, gap: 12 },
  errorText: { color: '#f87171', fontSize: 15 },
  retry: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryText: { color: '#fff', fontWeight: '700' },
  modal: { flex: 1, backgroundColor: '#0b1220' },
});
