import * as Sentry from '@sentry/react-native';
import { useNavigationContainerRef } from 'expo-router';
import { useEffect } from 'react';
import { env } from '@/constants/Environment';

const navigationIntegration = Sentry.reactNavigationIntegration({
  enableTimeToInitialDisplay: true,
});

export const initSentry = () => {
  // Initialiser Sentry aussi en développement pour les tests
  if (env.SENTRY_DSN) {
    Sentry.init({
      dsn: env.SENTRY_DSN,
      integrations: [navigationIntegration],
      debug: __DEV__, // Active les logs de debug en développement
    });
    
    if (__DEV__) {
      console.log('🔧 Sentry initialisé en mode développement');
    }
  } else {
    console.warn('⚠️ SENTRY_DSN non défini - Sentry non initialisé');
  }
};

export const useSentryNavigationConfig = () => {
  const navigationRef = useNavigationContainerRef();

  useEffect(() => {
    if (navigationRef && env.SENTRY_DSN) {
      navigationIntegration.registerNavigationContainer(navigationRef);
    }
  }, [navigationRef]);
};