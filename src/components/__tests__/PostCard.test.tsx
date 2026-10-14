/**
 * PostCard.test.tsx — COMPONENT TEST with user interaction + mocks.
 * ------------------------------------------------------------------
 * Shows:
 *  - fireEvent to simulate a press.
 *  - jest.fn() "mock functions" (aka spies) to assert a callback was
 *    called, and with what arguments.
 *  - Conditional rendering assertions with queryBy* (absence).
 * ------------------------------------------------------------------
 */

import { fireEvent, render, screen } from '@testing-library/react-native';
import { Post } from '../../domain/types';
import { PostCard } from '../PostCard';

function makePost(overrides: Partial<Post> = {}): Post {
  return {
    id: 'p1',
    author: 'Jordan',
    message: 'Big game tonight',
    createdAt: 1000,
    likes: 5,
    likedByMe: false,
    ...overrides,
  };
}

describe('PostCard', () => {
  it('renders author, message and like count', () => {
    render(
      <PostCard post={makePost()} onToggleLike={jest.fn()} onOpenChat={jest.fn()} />
    );
    expect(screen.getByText('Jordan')).toBeOnTheScreen();
    expect(screen.getByText('Big game tonight')).toBeOnTheScreen();
    // like-count-p1 is the testID we gave the count Text.
    expect(screen.getByTestId('like-count-p1')).toHaveTextContent('5');
  });

  it('calls onToggleLike with the post id when the heart is pressed', () => {
    // jest.fn() creates a MOCK function we can inspect afterwards.
    const onToggleLike = jest.fn();
    render(
      <PostCard post={makePost()} onToggleLike={onToggleLike} onOpenChat={jest.fn()} />
    );

    // Simulate a user tapping the like button.
    fireEvent.press(screen.getByTestId('like-button-p1'));

    // Assert the callback fired exactly once, with the right id.
    expect(onToggleLike).toHaveBeenCalledTimes(1);
    expect(onToggleLike).toHaveBeenCalledWith('p1');
  });

  it('calls onOpenChat when the chat button is pressed', () => {
    const onOpenChat = jest.fn();
    render(
      <PostCard post={makePost()} onToggleLike={jest.fn()} onOpenChat={onOpenChat} />
    );
    fireEvent.press(screen.getByTestId('chat-button-p1'));
    expect(onOpenChat).toHaveBeenCalledWith('p1');
  });

  it('renders a BetChip only when the post has a bet', () => {
    // Without a bet: the chip should be ABSENT. queryByTestId returns
    // null (instead of throwing) which is how we assert absence.
    const { rerender } = render(
      <PostCard post={makePost()} onToggleLike={jest.fn()} onOpenChat={jest.fn()} />
    );
    expect(screen.queryByTestId('bet-chip')).toBeNull();

    // With a bet: the chip appears.
    rerender(
      <PostCard
        post={makePost({ bet: { selection: 'X', americanOdds: 100, stake: 10 } })}
        onToggleLike={jest.fn()}
        onOpenChat={jest.fn()}
      />
    );
    expect(screen.getByTestId('bet-chip')).toBeOnTheScreen();
  });
});
