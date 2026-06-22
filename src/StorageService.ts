import axios, { AxiosInstance } from 'axios';

/**
 * Request body for token request
 */
export interface StoragePasswordDto {
  password: string;
}

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
  private id: string | null = null;

  /**
   * Initialize StorageService with a base URL and optional storage ID
   * @param baseUrl - The base URL of the storage service (e.g., http://localhost:3000)
   * @param id - Optional storage ID to associate with this service instance
   */
  constructor(baseUrl: string, id?: string) {
    this.baseUrl = baseUrl;
    this.id = id || null;
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
   * Automatically saves the token for subsequent requests
   * @param password - The password for authentication
   * @returns Promise containing the token response
   */
  async getToken(password: string): Promise<TokenResponse> {
    try {
      const response = await this.apiClient.post<TokenResponse>('/storage/token', {
        password
      });
      // Automatically set the token for subsequent requests
      this.setAuthToken(response.data.token);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to get token');
    }
  }

  /**
   * Retrieve a storage item by ID
   * GET /storage/{id}
   * Uses the storage ID from the service instance
   * @returns Promise containing the storage item
   */
  async getItem<T = StorageItem>(): Promise<T> {
    if (!this.id) {
      throw new Error('Storage ID not set. Call setId() or initialize with an ID.');
    }
    try {
      const response = await this.apiClient.get<T>(`/storage/${this.id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error, `Failed to get item with id: ${this.id}`);
    }
  }

  /**
   * Create or update a storage item
   * POST /storage/{id}
   * Uses the storage ID from the service instance
   * @param data - The data to store
   * @returns Promise containing the storage response
   */
  async saveItem<T = StorageItem>(data: T): Promise<T> {
    if (!this.id) {
      throw new Error('Storage ID not set. Call setId() or initialize with an ID.');
    }
    try {
      const response = await this.apiClient.post<T>(`/storage/${this.id}`, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error, `Failed to save item with id: ${this.id}`);
    }
  }

  /**
   * Set the authorization token for subsequent requests
   * Uses X-Storage-Token header for token transmission
   * Typically called automatically by getToken(), but can be used for manual token setting
   * @param token - The authorization token
   */
  private setAuthToken(token: string): void {
    this.apiClient.defaults.headers.common['X-Storage-Token'] = token;
  }

  /**
   * Clear the authorization token
   */
  clearAuthToken(): void {
    delete this.apiClient.defaults.headers.common['X-Storage-Token'];
  }

  /**
   * Get the storage ID associated with this service instance
   */
  getId(): string | null {
    return this.id;
  }

  /**
   * Set the storage ID for this service instance
   */
  setId(id: string): void {
    this.id = id;
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
