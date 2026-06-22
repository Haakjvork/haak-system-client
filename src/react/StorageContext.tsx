import React, { createContext, useContext, ReactNode } from 'react';
import { useStorage } from './useStorage';
import { SystemStorageService, StorageItem } from '../StorageService';

/**
 * Context value type
 */
export interface StorageContextType {
  token: string | null;
  tokenLoading: boolean;
  tokenError: Error | null;
  requestToken: () => Promise<any>;
  logout: () => void;
  getItem: <T = StorageItem>(id: string) => Promise<any>;
  saveItem: <T = StorageItem>(id: string, data: T) => Promise<any>;
  service: SystemStorageService | null;
}

/**
 * Storage context
 */
const StorageContext = createContext<StorageContextType | undefined>(undefined);

/**
 * Provider props
 */
export interface StorageProviderProps {
  baseUrl: string;
  children: ReactNode;
}

/**
 * Storage Provider Component
 * Wraps your app to provide storage service access via context
 * 
 * @example
 * ```tsx
 * <StorageProvider baseUrl="http://localhost:3000">
 *   <YourApp />
 * </StorageProvider>
 * ```
 */
export function StorageProvider({ baseUrl, children }: StorageProviderProps) {
  const storage = useStorage(baseUrl);

  return (
    <StorageContext.Provider value={storage as StorageContextType}>
      {children}
    </StorageContext.Provider>
  );
}

/**
 * Hook to access storage context
 * Must be used within StorageProvider
 * 
 * @example
 * ```tsx
 * const { getItem, saveItem, requestToken } = useStorageContext();
 * ```
 */
export function useStorageContext(): StorageContextType {
  const context = useContext(StorageContext);
  if (!context) {
    throw new Error('useStorageContext must be used within StorageProvider');
  }
  return context;
}
