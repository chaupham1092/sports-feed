/**
 * src/domain/types.ts
 * ------------------------------------------------------------------
 * Shared TypeScript types for the whole app. Keeping them in one place
 * means the feed, the bet-share form, the chat, and the tests all agree
 * on the same shapes. This is "a single source of truth for types".
 * ------------------------------------------------------------------
 */

/** A single bet attached to a shared post. */
export interface Bet {
  /** e.g. "Raptors to win vs Celtics" */
  selection: string;
  /** American odds, e.g. -150 or +220 */
  americanOdds: number;
  /** How much the user staked, in dollars */
  stake: number;
}

/** A post in the community feed. */
export interface Post {
  id: string;
  author: string;
  /** The free-text message the user wrote. */
  message: string;
  /** Optional bet the user is sharing with the community. */
  bet?: Bet;
  /** Unix epoch millis — when the post was created. */
  createdAt: number;
  /** How many likes the post has. */
  likes: number;
  /** Whether the CURRENT user has liked it (drives the UI toggle). */
  likedByMe: boolean;
}

/** A chat message in a post's comment thread. */
export interface ChatMessage {
  id: string;
  postId: string;
  author: string;
  text: string;
  createdAt: number;
}
