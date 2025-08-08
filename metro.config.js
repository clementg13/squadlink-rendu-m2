const { getDefaultConfig } = require('@expo/metro-config');
const path = require('path');

// Configuration Metro standard Expo avec alias pour résolution des modules
const config = getDefaultConfig(__dirname);

// Ajouter la résolution des alias
config.resolver.alias = {
  '@': path.resolve(__dirname),
  '@/components': path.resolve(__dirname, 'components'),
  '@/constants': path.resolve(__dirname, 'constants'),
  '@/hooks': path.resolve(__dirname, 'hooks'),
  '@/lib': path.resolve(__dirname, 'lib'),
  '@/services': path.resolve(__dirname, 'services'),
  '@/stores': path.resolve(__dirname, 'stores'),
  '@/types': path.resolve(__dirname, 'types'),
  '@/utils': path.resolve(__dirname, 'utils'),
  '@/assets': path.resolve(__dirname, 'assets'),
};

module.exports = config;
