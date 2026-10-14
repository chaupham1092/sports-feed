# Interview Prep — Covers / Legend Mobile App Developer

This file is your cram sheet. It maps the job description to what's in this
repo, names the industry terminology for things you already know, and gives
you a sentence you can actually say in the room. Read it top to bottom the
morning of the interview.

The app in this repo (`sports-feed`) is a small React Native + Expo (SDK 57,
TypeScript) community feed for a sports-betting audience: a feed of posts,
sharing a bet, liking, and a chat thread per post. It exists to demonstrate
the testing + CI/CD stack the JD asks for, in the exact domain the job is in.

---

## 1. The gap audit (JD vs. what you already knew)

Things you already know (don't over-study these): React Native, Expo, EAS,
TypeScript, Git, Supabase/backend integration, auth flows (Google/Apple),
OTA, safe-area handling, keyboard handling.

Things this project was built to close:

| Gap | Where it lives in this repo |
|---|---|
| Jest unit tests | `src/domain/__tests__/*.test.ts` |
| Testing Library component tests | `src/components/__tests__/*.test.tsx` |
| Integration tests | `src/screens/__tests__/FeedScreen.test.tsx` |
| React Query hook tests | `src/hooks/__tests__/usePosts.test.tsx` |
| Detox E2E | `.detoxrc.js`, `e2e/feed.e2e.js` |
| CI/CD | `.github/workflows/ci.yml` |
| Real-time social features | feed / bet share / chat screens + hooks |
| Render performance | `PostCard` (memo), `FeedScreen` (FlatList) |
| Client-side data management | React Query hooks in `src/hooks` |

---

## 2. The testing pyramid (the single most important talking point)

Picture a pyramid, bottom to top:

1. **Unit tests** — bottom, widest. Test one pure function in isolation.
   Fast (milliseconds), many of them. Here: odds math, validation, feed
   logic (`src/domain`). No React involved.
2. **Component / integration tests** — middle. Render components (with
   Testing Library) and verify behavior; integration tests wire several
   real pieces together. Here: `PostCard`, `ShareBetForm`, `FeedScreen`.
3. **End-to-end (E2E) tests** — top, narrowest. Drive the whole real app
   on a device like a user (Detox). Slow, few, highest confidence. Here:
   `e2e/feed.e2e.js`.

Say it: *"I push logic down into pure functions so most of my tests are fast
unit tests, keep a middle layer of component and integration tests with
Testing Library, and reserve a few Detox E2E tests for the critical user
journeys."*

---

## 3. Jest — vocabulary you must be fluent in

- **`describe`** — groups related tests. Organizational only.
- **`it` / `test`** — one test case. Name it like a sentence.
- **`expect(x).matcher(y)`** — an assertion. Common matchers:
  - `toBe` (===, primitives), `toEqual` (deep equality, objects/arrays),
    `toMatchObject` / `objectContaining` (partial match),
    `toHaveBeenCalledWith` (mock was called with these args),
    `toThrow` (function throws).
- **`jest.fn()`** — a **mock function** (a.k.a. **spy**). You pass it in,
  then assert how it was called. Example: `onToggleLike` in `PostCard.test`.
- **`jest.mock('../module')`** — replace a whole module with mocks. We mock
  the API layer (`src/api/mockApi`) so hooks talk to a controlled fake, not
  the network. Phrase: *"mock at the boundary."*
- **`beforeEach` / `afterEach`** — setup/teardown run around every test.
  `jest.clearAllMocks()` in `beforeEach` keeps tests isolated.
- **`it.each([...])`** — table test: run the same body over many inputs.
  See `validation.test.ts`.

Run them: `npm test`. Watch mode while coding: `npm run test:watch`.
Coverage: `npm run test:coverage`.

---

## 4. Testing Library (`@testing-library/react-native`)

Core philosophy — **test behavior, not implementation**. You query the
rendered output the way a user sees it, not internal state. If you refactor
the internals but the UI behaves the same, the tests still pass.

- **`render(<Component/>)`** — mount it.
- **Queries** (memorize the three variants):
  - `getBy*` — expects exactly one; **throws** if missing.
  - `queryBy*` — returns `null` if missing; use to **assert absence**.
  - `findBy*` — **async**, waits for the element to appear (for data that
    loads later). See `FeedScreen.test` using `findByText`.
  - Common selectors: `getByText`, `getByTestId`, `getByLabelText` (by
    accessibility label), `getByRole`.
- **`fireEvent.press(el)` / `fireEvent.changeText(el, 'txt')`** — simulate
  user actions.
- **`waitFor(() => expect(...))`** — retry an assertion until it passes
  (for async state like a React Query result).
- **`renderHook(() => useThing())`** — test a hook with no component.

`testID` note: every interactive element in this app has a `testID`. Those
same IDs are used by both Testing Library AND Detox, so one convention
serves unit and E2E tests.

---

## 5. Detox (E2E) — you can't run it on Windows, so know the story

Say it: *"Detox is a gray-box E2E framework for React Native. It builds and
launches the real app on a simulator or emulator and drives it like a user.
Gray-box means it hooks into the app to know when it's idle, so tests are
much less flaky than black-box tools."*

- API: `element(by.id('x'))` to find, `.tap()` / `.typeText()` for actions,
  `expect(...).toBeVisible()` / `.toHaveText()` for assertions.
- It needs a **native build** (not Expo Go): iOS needs macOS + Xcode;
  Android needs an emulator + a debug APK. For an Expo managed app you run
  `expo prebuild` first to generate the `android/` and `ios/` projects.
- Config is `.detoxrc.js`; specs are `e2e/*.e2e.js`; runner config is
  `e2e/jest.config.js`.
- Commands (in `package.json`): `e2e:build:android`, `e2e:test:android`.

If asked "why isn't E2E in your CI here?": *"E2E needs an emulator/simulator
runner. In a real pipeline I'd run Detox on a macOS runner (iOS) or an
Android emulator runner as a separate, slower job — gated after the fast
unit/integration job passes."*

---

## 6. CI/CD in agile (`.github/workflows/ci.yml`)

- **CI (Continuous Integration)**: on every push/PR, a clean machine runs
  type check + tests. Failures block the merge. Keeps `main` always green.
- **CD (Continuous Delivery/Deployment)**: after CI passes, build & release.
  For Expo that's an **EAS build/submit** for native changes, or an **OTA
  update** (`eas update`) for JS-only changes — pushed to users without an
  App Store review.
- **Agile tie-in**: small, frequent merges are only safe because CI gives
  fast feedback on every change, so trunk stays releasable throughout the
  sprint instead of a scary big-bang integration at the end.

The workflow here runs the `test` job on PRs; the EAS build/OTA job is
stubbed (commented) because it needs an `EXPO_TOKEN` secret — but you can
walk through it.

---

## 7. Client-side data management (React Query) — `src/hooks`

Terminology:

- **Server state vs. client state**: data owned by the backend (posts, chat)
  is *server state*; React Query manages its caching, loading/error flags,
  and refetching so you don't hand-roll `useEffect` + `useState` per fetch.
- **Query key**: the cache identity of some data, e.g. `['posts']` or
  `['chat', postId]`. Parameterized keys cache many independent lists.
- **Invalidation**: mark cached data stale so it refetches
  (`invalidateQueries`). Used after creating a post.
- **Optimistic update**: update the UI immediately before the server
  confirms, then roll back on failure. That's what makes the **like** button
  feel instant. See `useToggleLike` (`onMutate` writes the cache, `onError`
  restores the snapshot, `onSettled` refetches). There are tests for both
  the happy path and the rollback.

Say it: *"I treat server state with React Query — query keys, invalidation,
and optimistic updates with rollback — rather than stuffing remote data into
component state."*

---

## 8. Performance optimization — `PostCard` + `FeedScreen`

- **`FlatList` not `ScrollView` + `.map()`**: FlatList is **virtualized** —
  it only renders rows near the viewport and recycles them. A ScrollView
  renders every child up front, which tanks a long feed.
- **`React.memo`** on `PostCard` with a custom comparator: a row only
  re-renders when its own visible props change, so liking one post doesn't
  re-render the whole list.
- **`useCallback`** for the row callbacks in `FeedScreen`: keeps their
  references stable so `memo` actually works (a new function every render
  would defeat it).
- **FlatList knobs**: `initialNumToRender`, `windowSize`,
  `removeClippedSubviews`, and a stable `keyExtractor`.

Say it: *"For a long feed I virtualize with FlatList, memoize rows, and keep
callback references stable with useCallback so a single like doesn't trigger
a full-list re-render."* (And know the counterpoint: don't memo everything —
it has a cost; profile first.)

---

## 9. Animations — `PostCard` heart (`react-native-reanimated` v4)

- **Shared value** (`useSharedValue`) lives on the **UI thread**, so
  animating it doesn't block JS — that's why Reanimated stays smooth under
  load. We animate the heart's scale with `withSequence(withSpring(1.4),
  withSpring(1))` for a little pop on like.
- v4 gotcha worth mentioning: the Babel plugin moved to
  `react-native-worklets/plugin` and must be **last** in the plugins list.

---

## 10. Likely live-coding exercise & how to approach it

Given the role, expect something like: *"here's a component, add a feature
and a test"* or *"this test is failing, fix it."* Approach:

1. Read the failing test / requirement out loud; restate it.
2. Write (or fix) the smallest thing that makes it pass.
3. Add a test name as a sentence first, then fill in arrange/act/assert.
4. Narrate tradeoffs ("I'd push this into a pure function so it's trivially
   testable").

Rehearse writing, from memory, a Testing Library test that: renders a
component, fires a press, and asserts a `jest.fn()` callback was called with
the right argument. `PostCard.test.tsx` is your template.

---

## 11. Commands cheat sheet

```
npm test                 # run all Jest tests once
npm run test:watch       # TDD watch mode
npm run test:coverage    # tests + coverage report
npm run lint             # tsc --noEmit (type check)
npm start                # Expo dev server
# Detox (needs a Mac or configured Android emulator):
npm run e2e:build:android
npm run e2e:test:android
```
