/**
 * .detoxrc.js — Detox configuration (END-TO-END testing).
 * ------------------------------------------------------------------
 * WHAT DETOX IS (say this in the interview):
 *   Detox is a "gray-box" end-to-end testing framework for React Native.
 *   It builds and launches your REAL app on a simulator/emulator and
 *   drives it like a user: tap this, type that, expect to see this.
 *   "Gray-box" = it hooks into the app internals to know when the app is
 *   idle (no pending network/animations), so tests are far less flaky
 *   than black-box tools that just poll the screen.
 *
 * WHERE IT SITS IN THE PYRAMID:
 *   Jest unit tests (fast, many) -> component/integration tests (medium)
 *   -> Detox E2E (slow, few, highest confidence). You write a handful of
 *   E2E tests for critical user journeys, not for every edge case.
 *
 * WHY WE DON'T RUN IT HERE:
 *   Detox needs a NATIVE build of the app (not Expo Go). On iOS that
 *   requires macOS + Xcode; on Android it needs an emulator + a debug
 *   APK. This machine is Windows with no emulator configured, so this
 *   config + the specs in e2e/ are set up and explained, ready to run
 *   on a Mac or a configured Android machine. The commands are in
 *   package.json ("e2e:build:android", "e2e:test:android").
 *
 * The binaryPath/build lines assume you've run `expo prebuild` to
 * generate the native android/ios projects (Expo apps are "managed" by
 * default and have no native folders until you prebuild).
 * ------------------------------------------------------------------
 */
module.exports = {
  testRunner: {
    args: {
      // Detox ships a Jest runner config; E2E tests live in ./e2e.
      $0: 'jest',
      config: 'e2e/jest.config.js',
    },
    jest: {
      setupTimeout: 120000,
    },
  },
  apps: {
    'android.debug': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
      build:
        'cd android && gradlew.bat app:assembleDebug app:assembleAndroidTest -DtestBuildType=debug && cd ..',
    },
    'ios.debug': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Debug-iphonesimulator/sportsfeed.app',
      build:
        'xcodebuild -workspace ios/sportsfeed.xcworkspace -scheme sportsfeed -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build',
    },
  },
  devices: {
    emulator: {
      type: 'android.emulator',
      device: { avdName: 'Pixel_7_API_34' }, // name of an AVD you created
    },
    simulator: {
      type: 'ios.simulator',
      device: { type: 'iPhone 15' },
    },
  },
  configurations: {
    'android.emu.debug': {
      device: 'emulator',
      app: 'android.debug',
    },
    'ios.sim.debug': {
      device: 'simulator',
      app: 'ios.debug',
    },
  },
};
