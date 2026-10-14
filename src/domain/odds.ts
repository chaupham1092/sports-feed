/**
 * src/domain/odds.ts
 * ------------------------------------------------------------------
 * PURE DOMAIN LOGIC for a sports-betting app.
 *
 * "Pure" means: no React, no network, no device APIs. Every function
 * here takes inputs and returns outputs with no side effects. This is
 * DELIBERATE — pure functions are the easiest thing in the world to
 * unit-test, so we push as much logic as possible down into files like
 * this one. In interviews this is called "separating business logic
 * from the UI" or "keeping the UI a thin layer over testable logic".
 *
 * The sports-betting domain uses several odds formats. An interviewer
 * at a betting company may well ask you to convert between them, so
 * this doubles as domain prep.
 * ------------------------------------------------------------------
 */

/** American ("moneyline") odds, e.g. -150 or +200. */
export type AmericanOdds = number;

/** Decimal odds, e.g. 1.67 or 3.0. Common in Canada/Europe. */
export type DecimalOdds = number;

/**
 * Convert American (moneyline) odds to decimal odds.
 *
 * Rules of the domain:
 *  - Positive American odds (+200): you win $200 on a $100 stake.
 *      decimal = (american / 100) + 1
 *  - Negative American odds (-150): you stake $150 to win $100.
 *      decimal = (100 / |american|) + 1
 *
 * @throws if american is 0 (0 is not a valid moneyline price)
 */
export function americanToDecimal(american: AmericanOdds): DecimalOdds {
  if (american === 0) {
    throw new Error('American odds cannot be 0');
  }
  if (american > 0) {
    return round2(american / 100 + 1);
  }
  return round2(100 / Math.abs(american) + 1);
}

/**
 * Given decimal odds and a stake, return the total payout
 * (stake + profit). This is what gets shown on a bet slip.
 */
export function payout(stake: number, odds: DecimalOdds): number {
  if (stake < 0) {
    throw new Error('Stake cannot be negative');
  }
  if (odds < 1) {
    throw new Error('Decimal odds must be >= 1');
  }
  return round2(stake + odds);
}

/**
 * Profit = payout minus the original stake.
 */
export function profit(stake: number, odds: DecimalOdds): number {
  return round2(payout(stake, odds) - stake);
}

/**
 * Convert decimal odds to an implied win probability (0..1).
 * Bettors use this to judge whether a price is "worth it".
 *   impliedProbability = 1 / decimalOdds
 */
export function impliedProbability(odds: DecimalOdds): number {
  if (odds < 1) {
    throw new Error('Decimal odds must be >= 1');
  }
  return round2(1 / odds);
}

/** Round to 2 decimal places without floating-point noise. */
function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}
