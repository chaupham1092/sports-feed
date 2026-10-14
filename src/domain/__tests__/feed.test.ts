/**
 * feed.test.ts — UNIT TESTS for immutable feed logic.
 * ------------------------------------------------------------------
 * The key lesson here: these functions must NOT mutate their inputs.
 * We assert both the new value AND that the original array is untouched.
 * Interviewers love when you check immutability explicitly.
 * ------------------------------------------------------------------
 */

import { addPost, createPost, sortByNewest, toggleLike } from '../feed';
import { Post } from '../types';

function samplePost(overrides: Partial<Post> = {}): Post {
  return {
    id: 'p1',
    author: 'Jordan',
    message: 'Hello',
    createdAt: 1000,
    likes: 5,
    likedByMe: false,
    ...overrides,
  };
}

describe('toggleLike', () => {
  it('likes a post: increments count and sets likedByMe', () => {
    const posts = [samplePost()];
    const next = toggleLike(posts, 'p1');
    expect(next[0].likes).toBe(6);
    expect(next[0].likedByMe).toBe(true);
  });

  it('unlikes a post: decrements count and clears likedByMe', () => {
    const posts = [samplePost({ likes: 5, likedByMe: true })];
    const next = toggleLike(posts, 'p1');
    expect(next[0].likes).toBe(4);
    expect(next[0].likedByMe).toBe(false);
  });

  it('does not mutate the original array (immutability)', () => {
    const posts = [samplePost()];
    toggleLike(posts, 'p1');
    // Original is unchanged — proves we returned a new array.
    expect(posts[0].likes).toBe(5);
    expect(posts[0].likedByMe).toBe(false);
  });

  it('leaves other posts untouched', () => {
    const posts = [samplePost({ id: 'p1' }), samplePost({ id: 'p2', likes: 2 })];
    const next = toggleLike(posts, 'p1');
    expect(next[1].likes).toBe(2);
  });
});

describe('addPost', () => {
  it('prepends the new post (newest first)', () => {
    const posts = [samplePost({ id: 'old' })];
    const next = addPost(posts, samplePost({ id: 'new' }));
    expect(next[0].id).toBe('new');
    expect(next).toHaveLength(2);
  });
});

describe('createPost', () => {
  it('builds a post with 0 likes, not liked, trimmed message', () => {
    const post = createPost({
      id: 'x',
      author: 'You',
      message: '  padded  ',
      now: 1234,
    });
    expect(post).toMatchObject({
      id: 'x',
      author: 'You',
      message: 'padded',
      likes: 0,
      likedByMe: false,
      createdAt: 1234,
    });
  });
});

describe('sortByNewest', () => {
  it('orders posts by createdAt descending', () => {
    const posts = [
      samplePost({ id: 'a', createdAt: 100 }),
      samplePost({ id: 'b', createdAt: 300 }),
      samplePost({ id: 'c', createdAt: 200 }),
    ];
    const ids = sortByNewest(posts).map((p) => p.id);
    expect(ids).toEqual(['b', 'c', 'a']);
  });
});
