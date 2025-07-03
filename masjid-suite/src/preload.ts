// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron';
import { PrayerTime, CommunityMember, Announcement, AppSettings, BackupMeta, DbResult } from './types';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Prayer Times API
  prayerTimes: {
    get: (date?: string): Promise<DbResult<PrayerTime[]>> => 
      ipcRenderer.invoke('prayer-times:get', date),
    add: (prayerTime: Omit<PrayerTime, 'id'>): Promise<DbResult<PrayerTime>> => 
      ipcRenderer.invoke('prayer-times:add', prayerTime),
    update: (id: number, prayerTime: Partial<PrayerTime>): Promise<DbResult<PrayerTime>> => 
      ipcRenderer.invoke('prayer-times:update', id, prayerTime),
    delete: (id: number): Promise<DbResult<void>> => 
      ipcRenderer.invoke('prayer-times:delete', id),
  },

  // Community Members API
  community: {
    get: (): Promise<DbResult<CommunityMember[]>> => 
      ipcRenderer.invoke('community:get'),
    add: (member: Omit<CommunityMember, 'id'>): Promise<DbResult<CommunityMember>> => 
      ipcRenderer.invoke('community:add', member),
    update: (id: number, member: Partial<CommunityMember>): Promise<DbResult<CommunityMember>> => 
      ipcRenderer.invoke('community:update', id, member),
    delete: (id: number): Promise<DbResult<void>> => 
      ipcRenderer.invoke('community:delete', id),
  },

  // Announcements API
  announcements: {
    get: (activeOnly?: boolean): Promise<DbResult<Announcement[]>> => 
      ipcRenderer.invoke('announcements:get', activeOnly),
    add: (announcement: Omit<Announcement, 'id'>): Promise<DbResult<Announcement>> => 
      ipcRenderer.invoke('announcements:add', announcement),
    update: (id: number, announcement: Partial<Announcement>): Promise<DbResult<Announcement>> => 
      ipcRenderer.invoke('announcements:update', id, announcement),
    delete: (id: number): Promise<DbResult<void>> => 
      ipcRenderer.invoke('announcements:delete', id),
  },

  // Settings API
  settings: {
    get: (): Promise<DbResult<AppSettings>> => 
      ipcRenderer.invoke('settings:get'),
    update: (settings: Partial<AppSettings>): Promise<DbResult<AppSettings>> => 
      ipcRenderer.invoke('settings:update', settings),
  },

  // Backup API
  backup: {
    create: (notes?: string): Promise<DbResult<BackupMeta>> => 
      ipcRenderer.invoke('backup:create', notes),
    restore: (backupId: number): Promise<DbResult<void>> => 
      ipcRenderer.invoke('backup:restore', backupId),
    list: (): Promise<DbResult<BackupMeta[]>> => 
      ipcRenderer.invoke('backup:list'),
    delete: (backupId: number): Promise<DbResult<void>> => 
      ipcRenderer.invoke('backup:delete', backupId),
  },

  // Database utility
  db: {
    getPath: (): Promise<string> => 
      ipcRenderer.invoke('db:get-path'),
  },
  
  // Window management
  windows: {
    openPrayerTimesWindow: (): Promise<void> => ipcRenderer.invoke('window:open-prayer-times'),
  },
});

// Define the type for the exposed API
export interface ElectronAPI {
  prayerTimes: {
    get: (date?: string) => Promise<DbResult<PrayerTime[]>>;
    add: (prayerTime: Omit<PrayerTime, 'id'>) => Promise<DbResult<PrayerTime>>;
    update: (id: number, prayerTime: Partial<PrayerTime>) => Promise<DbResult<PrayerTime>>;
    delete: (id: number) => Promise<DbResult<void>>;
  };
  community: {
    get: () => Promise<DbResult<CommunityMember[]>>;
    add: (member: Omit<CommunityMember, 'id'>) => Promise<DbResult<CommunityMember>>;
    update: (id: number, member: Partial<CommunityMember>) => Promise<DbResult<CommunityMember>>;
    delete: (id: number) => Promise<DbResult<void>>;
  };
  announcements: {
    get: (activeOnly?: boolean) => Promise<DbResult<Announcement[]>>;
    add: (announcement: Omit<Announcement, 'id'>) => Promise<DbResult<Announcement>>;
    update: (id: number, announcement: Partial<Announcement>) => Promise<DbResult<Announcement>>;
    delete: (id: number) => Promise<DbResult<void>>;
  };
  settings: {
    get: () => Promise<DbResult<AppSettings>>;
    update: (settings: Partial<AppSettings>) => Promise<DbResult<AppSettings>>;
  };
  backup: {
    create: (notes?: string) => Promise<DbResult<BackupMeta>>;
    restore: (backupId: number) => Promise<DbResult<void>>;
    list: () => Promise<DbResult<BackupMeta[]>>;
    delete: (backupId: number) => Promise<DbResult<void>>;
  };
  db: {
    getPath: () => Promise<string>;
  };
}

// Extend the Window interface to include our API
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
