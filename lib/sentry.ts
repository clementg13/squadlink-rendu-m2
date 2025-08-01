import * as Sentry from '@sentry/react-native';
import { useNavigationContainerRef } from 'expo-router';
import { useEffect } from 'react';
import { env } from '@/constants/Environment';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Configuration des intégrations Sentry
const navigationIntegration = Sentry.reactNavigationIntegration({
  enableTimeToInitialDisplay: true,
});

export const initSentry = () => {
  // Configuration Sentry optimisée
  if (env.SENTRY_DSN) {
    Sentry.init({
      dsn: env.SENTRY_DSN,
      
      // Intégrations
      integrations: [
        navigationIntegration,
      ],
      
      // Configuration des environnements
      environment: env.NODE_ENV,
      release: `${Constants.expoConfig?.name}@${Constants.expoConfig?.version}`,
      dist: Platform.OS,
      
      // Configuration du debug
      debug: __DEV__,
      
      // Configuration des traces
      tracesSampleRate: __DEV__ ? 1.0 : 0.2,
      profilesSampleRate: __DEV__ ? 1.0 : 0.1,
      
      // Configuration des erreurs
      beforeSend(event) {
        // Filtrer les erreurs en développement
        if (__DEV__ && event.exception) {
          console.log('🚨 Sentry Event:', event);
        }
        return event;
      },
      
      // Configuration des breadcrumbs
      beforeBreadcrumb(breadcrumb) {
        // Filtrer les breadcrumbs sensibles
        if (breadcrumb.category === 'http' && breadcrumb.data?.url?.includes('password')) {
          return null;
        }
        return breadcrumb;
      },
      
      // Configuration des métriques
      enableAutoSessionTracking: true,
      autoSessionTracking: true,
      
      // Configuration des performances
      enableTracing: true,
      
      // Configuration des erreurs natives
      enableNativeCrashHandling: true,
      
      // Configuration des breadcrumbs
      maxBreadcrumbs: 100,
      
      // Configuration des contextes
      initialScope: {
        tags: {
          app: Constants.expoConfig?.name,
          environment: env.NODE_ENV,
          platform: Platform.OS,
          version: Constants.expoConfig?.version,
          build: Constants.expoConfig?.version,
        },
        user: {
          id: undefined, // Sera défini lors de la connexion
        },
      },
    });
    
    if (__DEV__) {
      console.log('🔧 Sentry initialisé avec configuration optimisée');
      console.log('🔧 Environnement:', env.NODE_ENV);
      console.log('🔧 Version:', Constants.expoConfig?.version);
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

// Fonctions utilitaires pour Sentry
export const setSentryUser = (user: { id: string; email?: string; username?: string }) => {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.username,
  });
};

export const clearSentryUser = () => {
  Sentry.setUser(null);
};

export const addSentryTag = (key: string, value: string) => {
  Sentry.setTag(key, value);
};

export const addSentryContext = (name: string, context: Record<string, any>) => {
  Sentry.setContext(name, context);
};

export const captureSentryException = (error: Error, context?: Record<string, any>) => {
  if (context) {
    Sentry.setContext('error_context', context);
  }
  Sentry.captureException(error);
};

export const captureSentryMessage = (message: string, level: Sentry.SeverityLevel = 'info') => {
  Sentry.captureMessage(message, level);
};

export const addSentryBreadcrumb = (message: string, category: string, data?: Record<string, any>) => {
  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level: 'info',
  });
};

// Hook pour le monitoring des performances
export const useSentryPerformance = () => {
  const measurePerformance = async <T>(
    name: string,
    operation: () => Promise<T>
  ): Promise<T> => {
    const startTime = Date.now();
    
    try {
      const result = await operation();
      const duration = Date.now() - startTime;
      
      // Ajouter un breadcrumb pour le suivi des performances
      addSentryBreadcrumb(
        `Performance: ${name}`,
        'performance',
        { duration, status: 'success' }
      );
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Ajouter un breadcrumb pour l'erreur
      addSentryBreadcrumb(
        `Performance Error: ${name}`,
        'performance',
        { duration, status: 'error', error: errorMessage }
      );
      
      Sentry.captureException(error);
      throw error;
    }
  };

  return { measurePerformance };
};