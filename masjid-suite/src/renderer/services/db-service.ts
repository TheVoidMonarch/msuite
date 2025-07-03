import { PrayerTime, CommunityMember, Announcement, AppSettings, BackupMeta, DbResult } from '../../types';

/**
 * Database API service that wraps the Electron IPC calls
 * This provides a clean interface for the renderer process to interact with the database
 */
class DatabaseService {
  // Prayer Times operations
  async getPrayerTimes(date?: string): Promise<DbResult<PrayerTime[]>> {
    return window.electronAPI.prayerTimes.get(date);
  }

  async addPrayerTime(prayerTime: Omit<PrayerTime, 'id'>): Promise<DbResult<PrayerTime>> {
    return window.electronAPI.prayerTimes.add(prayerTime);
  }

  async updatePrayerTime(id: number, prayerTime: Partial<PrayerTime>): Promise<DbResult<PrayerTime>> {
    return window.electronAPI.prayerTimes.update(id, prayerTime);
  }

  async deletePrayerTime(id: number): Promise<DbResult<void>> {
    return window.electronAPI.prayerTimes.delete(id);
  }

  // Community Members operations
  async getCommunityMembers(): Promise<DbResult<CommunityMember[]>> {
    return window.electronAPI.community.get();
  }

  async addCommunityMember(member: Omit<CommunityMember, 'id'>): Promise<DbResult<CommunityMember>> {
    return window.electronAPI.community.add(member);
  }

  async updateCommunityMember(id: number, member: Partial<CommunityMember>): Promise<DbResult<CommunityMember>> {
    return window.electronAPI.community.update(id, member);
  }

  async deleteCommunityMember(id: number): Promise<DbResult<void>> {
    return window.electronAPI.community.delete(id);
  }

  // Announcements operations
  async getAnnouncements(activeOnly?: boolean): Promise<DbResult<Announcement[]>> {
    return window.electronAPI.announcements.get(activeOnly);
  }

  async addAnnouncement(announcement: Omit<Announcement, 'id'>): Promise<DbResult<Announcement>> {
    return window.electronAPI.announcements.add(announcement);
  }

  async updateAnnouncement(id: number, announcement: Partial<Announcement>): Promise<DbResult<Announcement>> {
    return window.electronAPI.announcements.update(id, announcement);
  }

  async deleteAnnouncement(id: number): Promise<DbResult<void>> {
    return window.electronAPI.announcements.delete(id);
  }

  // Settings operations
  async getSettings(): Promise<DbResult<AppSettings>> {
    return window.electronAPI.settings.get();
  }

  async updateSettings(settings: Partial<AppSettings>): Promise<DbResult<AppSettings>> {
    return window.electronAPI.settings.update(settings);
  }

  // Backup operations
  async createBackup(notes?: string): Promise<DbResult<BackupMeta>> {
    return window.electronAPI.backup.create(notes);
  }

  async restoreBackup(backupId: number): Promise<DbResult<void>> {
    return window.electronAPI.backup.restore(backupId);
  }

  async getBackupList(): Promise<DbResult<BackupMeta[]>> {
    return window.electronAPI.backup.list();
  }

  async deleteBackup(backupId: number): Promise<DbResult<void>> {
    return window.electronAPI.backup.delete(backupId);
  }

  // Database utility
  async getDatabasePath(): Promise<string> {
    return window.electronAPI.db.getPath();
  }

  // Helper methods for common operations
  async getTodaysPrayerTimes(): Promise<DbResult<PrayerTime[]>> {
    const today = new Date().toISOString().split('T')[0];
    return this.getPrayerTimes(today);
  }

  async getActiveCommunityMembers(): Promise<DbResult<CommunityMember[]>> {
    const result = await this.getCommunityMembers();
    if (result.success && result.data) {
      result.data = result.data.filter(member => member.isActive);
    }
    return result;
  }

  async getActiveAnnouncements(): Promise<DbResult<Announcement[]>> {
    return this.getAnnouncements(true);
  }

  async getRecentAnnouncements(limit: number = 5): Promise<DbResult<Announcement[]>> {
    const result = await this.getAnnouncements(true);
    if (result.success && result.data) {
      result.data = result.data.slice(0, limit);
    }
    return result;
  }

  // Test method to verify database connection
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const settingsResult = await this.getSettings();
      if (settingsResult.success) {
        return { 
          success: true, 
          message: 'Database connection successful' 
        };
      } else {
        return { 
          success: false, 
          message: `Database error: ${settingsResult.error}` 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        message: `Connection failed: ${error.message}` 
      };
    }
  }
}

// Export a singleton instance
export const dbService = new DatabaseService();
export default DatabaseService;
