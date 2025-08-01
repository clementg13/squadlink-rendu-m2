import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text, View } from 'react-native';
import { ErrorBoundary, useSentryErrorBoundary } from '@/components/ErrorBoundary';
import { captureSentryException } from '@/lib/sentry';

// Mock Sentry
jest.mock('@/lib/sentry', () => ({
  captureSentryException: jest.fn(),
}));

// Component that throws an error
const ThrowError: React.FC<{ shouldThrow: boolean }> = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <Text>Normal component</Text>;
};

// Component that throws an error during render
const ThrowRenderError: React.FC<{ shouldThrow: boolean }> = ({ shouldThrow }) => {
  if (shouldThrow) {
    // This will cause a render error
    (undefined as any).nonExistentMethod();
  }
  return <Text>Normal render component</Text>;
};

describe('ErrorBoundary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Suppress console.error for expected errors
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Error Handling', () => {
    it('should render children when no error occurs', () => {
      const { getByText } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      expect(getByText('Normal component')).toBeTruthy();
    });

    it('should render error UI when error occurs', () => {
      const { getByText } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(getByText("Oups ! Quelque chose s'est mal passé")).toBeTruthy();
      expect(getByText('Une erreur inattendue s\'est produite. Notre équipe a été notifiée.')).toBeTruthy();
    });

    it('should capture error in Sentry', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(captureSentryException).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          componentStack: expect.any(String),
          errorBoundary: true,
        })
      );
    });

    it('should call onError callback when provided', () => {
      const onError = jest.fn();
      
      render(
        <ErrorBoundary onError={onError}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(onError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          componentStack: expect.any(String),
        })
      );
    });
  });

  describe('Error UI Interaction', () => {
    it('should show retry button and handle retry', () => {
      const { getByText } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const retryButton = getByText('Réessayer');
      expect(retryButton).toBeTruthy();

      // Retry should reset the error state
      fireEvent.press(retryButton);
      
      // The error UI should still be visible because the error will occur again
      expect(getByText("Oups ! Quelque chose s'est mal passé")).toBeTruthy();
    });

    it('should show report button', () => {
      const { getByText } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const reportButton = getByText('Signaler l\'erreur');
      expect(reportButton).toBeTruthy();
    });
  });

  describe('Custom Fallback', () => {
    it('should render custom fallback when provided', () => {
      const CustomFallback = () => <Text>Custom error UI</Text>;
      
      const { getByText, queryByText } = render(
        <ErrorBoundary fallback={<CustomFallback />}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(getByText('Custom error UI')).toBeTruthy();
      expect(queryByText("Oups ! Quelque chose s'est mal passé")).toBeFalsy();
    });
  });

  describe('Debug Information', () => {
    it('should show debug information in development mode', () => {
      // Mock __DEV__ to true
      const originalDev = (global as any).__DEV__;
      (global as any).__DEV__ = true;

      const { getByText } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(getByText('Détails de l\'erreur (Développement):')).toBeTruthy();
      expect(getByText('Error: Test error')).toBeTruthy();

      // Restore __DEV__
      (global as any).__DEV__ = originalDev;
    });

    it('should not show debug information in production mode', () => {
      // Mock __DEV__ to false
      const originalDev = (global as any).__DEV__;
      (global as any).__DEV__ = false;

      const { queryByText } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(queryByText('Détails de l\'erreur (Développement):')).toBeFalsy();

      // Restore __DEV__
      (global as any).__DEV__ = originalDev;
    });
  });

  describe('Render Errors', () => {
    it('should handle render errors', () => {
      const { getByText } = render(
        <ErrorBoundary>
          <ThrowRenderError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(getByText("Oups ! Quelque chose s'est mal passé")).toBeTruthy();
    });
  });

  describe('ScrollView Integration', () => {
    it('should render error UI with scrollable content', () => {
      const { getByText } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Check if error UI is rendered (which includes ScrollView)
      expect(getByText("Oups ! Quelque chose s'est mal passé")).toBeTruthy();
    });
  });

  describe('useSentryErrorBoundary Hook', () => {
    it('should provide captureError function', () => {
      const { captureError } = useSentryErrorBoundary();
      
      expect(typeof captureError).toBe('function');
    });

    it('should call captureSentryException when captureError is called', () => {
      const { captureError } = useSentryErrorBoundary();
      const error = new Error('Test error');
      const context = { test: 'context' };

      captureError(error, context);

      expect(captureSentryException).toHaveBeenCalledWith(error, context);
    });

    it('should call captureSentryException without context when not provided', () => {
      const { captureError } = useSentryErrorBoundary();
      const error = new Error('Test error');

      captureError(error);

      expect(captureSentryException).toHaveBeenCalledWith(error, undefined);
    });
  });
}); 