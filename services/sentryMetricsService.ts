import { addSentryTag, addSentryContext, captureSentryMessage, addSentryBreadcrumb } from '@/lib/sentry';

export interface UserMetrics {
  userId: string;
  userType: 'new' | 'returning';
  sessionDuration: number;
  actionsPerformed: number;
  errorsEncountered: number;
}

export interface AppMetrics {
  appVersion: string;
  platform: 'ios' | 'android' | 'web';
  screenViews: number;
  apiCalls: number;
  crashCount: number;
}

export interface PerformanceMetrics {
  screenLoadTime: number;
  apiResponseTime: number;
  memoryUsage: number;
  batteryLevel?: number;
}

export class SentryMetricsService {
  private static instance: SentryMetricsService;
  private userMetrics: UserMetrics | null = null;
  private appMetrics: AppMetrics | null = null;
  private performanceMetrics: PerformanceMetrics | null = null;

  // Constructeur privé pour le pattern Singleton
  private constructor() {
    // Constructeur vide pour le pattern Singleton
  }

  static getInstance(): SentryMetricsService {
    if (!SentryMetricsService.instance) {
      SentryMetricsService.instance = new SentryMetricsService();
    }
    return SentryMetricsService.instance;
  }

  // Métriques utilisateur
  setUserMetrics(metrics: UserMetrics) {
    this.userMetrics = metrics;
    
    addSentryTag('user_type', metrics.userType);
    addSentryTag('session_duration', metrics.sessionDuration.toString());
    addSentryTag('actions_performed', metrics.actionsPerformed.toString());
    addSentryTag('errors_encountered', metrics.errorsEncountered.toString());
    
    addSentryContext('user_metrics', metrics as unknown as Record<string, unknown>);
    
    addSentryBreadcrumb(
      'User Metrics Updated',
      'metrics',
      { userMetrics: metrics }
    );
  }

  // Métriques de l'application
  setAppMetrics(metrics: AppMetrics) {
    this.appMetrics = metrics;
    
    addSentryTag('app_version', metrics.appVersion);
    addSentryTag('platform', metrics.platform);
    addSentryTag('screen_views', metrics.screenViews.toString());
    addSentryTag('api_calls', metrics.apiCalls.toString());
    addSentryTag('crash_count', metrics.crashCount.toString());
    
    addSentryContext('app_metrics', metrics as unknown as Record<string, unknown>);
  }

  // Métriques de performance
  setPerformanceMetrics(metrics: PerformanceMetrics) {
    this.performanceMetrics = metrics;
    
    addSentryTag('screen_load_time', metrics.screenLoadTime.toString());
    addSentryTag('api_response_time', metrics.apiResponseTime.toString());
    addSentryTag('memory_usage', metrics.memoryUsage.toString());
    
    if (metrics.batteryLevel !== undefined) {
      addSentryTag('battery_level', metrics.batteryLevel.toString());
    }
    
    addSentryContext('performance_metrics', metrics as unknown as Record<string, unknown>);
  }

  // Suivi des événements utilisateur
  trackUserAction(action: string, details?: Record<string, unknown>) {
    addSentryBreadcrumb(
      `User Action: ${action}`,
      'user_action',
      { action, details, timestamp: new Date().toISOString() }
    );
    
    if (this.userMetrics) {
      this.userMetrics.actionsPerformed++;
      this.setUserMetrics(this.userMetrics);
    }
  }

  // Suivi des vues d'écran
  trackScreenView(screenName: string, duration?: number) {
    addSentryBreadcrumb(
      `Screen View: ${screenName}`,
      'navigation',
      { 
        screenName, 
        duration, 
        timestamp: new Date().toISOString() 
      }
    );
    
    if (this.appMetrics) {
      this.appMetrics.screenViews++;
      this.setAppMetrics(this.appMetrics);
    }
  }

  // Suivi des appels API
  trackApiCall(endpoint: string, method: string, status: number, duration: number) {
    addSentryBreadcrumb(
      `API Call: ${method} ${endpoint}`,
      'api',
      { 
        endpoint, 
        method, 
        status, 
        duration, 
        timestamp: new Date().toISOString() 
      }
    );
    
    if (this.appMetrics) {
      this.appMetrics.apiCalls++;
      this.setAppMetrics(this.appMetrics);
    }
    
    if (this.performanceMetrics) {
      this.performanceMetrics.apiResponseTime = duration;
      this.setPerformanceMetrics(this.performanceMetrics);
    }
  }

  // Suivi des erreurs
  trackError(error: Error, context?: Record<string, unknown>) {
    addSentryBreadcrumb(
      `Error Tracked: ${error.message}`,
      'error',
      { 
        error: error.message, 
        stack: error.stack, 
        context, 
        timestamp: new Date().toISOString() 
      }
    );
    
    if (this.userMetrics) {
      this.userMetrics.errorsEncountered++;
      this.setUserMetrics(this.userMetrics);
    }
  }

  // Suivi des performances
  trackPerformance(operation: string, duration: number, success: boolean) {
    addSentryBreadcrumb(
      `Performance: ${operation}`,
      'performance',
      { 
        operation, 
        duration, 
        success, 
        timestamp: new Date().toISOString() 
      }
    );
    
    if (this.performanceMetrics) {
      if (operation.includes('screen')) {
        this.performanceMetrics.screenLoadTime = duration;
      } else if (operation.includes('api')) {
        this.performanceMetrics.apiResponseTime = duration;
      }
      this.setPerformanceMetrics(this.performanceMetrics);
    }
  }

  // Envoi de métriques personnalisées
  sendCustomMetric(name: string, value: number, tags?: Record<string, string>) {
    addSentryBreadcrumb(
      `Custom Metric: ${name}`,
      'custom_metric',
      { 
        name, 
        value, 
        tags, 
        timestamp: new Date().toISOString() 
      }
    );
    
    if (tags) {
      Object.entries(tags).forEach(([key, value]) => {
        addSentryTag(key, value);
      });
    }
  }

  // Rapport de session
  generateSessionReport() {
    const report = {
      userMetrics: this.userMetrics,
      appMetrics: this.appMetrics,
      performanceMetrics: this.performanceMetrics,
      timestamp: new Date().toISOString(),
    };
    
    addSentryContext('session_report', report);
    captureSentryMessage('Session Report Generated', 'info');
    
    return report;
  }

  // Réinitialisation des métriques
  resetMetrics() {
    this.userMetrics = null;
    this.appMetrics = null;
    this.performanceMetrics = null;
    
    addSentryBreadcrumb(
      'Metrics Reset',
      'metrics',
      { timestamp: new Date().toISOString() }
    );
  }
}

// Export de l'instance singleton
export const sentryMetricsService = SentryMetricsService.getInstance(); 