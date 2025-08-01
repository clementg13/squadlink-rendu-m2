import { renderHook, act } from '@testing-library/react-native';
import { useSentryMetrics } from '@/hooks/useSentryMetrics';
import { sentryMetricsService } from '@/services/sentryMetricsService';

// Mock the metrics service
jest.mock('@/services/sentryMetricsService', () => ({
  sentryMetricsService: {
    setAppMetrics: jest.fn(),
    setPerformanceMetrics: jest.fn(),
    setUserMetrics: jest.fn(),
    trackUserAction: jest.fn(),
    trackScreenView: jest.fn(),
    trackApiCall: jest.fn(),
    trackError: jest.fn(),
    trackPerformance: jest.fn(),
    sendCustomMetric: jest.fn(),
    generateSessionReport: jest.fn(),
    resetMetrics: jest.fn(),
  },
}));

// Mock expo-constants
jest.mock('expo-constants', () => ({
  default: {
    expoConfig: {
      version: '1.0.1',
    },
  },
}));

// Mock react-native
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
  },
}));

describe('useSentryMetrics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize app metrics on mount', () => {
      renderHook(() => useSentryMetrics());

      expect(sentryMetricsService.setAppMetrics).toHaveBeenCalledWith({
        appVersion: '1.0.0', // Default value when expoConfig is undefined
        platform: 'ios',
        screenViews: 0,
        apiCalls: 0,
        crashCount: 0,
      });
    });

    it('should initialize performance metrics on mount', () => {
      renderHook(() => useSentryMetrics());

      expect(sentryMetricsService.setPerformanceMetrics).toHaveBeenCalledWith({
        screenLoadTime: 0,
        apiResponseTime: 0,
        memoryUsage: 0,
      });
    });
  });

  describe('trackUserAction', () => {
    it('should track user action with details', () => {
      const { result } = renderHook(() => useSentryMetrics());
      const details = { buttonId: 'test' };

      act(() => {
        result.current.trackUserAction('test_action', details);
      });

      expect(sentryMetricsService.trackUserAction).toHaveBeenCalledWith('test_action', details);
    });

    it('should track user action without details', () => {
      const { result } = renderHook(() => useSentryMetrics());

      act(() => {
        result.current.trackUserAction('test_action');
      });

      expect(sentryMetricsService.trackUserAction).toHaveBeenCalledWith('test_action', undefined);
    });
  });

  describe('trackScreenView', () => {
    it('should track screen view with duration', () => {
      const { result } = renderHook(() => useSentryMetrics());

      act(() => {
        result.current.trackScreenView('TestScreen', 1000);
      });

      expect(sentryMetricsService.trackScreenView).toHaveBeenCalledWith('TestScreen', 1000);
    });

    it('should track screen view without duration', () => {
      const { result } = renderHook(() => useSentryMetrics());

      act(() => {
        result.current.trackScreenView('TestScreen');
      });

      expect(sentryMetricsService.trackScreenView).toHaveBeenCalledWith('TestScreen', undefined);
    });

    it('should increment screen view count', () => {
      const { result } = renderHook(() => useSentryMetrics());

      act(() => {
        result.current.trackScreenView('Screen1');
        result.current.trackScreenView('Screen2');
      });

      expect(result.current.getScreenViewCount()).toBe(2);
    });
  });

  describe('trackApiCall', () => {
    it('should track API call with all parameters', () => {
      const { result } = renderHook(() => useSentryMetrics());

      act(() => {
        result.current.trackApiCall('/api/test', 'GET', 200, 150);
      });

      expect(sentryMetricsService.trackApiCall).toHaveBeenCalledWith('/api/test', 'GET', 200, 150);
    });

    it('should increment API call count', () => {
      const { result } = renderHook(() => useSentryMetrics());

      act(() => {
        result.current.trackApiCall('/api/test1', 'GET', 200, 100);
        result.current.trackApiCall('/api/test2', 'POST', 201, 200);
      });

      expect(result.current.getApiCallCount()).toBe(2);
    });
  });

  describe('trackError', () => {
    it('should track error with context', () => {
      const { result } = renderHook(() => useSentryMetrics());
      const error = new Error('Test error');
      const context = { component: 'test' };

      act(() => {
        result.current.trackError(error, context);
      });

      expect(sentryMetricsService.trackError).toHaveBeenCalledWith(error, context);
    });

    it('should track error without context', () => {
      const { result } = renderHook(() => useSentryMetrics());
      const error = new Error('Test error');

      act(() => {
        result.current.trackError(error);
      });

      expect(sentryMetricsService.trackError).toHaveBeenCalledWith(error, undefined);
    });

    it('should increment error count', () => {
      const { result } = renderHook(() => useSentryMetrics());

      act(() => {
        result.current.trackError(new Error('Error 1'));
        result.current.trackError(new Error('Error 2'));
      });

      expect(result.current.getErrorCount()).toBe(2);
    });
  });

  describe('trackPerformance', () => {
    it('should track performance with success', () => {
      const { result } = renderHook(() => useSentryMetrics());

      act(() => {
        result.current.trackPerformance('test_operation', 1000, true);
      });

      expect(sentryMetricsService.trackPerformance).toHaveBeenCalledWith('test_operation', 1000, true);
    });

    it('should track performance with failure', () => {
      const { result } = renderHook(() => useSentryMetrics());

      act(() => {
        result.current.trackPerformance('test_operation', 1000, false);
      });

      expect(sentryMetricsService.trackPerformance).toHaveBeenCalledWith('test_operation', 1000, false);
    });
  });

  describe('sendCustomMetric', () => {
    it('should send custom metric with tags', () => {
      const { result } = renderHook(() => useSentryMetrics());
      const tags = { feature: 'test' };

      act(() => {
        result.current.sendCustomMetric('test_metric', 42, tags);
      });

      expect(sentryMetricsService.sendCustomMetric).toHaveBeenCalledWith('test_metric', 42, tags);
    });

    it('should send custom metric without tags', () => {
      const { result } = renderHook(() => useSentryMetrics());

      act(() => {
        result.current.sendCustomMetric('test_metric', 42);
      });

      expect(sentryMetricsService.sendCustomMetric).toHaveBeenCalledWith('test_metric', 42, undefined);
    });
  });

  describe('updateUserMetrics', () => {
    it('should update user metrics with new user', () => {
      const { result } = renderHook(() => useSentryMetrics());

      act(() => {
        result.current.updateUserMetrics('user123', 'new');
      });

      expect(sentryMetricsService.setUserMetrics).toHaveBeenCalledWith({
        userId: 'user123',
        userType: 'new',
        sessionDuration: expect.any(Number),
        actionsPerformed: 0,
        errorsEncountered: 0,
      });
    });

    it('should update user metrics with returning user', () => {
      const { result } = renderHook(() => useSentryMetrics());

      act(() => {
        result.current.updateUserMetrics('user123', 'returning');
      });

      expect(sentryMetricsService.setUserMetrics).toHaveBeenCalledWith({
        userId: 'user123',
        userType: 'returning',
        sessionDuration: expect.any(Number),
        actionsPerformed: 0,
        errorsEncountered: 0,
      });
    });

    it('should use returning as default user type', () => {
      const { result } = renderHook(() => useSentryMetrics());

      act(() => {
        result.current.updateUserMetrics('user123');
      });

      expect(sentryMetricsService.setUserMetrics).toHaveBeenCalledWith({
        userId: 'user123',
        userType: 'returning',
        sessionDuration: expect.any(Number),
        actionsPerformed: 0,
        errorsEncountered: 0,
      });
    });
  });

  describe('generateSessionReport', () => {
    it('should generate session report', () => {
      const { result } = renderHook(() => useSentryMetrics());
      const mockReport = { test: 'report' };
      (sentryMetricsService.generateSessionReport as jest.Mock).mockReturnValue(mockReport);

      act(() => {
        const report = result.current.generateSessionReport();
        expect(report).toBe(mockReport);
      });

      expect(sentryMetricsService.generateSessionReport).toHaveBeenCalled();
    });
  });

  describe('resetMetrics', () => {
    it('should reset all metrics', () => {
      const { result } = renderHook(() => useSentryMetrics());

      act(() => {
        result.current.resetMetrics();
      });

      expect(sentryMetricsService.resetMetrics).toHaveBeenCalled();
    });

    it('should reset internal counters', () => {
      const { result } = renderHook(() => useSentryMetrics());

      // Add some metrics first
      act(() => {
        result.current.trackScreenView('Screen1');
        result.current.trackApiCall('/api/test', 'GET', 200, 100);
        result.current.trackError(new Error('Test error'));
      });

      expect(result.current.getScreenViewCount()).toBe(1);
      expect(result.current.getApiCallCount()).toBe(1);
      expect(result.current.getErrorCount()).toBe(1);

      // Reset metrics
      act(() => {
        result.current.resetMetrics();
      });

      expect(result.current.getScreenViewCount()).toBe(0);
      expect(result.current.getApiCallCount()).toBe(0);
      expect(result.current.getErrorCount()).toBe(0);
    });
  });

  describe('useScreenTracking', () => {
    it('should track screen view on mount and unmount', () => {
      const { result } = renderHook(() => useSentryMetrics());
      const { useScreenTracking } = result.current;

      const { unmount } = renderHook(() => useScreenTracking('TestScreen'));

      expect(sentryMetricsService.trackScreenView).toHaveBeenCalledWith('TestScreen', undefined);

      unmount();

      // Should track performance on unmount
      expect(sentryMetricsService.trackPerformance).toHaveBeenCalledWith('screen_TestScreen', expect.any(Number), true);
    });
  });

  describe('usePerformanceTracking', () => {
    it('should track successful operation performance', async () => {
      const { result } = renderHook(() => useSentryMetrics());
      const { usePerformanceTracking } = result.current;
      const { trackOperation } = usePerformanceTracking('test_operation');

      const mockOperation = jest.fn().mockResolvedValue('success');

      await act(async () => {
        const operationResult = await trackOperation(mockOperation);
        expect(operationResult).toBe('success');
      });

      expect(sentryMetricsService.trackPerformance).toHaveBeenCalledWith('test_operation', expect.any(Number), true);
    });

    it('should track failed operation performance', async () => {
      const { result } = renderHook(() => useSentryMetrics());
      const { usePerformanceTracking } = result.current;
      const { trackOperation } = usePerformanceTracking('test_operation');

      const mockError = new Error('Test error');
      const mockOperation = jest.fn().mockRejectedValue(mockError);

      await act(async () => {
        await expect(trackOperation(mockOperation)).rejects.toThrow('Test error');
      });

      expect(sentryMetricsService.trackPerformance).toHaveBeenCalledWith('test_operation', expect.any(Number), false);
      expect(sentryMetricsService.trackError).toHaveBeenCalledWith(mockError, undefined);
    });
  });

  describe('Session Duration', () => {
    it('should return correct session duration', () => {
      const { result } = renderHook(() => useSentryMetrics());

      const duration = result.current.getSessionDuration();
      expect(duration).toBeGreaterThanOrEqual(0);
      expect(typeof duration).toBe('number');
    });
  });
}); 