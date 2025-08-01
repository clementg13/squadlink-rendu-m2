import { useEffect, useRef } from 'react';
import { addSentryBreadcrumb, captureSentryException } from '@/lib/sentry';

interface NetworkRequest {
  url: string;
  method: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  status?: number;
  error?: string;
}

export const useSentryNetworkMonitoring = () => {
  const requestsRef = useRef<Map<string, NetworkRequest>>(new Map());

  const startRequest = (url: string, method: string = 'GET') => {
    const requestId = `${method}_${url}_${Date.now()}`;
    const request: NetworkRequest = {
      url,
      method,
      startTime: Date.now(),
    };
    
    requestsRef.current.set(requestId, request);
    
    // Ajouter un breadcrumb pour le début de la requête
    addSentryBreadcrumb(
      `Network Request Started: ${method} ${url}`,
      'network',
      {
        url,
        method,
        requestId,
        timestamp: new Date().toISOString(),
      }
    );
    
    return requestId;
  };

  const endRequest = (requestId: string, status: number, error?: string) => {
    const request = requestsRef.current.get(requestId);
    if (!request) return;

    request.endTime = Date.now();
    request.duration = request.endTime - request.startTime;
    request.status = status;
    request.error = error;

    // Ajouter un breadcrumb pour la fin de la requête
    addSentryBreadcrumb(
      `Network Request Completed: ${request.method} ${request.url}`,
      'network',
      {
        url: request.url,
        method: request.method,
        status,
        duration: request.duration,
        error,
        requestId,
        timestamp: new Date().toISOString(),
      }
    );

    // Capturer les erreurs réseau
    if (error || status >= 400) {
      const networkError = new Error(`Network Error: ${request.method} ${request.url} - ${status} ${error || ''}`);
      captureSentryException(networkError, {
        network_request: {
          url: request.url,
          method: request.method,
          status,
          duration: request.duration,
          error,
        },
      });
    }

    // Nettoyer la requête
    requestsRef.current.delete(requestId);
  };

  const monitorFetch = () => {
    const originalFetch = global.fetch;
    
    global.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString();
      const method = init?.method || 'GET';
      
      const requestId = startRequest(url, method);
      
      try {
        const response = await originalFetch(input, init);
        
        endRequest(requestId, response.status);
        
        return response;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        endRequest(requestId, 0, errorMessage);
        throw error;
      }
    };
  };

  const monitorXMLHttpRequest = () => {
    if (typeof XMLHttpRequest !== 'undefined') {
      const originalOpen = XMLHttpRequest.prototype.open;
      const originalSend = XMLHttpRequest.prototype.send;
      
      XMLHttpRequest.prototype.open = function(method: string, url: string) {
        this._sentryRequestId = startRequest(url, method);
        return originalOpen.call(this, method, url);
      };
      
      XMLHttpRequest.prototype.send = function(data?: any) {
        const xhr = this;
        const requestId = xhr._sentryRequestId;
        
        const originalOnReadyStateChange = xhr.onreadystatechange;
        
        xhr.onreadystatechange = function() {
          if (xhr.readyState === 4) {
            endRequest(requestId, xhr.status, xhr.statusText);
          }
          
          if (originalOnReadyStateChange) {
            originalOnReadyStateChange.call(xhr);
          }
        };
        
        return originalSend.call(this, data);
      };
    }
  };

  useEffect(() => {
    // Activer le monitoring réseau
    monitorFetch();
    monitorXMLHttpRequest();
    
    // Nettoyer les requêtes en cours lors du démontage
    return () => {
      requestsRef.current.clear();
    };
  }, []);

  return {
    startRequest,
    endRequest,
    getActiveRequests: () => Array.from(requestsRef.current.values()),
  };
}; 