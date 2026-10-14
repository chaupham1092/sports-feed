/**
 * ShareBetForm.test.tsx — COMPONENT TEST of a stateful form.
 * ------------------------------------------------------------------
 * This is the test most likely to resemble a live-coding exercise:
 * "type into a form, assert validation, submit, assert the payload".
 *
 * Shows:
 *  - fireEvent.changeText to type into TextInputs.
 *  - Asserting a disabled button via accessibilityState.
 *  - Asserting the submit callback receives a correctly-shaped object
 *    (using expect.objectContaining for a partial match).
 * ------------------------------------------------------------------
 */

import { fireEvent, render, screen } from '@testing-library/react-native';
import { ShareBetForm } from '../ShareBetForm';

function setup() {
  const onSubmit = jest.fn();
  const onCancel = jest.fn();
  render(<ShareBetForm author="You" onSubmit={onSubmit} onCancel={onCancel} />);
  return { onSubmit, onCancel };
}

/** Fill all fields with valid values. */
function fillValid() {
  fireEvent.changeText(screen.getByTestId('input-message'), 'Love this spot');
  fireEvent.changeText(screen.getByTestId('input-selection'), 'Raptors ML');
  fireEvent.changeText(screen.getByTestId('input-odds'), '-150');
  fireEvent.changeText(screen.getByTestId('input-stake'), '25');
}

describe('ShareBetForm', () => {
  it('starts with the submit button disabled (form is empty/invalid)', () => {
    setup();
    const submit = screen.getByTestId('submit-bet');
    // The disabled state is exposed via accessibilityState.disabled.
    expect(submit).toBeDisabled();
  });

  it('shows a validation error after pressing submit on an empty form', () => {
    setup();
    fireEvent.press(screen.getByTestId('submit-bet'));
    // Pressing submit marks fields touched, so errors surface.
    expect(screen.getByTestId('input-message-error')).toBeOnTheScreen();
    expect(screen.getByTestId('input-stake-error')).toBeOnTheScreen();
  });

  it('enables submit once all fields are valid', () => {
    setup();
    fillValid();
    expect(screen.getByTestId('submit-bet')).toBeEnabled();
  });

  it('calls onSubmit with a well-formed post when valid', () => {
    const { onSubmit } = setup();
    fillValid();
    fireEvent.press(screen.getByTestId('submit-bet'));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    // objectContaining = partial match; we don't care about the
    // generated id/timestamp, only the meaningful fields.
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        author: 'You',
        message: 'Love this spot',
        bet: expect.objectContaining({
          selection: 'Raptors ML',
          americanOdds: -150,
          stake: 25,
        }),
      })
    );
  });

  it('does NOT call onSubmit when a field is invalid', () => {
    const { onSubmit } = setup();
    fireEvent.changeText(screen.getByTestId('input-message'), 'Hi');
    fireEvent.changeText(screen.getByTestId('input-selection'), 'Raptors');
    fireEvent.changeText(screen.getByTestId('input-odds'), '0'); // invalid
    fireEvent.changeText(screen.getByTestId('input-stake'), '25');

    fireEvent.press(screen.getByTestId('submit-bet'));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('calls onCancel when cancel is pressed', () => {
    const { onCancel } = setup();
    fireEvent.press(screen.getByTestId('cancel-bet'));
    expect(onCancel).toHaveBeenCalled();
  });
});
