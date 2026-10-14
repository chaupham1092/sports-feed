# sports-feed

A small React Native + Expo (SDK 57, TypeScript) sports-community app built as
**interview preparation** for a React Native role. It demonstrates the testing
and CI/CD stack the job asks for — Jest, Testing Library, Detox, GitHub Actions
— in a realistic domain (a feed, bet sharing, likes, and per-post chat).

> Read **`INTERVIEW-NOTES.md`** first. It maps the job description to this repo
> and gives you the industry terminology + talking points.

## Run it

```bash
npm install
npm start          # Expo dev server (press i / a / w)
```

## The stack, and where to look

| Concern | Files |
|---|---|
| Pure domain logic (odds, validation, feed) | `src/domain/` |
| Data layer (React Query hooks + mock API) | `src/hooks/`, `src/api/` |
| UI components | `src/components/` |
| Screens | `src/screens/` |
| Unit tests | `src/domain/__tests__/` |
| Component tests | `src/components/__tests__/` |
| Hook tests (optimistic updates) | `src/hooks/__tests__/` |
| Integration test | `src/screens/__tests__/FeedScreen.test.tsx` |
| E2E tests (Detox) | `e2e/`, `.detoxrc.js` |
| CI pipeline | `.github/workflows/ci.yml` |

## Testing

```bash
npm test               # all Jest tests (unit + component + integration)
npm run test:watch     # watch mode (TDD)
npm run test:coverage  # with coverage report
npm run lint           # tsc --noEmit (type check)
```

51 tests across 8 suites. All green.

### Detox (E2E)

Detox drives the real app on a simulator/emulator. It needs a native build, so
it runs on macOS (iOS) or a configured Android emulator — **not** on this
Windows machine and **not** in Expo Go. The config and specs are ready:

```bash
npx expo prebuild              # generate native android/ios projects first
npm run e2e:build:android
npm run e2e:test:android
```

## Architecture notes

- **Logic lives in pure functions** (`src/domain`) so most tests are fast unit
  tests. Components stay thin.
- **React Query** owns server state: caching, invalidation, and optimistic
  updates with rollback (the snappy like button).
- **Performance**: the feed is a virtualized `FlatList`; rows are `React.memo`'d
  with stable `useCallback` handlers so one like doesn't re-render the list.
- **Animations** use `react-native-reanimated` v4 (shared values on the UI
  thread).
