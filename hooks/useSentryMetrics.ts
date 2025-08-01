import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { sentryMetricsService } from '@/services/sentryMetricsService';
import type { UserMetrics, AppMetrics, PerformanceMetrics } from '@/services/sentryMetricsService';

export const useSentryMetrics = () => {
  const sessionStartTime = useRef(Date.now());
  const screenViewCount = useRef(0);
  const apiCallCount = useRef(0);
  const errorCount = useRef(0);

  // Initialisation des métriques de base
  useEffect(() => {
    const initializeMetrics = () => {
      // Métriques de l'application
      const appMetrics: AppMetrics = {
        appVersion: Constants.expoConfig?.version || '1.0.0',
        platform: Platform.OS as 'ios' | 'android' | 'web',
        screenViews: 0,
        apiCalls: 0,
        crashCount: 0,
      };
      
      sentryMetricsService.setAppMetrics(appMetrics);

      // Métriques de performance initiales
      const performanceMetrics: PerformanceMetrics = {
        screenLoadTime: 0,
        apiResponseTime: 0,
        memoryUsage: 0,
      };
      
      sentryMetricsService.setPerformanceMetrics(performanceMetrics);
    };

    initializeMetrics();
  }, []);

  // Suivi des actions utilisateur
  const trackUserAction = (action: string, details?: Record<string, unknown>) => {
    sentryMetricsService.trackUserAction(action, details);
  };

  // Suivi des vues d'écran
  const trackScreenView = (screenName: string, duration?: number) => {
    screenViewCount.current++;
    sentryMetricsService.trackScreenView(screenName, duration);
  };

  // Suivi des appels API
  const trackApiCall = (endpoint: string, method: string, status: number, duration: number) => {
    apiCallCount.current++;
    sentryMetricsService.trackApiCall(endpoint, method, status, duration);
  };

  // Suivi des erreurs
  const trackError = (error: Error, context?: Record<string, unknown>) => {
    errorCount.current++;
    sentryMetricsService.trackError(error, context);
  };

  // Suivi des performances
  const trackPerformance = (operation: string, duration: number, success: boolean) => {
    sentryMetricsService.trackPerformance(operation, duration, success);
  };

  // Métriques personnalisées
  const sendCustomMetric = (name: string, value: number, tags?: Record<string, string>) => {
    sentryMetricsService.sendCustomMetric(name, value, tags);
  };

  // Mise à jour des métriques utilisateur
  const updateUserMetrics = (userId: string, userType: 'new' | 'returning' = 'returning') => {
    const sessionDuration = Date.now() - sessionStartTime.current;
    
    const userMetrics: UserMetrics = {
      userId,
      userType,
      sessionDuration,
      actionsPerformed: 0, // Sera mis à jour automatiquement
      errorsEncountered: errorCount.current,
    };
    
    sentryMetricsService.setUserMetrics(userMetrics);
  };

  // Rapport de session
  const generateSessionReport = () => {
    return sentryMetricsService.generateSessionReport();
  };

  // Réinitialisation des métriques
  const resetMetrics = () => {
    sessionStartTime.current = Date.now();
    screenViewCount.current = 0;
    apiCallCount.current = 0;
    errorCount.current = 0;
    sentryMetricsService.resetMetrics();
  };

  // Hook pour le suivi automatique des vues d'écran
  const useScreenTracking = (screenName: string) => {
    useEffect(() => {
      const startTime = Date.now();
      trackScreenView(screenName);
      
      return () => {
        const duration = Date.now() - startTime;
        trackPerformance(`screen_${screenName}`, duration, true);
      };
    }, [screenName]);
  };

  // Hook pour le suivi des performances d'opérations
  const usePerformanceTracking = (operationName: string) => {
    const trackOperation = async <T>(operation: () => Promise<T>): Promise<T> => {
      const startTime = Date.now();
      
      try {
        const result = await operation();
        const duration = Date.now() - startTime;
        trackPerformance(operationName, duration, true);
        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        trackPerformance(operationName, duration, false);
        trackError(error instanceof Error ? error : new Error(String(error)));
        throw error;
      }
    };

    return { trackOperation };
  };

  return {
    // Méthodes de base
    trackUserAction,
    trackScreenView,
    trackApiCall,
    trackError,
    trackPerformance,
    sendCustomMetric,
    updateUserMetrics,
    generateSessionReport,
    resetMetrics,
    
    // Hooks spécialisés
    useScreenTracking,
    usePerformanceTracking,
    
    // Getters pour les compteurs
    getScreenViewCount: () => screenViewCount.current,
    getApiCallCount: () => apiCallCount.current,
    getErrorCount: () => errorCount.current,
    getSessionDuration: () => Date.now() - sessionStartTime.current,
  };
}; 