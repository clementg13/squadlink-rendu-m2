const { getDefaultConfig } = require('@expo/metro-config');
const path = require('path');
const fs = require('fs');

// Configuration Metro ultra-robuste pour EAS Build
console.log('🔧 [Metro] Loading config from:', __dirname);

// Forcer EXPO_ROUTER_APP_ROOT pour résoudre require.context
if (!process.env.EXPO_ROUTER_APP_ROOT) {
  process.env.EXPO_ROUTER_APP_ROOT = 'app';
  console.log('🔧 [Metro] Set EXPO_ROUTER_APP_ROOT to:', process.env.EXPO_ROUTER_APP_ROOT);
}

// Vérification de l'environnement
const isEASBuild = process.env.EAS_BUILD_PLATFORM !== undefined;
const isCIEnvironment = process.env.CI === 'true';

console.log('🔧 [Metro] Environment check:');
console.log('  - EAS Build:', isEASBuild);
console.log('  - CI Environment:', isCIEnvironment);
console.log('  - NODE_ENV:', process.env.NODE_ENV);

const config = getDefaultConfig(__dirname);

// Debug - vérifier la structure du projet
console.log('🔧 [Metro] Project structure check:');
const projectDirectories = ['components', 'constants', 'hooks', 'lib', 'services', 'stores', 'types', 'assets'];
projectDirectories.forEach(dir => {
  const exists = fs.existsSync(path.join(__dirname, dir));
  console.log(`  - ${dir}/: ${exists}`);
});

// S'assurer que resolver existe
if (!config.resolver) {
  config.resolver = {};
}

// Configuration des alias avec chemins absolus - version ultra-robuste
const projectRoot = path.resolve(__dirname);
config.resolver.alias = {
  '@': projectRoot,
  '@/components': path.resolve(projectRoot, 'components'),
  '@/constants': path.resolve(projectRoot, 'constants'),
  '@/hooks': path.resolve(projectRoot, 'hooks'),
  '@/lib': path.resolve(projectRoot, 'lib'),
  '@/services': path.resolve(projectRoot, 'services'),
  '@/stores': path.resolve(projectRoot, 'stores'),
  '@/types': path.resolve(projectRoot, 'types'),
  '@/assets': path.resolve(projectRoot, 'assets'),
};

console.log('🔧 [Metro] Aliases configured:', Object.keys(config.resolver.alias));

// S'assurer que le resolver utilise nos alias
if (!config.resolver.platforms) {
  config.resolver.platforms = ['ios', 'android', 'web'];
}

// Configuration Sentry pour sourcemaps
if (!config.transformer) {
  config.transformer = {};
}

config.transformer.minifierConfig = {
  ...config.transformer.minifierConfig,
  keep_fnames: true,
  mangle: {
    keep_fnames: true,
  },
};

// Debug final
console.log('🔧 [Metro] Final config check:');
console.log('  - Resolver alias keys:', Object.keys(config.resolver.alias || {}));
console.log('  - Transformer configured:', !!config.transformer.minifierConfig);

module.exports = config;
