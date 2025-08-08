module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Note: Removed module-resolver plugin to avoid EAS Build dependency issues
      // Module resolution is handled by metro.config.js resolver.alias instead
      [
        '@babel/plugin-transform-export-namespace-from'
      ],
    ],
  };
};
