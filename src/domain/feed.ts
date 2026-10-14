/**
 * src/domain/feed.ts
 * ------------------------------------------------------------------
 * Pure feed-manipulation logic. These functions take the current list
 * of posts and return a NEW list (immutable updates — we never mutate
 * the array we were given). Immutability is what lets React detect
 * changes and re-render, and it's what makes these functions trivial
 * to unit test: given input X, assert output Y.
 * ------------------------------------------------------------------
 */

import { Bet, Post } from './types';

/**
 * Toggle the "liked by me" state of one post and adjust its like count.
 * Returns a brand-new array; the input is left untouched.
 */
export function toggleLike(posts: Post[], postId: string): Post[] {
  return posts.map((post) => {
    if (post.id !== postId) {
      return post;
    }
    const likedByMe = !post.likedByMe;
    return {
      ...post,
      likedByMe,
      likes: likedByMe ? post.likes + 1 : post.likes - 1,
    };
  });
}

/**
 * Prepend a new post to the feed (newest first — the convention for
 * social feeds). Pure: returns a new array.
 */
export function addPost(posts: Post[], newPost: Post): Post[] {
  return [newPost, ...posts];
}

/**
 * Build a Post object from raw bet-form values. Keeping this as a
 * factory function (rather than inline in the component) means the
 * shape of a "new post" is defined and tested in exactly one place.
 */
export function createPost(params: {
  id: string;
  author: string;
  message: string;
  bet?: Bet;
  now?: number; // injectable clock makes the function deterministic in tests
}): Post {
  return {
    id: params.id,
    author: params.author,
    message: params.message.trim(),
    bet: params.bet,
    createdAt: params.now ?? Date.now(),
    likes: 0,
    likedByMe: false,
  };
}

/**
 * Sort posts newest-first. Pure and stable.
 */
export function sortByNewest(posts: Post[]): Post[] {
  return [...posts].sort((a, b) => b.createdAt - a.createdAt);
}
