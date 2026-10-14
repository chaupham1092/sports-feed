/**
 * src/components/BetChip.tsx
 * ------------------------------------------------------------------
 * A small, PURE presentational component that renders a shared bet.
 * It takes a `Bet`, computes the decimal odds + payout using our tested
 * domain functions, and displays them. No state, no side effects — the
 * easiest kind of component to test.
 *
 * Note the `testID` and `accessibilityLabel`:
 *  - testID: a stable hook tests (and Detox) use to find this element.
 *  - accessibilityLabel: what a screen reader announces. The JD mentions
 *    Apple HIG — accessibility is part of that. Good labels also make
 *    tests more robust because we can query "by role/label".
 * ------------------------------------------------------------------
 */

import { StyleSheet, Text, View } from 'react-native';
import { americanToDecimal, payout } from '../domain/odds';
import { Bet } from '../domain/types';

interface Props {
  bet: Bet;
}

export function BetChip({ bet }: Props) {
  const decimal = americanToDecimal(bet.americanOdds);
  const totalPayout = payout(bet.stake, decimal);
  const sign = bet.americanOdds > 0 ? '+' : '';

  return (
    <View
      style={styles.chip}
      testID="bet-chip"
      accessibilityLabel={`Bet on ${bet.selection} at ${sign}${bet.americanOdds}, stake ${bet.stake} dollars, payout ${totalPayout} dollars`}
    >
      <Text style={styles.selection}>{bet.selection}</Text>
      <View style={styles.row}>
        <Text style={styles.odds}>
          {sign}
          {bet.americanOdds}
        </Text>
        <Text style={styles.meta}>
          ${bet.stake} → ${totalPayout}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    backgroundColor: '#0f2a1d',
    borderRadius: 10,
    padding: 10,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#1f6f43',
  },
  selection: { color: '#9be7bd', fontWeight: '700', fontSize: 14 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  odds: { color: '#4ade80', fontWeight: '800', fontSize: 16 },
  meta: { color: '#86efac', fontSize: 13 },
});
