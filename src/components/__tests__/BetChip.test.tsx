/**
 * BetChip.test.tsx — COMPONENT TEST (the simplest kind).
 * ------------------------------------------------------------------
 * BetChip is a pure presentational component (no hooks, no provider
 * needed), so we can use the plain render() from Testing Library.
 *
 * Core Testing Library ideas shown here:
 *  - render(<Component/>) mounts the component into a virtual tree.
 *  - screen.getByText / getByTestId QUERY the rendered output the way a
 *    user (or screen reader) would see it — NOT by poking internal state.
 *    This is the library's whole philosophy: "test behavior, not
 *    implementation".
 *  - Query variants you must know:
 *      getBy*   -> expects exactly one match, THROWS if missing.
 *      queryBy* -> returns null if missing (use to assert absence).
 *      findBy*  -> async, waits for the element to appear.
 * ------------------------------------------------------------------
 */

import { render, screen } from '@testing-library/react-native';
import { BetChip } from '../BetChip';

describe('BetChip', () => {
  it('renders the selection and the American odds with a sign', () => {
    render(<BetChip bet={{ selection: 'Raptors ML', americanOdds: 200, stake: 50 }} />);

    // The user should see the selection text.
    expect(screen.getByText('Raptors ML')).toBeOnTheScreen();
    // +200 because the odds are positive.
    expect(screen.getByText('+200')).toBeOnTheScreen();
  });

  it('shows the computed payout ($50 at +200 -> $150)', () => {
    render(<BetChip bet={{ selection: 'Raptors ML', americanOdds: 200, stake: 50 }} />);
    // +200 American = 3.0 decimal, so $50 stake returns $150.
    expect(screen.getByText('$50 → $150')).toBeOnTheScreen();
  });

  it('does not prefix a + sign on negative odds', () => {
    render(<BetChip bet={{ selection: 'Celtics ML', americanOdds: -150, stake: 30 }} />);
    expect(screen.getByText('-150')).toBeOnTheScreen();
  });

  it('exposes an accessibility label describing the whole bet', () => {
    render(<BetChip bet={{ selection: 'Over 2.5', americanOdds: 135, stake: 25 }} />);
    // getByLabelText finds the element by its accessibilityLabel —
    // the same text a screen reader would announce.
    expect(
      screen.getByLabelText(/Bet on Over 2.5 at \+135, stake 25 dollars/)
    ).toBeOnTheScreen();
  });
});
