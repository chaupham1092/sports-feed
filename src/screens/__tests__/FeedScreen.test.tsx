/**
 * FeedScreen.test.tsx — INTEGRATION TEST.
 * ------------------------------------------------------------------
 * Unit tests check one function; component tests check one component.
 * An INTEGRATION test wires several real pieces together: the screen,
 * the React Query hooks, and (mocked) API — and verifies they behave
 * correctly as a whole. This is the pyramid interviewers describe:
 * many fast unit tests at the bottom, fewer integration tests, a
 * handful of slow end-to-end (Detox) tests at the top.
 *
 * Shows:
 *  - findBy* queries (async) to wait for the loading spinner to be
 *    replaced by real content.
 *  - Driving a real interaction (like) end-to-end through the hooks.
 * ------------------------------------------------------------------
 */

import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import React from 'react';
import { Post } from '../../domain/types';
import { renderWithProviders } from '../../test-utils/renderWithProviders';
import { FeedScreen } from '../FeedScreen';

jest.mock('../../api/mockApi');
import * as api from '../../api/mockApi';
const mockedApi = api as jest.Mocked<typeof api>;

const posts: Post[] = [
  {
    id: 'p1',
    author: 'Jordan',
    message: 'Raptors tonight',
    createdAt: 2,
    likes: 5,
    likedByMe: false,
    bet: { selection: 'Raptors ML', americanOdds: -120, stake: 50 },
  },
  {
    id: 'p2',
    author: 'Sam',
    message: 'Over 2.5 goals',
    createdAt: 1,
    likes: 3,
    likedByMe: true,
  },
];

// FeedScreen uses useSafeAreaInsets, so it needs SafeAreaProvider too.
function renderFeed() {
  return renderWithProviders(
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 390, height: 844 },
        insets: { top: 47, left: 0, right: 0, bottom: 34 },
      }}
    >
      <FeedScreen />
    </SafeAreaProvider>
  );
}

describe('FeedScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // A small STATEFUL fake: fetchPosts returns the current state, and
    // likePostRemote mutates that state. This mirrors a real backend so
    // the optimistic update and the follow-up refetch (onSettled) agree.
    // (If the fake were static, the refetch would overwrite the
    // optimistic like and the count would snap back — a real gotcha.)
    let state: Post[] = posts.map((p) => ({ ...p }));

    mockedApi.fetchPosts.mockImplementation(async () => state.map((p) => ({ ...p })));
    mockedApi.likePostRemote.mockImplementation(async (id: string) => {
      state = state.map((p) =>
        p.id === id
          ? { ...p, likedByMe: !p.likedByMe, likes: p.likedByMe ? p.likes - 1 : p.likes + 1 }
          : p
      );
      return state.find((p) => p.id === id)!;
    });
  });

  it('shows a loading spinner, then renders the posts', async () => {
    renderFeed();

    // The spinner is visible first.
    expect(screen.getByTestId('feed-loading')).toBeOnTheScreen();

    // findByText waits for the async query to resolve and the row to show.
    expect(await screen.findByText('Raptors tonight')).toBeOnTheScreen();
    expect(screen.getByText('Over 2.5 goals')).toBeOnTheScreen();

    // The spinner is gone once data has loaded.
    expect(screen.queryByTestId('feed-loading')).toBeNull();
  });

  it('shows a bet chip for a post that has a bet', async () => {
    renderFeed();
    await screen.findByText('Raptors tonight');
    expect(screen.getByText('Raptors ML')).toBeOnTheScreen();
  });

  it('likes a post when the heart is tapped (end-to-end through hooks)', async () => {
    renderFeed();
    await screen.findByText('Raptors tonight');

    // p1 starts at 5 likes.
    expect(screen.getByTestId('like-count-p1')).toHaveTextContent('5');

    fireEvent.press(screen.getByTestId('like-button-p1'));

    // Optimistic update bumps it to 6 immediately.
    await waitFor(() =>
      expect(screen.getByTestId('like-count-p1')).toHaveTextContent('6')
    );
    // And the mutation hit the API. React Query calls the mutationFn with
    // (variables, context), so we assert on the FIRST argument only.
    expect(mockedApi.likePostRemote.mock.calls[0][0]).toBe('p1');
  });

  it('opens the composer when "+ Share" is pressed', async () => {
    renderFeed();
    await screen.findByText('Raptors tonight');

    fireEvent.press(screen.getByTestId('open-composer'));

    // The share form (inside a Modal) should now be on screen.
    expect(await screen.findByTestId('share-bet-form')).toBeOnTheScreen();
  });
});
