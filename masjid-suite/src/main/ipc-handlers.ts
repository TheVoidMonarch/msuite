import { ipcMain } from 'electron';
import { app } from 'electron';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import DatabaseManager from './db';
import { PrayerTime, CommunityMember, Announcement, AppSettings, BackupMeta, DbResult } from '../types';

class IPCHandler {
  private db: DatabaseManager;

  constructor() {
    this.db = new DatabaseManager();
    this.setupHandlers();
  }

  private setupHandlers(): void {
    // Prayer Times Handlers
    ipcMain.handle('prayer-times:get', async (event, date?: string): Promise<DbResult<PrayerTime[]>> => {
      return this.db.getPrayerTimes(date);
    });

    ipcMain.handle('prayer-times:add', async (event, prayerTime: Omit<PrayerTime, 'id'>): Promise<DbResult<PrayerTime>> => {
      return this.db.addPrayerTime(prayerTime);
    });

    ipcMain.handle('prayer-times:update', async (event, id: number, prayerTime: Partial<PrayerTime>): Promise<DbResult<PrayerTime>> => {
      return this.db.updatePrayerTime(id, prayerTime);
    });

    ipcMain.handle('prayer-times:delete', async (event, id: number): Promise<DbResult<void>> => {
      return this.db.deletePrayerTime(id);
    });

    // Community Members Handlers
    ipcMain.handle('community:get', async (event): Promise<DbResult<CommunityMember[]>> => {
      return this.db.getCommunityMembers();
    });

    ipcMain.handle('community:add', async (event, member: Omit<CommunityMember, 'id'>): Promise<DbResult<CommunityMember>> => {
      return this.db.addCommunityMember(member);
    });

    ipcMain.handle('community:update', async (event, id: number, member: Partial<CommunityMember>): Promise<DbResult<CommunityMember>> => {
      return this.db.updateCommunityMember(id, member);
    });

    ipcMain.handle('community:delete', async (event, id: number): Promise<DbResult<void>> => {
      return this.db.deleteCommunityMember(id);
    });

    // Announcements Handlers
    ipcMain.handle('announcements:get', async (event, activeOnly?: boolean): Promise<DbResult<Announcement[]>> => {
      return this.db.getAnnouncements(activeOnly);
    });

    ipcMain.handle('announcements:add', async (event, announcement: Omit<Announcement, 'id'>): Promise<DbResult<Announcement>> => {
      return this.db.addAnnouncement(announcement);
    });

    ipcMain.handle('announcements:update', async (event, id: number, announcement: Partial<Announcement>): Promise<DbResult<Announcement>> => {
      return this.db.updateAnnouncement(id, announcement);
    });

    ipcMain.handle('announcements:delete', async (event, id: number): Promise<DbResult<void>> => {
      return this.db.deleteAnnouncement(id);
    });

    // Settings Handlers
    ipcMain.handle('settings:get', async (event): Promise<DbResult<AppSettings>> => {
      return this.db.getSettings();
    });

    ipcMain.handle('settings:update', async (event, settings: Partial<AppSettings>): Promise<DbResult<AppSettings>> => {
      return this.db.updateSettings(settings);
    });

    // Backup Handlers
    ipcMain.handle('backup:create', async (event, notes?: string): Promise<DbResult<BackupMeta>> => {
      return this.createBackup(notes);
    });

    ipcMain.handle('backup:restore', async (event, backupId: number): Promise<DbResult<void>> => {
      return this.restoreBackup(backupId);
    });

    ipcMain.handle('backup:list', async (event): Promise<DbResult<BackupMeta[]>> => {
      return this.db.getBackupList();
    });

    ipcMain.handle('backup:delete', async (event, backupId: number): Promise<DbResult<void>> => {
      return this.deleteBackup(backupId);
    });

    // Database utility handlers
    ipcMain.handle('db:get-path', async (event): Promise<string> => {
      return this.db.getDbPath();
    });

    console.log('IPC handlers registered successfully');
  }

  private async createBackup(notes?: string): Promise<DbResult<BackupMeta>> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupDir = path.join(app.getPath('userData'), 'backups');
      
      // Ensure backup directory exists
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }

      const fileName = `masjid-suite-backup-${timestamp}.db`;
      const backupPath = path.join(backupDir, fileName);
      const sourcePath = this.db.getDbPath();

      // Copy the database file
      fs.copyFileSync(sourcePath, backupPath);

      // Get file stats
      const stats = fs.statSync(backupPath);
      
      // Calculate checksum
      const fileBuffer = fs.readFileSync(backupPath);
      const checksum = crypto.createHash('sha256').update(fileBuffer).digest('hex');

      // Get record counts
      const prayerTimesResult = this.db.getPrayerTimes();
      const membersResult = this.db.getCommunityMembers();
      const announcementsResult = this.db.getAnnouncements();
      const settingsResult = this.db.getSettings();

      const recordCounts = {
        prayerTimes: prayerTimesResult.success ? prayerTimesResult.data?.length || 0 : 0,
        communityMembers: membersResult.success ? membersResult.data?.length || 0 : 0,
        announcements: announcementsResult.success ? announcementsResult.data?.length || 0 : 0,
        settings: settingsResult.success ? 1 : 0
      };

      // Get app version from package.json (placeholder)
      const appVersion = '1.0.0'; // This should be dynamically loaded from package.json
      const dataVersion = '1.0.0';

      const backupMeta: Omit<BackupMeta, 'id'> = {
        fileName,
        filePath: backupPath,
        fileSize: stats.size,
        backupDate: new Date().toISOString(),
        appVersion,
        dataVersion,
        recordCounts,
        checksum,
        isCompressed: false,
        notes: notes || 'Manual backup'
      };

      return this.db.addBackupMeta(backupMeta);
    } catch (error) {
      return { success: false, error: `Failed to create backup: ${error.message}` };
    }
  }

  private async restoreBackup(backupId: number): Promise<DbResult<void>> {
    try {
      // Get backup metadata
      const backups = this.db.getBackupList();
      if (!backups.success || !backups.data) {
        return { success: false, error: 'Failed to get backup list' };
      }

      const backup = backups.data.find(b => b.id === backupId);
      if (!backup) {
        return { success: false, error: 'Backup not found' };
      }

      // Verify backup file exists
      if (!fs.existsSync(backup.filePath)) {
        return { success: false, error: 'Backup file not found' };
      }

      // Verify checksum
      const fileBuffer = fs.readFileSync(backup.filePath);
      const currentChecksum = crypto.createHash('sha256').update(fileBuffer).digest('hex');
      if (currentChecksum !== backup.checksum) {
        return { success: false, error: 'Backup file integrity check failed' };
      }

      // Close current database connection
      this.db.close();

      // Create a backup of current database before restoring
      const currentDbPath = this.db.getDbPath();
      const currentBackupPath = `${currentDbPath}.pre-restore.${Date.now()}`;
      fs.copyFileSync(currentDbPath, currentBackupPath);

      try {
        // Restore the backup
        fs.copyFileSync(backup.filePath, currentDbPath);
        
        // Reinitialize database connection
        this.db = new DatabaseManager();
        
        return { success: true };
      } catch (restoreError) {
        // If restore fails, restore the original database
        fs.copyFileSync(currentBackupPath, currentDbPath);
        this.db = new DatabaseManager();
        throw restoreError;
      } finally {
        // Clean up the temporary backup
        if (fs.existsSync(currentBackupPath)) {
          fs.unlinkSync(currentBackupPath);
        }
      }
    } catch (error) {
      return { success: false, error: `Failed to restore backup: ${error.message}` };
    }
  }

  private async deleteBackup(backupId: number): Promise<DbResult<void>> {
    try {
      // Get backup metadata
      const backups = this.db.getBackupList();
      if (!backups.success || !backups.data) {
        return { success: false, error: 'Failed to get backup list' };
      }

      const backup = backups.data.find(b => b.id === backupId);
      if (!backup) {
        return { success: false, error: 'Backup not found' };
      }

      // Delete the backup file
      if (fs.existsSync(backup.filePath)) {
        fs.unlinkSync(backup.filePath);
      }

      // Remove backup metadata from database
      return this.db.deleteBackupMeta(backupId);
    } catch (error) {
      return { success: false, error: `Failed to delete backup: ${error.message}` };
    }
  }

  // Auto-backup functionality
  public startAutoBackup(settings: AppSettings): void {
    if (!settings.backupSettings.autoBackup) {
      return;
    }

    const interval = this.getBackupIntervalMs(settings.backupSettings.backupInterval);
    
    setInterval(async () => {
      try {
        const result = await this.createBackup('Automatic backup');
        if (result.success) {
          console.log('Automatic backup created successfully');
          
          // Clean up old backups if necessary
          await this.cleanupOldBackups(settings.backupSettings.maxBackupFiles);
        } else {
          console.error('Automatic backup failed:', result.error);
        }
      } catch (error) {
        console.error('Error during automatic backup:', error);
      }
    }, interval);
  }

  private getBackupIntervalMs(interval: string): number {
    switch (interval) {
      case 'daily':
        return 24 * 60 * 60 * 1000; // 24 hours
      case 'weekly':
        return 7 * 24 * 60 * 60 * 1000; // 7 days
      case 'monthly':
        return 30 * 24 * 60 * 60 * 1000; // 30 days
      default:
        return 7 * 24 * 60 * 60 * 1000; // Default to weekly
    }
  }

  private async cleanupOldBackups(maxBackupFiles: number): Promise<void> {
    try {
      const backups = this.db.getBackupList();
      if (!backups.success || !backups.data) {
        return;
      }

      // Sort backups by date (newest first)
      const sortedBackups = backups.data.sort((a, b) => 
        new Date(b.backupDate).getTime() - new Date(a.backupDate).getTime()
      );

      // Delete backups exceeding the limit
      for (let i = maxBackupFiles; i < sortedBackups.length; i++) {
        const backup = sortedBackups[i];
        await this.deleteBackup(backup.id!);
      }
    } catch (error) {
      console.error('Error cleaning up old backups:', error);
    }
  }

  public close(): void {
    this.db.close();
  }
}

export default IPCHandler;
