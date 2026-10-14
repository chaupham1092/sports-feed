/**
 * src/components/ShareBetForm.tsx
 * ------------------------------------------------------------------
 * The "share a pick" form. This is the single best component to show
 * off testing in a live interview because it has clear states:
 *   - empty / invalid -> errors shown, submit disabled
 *   - valid -> onSubmit called with a well-formed Post
 *
 * All validation is delegated to the PURE validateBetForm() function
 * (src/domain/validation.ts). The component just renders the result.
 *
 * KeyboardAvoidingView + ScrollView: per hard-won mobile experience,
 * the on-screen keyboard can cover inputs/buttons. Wrapping the form
 * keeps everything reachable while typing.
 * ------------------------------------------------------------------
 */

import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { createPost } from '../domain/feed';
import { Post } from '../domain/types';
import {
  BetFormInput,
  MAX_MESSAGE_LENGTH,
  validateBetForm,
} from '../domain/validation';

interface Props {
  author: string;
  onSubmit: (post: Post) => void;
  onCancel: () => void;
}

export function ShareBetForm({ author, onSubmit, onCancel }: Props) {
  const [form, setForm] = useState<BetFormInput>({
    message: '',
    selection: '',
    americanOdds: '',
    stake: '',
  });
  // Only show an error for a field once the user has "touched" it.
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const errors = useMemo(() => validateBetForm(form), [form]);
  const isValid = Object.keys(errors).length === 0;

  const update = (key: keyof BetFormInput) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const markTouched = (key: keyof BetFormInput) => () =>
    setTouched((prev) => ({ ...prev, [key]: true }));

  const handleSubmit = () => {
    // Mark everything touched so all errors surface if they press submit.
    setTouched({ message: true, selection: true, americanOdds: true, stake: true });
    if (!isValid) {
      return;
    }
    const post = createPost({
      id: `local-${Date.now()}`,
      author,
      message: form.message,
      bet: {
        selection: form.selection.trim(),
        americanOdds: Number(form.americanOdds),
        stake: Number(form.stake),
      },
    });
    onSubmit(post);
  };

  const showError = (key: keyof BetFormInput) =>
    touched[key] ? errors[key] : undefined;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.flex}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        testID="share-bet-form"
      >
        <Text style={styles.title}>Share your pick</Text>

        <Field
          label="What's your take?"
          testID="input-message"
          value={form.message}
          onChangeText={update('message')}
          onBlur={markTouched('message')}
          placeholder="Why do you like this bet?"
          multiline
          error={showError('message')}
          maxLength={MAX_MESSAGE_LENGTH + 20}
        />

        <Field
          label="Selection"
          testID="input-selection"
          value={form.selection}
          onChangeText={update('selection')}
          onBlur={markTouched('selection')}
          placeholder="e.g. Raptors ML"
          error={showError('selection')}
        />

        <Field
          label="Odds (American)"
          testID="input-odds"
          value={form.americanOdds}
          onChangeText={update('americanOdds')}
          onBlur={markTouched('americanOdds')}
          placeholder="-150 or +200"
          keyboardType="numbers-and-punctuation"
          error={showError('americanOdds')}
        />

        <Field
          label="Stake ($)"
          testID="input-stake"
          value={form.stake}
          onChangeText={update('stake')}
          onBlur={markTouched('stake')}
          placeholder="25"
          keyboardType="numeric"
          error={showError('stake')}
        />

        {/*
          NOTE: we intentionally keep the button pressable even when the
          form is invalid, and block submission inside handleSubmit().
          Pressing it then reveals all validation errors — better UX than
          a dead, disabled button that gives the user no feedback about
          WHY they can't submit. We still expose accessibilityState.disabled
          so screen readers announce the invalid state.
        */}
        <Pressable
          testID="submit-bet"
          onPress={handleSubmit}
          accessibilityRole="button"
          accessibilityState={{ disabled: !isValid }}
          style={[styles.submit, !isValid && styles.submitDisabled]}
        >
          <Text style={styles.submitText}>Share pick</Text>
        </Pressable>

        <Pressable testID="cancel-bet" onPress={onCancel} style={styles.cancel}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/** Small labelled input with inline error text. */
function Field({
  label,
  error,
  testID,
  ...inputProps
}: {
  label: string;
  error?: string;
  testID: string;
} & React.ComponentProps<typeof TextInput>) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        testID={testID}
        placeholderTextColor="#6b7280"
        style={[styles.input, error ? styles.inputError : null]}
        {...inputProps}
      />
      {error ? (
        <Text style={styles.errorText} testID={`${testID}-error`}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { padding: 16, gap: 4 },
  title: { color: '#f9fafb', fontSize: 22, fontWeight: '800', marginBottom: 8 },
  field: { marginBottom: 12 },
  label: { color: '#d1d5db', fontSize: 13, marginBottom: 6, fontWeight: '600' },
  input: {
    backgroundColor: '#1f2937',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#f9fafb',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#374151',
  },
  inputError: { borderColor: '#f87171' },
  errorText: { color: '#f87171', fontSize: 12, marginTop: 4 },
  submit: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  submitDisabled: { backgroundColor: '#374151' },
  submitText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  cancel: { paddingVertical: 12, alignItems: 'center' },
  cancelText: { color: '#9ca3af', fontSize: 14 },
});
