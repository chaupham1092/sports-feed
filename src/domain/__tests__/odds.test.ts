/**
 * odds.test.ts — UNIT TESTS for pure domain logic.
 * ------------------------------------------------------------------
 * This file is the clearest demonstration of Jest fundamentals. Read
 * the comments top to bottom and you'll know the vocabulary interviewers
 * use: describe, it/test, expect, matchers, and testing error throwing.
 * ------------------------------------------------------------------
 */

import {
  americanToDecimal,
  impliedProbability,
  payout,
  profit,
} from '../odds';

// `describe` groups related tests. It's just for organization/readability
// in the test output. You can nest describes.
describe('americanToDecimal', () => {
  // `it` (alias of `test`) is a single test case. Write the name as a
  // sentence: "it <does something>". Good names read like a spec.
  it('converts positive American odds (+200) to decimal 3.0', () => {
    // ARRANGE / ACT: call the function.
    const result = americanToDecimal(200);
    // ASSERT: `expect(...).toBe(...)` is a "matcher". toBe uses ===.
    expect(result).toBe(3);
  });

  it('converts negative American odds (-150) to decimal 1.67', () => {
    expect(americanToDecimal(-150)).toBe(1.67);
  });

  it('treats +100 and -100 as the same even-money price (2.0)', () => {
    expect(americanToDecimal(100)).toBe(2);
    expect(americanToDecimal(-100)).toBe(2);
  });

  // Testing that a function THROWS. You must pass a FUNCTION to expect,
  // not call it directly, so Jest can catch the throw.
  it('throws when given 0 (not a valid moneyline price)', () => {
    expect(() => americanToDecimal(0)).toThrow('American odds cannot be 0');
  });
});

describe('payout', () => {
  it('returns stake times decimal odds', () => {
    // $50 at 3.0 decimal = $150 total back.
    expect(payout(50, 3)).toBe(150);
  });

  it('rejects a negative stake', () => {
    expect(() => payout(-10, 2)).toThrow('Stake cannot be negative');
  });

  it('rejects decimal odds below 1', () => {
    expect(() => payout(10, 0.5)).toThrow('Decimal odds must be >= 1');
  });
});

describe('profit', () => {
  it('is payout minus the original stake', () => {
    // $50 at 3.0 pays $150, so profit is $100.
    expect(profit(50, 3)).toBe(100);
  });
});

describe('impliedProbability', () => {
  it('is 1 / decimal odds', () => {
    // 2.0 decimal implies a 50% chance.
    expect(impliedProbability(2)).toBe(0.5);
  });

  it('is lower for longer odds', () => {
    // A big underdog (5.0) implies only a 20% chance.
    expect(impliedProbability(5)).toBe(0.2);
  });
});
