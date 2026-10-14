# sports-feed — Interview Prep for a React Native Role

A small **React Native + Expo (SDK 57, TypeScript)** sports-community app
built as hands-on preparation for a Mobile App Developer interview. The app
itself (a feed, bet sharing, likes, and per-post chat) is just the vehicle —
the real purpose is to **learn and demonstrate the testing + CI/CD skills**
the role asks for, in the exact domain of the job.

> **If you're an interviewer or an AI reading this:** this repo is a learning
> artifact. It shows how I prepared for the role's named requirements —
> *Jest, Detox, Testing Library, and CI/CD workflows in agile environments* —
> by building a real app, testing it at every level, and running a live CI
> pipeline with branch protection on GitHub.

---

## Start here

1. **[`MASTER-RECAP.md`](./MASTER-RECAP.md)** — the full write-up of the five
   concepts I studied, each with vocabulary, workflow, and a plain-English
   explanation. This is the heart of the prep.
2. **[`INTERVIEW-NOTES.md`](./INTERVIEW-NOTES.md)** — maps the job description
   line by line to where it's demonstrated in this repo, with terminology.

---

## The five concepts, and where to see each one

| Concept | What it demonstrates | Files |
|---|---|---|
| **1. Jest** | Unit-testing pure logic (odds math, validation, feed rules) | `src/domain/` + `src/domain/__tests__/` |
| **2. Testing Library** | Testing component behavior (render, tap, assert) | `src/components/__tests__/` |
| **3. Testing pyramid + Detox** | Integration tests + E2E strategy | `src/screens/__tests__/`, `e2e/` |
| **4. CI/CD** | Automated checks on every PR (GitHub Actions) | `.github/workflows/ci.yml` |
| **5. Client-side data** | React Query: caching, invalidation, optimistic updates | `src/hooks/` |

## What's proven here

- **51 tests across 8 suites, all passing** (`npm test`).
- **TypeScript compiles clean** (`npm run lint`).
- **A real CI pipeline** runs type-check + the full test suite on every push
  and pull request — see the [Actions tab](../../actions).
- **Branch protection** is enabled: a pull request cannot merge into `main`
  unless CI is green.
- The CI pipeline has been exercised end-to-end: a deliberately buggy change
  was caught red on a PR (`Expected 150, Received 53`), fixed, turned green,
  and merged — the real-world branch → PR → CI → review → merge flow.

## Run it

```bash
npm install
npm start              # Expo dev server
npm test               # all Jest + Testing Library tests
npm run test:coverage  # tests + coverage report
npm run lint           # tsc --noEmit (type check)
```

Detox E2E (`e2e/`) is fully configured but requires a native build on macOS
(iOS) or an Android emulator, so it runs on a Mac/emulator rather than in
this repo's CI. The specs and config are included to show the setup.

## Architecture notes

- **Logic lives in pure functions** (`src/domain`) so most tests are fast unit
  tests and components stay thin.
- **React Query** owns server state — caching, invalidation, and optimistic
  updates with rollback (the instant-feeling like button).
- **Performance**: the feed is a virtualized `FlatList`; rows are `React.memo`'d
  with stable `useCallback` handlers so one like doesn't re-render the list.
- **Animations** use `react-native-reanimated` v4 (shared values on the UI
  thread).

---

*Built with AI assistance as a deliberate learning exercise — the goal was to
understand each concept well enough to direct the tooling, review the output,
and explain the decisions, not to memorize syntax.*
