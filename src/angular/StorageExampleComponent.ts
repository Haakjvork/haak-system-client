import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AngularSystemStorageService } from '../angular';

/**
 * Example Angular component using the storage service
 */
@Component({
  selector: 'app-storage-example',
  templateUrl: './storage-example.component.html',
  styleUrls: ['./storage-example.component.css']
})
export class StorageExampleComponent implements OnInit, OnDestroy {
  token: string | null = null;
  tokenLoading = false;
  tokenError: Error | null = null;

  itemData: any = null;
  itemError: Error | null = null;
  itemLoading = false;

  private destroy$ = new Subject<void>();

  constructor(private storageService: AngularSystemStorageService) {}

  ngOnInit(): void {
    // Initialize the service
    this.storageService.initialize('http://localhost:3000');

    // Subscribe to token changes
    this.storageService.token$
      .pipe(takeUntil(this.destroy$))
      .subscribe(token => (this.token = token));

    this.storageService.tokenLoading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => (this.tokenLoading = loading));

    this.storageService.tokenError$
      .pipe(takeUntil(this.destroy$))
      .subscribe(error => (this.tokenError = error));

    // Request token on init
    this.requestToken();
  }

  requestToken(): void {
    this.storageService
      .requestToken()
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        response => console.log('Token received:', response),
        error => console.error('Token error:', error)
      );
  }

  getItem(id: string = 'my-item-id'): void {
    this.itemLoading = true;
    this.itemError = null;

    this.storageService
      .getItem(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        data => {
          this.itemData = data;
          this.itemLoading = false;
        },
        error => {
          this.itemError = error;
          this.itemLoading = false;
        }
      );
  }

  saveItem(id: string = 'my-item-id'): void {
    const dataToSave = { name: 'Test Item', value: 42 };
    this.itemLoading = true;
    this.itemError = null;

    this.storageService
      .saveItem(id, dataToSave)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        result => {
          this.itemData = result;
          this.itemLoading = false;
        },
        error => {
          this.itemError = error;
          this.itemLoading = false;
        }
      );
  }

  logout(): void {
    this.storageService.logout();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
