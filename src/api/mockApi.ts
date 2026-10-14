/**
 * src/api/mockApi.ts
 * ------------------------------------------------------------------
 * A fake backend that mimics how a real Supabase (or REST) backend
 * behaves: async functions that resolve after a short delay. In the
 * real job this file would be replaced by Supabase client calls
 * (supabase.from('posts').select(), .insert(), realtime subscriptions).
 *
 * We keep it mockable so:
 *   1. The app runs with zero backend setup (good for a 1-day build).
 *   2. Tests can mock THIS module instead of the network, which is the
 *      standard pattern: "mock at the API boundary, not deep in React".
 * ------------------------------------------------------------------
 */

import { ChatMessage, Post } from '../domain/types';

/** Simulate network latency so loading states are visible/testable. */
const LATENCY_MS = 400;

function delay<T>(value: T, ms = LATENCY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

// In-memory "database". A real backend persists this in Postgres.
let posts: Post[] = [
  {
    id: 'p1',
    author: 'Jordan',
    message: 'Raptors look unstoppable tonight. Loading up on the moneyline.',
    bet: { selection: 'Raptors ML', americanOdds: -120, stake: 50 },
    createdAt: Date.now() - 1000 * 60 * 12,
    likes: 8,
    likedByMe: false,
  },
  {
    id: 'p2',
    author: 'Sam',
    message: 'Over 2.5 goals is free money in this match.',
    bet: { selection: 'Over 2.5 Goals', americanOdds: 135, stake: 25 },
    createdAt: Date.now() - 1000 * 60 * 40,
    likes: 3,
    likedByMe: true,
  },
  {
    id: 'p3',
    author: 'Alex',
    message: 'Fading the public on this one. Who is with me?',
    createdAt: Date.now() - 1000 * 60 * 90,
    likes: 1,
    likedByMe: false,
  },
];

let chats: ChatMessage[] = [
  {
    id: 'c1',
    postId: 'p1',
    author: 'Sam',
    text: 'Bold. I like it.',
    createdAt: Date.now() - 1000 * 60 * 10,
  },
];

export async function fetchPosts(): Promise<Post[]> {
  // newest first
  return delay([...posts].sort((a, b) => b.createdAt - a.createdAt));
}

export async function createPostRemote(post: Post): Promise<Post> {
  posts = [post, ...posts];
  return delay(post);
}

export async function likePostRemote(postId: string): Promise<Post> {
  posts = posts.map((p) =>
    p.id === postId
      ? {
          ...p,
          likedByMe: !p.likedByMe,
          likes: p.likedByMe ? p.likes - 1 : p.likes + 1,
        }
      : p
  );
  const updated = posts.find((p) => p.id === postId);
  if (!updated) {
    throw new Error('Post not found');
  }
  return delay(updated);
}

export async function fetchChat(postId: string): Promise<ChatMessage[]> {
  return delay(chats.filter((c) => c.postId === postId));
}

export async function sendChatRemote(msg: ChatMessage): Promise<ChatMessage> {
  chats = [...chats, msg];
  return delay(msg);
}

/** Test-only helper to reset the in-memory DB between tests. */
export function __resetMockDb(nextPosts?: Post[], nextChats?: ChatMessage[]) {
  if (nextPosts) posts = nextPosts;
  if (nextChats) chats = nextChats;
}
