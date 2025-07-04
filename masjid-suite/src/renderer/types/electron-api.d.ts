import { DbResult } from '../../types';

// Define the shape of the exposed Electron API
export interface WindowsAPI {
  openPrayerTimesWindow: () => Promise<void>;
}

export interface PrayerTimesAPI {
  get: (date?: string) => Promise<DbResult<any[]>>;
  add: (prayerTime: any) => Promise<DbResult<any>>;
  update: (id: number, prayerTime: any) => Promise<DbResult<any>>;
  delete: (id: number) => Promise<DbResult<void>>;
}

export interface CommunityAPI {
  get: () => Promise<DbResult<any[]>>;
  add: (member: any) => Promise<DbResult<any>>;
  update: (id: number, member: any) => Promise<DbResult<any>>;
  delete: (id: number) => Promise<DbResult<void>>;
}

export interface AnnouncementsAPI {
  get: (activeOnly?: boolean) => Promise<DbResult<any[]>>;
  add: (announcement: any) => Promise<DbResult<any>>;
  update: (id: number, announcement: any) => Promise<DbResult<any>>;
  delete: (id: number) => Promise<DbResult<void>>;
}

export interface SettingsAPI {
  get: () => Promise<DbResult<any>>;
  update: (settings: any) => Promise<DbResult<any>>;
}

export interface BackupAPI {
  create: (notes?: string) => Promise<DbResult<any>>;
  restore: (backupId: number) => Promise<DbResult<void>>;
  list: () => Promise<DbResult<any[]>>;
  delete: (backupId: number) => Promise<DbResult<void>>;
}

export interface DatabaseAPI {
  getPath: () => Promise<string>;
}

declare global {
  interface Window {
    electronAPI: {
      prayerTimes: PrayerTimesAPI;
      community: CommunityAPI;
      announcements: AnnouncementsAPI;
      settings: SettingsAPI;
      backup: BackupAPI;
      db: DatabaseAPI;
      windows: WindowsAPI;
    };
  }
}
