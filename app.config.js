require('dotenv').config();

export default {
  expo: {
    name: 'squadlink',
    slug: 'squadlink',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'squadlink',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    splash: {
      image: './assets/images/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff'
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.clementgexpo.squadlink'
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: '#ffffff'
      },
      edgeToEdgeEnabled: true
    },
    web: {
      bundler: 'metro',
      output: 'static',
      favicon: './assets/images/favicon.png'
    },
    plugins: [
      'expo-router'
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      // Variables d'environnement chargées depuis .env
      API_URL: process.env.API_URL,
      DEBUG: process.env.DEBUG,
      LOG_LEVEL: process.env.LOG_LEVEL,
      NODE_ENV: process.env.NODE_ENV,
      SENTRY_DSN: process.env.SENTRY_DSN,
      ANALYTICS_KEY: process.env.ANALYTICS_KEY,
    }
  }
}; 