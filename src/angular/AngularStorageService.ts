import { Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { SystemStorageService, TokenResponse, StorageItem } from '../StorageService';

/**
 * Angular wrapper for SystemStorageService
 * Provides RxJS observables and Angular-specific lifecycle management
 * 
 * @example
 * ```typescript
 * constructor(private storageService: AngularSystemStorageService) {}
 * 
 * ngOnInit() {
 *   this.storageService.requestToken().subscribe(token => {
 *     console.log('Token:', token);
 *   });
 * }
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class AngularSystemStorageService {
  private baseUrl: string = '';
  private storageService: SystemStorageService | null = null;

  // Observables for token state
  private tokenSubject = new BehaviorSubject<string | null>(null);
  private tokenLoadingSubject = new BehaviorSubject<boolean>(false);
  private tokenErrorSubject = new Subject<Error | null>();

  // Public observables
  public token$ = this.tokenSubject.asObservable();
  public tokenLoading$ = this.tokenLoadingSubject.asObservable();
  public tokenError$ = this.tokenErrorSubject.asObservable();

  /**
   * Initialize the service with a base URL and optional storage ID
   * Should be called before using other methods
   * 
   * @param baseUrl - The base URL of the storage service
   * @param id - Optional storage ID to associate with this service instance
   */
  initialize(baseUrl: string, id?: string): void {
    this.baseUrl = baseUrl;
    this.storageService = new SystemStorageService(baseUrl, id);
  }

  /**
  * Get the underlying SystemStorageService instance
   */
  getService(): SystemStorageService {
    if (!this.storageService) {
      throw new Error('AngularSystemStorageService not initialized. Call initialize(baseUrl) first.');
    }
    return this.storageService;
  }

  /**
   * Request a token from the storage service
   * Automatically sets the token for subsequent requests
   * @param password - The password for authentication
   * @returns Observable of TokenResponse
   */
  requestToken(password: string): Observable<TokenResponse> {
    return new Observable(observer => {
      if (!this.storageService) {
        observer.error(new Error('Service not initialized'));
        return;
      }

      this.tokenLoadingSubject.next(true);
      this.tokenErrorSubject.next(null);

      this.storageService
        .getToken(password)
        .then(response => {
          this.tokenSubject.next(response.token);
          observer.next(response);
          observer.complete();
          this.tokenLoadingSubject.next(false);
        })
        .catch(error => {
          const err = error instanceof Error ? error : new Error(String(error));
          this.tokenErrorSubject.next(err);
          observer.error(err);
          this.tokenLoadingSubject.next(false);
        });
    });
  }

  /**
   * Retrieve a storage item
   * Uses the storage ID from the service instance
   * @returns Observable of the storage item
   */
  getItem<T = StorageItem>(): Observable<T> {
    return new Observable(observer => {
      if (!this.storageService) {
        observer.error(new Error('Service not initialized'));
        return;
      }

      this.storageService
        .getItem<T>()
        .then(data => {
          observer.next(data);
          observer.complete();
        })
        .catch(error => {
          observer.error(error);
        });
    });
  }

  /**
   * Save a storage item
   * Uses the storage ID from the service instance
   * @param data - The data to save
   * @returns Observable of the saved item
   */
  saveItem<T = StorageItem>(data: T): Observable<T> {
    return new Observable(observer => {
      if (!this.storageService) {
        observer.error(new Error('Service not initialized'));
        return;
      }

      this.storageService
        .saveItem<T>(data)
        .then(result => {
          observer.next(result);
          observer.complete();
        })
        .catch(error => {
          observer.error(error);
        });
    });
  }

  /**
   * Set the authorization token for subsequent requests
   * @param token - The authorization token
   */
  setAuthToken(token: string): void {
    if (!this.storageService) {
      throw new Error('Service not initialized');
    }
    this.tokenSubject.next(token);
    this.storageService.setAuthToken(token);
  }

  /**
   * Clear the authorization token and logout
   */
  logout(): void {
    if (!this.storageService) {
      throw new Error('Service not initialized');
    }
    this.tokenSubject.next(null);
    this.storageService.clearAuthToken();
  }

  /**
   * Get current token synchronously
   */
  getCurrentToken(): string | null {
    return this.tokenSubject.value;
  }

  /**
   * Get current loading state synchronously
   */
  isLoading(): boolean {
    return this.tokenLoadingSubject.value;
  }

  /**
   * Get the storage ID associated with this service instance
   */
  getId(): string | null {
    if (!this.storageService) {
      throw new Error('Service not initialized');
    }
    return this.storageService.getId();
  }

  /**
   * Set the storage ID for this service instance
   */
  setId(id: string): void {
    if (!this.storageService) {
      throw new Error('Service not initialized');
    }
    this.storageService.setId(id);
  }
}
