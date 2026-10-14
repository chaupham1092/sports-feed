/**
 * validation.test.ts — UNIT TESTS for form validation.
 * ------------------------------------------------------------------
 * Shows how to test "many inputs, check the output" logic. Note the
 * `it.each` table test near the bottom — a clean way to run the same
 * assertion over many cases without copy-paste.
 * ------------------------------------------------------------------
 */

import {
  BetFormInput,
  isBetFormValid,
  MAX_MESSAGE_LENGTH,
  validateBetForm,
} from '../validation';

// A helper to build a valid form, then override just the field under test.
// This "object factory" pattern keeps each test focused on ONE thing.
function makeForm(overrides: Partial<BetFormInput> = {}): BetFormInput {
  return {
    message: 'Great value here',
    selection: 'Raptors ML',
    americanOdds: '-150',
    stake: '25',
    ...overrides,
  };
}

describe('validateBetForm', () => {
  it('returns no errors for a fully valid form', () => {
    const errors = validateBetForm(makeForm());
    // toEqual does a deep equality check (good for objects/arrays).
    expect(errors).toEqual({});
  });

  it('flags an empty message', () => {
    const errors = validateBetForm(makeForm({ message: '   ' }));
    expect(errors.message).toBeDefined();
  });

  it('flags a message over the max length', () => {
    const tooLong = 'x'.repeat(MAX_MESSAGE_LENGTH + 1);
    const errors = validateBetForm(makeForm({ message: tooLong }));
    expect(errors.message).toContain('under');
  });

  it('flags a missing selection', () => {
    expect(validateBetForm(makeForm({ selection: '' })).selection).toBeDefined();
  });

  it('flags odds of 0', () => {
    expect(validateBetForm(makeForm({ americanOdds: '0' })).americanOdds).toBeDefined();
  });

  it('flags non-numeric odds', () => {
    expect(validateBetForm(makeForm({ americanOdds: 'abc' })).americanOdds).toBeDefined();
  });

  it('flags a non-positive stake', () => {
    expect(validateBetForm(makeForm({ stake: '0' })).stake).toBeDefined();
    expect(validateBetForm(makeForm({ stake: '-5' })).stake).toBeDefined();
  });
});

describe('isBetFormValid', () => {
  it('is true only when there are zero errors', () => {
    expect(isBetFormValid(makeForm())).toBe(true);
    expect(isBetFormValid(makeForm({ stake: '' }))).toBe(false);
  });

  // `it.each` = a TABLE TEST. Each row runs the test body once.
  // Columns: [description, overrides, expectedValid].
  it.each([
    ['valid baseline', {}, true],
    ['empty message', { message: '' }, false],
    ['zero odds', { americanOdds: '0' }, false],
    ['negative stake', { stake: '-1' }, false],
    ['positive underdog odds', { americanOdds: '+300' }, true],
  ])('%s -> valid=%s', (_label, overrides, expected) => {
    expect(isBetFormValid(makeForm(overrides as Partial<BetFormInput>))).toBe(expected);
  });
});
