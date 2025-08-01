import { SentryMetricsService, sentryMetricsService } from '@/services/sentryMetricsService';
import { addSentryTag, addSentryContext, captureSentryMessage, addSentryBreadcrumb } from '@/lib/sentry';

// Mock Sentry functions
jest.mock('@/lib/sentry', () => ({
  addSentryTag: jest.fn(),
  addSentryContext: jest.fn(),
  captureSentryMessage: jest.fn(),
  addSentryBreadcrumb: jest.fn(),
}));

describe('SentryMetricsService', () => {
  let service: SentryMetricsService;

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the singleton instance
    (SentryMetricsService as any).instance = undefined;
    service = SentryMetricsService.getInstance();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = SentryMetricsService.getInstance();
      const instance2 = SentryMetricsService.getInstance();
      
      expect(instance1).toBe(instance2);
    });
  });

  describe('setUserMetrics', () => {
    it('should set user metrics and add tags', () => {
      const userMetrics = {
        userId: 'user123',
        userType: 'new' as const,
        sessionDuration: 5000,
        actionsPerformed: 10,
        errorsEncountered: 2,
      };

      service.setUserMetrics(userMetrics);

      expect(addSentryTag).toHaveBeenCalledWith('user_type', 'new');
      expect(addSentryTag).toHaveBeenCalledWith('session_duration', '5000');
      expect(addSentryTag).toHaveBeenCalledWith('actions_performed', '10');
      expect(addSentryTag).toHaveBeenCalledWith('errors_encountered', '2');
      expect(addSentryContext).toHaveBeenCalledWith('user_metrics', userMetrics);
      expect(addSentryBreadcrumb).toHaveBeenCalledWith(
        'User Metrics Updated',
        'metrics',
        { userMetrics }
      );
    });

    it('should handle returning user type', () => {
      const userMetrics = {
        userId: 'user123',
        userType: 'returning' as const,
        sessionDuration: 10000,
        actionsPerformed: 5,
        errorsEncountered: 1,
      };

      service.setUserMetrics(userMetrics);

      expect(addSentryTag).toHaveBeenCalledWith('user_type', 'returning');
    });
  });

  describe('setAppMetrics', () => {
    it('should set app metrics and add tags', () => {
      const appMetrics = {
        appVersion: '1.0.1',
        platform: 'ios' as const,
        screenViews: 25,
        apiCalls: 50,
        crashCount: 0,
      };

      service.setAppMetrics(appMetrics);

      expect(addSentryTag).toHaveBeenCalledWith('app_version', '1.0.1');
      expect(addSentryTag).toHaveBeenCalledWith('platform', 'ios');
      expect(addSentryTag).toHaveBeenCalledWith('screen_views', '25');
      expect(addSentryTag).toHaveBeenCalledWith('api_calls', '50');
      expect(addSentryTag).toHaveBeenCalledWith('crash_count', '0');
      expect(addSentryContext).toHaveBeenCalledWith('app_metrics', appMetrics);
    });

    it('should handle android platform', () => {
      const appMetrics = {
        appVersion: '1.0.1',
        platform: 'android' as const,
        screenViews: 15,
        apiCalls: 30,
        crashCount: 1,
      };

      service.setAppMetrics(appMetrics);

      expect(addSentryTag).toHaveBeenCalledWith('platform', 'android');
      expect(addSentryTag).toHaveBeenCalledWith('crash_count', '1');
    });
  });

  describe('setPerformanceMetrics', () => {
    it('should set performance metrics and add tags', () => {
      const performanceMetrics = {
        screenLoadTime: 1500,
        apiResponseTime: 800,
        memoryUsage: 75,
        batteryLevel: 85,
      };

      service.setPerformanceMetrics(performanceMetrics);

      expect(addSentryTag).toHaveBeenCalledWith('screen_load_time', '1500');
      expect(addSentryTag).toHaveBeenCalledWith('api_response_time', '800');
      expect(addSentryTag).toHaveBeenCalledWith('memory_usage', '75');
      expect(addSentryTag).toHaveBeenCalledWith('battery_level', '85');
      expect(addSentryContext).toHaveBeenCalledWith('performance_metrics', performanceMetrics);
    });

    it('should handle performance metrics without battery level', () => {
      const performanceMetrics = {
        screenLoadTime: 1200,
        apiResponseTime: 600,
        memoryUsage: 60,
      };

      service.setPerformanceMetrics(performanceMetrics);

      expect(addSentryTag).toHaveBeenCalledWith('screen_load_time', '1200');
      expect(addSentryTag).toHaveBeenCalledWith('api_response_time', '600');
      expect(addSentryTag).toHaveBeenCalledWith('memory_usage', '60');
      expect(addSentryTag).not.toHaveBeenCalledWith('battery_level', expect.any(String));
    });
  });

  describe('trackUserAction', () => {
    it('should track user action with details', () => {
      const details = { buttonId: 'submit', screen: 'home' };
      
      service.trackUserAction('button_pressed', details);

      expect(addSentryBreadcrumb).toHaveBeenCalledWith(
        'User Action: button_pressed',
        'user_action',
        {
          action: 'button_pressed',
          details,
          timestamp: expect.any(String),
        }
      );
    });

    it('should track user action without details', () => {
      service.trackUserAction('screen_view');

      expect(addSentryBreadcrumb).toHaveBeenCalledWith(
        'User Action: screen_view',
        'user_action',
        {
          action: 'screen_view',
          details: undefined,
          timestamp: expect.any(String),
        }
      );
    });

    it('should update user metrics if available', () => {
      // Set up user metrics first
      const userMetrics = {
        userId: 'user123',
        userType: 'new' as const,
        sessionDuration: 5000,
        actionsPerformed: 5,
        errorsEncountered: 1,
      };
      service.setUserMetrics(userMetrics);

      // Track an action
      service.trackUserAction('test_action');

      // Should update the user metrics with incremented actions
      expect(addSentryContext).toHaveBeenCalledWith('user_metrics', {
        ...userMetrics,
        actionsPerformed: 6,
      });
    });
  });

  describe('trackScreenView', () => {
    it('should track screen view with duration', () => {
      service.trackScreenView('HomeScreen', 1200);

      expect(addSentryBreadcrumb).toHaveBeenCalledWith(
        'Screen View: HomeScreen',
        'navigation',
        {
          screenName: 'HomeScreen',
          duration: 1200,
          timestamp: expect.any(String),
        }
      );
    });

    it('should track screen view without duration', () => {
      service.trackScreenView('ProfileScreen');

      expect(addSentryBreadcrumb).toHaveBeenCalledWith(
        'Screen View: ProfileScreen',
        'navigation',
        {
          screenName: 'ProfileScreen',
          duration: undefined,
          timestamp: expect.any(String),
        }
      );
    });

    it('should update app metrics if available', () => {
      // Set up app metrics first
      const appMetrics = {
        appVersion: '1.0.1',
        platform: 'ios' as const,
        screenViews: 10,
        apiCalls: 20,
        crashCount: 0,
      };
      service.setAppMetrics(appMetrics);

      // Track a screen view
      service.trackScreenView('TestScreen');

      // Should update the app metrics with incremented screen views
      expect(addSentryContext).toHaveBeenCalledWith('app_metrics', {
        ...appMetrics,
        screenViews: 11,
      });
    });
  });

  describe('trackApiCall', () => {
    it('should track API call with all parameters', () => {
      service.trackApiCall('/api/users', 'GET', 200, 500);

      expect(addSentryBreadcrumb).toHaveBeenCalledWith(
        'API Call: GET /api/users',
        'api',
        {
          endpoint: '/api/users',
          method: 'GET',
          status: 200,
          duration: 500,
          timestamp: expect.any(String),
        }
      );
    });

    it('should update app metrics if available', () => {
      // Set up app metrics first
      const appMetrics = {
        appVersion: '1.0.1',
        platform: 'ios' as const,
        screenViews: 10,
        apiCalls: 5,
        crashCount: 0,
      };
      service.setAppMetrics(appMetrics);

      // Track an API call
      service.trackApiCall('/api/test', 'POST', 201, 300);

      // Should update the app metrics with incremented API calls
      expect(addSentryContext).toHaveBeenCalledWith('app_metrics', {
        ...appMetrics,
        apiCalls: 6,
      });
    });

    it('should update performance metrics if available', () => {
      // Set up performance metrics first
      const performanceMetrics = {
        screenLoadTime: 1000,
        apiResponseTime: 200,
        memoryUsage: 50,
      };
      service.setPerformanceMetrics(performanceMetrics);

      // Track an API call
      service.trackApiCall('/api/test', 'GET', 200, 150);

      // Should update the performance metrics with new API response time
      expect(addSentryContext).toHaveBeenCalledWith('performance_metrics', {
        ...performanceMetrics,
        apiResponseTime: 150,
      });
    });
  });

  describe('trackError', () => {
    it('should track error with context', () => {
      const error = new Error('Test error');
      const context = { component: 'TestComponent', action: 'test_action' };

      service.trackError(error, context);

      expect(addSentryBreadcrumb).toHaveBeenCalledWith(
        'Error Tracked: Test error',
        'error',
        {
          error: 'Test error',
          stack: error.stack,
          context,
          timestamp: expect.any(String),
        }
      );
    });

    it('should track error without context', () => {
      const error = new Error('Network error');

      service.trackError(error);

      expect(addSentryBreadcrumb).toHaveBeenCalledWith(
        'Error Tracked: Network error',
        'error',
        {
          error: 'Network error',
          stack: error.stack,
          context: undefined,
          timestamp: expect.any(String),
        }
      );
    });

    it('should update user metrics if available', () => {
      // Set up user metrics first
      const userMetrics = {
        userId: 'user123',
        userType: 'new' as const,
        sessionDuration: 5000,
        actionsPerformed: 5,
        errorsEncountered: 2,
      };
      service.setUserMetrics(userMetrics);

      // Track an error
      service.trackError(new Error('Test error'));

      // Should update the user metrics with incremented errors
      expect(addSentryContext).toHaveBeenCalledWith('user_metrics', {
        ...userMetrics,
        errorsEncountered: 3,
      });
    });
  });

  describe('trackPerformance', () => {
    it('should track performance with success', () => {
      service.trackPerformance('api_call', 800, true);

      expect(addSentryBreadcrumb).toHaveBeenCalledWith(
        'Performance: api_call',
        'performance',
        {
          operation: 'api_call',
          duration: 800,
          success: true,
          timestamp: expect.any(String),
        }
      );
    });

    it('should track performance with failure', () => {
      service.trackPerformance('screen_load', 1500, false);

      expect(addSentryBreadcrumb).toHaveBeenCalledWith(
        'Performance: screen_load',
        'performance',
        {
          operation: 'screen_load',
          duration: 1500,
          success: false,
          timestamp: expect.any(String),
        }
      );
    });

    it('should update performance metrics for screen operations', () => {
      // Set up performance metrics first
      const performanceMetrics = {
        screenLoadTime: 1000,
        apiResponseTime: 200,
        memoryUsage: 50,
      };
      service.setPerformanceMetrics(performanceMetrics);

      // Track a screen performance
      service.trackPerformance('screen_home', 1200, true);

      // Should update the performance metrics with new screen load time
      expect(addSentryContext).toHaveBeenCalledWith('performance_metrics', {
        ...performanceMetrics,
        screenLoadTime: 1200,
      });
    });

    it('should update performance metrics for API operations', () => {
      // Set up performance metrics first
      const performanceMetrics = {
        screenLoadTime: 1000,
        apiResponseTime: 200,
        memoryUsage: 50,
      };
      service.setPerformanceMetrics(performanceMetrics);

      // Track an API performance
      service.trackPerformance('api_users', 300, true);

      // Should update the performance metrics with new API response time
      expect(addSentryContext).toHaveBeenCalledWith('performance_metrics', {
        ...performanceMetrics,
        apiResponseTime: 300,
      });
    });
  });

  describe('sendCustomMetric', () => {
    it('should send custom metric with tags', () => {
      const tags = { feature: 'chat', user_type: 'premium' };

      service.sendCustomMetric('feature_usage', 1, tags);

      expect(addSentryBreadcrumb).toHaveBeenCalledWith(
        'Custom Metric: feature_usage',
        'custom_metric',
        {
          name: 'feature_usage',
          value: 1,
          tags,
          timestamp: expect.any(String),
        }
      );

      // Should add tags
      expect(addSentryTag).toHaveBeenCalledWith('feature', 'chat');
      expect(addSentryTag).toHaveBeenCalledWith('user_type', 'premium');
    });

    it('should send custom metric without tags', () => {
      service.sendCustomMetric('app_launch', 1);

      expect(addSentryBreadcrumb).toHaveBeenCalledWith(
        'Custom Metric: app_launch',
        'custom_metric',
        {
          name: 'app_launch',
          value: 1,
          tags: undefined,
          timestamp: expect.any(String),
        }
      );

      // Should not add any tags
      expect(addSentryTag).not.toHaveBeenCalled();
    });
  });

  describe('generateSessionReport', () => {
    it('should generate session report with all metrics', () => {
      // Set up some metrics first
      const userMetrics = {
        userId: 'user123',
        userType: 'new' as const,
        sessionDuration: 5000,
        actionsPerformed: 10,
        errorsEncountered: 2,
      };
      const appMetrics = {
        appVersion: '1.0.1',
        platform: 'ios' as const,
        screenViews: 15,
        apiCalls: 25,
        crashCount: 0,
      };
      const performanceMetrics = {
        screenLoadTime: 1200,
        apiResponseTime: 500,
        memoryUsage: 75,
      };

      service.setUserMetrics(userMetrics);
      service.setAppMetrics(appMetrics);
      service.setPerformanceMetrics(performanceMetrics);

      const report = service.generateSessionReport();

      expect(report).toEqual({
        userMetrics,
        appMetrics,
        performanceMetrics,
        timestamp: expect.any(String),
      });

      expect(addSentryContext).toHaveBeenCalledWith('session_report', report);
      expect(captureSentryMessage).toHaveBeenCalledWith('Session Report Generated', 'info');
    });

    it('should generate session report with null metrics when not set', () => {
      const report = service.generateSessionReport();

      expect(report).toEqual({
        userMetrics: null,
        appMetrics: null,
        performanceMetrics: null,
        timestamp: expect.any(String),
      });
    });
  });

  describe('resetMetrics', () => {
    it('should reset all metrics', () => {
      // Set up some metrics first
      service.setUserMetrics({
        userId: 'user123',
        userType: 'new' as const,
        sessionDuration: 5000,
        actionsPerformed: 10,
        errorsEncountered: 2,
      });

      service.resetMetrics();

      expect(addSentryBreadcrumb).toHaveBeenCalledWith(
        'Metrics Reset',
        'metrics',
        { timestamp: expect.any(String) }
      );

      // Generate a report after reset to verify metrics are null
      const report = service.generateSessionReport();
      expect(report.userMetrics).toBeNull();
      expect(report.appMetrics).toBeNull();
      expect(report.performanceMetrics).toBeNull();
    });
  });
}); 