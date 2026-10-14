/**
 * jest.setup.ts — runs before every test file (via setupFilesAfterEnv).
 * ------------------------------------------------------------------
 * Native modules don't exist in the Node test environment, so we set up
 * the ones our components import.
 *
 * The tricky part on Expo SDK 57 is Reanimated v4, which depends on
 * react-native-worklets. Worklets' real entry point tries to load a
 * NATIVE module ("loadUnpackers") that doesn't exist under Jest, which
 * crashes the whole test suite. The fix (in package.json "jest":
 * "moduleNameMapper") is to redirect `react-native-worklets` imports to
 * the library's own pure-JS mock. With that in place, Reanimated's
 * components render harmlessly in tests.
 *
 * We also run gesture-handler's Jest setup, which no-ops its native side.
 * ------------------------------------------------------------------
 */

import 'react-native-gesture-handler/jestSetup';
