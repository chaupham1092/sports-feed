# Master Recap — 5 Concepts for the Covers/Legend Interview

Everything you learned hands-on, in one place. The app at
`github.com/chaupham1092/sports-feed` is your live reference — a real repo
with passing tests and a working CI pipeline you built end to end.

---

## The big framing (say this if asked "how do you work?")

> "AI accelerates the implementation, but it also produces confident wrong
> answers fast. My value is knowing what correct architecture looks like, so
> I can direct the tool and catch it when it's wrong. I treat generated code
> as a draft I'm responsible for reviewing, not an answer I trust blindly."

Companies pay for **judgment**, not typing. The more AI writes, the more
valuable the person who knows when it's wrong.

---

## Concept 1 — Jest (unit testing)

**What:** Jest is the test *runner* and *assertion* tool. Tests pure logic
(functions): give an input, assert the output.

**Vocabulary:**
- `describe('name', ...)` — groups related tests (readability only).
- `it('does X', ...)` — one test case, named like a sentence.
- `expect(value).toBe(3)` — assertion. `toBe` = exact. `toEqual` = deep
  compare (objects). `toThrow` = expects an error.
- **matcher** = the comparison word (`toBe`, `toEqual`, `toThrow`...).
- **Arrange / Act / Assert** = the 3-step shape of a test.
- Error test: `expect(() => fn(0)).toThrow('msg')` — wrap in `() =>` so Jest
  can catch the throw.

**Workflow:** test the logic that would hurt if it broke (calculations,
rules, validation) — NOT styling. Normal case + **edge cases** (zero,
negative, empty). The payoff is a **safety net**: tests go red before a
regression reaches a user.

**Hands-on I did:** changed `*` to `+` in payout math → test went red with
`Expected: 150, Received: 53` → fixed it → green. The red→green loop IS
unit testing.

**Interview sentence:**
> "I push logic into pure functions and unit-test them with Jest — a known
> input, an assertion with a matcher, covering the happy path and edge cases
> like zero or invalid input. For errors I use toThrow."

---

## Concept 2 — Testing Library (component testing)

**What:** `@testing-library/react-native` sits ON TOP of Jest to test
*components* (UI behavior), not just functions. Jest is the engine; Testing
Library lets it render and interact with components.

**Not competitors** — they work together: Testing Library renders + fires
events, Jest makes the assertion.

| | Pure logic | A component |
|---|---|---|
| Tool | Jest alone | Jest + Testing Library |
| Check | returned value | what the user sees/triggers |

**Vocabulary:**
- `render(<Component/>)` — mount it (in memory, no phone).
- `fireEvent.press(el)` / `fireEvent.changeText(el, 'txt')` — simulate user.
- `screen.getByTestId('x')` / `getByText` / `getByLabelText` — find elements.
  (By label/text is better than testID — tests what the user perceives +
  doubles as an accessibility check.)
- `jest.fn()` — a **mock function / spy**: a fake you pass in that records if
  it was called and with what.

**Principle (the phrase):** *test behavior, not implementation.* Do what a
user does (tap), check what a user expects (callback fired).

**Hands-on I did:** commented out `onToggleLike(post.id)` → the button
rendered fine but did nothing → test caught it:
`Expected calls: 1, Received: 0`. A bug invisible to the eye, caught instantly.

**Interview sentence:**
> "I render components with Testing Library, simulate the action with
> fireEvent, and assert the outcome — a callback fired, or an element
> appeared. I pass jest.fn() spies to verify callbacks. I test behavior the
> way a user experiences it, not internal details."

---

## Concept 3 — Testing Pyramid + Detox (E2E)

**The pyramid (bottom to top = wide to narrow):**
1. **Unit (Jest)** — many, fast, cheap. Pure logic.
2. **Component/Integration (Testing Library)** — some, medium. Render + behave.
3. **E2E (Detox)** — few, slow, highest confidence. The whole real app.

**Why a pyramid, not a square:** cost & speed. All-E2E = an hour per run and
constant flakiness. All-unit = never catch "the screens don't connect." So:
lots of cheap tests at the base, a handful of expensive E2E at the top.

**Detox (the tool you've never touched — know the story):**
- Drives the REAL app on a simulator/emulator like a human.
- API reads like English: `element(by.id('x')).tap()`,
  `.typeText('...')`, `expect(element(by.text('...'))).toBeVisible()`.
- **"Gray-box"** (the fancy word) — hooks into the app so it knows when it's
  idle and auto-waits → far less flaky than black-box tools. The `await` on
  every line IS that waiting.
- **Can't run on Windows** — needs a Mac (iOS) or Android emulator. You
  understand it and talk about it; you don't demo it.
- Same `testID`s serve both Testing Library AND Detox.

**Hands-on I did:** read the chat E2E test and narrated the user journey
correctly (tap chat → type → send → assert visible → close → back on feed).
Learned: the test deliberately does NOT assert the chat message in the feed,
because it belongs to the post's thread, not the feed.

**Interview sentence:**
> "I follow the testing pyramid — a broad base of fast Jest unit tests, a
> middle of Testing Library component/integration tests, and a thin top of
> Detox E2E for critical journeys. E2E needs an emulator so it's slow; I run
> it separately or nightly, not on every commit."

---

## Concept 4 — CI/CD

**CI = Continuous Integration:** a cloud robot runs your checks (type check +
tests) on every push/PR. Fails → change blocked. Keeps `main` always working.

**CD = Continuous Delivery/Deployment:** after CI passes, auto build/release.
For Expo: **EAS build** (new binary) or **OTA update** (`eas update`, JS
changes straight to users, no App Store review).

**Mental model:** CI/CD is **infrastructure that already exists** in the repo.
You don't build it per feature. Your job per feature = write the feature +
its tests; the pipeline runs them.

**Where it lives:** `.github/workflows/ci.yml` (GitHub Actions).
- `on: push/pull_request to main` = **trigger** (branch name must match —
  `master` ≠ `main`, learned the hard way).
- `runs-on: ubuntu-latest` = the **runner** (fresh cloud machine).
- `steps:` = checkout → setup Node → `npm ci` → type check → run tests.
- Any step fails → red → PR blocked = the **quality gate**.

**Real feature workflow (the 12 steps):**
clone → pull main → branch → build + write tests → run tests locally →
commit + push → open PR → **CI runs automatically** → humans review while
robot checks → if red, fix on same branch (re-runs) → if green + approved,
**merge** → CD deploys.

**Auto vs human:** Auto = CI running, re-running, blocking merge, CD
deploying. Human = writing feature/tests, review, clicking merge. You never
push to main directly — you **merge a PR** (branch protection enforces it).

**Which tests in CI:** Jest + Testing Library (fast, no device). Detox runs
separately/nightly (needs emulator).

**Terms:** GitHub Actions, runner, quality gate, required status check /
branch protection, artifact (saved file e.g. coverage), `npm ci` vs install.

**Coverage:** `% Lines` / `% Branch` = how much code the tests exercise.
Don't chase 100% (vanity) — cover business-critical logic well.

**Hands-on I did (on my real GitHub):** created repo, pushed, watched first
Action go green. Then: branch → broke payout → PR → **CI red on the PR**
(`Expected 150, Received 53` in the cloud) → fixed → **green** → merged.
Enabled **branch protection** (required status check) so red PRs can't merge.

**Interview sentence:**
> "I work on feature branches and open PRs. CI runs type check + the
> Jest/Testing Library suite on every PR; a required status check blocks the
> merge if it's red. Red → I fix on the same branch, it re-runs; green +
> reviewed → I merge. CD is EAS: OTA for JS changes, a build for native. In
> agile this makes frequent small merges safe."

---

## Concept 5 — Client-Side Data Management (React Query)

**Problem:** without a tool, every screen hand-rolls useState + useEffect +
loading + error + manual refetch. Repetitive, no shared cache.

**Key idea — server state vs client state:**
- **Client state** (modal open, input text) → `useState`.
- **Server state** (posts, chat, profile — a borrowed copy of backend data) →
  **React Query (`@tanstack/react-query`)**.

**The 4 terms:**
1. **Query** = read. `useQuery({ queryKey, queryFn })` → `{ data, isLoading,
   isError }` managed for you.
2. **Query key** = cache label (`['posts']`, `['chat', postId]`). Same key =
   shared cache, no double fetch.
3. **Mutation** = write (create/update/delete). `useMutation`.
4. **Invalidation** = after a write, mark stale (`invalidateQueries`) → refetch.

**Star feature — optimistic update with rollback** (makes likes feel instant):
- `onMutate`: update cache now + snapshot old value
- `onError`: restore snapshot (rollback)
- `onSettled`: refetch to confirm
The rollback is the mature part. (Tested: forced a network failure, proved
the like count returned to 5.)

**Nuance:** React Query = server state. Global client state (auth, theme,
cart) = Context or Zustand. Edge cases: realtime (wire Supabase subscription
into cache), pagination (`useInfiniteQuery`), offline (persistence add-ons).

**Interview sentence:**
> "I manage server state with React Query — queries for reads, mutations for
> writes, query keys for the cache, invalidation to refetch, and optimistic
> updates with rollback for instant-feeling actions like likes. Global client
> state like auth or theme I'd put in Context or Zustand — React Query is
> specifically for server state."

---

## 30-second summary (if you only remember one thing per concept)

| Concept | One line |
|---|---|
| Jest | Test pure logic: input → assert output with a matcher. |
| Testing Library | Test components by doing what a user does, assert the result. |
| Pyramid + Detox | Many cheap unit tests, few slow E2E; Detox drives the real app. |
| CI/CD | A robot runs your tests on every PR and blocks bad merges. |
| React Query | Manage server state with caching, invalidation, optimistic updates. |

## Honest positioning (if asked about hands-on coding)
You direct AI tools expertly and own the architecture decisions. You know
what good looks like, which is exactly why you can catch when generated code
is wrong — the skill that matters more as AI writes more of the code.
