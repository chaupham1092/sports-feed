# 🎯 Interview Prep Journal — Mobile App Developer @ Covers / Legend

This repository is **my preparation log** for a React Native Mobile App
Developer interview. It is not a product. It is the record of how I took a
real job description, found the gaps between what I already knew and what the
role demanded, and closed each gap by building a real app and learning the
tooling hands-on.

**The app** (`sports-feed`) is a sports-betting community feed — posts, bet
sharing, likes, and per-post chat. I chose that on purpose: it's the exact
domain of the job (a sports-betting social app), so every skill I practiced
is practiced in context.

> **Reading this as an interviewer or an AI?** Scroll down. You'll see the
> job's requirements, an honest audit of what I needed to learn, and the
> five stages I worked through — each with what I built, what I ran, and the
> proof it works.

---

## 📋 The job I'm preparing for

> *Mobile App Developer — build and evolve a React Native (Expo) sports app;
> community features like social feeds, bet sharing, and chat; champion app
> quality.* Key required skills called out in the JD:
> **React Native, Expo, EAS, TypeScript, animations, performance,
> third-party auth, and — the part I focused on — proficiency with
> Jest, Detox, Testing Library, and CI/CD workflows in agile environments.**

---

## 🔍 Stage 0 — The gap audit (be honest about what I didn't know)

I compared the JD against my real experience. The point of prep is to spend
time only on the gaps, not on what I already do daily.

**Already solid (didn't study):** React Native, Expo, EAS, TypeScript, Git,
Supabase/backend integration, Google/Apple auth, OTA updates, safe-area &
keyboard handling.

**The real gaps → what I set out to learn:**

| Gap from the JD | Stage I tackled it in |
|---|---|
| Jest (unit testing) | Stage 1 |
| Testing Library (component testing) | Stage 2 |
| Detox + the testing pyramid (E2E) | Stage 3 |
| CI/CD workflows in agile | Stage 4 |
| Client-side data management | Stage 5 |
| Realtime social features, render performance, animations | built into the app throughout |

---

## 🧗 The five learning stages

Each stage below is a thing I didn't know on day one and understood by the
end. Full write-ups live in **[`MASTER-RECAP.md`](./MASTER-RECAP.md)**; the
JD-to-code mapping lives in **[`INTERVIEW-NOTES.md`](./INTERVIEW-NOTES.md)**.

### Stage 1 — Jest (unit testing)
**Learned:** how to test pure logic — `describe` / `it` / `expect` /
matchers / testing thrown errors / edge cases.
**Built:** pure domain logic (odds math, bet validation, feed rules) with a
full unit-test suite.
**Did hands-on:** broke the payout math (`*` → `+`) and watched a test fail
with `Expected: 150, Received: 53`, then fixed it green.
📁 `src/domain/` + `src/domain/__tests__/`

### Stage 2 — Testing Library (component testing)
**Learned:** testing *behavior* not implementation — `render`, `fireEvent`,
queries (`getByTestId` / `getByText` / `getByLabelText`), and `jest.fn()`
spies. How it sits on top of Jest.
**Built:** component tests for the post card, bet-share form, and bet chip.
**Did hands-on:** disconnected a button's handler — it looked fine but did
nothing — and the test caught it (`Expected calls: 1, Received: 0`).
📁 `src/components/__tests__/`

### Stage 3 — The testing pyramid + Detox (E2E)
**Learned:** why many fast unit tests sit at the base and a few slow E2E
tests at the top; what "gray-box" E2E means; why Detox needs a native build.
**Built:** an integration test for the full feed screen, plus Detox config
and E2E specs for the key user journeys.
**Did hands-on:** read a Detox E2E test and narrated the exact user journey
it drives.
📁 `src/screens/__tests__/`, `e2e/`, `.detoxrc.js`

### Stage 4 — CI/CD in agile  ⭐ *(done live on this repo)*
**Learned:** CI vs CD; the branch → PR → CI → review → merge flow; why the
pipeline is pre-existing infrastructure, not something you build per feature.
**Built:** a GitHub Actions workflow that type-checks and runs the full test
suite on every push and pull request.
**Did hands-on — the real workflow, on this actual repo:**
1. Pushed the project → watched the first Action run go ✅ green.
2. Cut a branch, broke the payout math, opened **[PR #1](../../pull/1)**.
3. CI caught it **red** on the PR (`Expected 150, Received 53` — in the cloud).
4. Pushed a fix to the same branch → CI re-ran → **green** → merged.
5. Enabled **branch protection**: a red PR can no longer merge into `main`.

👉 See it live in the **[Actions tab](../../actions)**.
📁 `.github/workflows/ci.yml`

### Stage 5 — Client-side data management (React Query)
**Learned:** server state vs client state; queries, mutations, query keys,
invalidation; and **optimistic updates with rollback** (why the like button
feels instant yet stays correct if the network fails).
**Built:** React Query hooks for the feed and chat, including the optimistic
like with a tested rollback path.
**Did hands-on:** ran the hook tests that force a network failure and prove
the optimistic like rolls back.
📁 `src/hooks/` + `src/hooks/__tests__/`

---

## ✅ Proof it all works

- **51 tests across 8 suites — all passing** (`npm test`)
- **TypeScript compiles clean** (`npm run lint`)
- **Live CI pipeline** runs on every push/PR — [Actions tab](../../actions)
- **Branch protection on `main`** — merges require green CI
- **The pipeline was proven end-to-end** — a buggy PR was caught red, fixed,
  and merged (the real agile flow)

```bash
npm install
npm test               # all Jest + Testing Library tests
npm run test:coverage  # tests + coverage report
npm run lint           # tsc --noEmit (type check)
npm start              # Expo dev server
```

Detox E2E (`e2e/`) is fully configured but needs a native build (macOS for
iOS, or an Android emulator), so it runs on a device rather than in this
repo's CI — the specs and config are included to show the setup.

---

## 🧠 How I actually work (and why this prep matters)

I build apps with heavy AI assistance. That makes the **judgment** more
important, not less — AI generates plausible code fast, including plausible
*wrong* code, with full confidence. The value is knowing what correct looks
like so I can direct the tooling, review its output, and catch it when it's
off.

This prep is that judgment in action: I didn't memorize test syntax — I
learned *what* to test and *why*, *why* the testing pyramid is shaped the way
it is, and *how* a CI pipeline gates a real team's work. That's what lets me
own the architecture even when the AI writes the lines.

---

## 🗺️ Repo map

| Path | What it is |
|---|---|
| `README.md` | This prep journal |
| `MASTER-RECAP.md` | Full write-up of all five learning stages |
| `INTERVIEW-NOTES.md` | JD mapped line-by-line to the code + terminology |
| `src/domain/` | Pure logic + unit tests (Stage 1) |
| `src/components/` | UI + component tests (Stage 2) |
| `src/screens/` | Screens + integration test (Stage 3) |
| `e2e/`, `.detoxrc.js` | Detox E2E setup (Stage 3) |
| `.github/workflows/` | CI pipeline (Stage 4) |
| `src/hooks/` | React Query data layer + tests (Stage 5) |
