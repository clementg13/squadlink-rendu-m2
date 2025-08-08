module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['.'],
          alias: {
            '@': './',
            '@/components': './components',
            '@/constants': './constants',
            '@/hooks': './hooks',
            '@/lib': './lib',
            '@/services': './services',
            '@/stores': './stores',
            '@/types': './types',
            '@/utils': './utils',
            '@/assets': './assets',
          },
          extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
        },
      ],
      [
        '@babel/plugin-transform-export-namespace-from'
      ],
    ],
  };
};
