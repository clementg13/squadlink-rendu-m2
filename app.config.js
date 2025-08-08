require('dotenv').config();

export default {
  expo: {
    name: 'squadlink',
    slug: 'squadlink',
    version: '1.1.0',
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
      edgeToEdgeEnabled: true,
      package: 'com.clementgexpo.squadlink'
    },
    web: {
      bundler: 'metro',
      output: 'static',
      favicon: './assets/images/favicon.png'
    },
    plugins: [
      'expo-router',
      [
        '@sentry/react-native/expo',
        {
          url: 'https://sentry.io/',
          project: 'react-native',
          organization: 'ynov-boo'
        }
      ]
    ],
    updates: {
      url: "https://u.expo.dev/YOUR_PROJECT_ID"
    },
    runtimeVersion: {
      policy: "sdkVersion"
    },
    experiments: {
      typedRoutes: true
    },
    extra: {
      // EAS Project ID
      eas: {
        projectId: "d9748c1b-051b-40a7-917f-46deb54d8185"
      },
      
      // Variables d'environnement chargées depuis .env
      API_URL: process.env.API_URL,
      DEBUG: process.env.DEBUG,
      LOG_LEVEL: process.env.LOG_LEVEL,
      NODE_ENV: process.env.NODE_ENV,
      SENTRY_DSN: process.env.SENTRY_DSN,
      SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
      ANALYTICS_KEY: process.env.ANALYTICS_KEY,
      
      // Variables Supabase
      EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
      EXPO_PUBLIC_SUPABASE_KEY: process.env.EXPO_PUBLIC_SUPABASE_KEY,
    }
  }
};