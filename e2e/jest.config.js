/**
 * e2e/jest.config.js — Jest config used ONLY by Detox E2E tests.
 * ------------------------------------------------------------------
 * This is separate from the unit-test Jest config (in package.json)
 * because E2E tests run against a real device, run serially (maxWorkers
 * 1), and need long timeouts. Keeping them separate means `npm test`
 * stays fast and never tries to launch an emulator.
 * ------------------------------------------------------------------
 */
module.exports = {
  rootDir: '..',
  testMatch: ['<rootDir>/e2e/**/*.e2e.js'],
  testTimeout: 120000,
  maxWorkers: 1, // E2E tests share one device, so run one at a time.
  globalSetup: 'detox/runners/jest/globalSetup',
  globalTeardown: 'detox/runners/jest/globalTeardown',
  reporters: ['detox/runners/jest/reporter'],
  testEnvironment: 'detox/runners/jest/testEnvironment',
  verbose: true,
};
