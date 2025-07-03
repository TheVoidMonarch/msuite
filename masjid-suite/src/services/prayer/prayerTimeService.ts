import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Coordinates, CalculationParameters, PrayerTimes, SunnahTimes, CalculationMethod, Prayer } from 'adhan';
import { format, addDays, isSameDay, parseISO } from 'date-fns';

export interface PrayerTimeRecord {
  date: string; // YYYY-MM-DD
  times: {
    [key in Prayer]: string; // HH:MM format
  };
  hijriDate: string;
  location: string;
  calculationMethod: string;
  lastUpdated: string;
}

interface PrayerTimeDB extends DBSchema {
  prayerTimes: {
    key: string; // date in YYYY-MM-DD format
    value: PrayerTimeRecord;
    indexes: { 'by-date': string };
  };
  settings: {
    key: string;
    value: {
      location: {
        latitude: number;
        longitude: number;
        elevation?: number;
        city?: string;
        country?: string;
      };
      calculationMethod: string;
      adjustments: {
        fajr: number;
        sunrise: number;
        dhuhr: number;
        asr: number;
        maghrib: number;
        isha: number;
      };
    };
  };
}

const DB_NAME = 'prayer-times-db';
const DB_VERSION = 1;

class PrayerTimeService {
  private db: IDBPDatabase<PrayerTimeDB> | null = null;
  private readonly MALAYSIA_COORDINATES = {
    latitude: 3.1390, // Default to Kuala Lumpur
    longitude: 101.6869,
    elevation: 50,
  };

  private readonly MAKKAH_PARAMS = {
    // Makkah calculation method parameters
    fajrAngle: 18.5,
    ishaAngle: 18.5,
    ishaInterval: 90, // 90 minutes after Maghrib
    maghribAngle: 1.0,
  };

  async init() {
    this.db = await openDB<PrayerTimeDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const prayerTimesStore = db.createObjectStore('prayerTimes', {
          keyPath: 'date',
        });
        prayerTimesStore.createIndex('by-date', 'date');

        db.createObjectStore('settings');
      },
    });

    // Initialize with default settings if none exist
    if (!(await this.getSetting('location'))) {
      await this.updateSetting('location', {
        ...this.MALAYSIA_COORDINATES,
        city: 'Kuala Lumpur',
        country: 'Malaysia',
      });

      await this.updateSetting('calculationMethod', 'Makkah');
      
      await this.updateSetting('adjustments', {
        fajr: 0,
        sunrise: 0,
        dhuhr: 0,
        asr: 0,
        maghrib: 0,
        isha: 0,
      });
    }
  }

  private async getSetting<T>(key: string): Promise<T | undefined> {
    if (!this.db) await this.init();
    return this.db!.get('settings', key);
  }

  private async updateSetting(key: string, value: any) {
    if (!this.db) await this.init();
    await this.db!.put('settings', value, key);
  }

  private getCalculationParams(): CalculationParameters {
    // Return Makkah calculation parameters
    return new CalculationParameters(
      'Makkah',
      this.MAKKAH_PARAMS.fajrAngle,
      this.MAKKAH_PARAMS.ishaAngle
    );
  }

  private calculatePrayerTimes(date: Date, coordinates: Coordinates): PrayerTimeRecord {
    const params = this.getCalculationParams();
    const prayerTimes = new PrayerTimes(coordinates, date, params);
    const sunnahTimes = new SunnahTimes(prayerTimes);

    return {
      date: format(date, 'yyyy-MM-dd'),
      times: {
        fajr: format(prayerTimes.fajr, 'HH:mm'),
        sunrise: format(prayerTimes.sunrise, 'HH:mm'),
        dhuhr: format(prayerTimes.dhuhr, 'HH:mm'),
        asr: format(prayerTimes.asr, 'HH:mm'),
        maghrib: format(prayerTimes.maghrib, 'HH:mm'),
        isha: format(prayerTimes.isha, 'HH:mm'),
      },
      hijriDate: this.getHijriDate(date),
      location: 'Kuala Lumpur, Malaysia', // Will be updated with actual location
      calculationMethod: 'Makkah',
      lastUpdated: new Date().toISOString(),
    };
  }

  private getHijriDate(date: Date): string {
    // TODO: Implement proper Hijri date conversion
    // For now, return a placeholder
    return '1445-01-01';
  }

  async getPrayerTimes(date: Date = new Date()): Promise<PrayerTimeRecord> {
    if (!this.db) await this.init();
    
    const dateStr = format(date, 'yyyy-MM-dd');
    const cached = await this.db!.get('prayerTimes', dateStr);
    
    if (cached) {
      return cached;
    }

    // If not in cache, calculate and store
    const location = await this.getSetting<PrayerTimeDB['settings']['value']['location']>('location') || this.MALAYSIA_COORDINATES;
    const prayerTime = this.calculatePrayerTimes(date, new Coordinates(location.latitude, location.longitude));
    
    await this.db!.put('prayerTimes', prayerTime);
    return prayerTime;
  }

  async getPrayerTimesRange(startDate: Date, endDate: Date): Promise<PrayerTimeRecord[]> {
    const results: PrayerTimeRecord[] = [];
    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const prayerTime = await this.getPrayerTimes(currentDate);
      results.push(prayerTime);
      currentDate = addDays(currentDate, 1);
    }
    
    return results;
  }

  async preloadPrayerTimes(monthsAhead: number = 2) {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + monthsAhead);
    
    console.log(`Preloading prayer times from ${startDate.toDateString()} to ${endDate.toDateString()}`);
    
    // Load in chunks to avoid blocking the main thread
    const chunkSize = 7; // One week at a time
    let currentChunkStart = new Date(startDate);
    
    while (currentChunkStart < endDate) {
      const chunkEnd = new Date(currentChunkStart);
      chunkEnd.setDate(chunkEnd.getDate() + chunkSize);
      
      if (chunkEnd > endDate) {
        chunkEnd.setTime(endDate.getTime());
      }
      
      await this.getPrayerTimesRange(currentChunkStart, chunkEnd);
      currentChunkStart = new Date(chunkEnd);
      currentChunkStart.setDate(currentChunkStart.getDate() + 1);
      
      // Allow UI to update between chunks
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }

  async updateLocation(coordinates: { latitude: number; longitude: number; city?: string; country?: string }) {
    await this.updateSetting('location', {
      ...coordinates,
      elevation: coordinates.elevation || 0,
    });
    
    // Recalculate all cached prayer times
    await this.db?.clear('prayerTimes');
    await this.preloadPrayerTimes();
  }
}

export const prayerTimeService = new PrayerTimeService();

// Initialize the service when imported
prayerTimeService.init().then(() => {
  // Preload prayer times for the next 2 months in the background
  prayerTimeService.preloadPrayerTimes(2).catch(console.error);
});
