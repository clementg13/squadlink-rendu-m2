const { getSentryExpoConfig } = require("@sentry/react-native/metro");
const path = require('path');

const config = getSentryExpoConfig(__dirname, {
  // Configuration Sentry pour Metro
  debug: process.env.NODE_ENV === 'development',
  
  // Options de build pour Sentry
  buildOptions: {
    // Inclure les source maps pour le debugging
    includeSourceMaps: true,
    
    // Configuration des fichiers à exclure
    excludeFiles: [
      '**/node_modules/**',
      '**/__tests__/**',
      '**/*.test.*',
      '**/*.spec.*',
    ],
  },
  
  // Configuration des transformations
  transformer: {
    // Activer les source maps
    generateSourceMaps: true,
    
    // Configuration des assets
    assetPlugins: ['expo-asset/tools/hashAssetFiles'],
  },
  
  // Configuration du resolver
  resolver: {
    // Extensions supportées
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    
    // Alias pour les imports
    alias: {
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
    },
  },
  
  // Configuration du serveur de développement
  server: {
    // Activer le hot reload
    hot: true,
    
    // Configuration des headers
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
});

module.exports = config;
