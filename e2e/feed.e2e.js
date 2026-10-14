/**
 * e2e/feed.e2e.js — END-TO-END test for the feed, written with Detox.
 * ------------------------------------------------------------------
 * READ THIS even though you can't run it on Windows — the API is the
 * part interviewers ask about.
 *
 * Detox's three verbs:
 *   element(by.id('x'))        -> find an element by its testID.
 *   .tap() / .typeText() ...   -> ACTIONS a user performs.
 *   expect(...).toBeVisible()  -> ASSERTIONS about what's on screen.
 *
 * Notice these are the SAME testIDs we used in the components
 * (like-button-p1, open-composer, etc). One set of testIDs serves both
 * Testing Library (unit/component) and Detox (E2E). That's deliberate.
 *
 * Detox automatically waits for the app to be idle before each action,
 * so you rarely need manual sleeps — a big reason it's less flaky than
 * older tools.
 * ------------------------------------------------------------------
 */

/* global device, element, by, expect, beforeAll, beforeEach, describe, it */

describe('Community feed', () => {
  beforeAll(async () => {
    // Launch a fresh install of the app before the suite runs.
    await device.launchApp({ newInstance: true });
  });

  beforeEach(async () => {
    // Reload the RN bundle between tests for a clean slate.
    await device.reloadReactNative();
  });

  it('shows the feed with seeded posts', async () => {
    await expect(element(by.id('feed-screen'))).toBeVisible();
    // The seed data includes a post by "Jordan".
    await expect(element(by.text('Jordan'))).toBeVisible();
  });

  it('likes a post and the heart count increments', async () => {
    // Tap the like button on the first seeded post (id p1).
    await element(by.id('like-button-p1')).tap();
    // The like count text should now read 9 (seed starts at 8).
    await expect(element(by.id('like-count-p1'))).toHaveText('9');
  });

  it('opens the composer, validates, and shares a pick', async () => {
    await element(by.id('open-composer')).tap();
    await expect(element(by.id('share-bet-form'))).toBeVisible();

    // Fill the form.
    await element(by.id('input-message')).typeText('E2E says this hits');
    await element(by.id('input-selection')).typeText('Lakers ML');
    await element(by.id('input-odds')).typeText('-110');
    await element(by.id('input-stake')).typeText('20');

    // Submit and return to the feed with the new post visible.
    await element(by.id('submit-bet')).tap();
    await expect(element(by.text('E2E says this hits'))).toBeVisible();
  });

  it('opens a chat thread and sends a message', async () => {
    await element(by.id('chat-button-p1')).tap();
    await expect(element(by.id('chat-screen'))).toBeVisible();

    await element(by.id('chat-input')).typeText('Good luck everyone');
    await element(by.id('chat-send')).tap();
    await expect(element(by.text('Good luck everyone'))).toBeVisible();

    await element(by.id('chat-close')).tap();
    await expect(element(by.id('feed-screen'))).toBeVisible();
  });
});
