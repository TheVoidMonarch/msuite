/**
 * Prayer time information
 */
export interface PrayerTime {
  id?: number;
  date: string; // ISO date string (YYYY-MM-DD)
  fajr: string; // Time in HH:MM format
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  location: string;
  hijriDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Community member information
 */
export interface CommunityMember {
  id?: number;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  address?: string;
  membershipType: 'regular' | 'family' | 'student' | 'senior';
  joinDate: string; // ISO date string
  isActive: boolean;
  notes?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  skills?: string[]; // Array of skills they can contribute
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Community announcements
 */
export interface Announcement {
  id?: number;
  title: string;
  content: string;
  type: 'general' | 'event' | 'urgent' | 'prayer' | 'fundraising';
  priority: 'low' | 'medium' | 'high';
  authorId: number; // Reference to community member
  publishDate: string; // ISO date string
  expiryDate?: string; // ISO date string
  isActive: boolean;
  targetAudience?: 'all' | 'members' | 'families' | 'youth' | 'seniors';
  attachments?: string[]; // File paths or URLs
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Application settings
 */
export interface AppSettings {
  id?: number;
  masjidName: string;
  location: {
    address: string;
    city: string;
    country: string;
    timezone: string;
    latitude?: number;
    longitude?: number;
  };
  prayerSettings: {
    calculationMethod: 'MWL' | 'ISNA' | 'Egypt' | 'Makkah' | 'Karachi' | 'Tehran' | 'Jafari';
    asrMethod: 'Standard' | 'Hanafi';
    adjustments: {
      fajr: number;
      sunrise: number;
      dhuhr: number;
      asr: number;
      maghrib: number;
      isha: number;
    };
    iqamahDelays: {
      fajr: number;
      dhuhr: number;
      asr: number;
      maghrib: number;
      isha: number;
    };
  };
  displaySettings: {
    theme: 'light' | 'dark' | 'auto';
    language: 'en' | 'ar' | 'ur' | 'tr' | 'fr';
    showHijriDate: boolean;
    show24HourTime: boolean;
    announcementDisplayDuration: number; // in seconds
  };
  notificationSettings: {
    enablePrayerNotifications: boolean;
    enableAnnouncementNotifications: boolean;
    notificationSound: boolean;
    reminderMinutes: number;
  };
  backupSettings: {
    autoBackup: boolean;
    backupInterval: 'daily' | 'weekly' | 'monthly';
    backupLocation: string;
    maxBackupFiles: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Backup metadata
 */
export interface BackupMeta {
  id?: number;
  fileName: string;
  filePath: string;
  fileSize: number; // in bytes
  backupDate: string; // ISO date string
  appVersion: string;
  dataVersion: string;
  recordCounts: {
    prayerTimes: number;
    communityMembers: number;
    announcements: number;
    settings: number;
  };
  checksum: string; // For integrity verification
  isCompressed: boolean;
  notes?: string;
  createdAt?: string;
}

/**
 * Database operation result
 */
export interface DbResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  rowsAffected?: number;
  lastInsertId?: number;
}

/**
 * IPC channel types for type safety
 */
export interface IPCChannels {
  // Prayer Times
  'prayer-times:get': (date?: string) => Promise<DbResult<PrayerTime[]>>;
  'prayer-times:add': (prayerTime: Omit<PrayerTime, 'id'>) => Promise<DbResult<PrayerTime>>;
  'prayer-times:update': (id: number, prayerTime: Partial<PrayerTime>) => Promise<DbResult<PrayerTime>>;
  'prayer-times:delete': (id: number) => Promise<DbResult<void>>;
  
  // Community Members
  'community:get': () => Promise<DbResult<CommunityMember[]>>;
  'community:add': (member: Omit<CommunityMember, 'id'>) => Promise<DbResult<CommunityMember>>;
  'community:update': (id: number, member: Partial<CommunityMember>) => Promise<DbResult<CommunityMember>>;
  'community:delete': (id: number) => Promise<DbResult<void>>;
  
  // Announcements
  'announcements:get': (activeOnly?: boolean) => Promise<DbResult<Announcement[]>>;
  'announcements:add': (announcement: Omit<Announcement, 'id'>) => Promise<DbResult<Announcement>>;
  'announcements:update': (id: number, announcement: Partial<Announcement>) => Promise<DbResult<Announcement>>;
  'announcements:delete': (id: number) => Promise<DbResult<void>>;
  
  // Settings
  'settings:get': () => Promise<DbResult<AppSettings>>;
  'settings:update': (settings: Partial<AppSettings>) => Promise<DbResult<AppSettings>>;
  
  // Backup
  'backup:create': (notes?: string) => Promise<DbResult<BackupMeta>>;
  'backup:restore': (backupId: number) => Promise<DbResult<void>>;
  'backup:list': () => Promise<DbResult<BackupMeta[]>>;
  'backup:delete': (backupId: number) => Promise<DbResult<void>>;
}
