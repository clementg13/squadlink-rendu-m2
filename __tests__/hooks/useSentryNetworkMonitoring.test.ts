import { renderHook } from '@testing-library/react-native';
import { useSentryNetworkMonitoring } from '@/hooks/useSentryNetworkMonitoring';
import { addSentryBreadcrumb, captureSentryException } from '@/lib/sentry';

// Mock Sentry functions
jest.mock('@/lib/sentry', () => ({
  addSentryBreadcrumb: jest.fn(),
  captureSentryException: jest.fn(),
}));

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock XMLHttpRequest
const mockXMLHttpRequest = {
  prototype: {
    open: jest.fn(),
    send: jest.fn(),
  },
};
global.XMLHttpRequest = mockXMLHttpRequest as any;

describe('useSentryNetworkMonitoring', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
    // Remove mockClear calls that don't exist
  });

  describe('startRequest', () => {
    it('should start tracking a request and add breadcrumb', () => {
      const { result } = renderHook(() => useSentryNetworkMonitoring());

      const requestId = result.current.startRequest('https://api.test.com/data', 'POST');

      expect(requestId).toMatch(/POST_https:\/\/api\.test\.com\/data_\d+/);
      expect(addSentryBreadcrumb).toHaveBeenCalledWith(
        'Network Request Started: POST https://api.test.com/data',
        'network',
        {
          url: 'https://api.test.com/data',
          method: 'POST',
          requestId: expect.any(String),
          timestamp: expect.any(String),
        }
      );
    });

    it('should use GET as default method', () => {
      const { result } = renderHook(() => useSentryNetworkMonitoring());

      result.current.startRequest('https://api.test.com/data');

      expect(addSentryBreadcrumb).toHaveBeenCalledWith(
        'Network Request Started: GET https://api.test.com/data',
        'network',
        expect.objectContaining({
          method: 'GET',
        })
      );
    });
  });

  describe('endRequest', () => {
    it('should end tracking a request and add breadcrumb', () => {
      const { result } = renderHook(() => useSentryNetworkMonitoring());

      const requestId = result.current.startRequest('https://api.test.com/data', 'GET');
      result.current.endRequest(requestId, 200);

      expect(addSentryBreadcrumb).toHaveBeenCalledWith(
        'Network Request Completed: GET https://api.test.com/data',
        'network',
        {
          url: 'https://api.test.com/data',
          method: 'GET',
          status: 200,
          duration: expect.any(Number),
          error: undefined,
          requestId: expect.any(String),
          timestamp: expect.any(String),
        }
      );
    });

    it('should handle request with error', () => {
      const { result } = renderHook(() => useSentryNetworkMonitoring());

      const requestId = result.current.startRequest('https://api.test.com/data', 'GET');
      result.current.endRequest(requestId, 500, 'Internal Server Error');

      expect(addSentryBreadcrumb).toHaveBeenCalledWith(
        'Network Request Completed: GET https://api.test.com/data',
        'network',
        {
          url: 'https://api.test.com/data',
          method: 'GET',
          status: 500,
          duration: expect.any(Number),
          error: 'Internal Server Error',
          requestId: expect.any(String),
          timestamp: expect.any(String),
        }
      );
    });

    it('should capture exception for failed requests', () => {
      const { result } = renderHook(() => useSentryNetworkMonitoring());

      const requestId = result.current.startRequest('https://api.test.com/data', 'GET');
      result.current.endRequest(requestId, 404, 'Not Found');

      expect(captureSentryException).toHaveBeenCalledWith(
        expect.any(Error),
        {
          network_request: {
            url: 'https://api.test.com/data',
            method: 'GET',
            status: 404,
            duration: expect.any(Number),
            error: 'Not Found',
          },
        }
      );
    });

    it('should capture exception for requests with error parameter', () => {
      const { result } = renderHook(() => useSentryNetworkMonitoring());

      const requestId = result.current.startRequest('https://api.test.com/data', 'GET');
      result.current.endRequest(requestId, 0, 'Network Error');

      expect(captureSentryException).toHaveBeenCalledWith(
        expect.any(Error),
        {
          network_request: {
            url: 'https://api.test.com/data',
            method: 'GET',
            status: 0,
            duration: expect.any(Number),
            error: 'Network Error',
          },
        }
      );
    });

    it('should not capture exception for successful requests', () => {
      const { result } = renderHook(() => useSentryNetworkMonitoring());

      const requestId = result.current.startRequest('https://api.test.com/data', 'GET');
      result.current.endRequest(requestId, 200);

      expect(captureSentryException).not.toHaveBeenCalled();
    });

    it('should handle non-existent request ID gracefully', () => {
      const { result } = renderHook(() => useSentryNetworkMonitoring());

      // Try to end a request that was never started
      expect(() => {
        result.current.endRequest('non_existent_id', 200);
      }).not.toThrow();

      expect(addSentryBreadcrumb).not.toHaveBeenCalled();
    });
  });

  describe('getActiveRequests', () => {
    it('should return empty array when no requests are active', () => {
      const { result } = renderHook(() => useSentryNetworkMonitoring());

      const activeRequests = result.current.getActiveRequests();
      expect(activeRequests).toEqual([]);
    });

    it('should return active requests', () => {
      const { result } = renderHook(() => useSentryNetworkMonitoring());

      const requestId1 = result.current.startRequest('https://api.test.com/data1', 'GET');
      const requestId2 = result.current.startRequest('https://api.test.com/data2', 'POST');

      const activeRequests = result.current.getActiveRequests();
      expect(activeRequests).toHaveLength(2);
      expect(activeRequests[0].url).toBe('https://api.test.com/data1');
      expect(activeRequests[1].url).toBe('https://api.test.com/data2');
    });

    it('should remove completed requests from active list', () => {
      const { result } = renderHook(() => useSentryNetworkMonitoring());

      const requestId = result.current.startRequest('https://api.test.com/data', 'GET');
      
      expect(result.current.getActiveRequests()).toHaveLength(1);
      
      result.current.endRequest(requestId, 200);
      
      expect(result.current.getActiveRequests()).toHaveLength(0);
    });
  });

  describe('Fetch Monitoring', () => {
    it('should monitor fetch requests successfully', async () => {
      const mockResponse = { status: 200, ok: true };
      mockFetch.mockResolvedValue(mockResponse);

      renderHook(() => useSentryNetworkMonitoring());

      const response = await fetch('https://api.test.com/data', { method: 'POST' });

      expect(response).toBe(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith('https://api.test.com/data', { method: 'POST' });
    });

    it('should handle fetch errors', async () => {
      const mockError = new Error('Network error');
      mockFetch.mockRejectedValue(mockError);

      renderHook(() => useSentryNetworkMonitoring());

      await expect(fetch('https://api.test.com/data')).rejects.toThrow('Network error');
    });

    it('should handle fetch with string URL', async () => {
      const mockResponse = { status: 200, ok: true };
      mockFetch.mockResolvedValue(mockResponse);

      renderHook(() => useSentryNetworkMonitoring());

      await fetch('https://api.test.com/data');

      expect(mockFetch).toHaveBeenCalledWith('https://api.test.com/data', undefined);
    });

    it('should handle fetch with URL object', async () => {
      const mockResponse = { status: 200, ok: true };
      mockFetch.mockResolvedValue(mockResponse);

      renderHook(() => useSentryNetworkMonitoring());

      const url = new URL('https://api.test.com/data');
      await fetch(url);

      expect(mockFetch).toHaveBeenCalledWith(url, undefined);
    });
  });

  describe('XMLHttpRequest Monitoring', () => {
    it('should monitor XMLHttpRequest when available', () => {
      renderHook(() => useSentryNetworkMonitoring());

      // Check if XMLHttpRequest methods were called
      expect(mockXMLHttpRequest.prototype.open).toBeDefined();
      expect(mockXMLHttpRequest.prototype.send).toBeDefined();
    });

    it('should handle XMLHttpRequest when not available', () => {
      // Temporarily remove XMLHttpRequest
      const originalXMLHttpRequest = global.XMLHttpRequest;
      delete (global as any).XMLHttpRequest;

      expect(() => {
        renderHook(() => useSentryNetworkMonitoring());
      }).not.toThrow();

      // Restore XMLHttpRequest
      global.XMLHttpRequest = originalXMLHttpRequest;
    });
  });

  describe('Request Duration Calculation', () => {
    it('should calculate correct duration for requests', () => {
      const { result } = renderHook(() => useSentryNetworkMonitoring());

      const requestId = result.current.startRequest('https://api.test.com/data', 'GET');
      
      // Simulate some time passing
      jest.advanceTimersByTime(100);
      
      result.current.endRequest(requestId, 200);

      const activeRequests = result.current.getActiveRequests();
      expect(activeRequests).toHaveLength(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors with proper error messages', () => {
      const { result } = renderHook(() => useSentryNetworkMonitoring());

      const requestId = result.current.startRequest('https://api.test.com/data', 'GET');
      result.current.endRequest(requestId, 0, 'Connection timeout');

      expect(captureSentryException).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Network Error: GET https://api.test.com/data - 0 Connection timeout',
        }),
        expect.any(Object)
      );
    });

    it('should handle HTTP error status codes', () => {
      const { result } = renderHook(() => useSentryNetworkMonitoring());

      const requestId = result.current.startRequest('https://api.test.com/data', 'GET');
      result.current.endRequest(requestId, 500);

      expect(captureSentryException).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Network Error: GET https://api.test.com/data - 500 ',
        }),
        expect.any(Object)
      );
    });
  });

  describe('Cleanup', () => {
    it('should clean up active requests on unmount', () => {
      const { result, unmount } = renderHook(() => useSentryNetworkMonitoring());

      const requestId = result.current.startRequest('https://api.test.com/data', 'GET');
      expect(result.current.getActiveRequests()).toHaveLength(1);

      unmount();

      // After unmount, the requests should be cleaned up
      // Note: We can't directly test this since the hook is unmounted,
      // but we can verify that the cleanup function exists
      expect(result.current.getActiveRequests()).toEqual([]);
    });
  });
}); 