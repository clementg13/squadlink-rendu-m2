const { getSentryExpoConfig } = require("@sentry/react-native/metro");
const path = require('path');

// Configuration Metro avec alias pour résolution des modules
const config = getSentryExpoConfig(__dirname);

// Ajouter la résolution des alias
config.resolver = {
  ...config.resolver,
  alias: {
    '@': __dirname,
    '@/components': path.join(__dirname, 'components'),
    '@/constants': path.join(__dirname, 'constants'),
    '@/hooks': path.join(__dirname, 'hooks'),
    '@/lib': path.join(__dirname, 'lib'),
    '@/services': path.join(__dirname, 'services'),
    '@/stores': path.join(__dirname, 'stores'),
    '@/types': path.join(__dirname, 'types'),
    '@/utils': path.join(__dirname, 'utils'),
    '@/assets': path.join(__dirname, 'assets'),
  },
};

module.exports = config;
