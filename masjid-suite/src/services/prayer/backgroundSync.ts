import { prayerTimeService } from './prayerTimeService';

class BackgroundSyncService {
  private static readonly SYNC_INTERVAL = 6 * 60 * 60 * 1000; // 6 hours
  private syncTimer: NodeJS.Timeout | null = null;
  private isSyncing = false;

  async start() {
    // Initial sync
    await this.syncPrayerTimes();
    
    // Schedule periodic sync
    this.scheduleNextSync();
    
    // Listen for online/offline events
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
  }

  stop() {
    if (this.syncTimer) {
      clearTimeout(this.syncTimer);
      this.syncTimer = null;
    }
    
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
  }

  private scheduleNextSync() {
    if (this.syncTimer) {
      clearTimeout(this.syncTimer);
    }
    
    this.syncTimer = setTimeout(() => {
      this.syncPrayerTimes();
    }, BackgroundSyncService.SYNC_INTERVAL);
  }

  private handleOnline = () => {
    console.log('Network is back online, syncing prayer times...');
    this.syncPrayerTimes();
  };

  private handleOffline = () => {
    console.log('Network is offline, will retry when back online...');
    if (this.syncTimer) {
      clearTimeout(this.syncTimer);
      this.syncTimer = null;
    }
  };

  private async syncPrayerTimes() {
    if (this.isSyncing) return;
    
    try {
      this.isSyncing = true;
      
      // Check if we're online
      if (!navigator.onLine) {
        console.log('Offline, skipping sync');
        return;
      }
      
      console.log('Starting prayer times sync...');
      
      // 1. Check if we need to update the location data
      await this.verifyAndUpdateLocation();
      
      // 2. Verify and update prayer times for the next 14 days
      await this.verifyAndUpdatePrayerTimes(14);
      
      // 3. If it's the start of the month, preload next month's times
      await this.checkAndPreloadNextMonth();
      
      console.log('Prayer times sync completed');
    } catch (error) {
      console.error('Error syncing prayer times:', error);
    } finally {
      this.isSyncing = false;
      this.scheduleNextSync();
    }
  }

  private async verifyAndUpdateLocation() {
    try {
      // TODO: Implement actual location verification from a reliable source
      // For now, we'll just log that we would verify the location
      console.log('Verifying location data...');
    } catch (error) {
      console.error('Error verifying location:', error);
    }
  }

  private async verifyAndUpdatePrayerTimes(daysAhead: number) {
    try {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + daysAhead);
      
      console.log(`Verifying prayer times from ${startDate.toDateString()} to ${endDate.toDateString()}`);
      
      // TODO: Implement actual verification against a reliable online source
      // For now, we'll just ensure we have the times calculated
      await prayerTimeService.getPrayerTimesRange(startDate, endDate);
      
    } catch (error) {
      console.error('Error verifying prayer times:', error);
      throw error;
    }
  }

  private async checkAndPreloadNextMonth() {
    const now = new Date();
    const isStartOfMonth = now.getDate() === 1;
    
    if (isStartOfMonth) {
      console.log('Start of month detected, preloading next month\'s prayer times...');
      await prayerTimeService.preloadPrayerTimes(2); // Preload current + next month
    }
  }
}

export const backgroundSyncService = new BackgroundSyncService();

// Start the background sync when imported
if (typeof window !== 'undefined') {
  backgroundSyncService.start().catch(console.error);
}
