import { useState, useCallback, useRef, useEffect } from 'react';
import { SystemStorageService, TokenResponse, StorageItem } from '../StorageService';

/**
 * State for useStorage hook
 */
export interface UseStorageState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

/**
 * React hook for managing storage service interactions
 * Handles token management, item fetching, and updates
 * 
 * @param baseUrl - The base URL of the storage service
 * @returns Storage service utilities and state management
 */
export function useStorage(baseUrl: string) {
  const serviceRef = useRef<SystemStorageService | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState<Error | null>(null);
  const [tokenLoading, setTokenLoading] = useState(false);

  // Initialize service on mount
  useEffect(() => {
    if (!serviceRef.current) {
      serviceRef.current = new SystemStorageService(baseUrl);
    }
  }, [baseUrl]);

  /**
   * Request and store an authentication token
   */
  const requestToken = useCallback(async (): Promise<TokenResponse | null> => {
    if (!serviceRef.current) return null;

    setTokenLoading(true);
    setTokenError(null);

    try {
      const response = await serviceRef.current.getToken();
      setToken(response.token);
      serviceRef.current.setAuthToken(response.token);
      return response;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      setTokenError(err);
      return null;
    } finally {
      setTokenLoading(false);
    }
  }, []);

  /**
   * Retrieve a storage item
   */
  const getItem = useCallback(
    async <T = StorageItem>(id: string): Promise<UseStorageState<T>> => {
      if (!serviceRef.current) {
        return {
          data: null,
          loading: false,
          error: new Error('Storage service not initialized')
        };
      }

      try {
        const data = await serviceRef.current.getItem<T>(id);
        return { data, loading: false, error: null };
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        return { data: null, loading: false, error: err };
      }
    },
    []
  );

  /**
   * Save a storage item
   */
  const saveItem = useCallback(
    async <T = StorageItem>(id: string, data: T): Promise<UseStorageState<T>> => {
      if (!serviceRef.current) {
        return {
          data: null,
          loading: false,
          error: new Error('Storage service not initialized')
        };
      }

      try {
        const result = await serviceRef.current.saveItem<T>(id, data);
        return { data: result, loading: false, error: null };
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        return { data: null, loading: false, error: err };
      }
    },
    []
  );

  /**
   * Clear the authentication token
   */
  const logout = useCallback(() => {
    if (serviceRef.current) {
      serviceRef.current.clearAuthToken();
    }
    setToken(null);
  }, []);

  return {
    // Token management
    token,
    tokenLoading,
    tokenError,
    requestToken,
    logout,

    // Item operations
    getItem,
    saveItem,

    // Direct service access (if needed)
    service: serviceRef.current
  };
}
