import { usePrayerStore, useCommunityStore, useAnnouncementStore, useSettingsStore } from '../store';

class NetworkManager {
  private isOnline: boolean = navigator.onLine;
  private retryTimeouts: Map<string, NodeJS.Timeout> = new Map();
  private maxRetries = 3;
  private baseRetryDelay = 1000; // 1 second

  constructor() {
    this.initializeEventListeners();
    this.setInitialOnlineStatus();
  }

  private initializeEventListeners(): void {
    // Listen for online/offline events
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));

    // Listen for visibility change to check connection when app becomes visible
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
  }

  private setInitialOnlineStatus(): void {
    // Set initial online status for all stores
    this.updateAllStoresOnlineStatus(this.isOnline);
  }

  private handleOnline(): void {
    console.log('Network: Online');
    this.isOnline = true;
    this.updateAllStoresOnlineStatus(true);
    this.retryAllPendingActions();
  }

  private handleOffline(): void {
    console.log('Network: Offline');
    this.isOnline = false;
    this.updateAllStoresOnlineStatus(false);
    this.clearAllRetryTimeouts();
  }

  private handleVisibilityChange(): void {
    if (!document.hidden && this.isOnline) {
      // App became visible and we think we're online, verify connection
      this.verifyConnection();
    }
  }

  private updateAllStoresOnlineStatus(isOnline: boolean): void {
    usePrayerStore.getState().setOnlineStatus(isOnline);
    useCommunityStore.getState().setOnlineStatus(isOnline);
    useAnnouncementStore.getState().setOnlineStatus(isOnline);
    useSettingsStore.getState().setOnlineStatus(isOnline);
  }

  private async verifyConnection(): Promise<boolean> {
    try {
      // Try to make a simple request to verify actual connectivity
      // In Electron, we can try to access the database
      const response = await window.electronAPI.db.getPath();
      if (response) {
        if (!this.isOnline) {
          this.handleOnline();
        }
        return true;
      }
    } catch (error) {
      console.warn('Connection verification failed:', error);
      if (this.isOnline) {
        this.handleOffline();
      }
    }
    return false;
  }

  private retryAllPendingActions(): void {
    // Retry pending actions for all stores
    this.retryStoreActions('prayer', () => usePrayerStore.getState().retryPendingActions());
    this.retryStoreActions('community', () => useCommunityStore.getState().retryPendingActions());
    this.retryStoreActions('announcements', () => useAnnouncementStore.getState().retryPendingActions());
    this.retryStoreActions('settings', () => useSettingsStore.getState().retryPendingActions());
  }

  private retryStoreActions(storeKey: string, retryFn: () => Promise<void>): void {
    if (this.retryTimeouts.has(storeKey)) {
      clearTimeout(this.retryTimeouts.get(storeKey)!);
    }

    const timeout = setTimeout(async () => {
      try {
        await retryFn();
        this.retryTimeouts.delete(storeKey);
      } catch (error) {
        console.error(`Retry failed for ${storeKey}:`, error);
        // Schedule another retry with exponential backoff
        this.scheduleRetry(storeKey, retryFn, 1);
      }
    }, this.baseRetryDelay);

    this.retryTimeouts.set(storeKey, timeout);
  }

  private scheduleRetry(storeKey: string, retryFn: () => Promise<void>, attemptCount: number): void {
    if (attemptCount >= this.maxRetries) {
      console.warn(`Max retries reached for ${storeKey}`);
      return;
    }

    const delay = this.baseRetryDelay * Math.pow(2, attemptCount); // Exponential backoff
    const timeout = setTimeout(async () => {
      try {
        await retryFn();
        this.retryTimeouts.delete(storeKey);
      } catch (error) {
        console.error(`Retry attempt ${attemptCount + 1} failed for ${storeKey}:`, error);
        this.scheduleRetry(storeKey, retryFn, attemptCount + 1);
      }
    }, delay);

    this.retryTimeouts.set(storeKey, timeout);
  }

  private clearAllRetryTimeouts(): void {
    this.retryTimeouts.forEach(timeout => clearTimeout(timeout));
    this.retryTimeouts.clear();
  }

  // Public methods for manual connection management
  public forceRetry(): void {
    if (this.isOnline) {
      this.retryAllPendingActions();
    }
  }

  public getConnectionStatus(): boolean {
    return this.isOnline;
  }

  public async testConnection(): Promise<boolean> {
    return this.verifyConnection();
  }

  // Cleanup method
  public destroy(): void {
    window.removeEventListener('online', this.handleOnline.bind(this));
    window.removeEventListener('offline', this.handleOffline.bind(this));
    document.removeEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    this.clearAllRetryTimeouts();
  }
}

// Create and export a singleton instance
export const networkManager = new NetworkManager();

// React hook for using network manager
export const useNetworkManager = () => {
  return {
    forceRetry: networkManager.forceRetry.bind(networkManager),
    getConnectionStatus: networkManager.getConnectionStatus.bind(networkManager),
    testConnection: networkManager.testConnection.bind(networkManager)
  };
};
