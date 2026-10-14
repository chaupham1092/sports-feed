/**
 * babel.config.js
 * ------------------------------------------------------------------
 * babel-preset-expo handles React Native + Expo transforms.
 *
 * Reanimated v4 (used by Expo SDK 57) moved its Babel plugin into the
 * react-native-worklets package. The plugin MUST be listed LAST in the
 * plugins array — a classic gotcha. If it's missing or not last,
 * animations silently fail or the app throws a "Reanimated/Worklets
 * plugin" error at runtime.
 *
 * (On Reanimated v3 and earlier this was 'react-native-reanimated/plugin'.
 *  Mentioning this in the interview shows you track breaking changes.)
 * ------------------------------------------------------------------
 */
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-worklets/plugin'],
  };
};
