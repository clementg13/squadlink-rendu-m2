import { initSentry, setSentryUser, clearSentryUser, addSentryTag, addSentryContext, captureSentryException, captureSentryMessage, addSentryBreadcrumb, useSentryPerformance } from '@/lib/sentry';
import * as Sentry from '@sentry/react-native';

// Mock Sentry
jest.mock('@sentry/react-native', () => ({
  init: jest.fn(),
  setUser: jest.fn(),
  setTag: jest.fn(),
  setContext: jest.fn(),
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  addBreadcrumb: jest.fn(),
  getCurrentHub: jest.fn(() => ({
    startTransaction: jest.fn(() => ({
      setStatus: jest.fn(),
      finish: jest.fn(),
    })),
  })),
  reactNavigationIntegration: jest.fn(() => ({
    registerNavigationContainer: jest.fn(),
  })),
}));

// Mock expo-constants
jest.mock('expo-constants', () => ({
  default: {
    expoConfig: {
      name: 'squadlink',
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

// Mock environment
jest.mock('@/constants/Environment', () => ({
  env: {
    SENTRY_DSN: 'https://test@sentry.io/test',
    NODE_ENV: 'development',
  },
}));

describe('Sentry Configuration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset __DEV__ global
    (global as any).__DEV__ = true;
  });

  describe('initSentry', () => {
    it('should initialize Sentry with correct configuration when DSN is provided', () => {
      initSentry();

      expect(Sentry.init).toHaveBeenCalledWith(
        expect.objectContaining({
          dsn: 'https://test@sentry.io/test',
          environment: 'development',
          dist: 'ios',
          debug: true,
          tracesSampleRate: 1.0,
          profilesSampleRate: 1.0,
          enableAutoSessionTracking: true,
          autoSessionTracking: true,
          enableTracing: true,
          enableNativeCrashHandling: true,
          maxBreadcrumbs: 100,
          beforeSend: expect.any(Function),
          beforeBreadcrumb: expect.any(Function),
          integrations: expect.any(Array),
          initialScope: expect.objectContaining({
            tags: expect.objectContaining({
              environment: 'development',
              platform: 'ios',
            }),
            user: {
              id: undefined,
            },
          }),
        })
      );
    });

    it('should configure different sample rates for production', () => {
      // Mock production environment
      jest.doMock('@/constants/Environment', () => ({
        env: {
          SENTRY_DSN: 'https://test@sentry.io/test',
          NODE_ENV: 'production',
        },
      }));

      (global as any).__DEV__ = false;
      
      // Re-import to get the new mock
      const { initSentry: initSentryProduction } = require('@/lib/sentry');
      initSentryProduction();

      expect(Sentry.init).toHaveBeenCalledWith(
        expect.objectContaining({
          tracesSampleRate: 0.2,
          profilesSampleRate: 0.1,
          debug: false,
        })
      );
    });
  });

  describe('setSentryUser', () => {
    it('should set user information in Sentry', () => {
      const user = {
        id: 'user123',
        email: 'test@example.com',
        username: 'testuser',
      };

      setSentryUser(user);

      expect(Sentry.setUser).toHaveBeenCalledWith(user);
    });
  });

  describe('clearSentryUser', () => {
    it('should clear user information in Sentry', () => {
      clearSentryUser();

      expect(Sentry.setUser).toHaveBeenCalledWith(null);
    });
  });

  describe('addSentryTag', () => {
    it('should add a tag to Sentry', () => {
      addSentryTag('test_key', 'test_value');

      expect(Sentry.setTag).toHaveBeenCalledWith('test_key', 'test_value');
    });
  });

  describe('addSentryContext', () => {
    it('should add context to Sentry', () => {
      const context = { key: 'value' };
      addSentryContext('test_context', context);

      expect(Sentry.setContext).toHaveBeenCalledWith('test_context', context);
    });
  });

  describe('captureSentryException', () => {
    it('should capture exception with context', () => {
      const error = new Error('Test error');
      const context = { component: 'test' };

      captureSentryException(error, context);

      expect(Sentry.setContext).toHaveBeenCalledWith('error_context', context);
      expect(Sentry.captureException).toHaveBeenCalledWith(error);
    });

    it('should capture exception without context', () => {
      const error = new Error('Test error');

      captureSentryException(error);

      expect(Sentry.setContext).not.toHaveBeenCalled();
      expect(Sentry.captureException).toHaveBeenCalledWith(error);
    });
  });

  describe('captureSentryMessage', () => {
    it('should capture message with default level', () => {
      captureSentryMessage('Test message');

      expect(Sentry.captureMessage).toHaveBeenCalledWith('Test message', 'info');
    });

    it('should capture message with custom level', () => {
      captureSentryMessage('Test message', 'error');

      expect(Sentry.captureMessage).toHaveBeenCalledWith('Test message', 'error');
    });
  });

  describe('addSentryBreadcrumb', () => {
    it('should add breadcrumb with all parameters', () => {
      const data = { key: 'value' };
      addSentryBreadcrumb('Test message', 'test_category', data);

      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
        message: 'Test message',
        category: 'test_category',
        data,
        level: 'info',
      });
    });

    it('should add breadcrumb without data', () => {
      addSentryBreadcrumb('Test message', 'test_category');

      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
        message: 'Test message',
        category: 'test_category',
        data: undefined,
        level: 'info',
      });
    });
  });

  describe('useSentryPerformance', () => {
    it('should measure performance of successful operation', async () => {
      const { measurePerformance } = useSentryPerformance();
      const mockOperation = jest.fn().mockResolvedValue('success');

      const result = await measurePerformance('test_operation', mockOperation);

      expect(result).toBe('success');
      expect(mockOperation).toHaveBeenCalled();
    });

    it('should measure performance of failed operation', async () => {
      const { measurePerformance } = useSentryPerformance();
      const mockError = new Error('Test error');
      const mockOperation = jest.fn().mockRejectedValue(mockError);

      await expect(measurePerformance('test_operation', mockOperation)).rejects.toThrow('Test error');
    });
  });
}); 