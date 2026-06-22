import axios, { AxiosInstance } from 'axios';

/**
 * Response type for token request
 */
export interface TokenResponse {
  token: string;
  expiresIn?: number;
}

/**
 * Generic storage item interface
 */
export interface StorageItem {
  id: string;
  [key: string]: any;
}

/**
 * Storage Service Client
 * Handles interactions with the storage service API
 */
export class SystemStorageService {
  private apiClient: AxiosInstance;
  private baseUrl: string;

  /**
   * Initialize StorageService with a base URL
   * @param baseUrl - The base URL of the storage service (e.g., http://localhost:3000)
   */
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.apiClient = axios.create({
      baseURL: baseUrl,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Request a token from the storage service
   * POST /storage/token
   * @returns Promise containing the token response
   */
  async getToken(): Promise<TokenResponse> {
    try {
      const response = await this.apiClient.post<TokenResponse>('/storage/token');
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to get token');
    }
  }

  /**
   * Retrieve a storage item by ID
   * GET /storage/{id}
   * @param id - The ID of the storage item to retrieve
   * @returns Promise containing the storage item
   */
  async getItem<T = StorageItem>(id: string): Promise<T> {
    try {
      const response = await this.apiClient.get<T>(`/storage/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error, `Failed to get item with id: ${id}`);
    }
  }

  /**
   * Create or update a storage item
   * POST /storage/{id}
   * @param id - The ID of the storage item
   * @param data - The data to store
   * @returns Promise containing the storage response
   */
  async saveItem<T = StorageItem>(id: string, data: T): Promise<T> {
    try {
      const response = await this.apiClient.post<T>(`/storage/${id}`, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error, `Failed to save item with id: ${id}`);
    }
  }

  /**
   * Set the authorization token for subsequent requests
   * @param token - The authorization token
   */
  setAuthToken(token: string): void {
    this.apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Clear the authorization token
   */
  clearAuthToken(): void {
    delete this.apiClient.defaults.headers.common['Authorization'];
  }

  /**
   * Internal error handler
   */
  private handleError(error: any, message: string): Error {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // Server responded with error status
        return new Error(`${message}: ${error.response.status} ${error.response.statusText}`);
      } else if (error.request) {
        // Request made but no response received
        return new Error(`${message}: No response from server`);
      }
    }
    return new Error(`${message}: ${error instanceof Error ? error.message : String(error)}`);
  }
}
