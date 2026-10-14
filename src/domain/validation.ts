/**
 * src/domain/validation.ts
 * ------------------------------------------------------------------
 * Form validation for the "share a bet" screen, as pure functions.
 *
 * Why pure functions and not validation inside the component?
 * Because then we can test every edge case (empty message, odds of 0,
 * negative stake, message too long) in milliseconds with Jest, without
 * ever rendering a screen. The component just calls validateBetForm()
 * and renders whatever errors come back.
 * ------------------------------------------------------------------
 */

export interface BetFormInput {
  message: string;
  selection: string;
  americanOdds: string; // raw text from a TextInput, so it's a string
  stake: string; // raw text from a TextInput, so it's a string
}

/** Map of field name -> human-readable error. Empty object = valid. */
export type ValidationErrors = Partial<Record<keyof BetFormInput, string>>;

export const MAX_MESSAGE_LENGTH = 280;

/**
 * Validate the bet-share form. Returns an object of errors keyed by
 * field. An empty object means the form is valid.
 */
export function validateBetForm(input: BetFormInput): ValidationErrors {
  const errors: ValidationErrors = {};

  // --- message ---
  const message = input.message.trim();
  if (message.length === 0) {
    errors.message = 'Say something about your pick.';
  } else if (message.length > MAX_MESSAGE_LENGTH) {
    errors.message = `Keep it under ${MAX_MESSAGE_LENGTH} characters.`;
  }

  // --- selection ---
  if (input.selection.trim().length === 0) {
    errors.selection = 'Pick a selection (who or what you bet on).';
  }

  // --- american odds ---
  const odds = Number(input.americanOdds);
  if (input.americanOdds.trim().length === 0) {
    errors.americanOdds = 'Enter the odds.';
  } else if (!Number.isFinite(odds) || odds === 0) {
    errors.americanOdds = 'Odds must be a non-zero number like -150 or +200.';
  }

  // --- stake ---
  const stake = Number(input.stake);
  if (input.stake.trim().length === 0) {
    errors.stake = 'Enter your stake.';
  } else if (!Number.isFinite(stake) || stake <= 0) {
    errors.stake = 'Stake must be a positive number.';
  }

  return errors;
}

/** Convenience: a form is valid when it produces zero errors. */
export function isBetFormValid(input: BetFormInput): boolean {
  return Object.keys(validateBetForm(input)).length === 0;
}
