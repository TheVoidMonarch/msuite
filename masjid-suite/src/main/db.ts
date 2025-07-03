import Database from 'better-sqlite3';
import { app } from 'electron';
import path from 'path';
import { PrayerTime, CommunityMember, Announcement, AppSettings, BackupMeta, DbResult } from '../types';

class DatabaseManager {
  private db: Database.Database;
  private dbPath: string;

  constructor() {
    // Store database in userData directory
    const userDataPath = app.getPath('userData');
    this.dbPath = path.join(userDataPath, 'masjid-suite.db');
    
    // Initialize database
    this.db = new Database(this.dbPath);
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('foreign_keys = ON');
    
    // Run migrations
    this.runMigrations();
  }

  private runMigrations(): void {
    try {
      // Create migrations table if it doesn't exist
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS migrations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          version TEXT NOT NULL UNIQUE,
          applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      const migrations = [
        {
          version: '001_initial_schema',
          sql: `
            -- Prayer Times Table
            CREATE TABLE IF NOT EXISTS prayer_times (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              date TEXT NOT NULL,
              fajr TEXT NOT NULL,
              sunrise TEXT NOT NULL,
              dhuhr TEXT NOT NULL,
              asr TEXT NOT NULL,
              maghrib TEXT NOT NULL,
              isha TEXT NOT NULL,
              location TEXT NOT NULL,
              hijri_date TEXT,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              UNIQUE(date, location)
            );

            -- Community Members Table
            CREATE TABLE IF NOT EXISTS community_members (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              first_name TEXT NOT NULL,
              last_name TEXT NOT NULL,
              email TEXT UNIQUE,
              phone TEXT,
              address TEXT,
              membership_type TEXT NOT NULL CHECK (membership_type IN ('regular', 'family', 'student', 'senior')),
              join_date TEXT NOT NULL,
              is_active BOOLEAN NOT NULL DEFAULT 1,
              notes TEXT,
              emergency_contact TEXT, -- JSON string
              skills TEXT, -- JSON array
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            -- Announcements Table
            CREATE TABLE IF NOT EXISTS announcements (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              title TEXT NOT NULL,
              content TEXT NOT NULL,
              type TEXT NOT NULL CHECK (type IN ('general', 'event', 'urgent', 'prayer', 'fundraising')),
              priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
              author_id INTEGER NOT NULL,
              publish_date TEXT NOT NULL,
              expiry_date TEXT,
              is_active BOOLEAN NOT NULL DEFAULT 1,
              target_audience TEXT CHECK (target_audience IN ('all', 'members', 'families', 'youth', 'seniors')),
              attachments TEXT, -- JSON array
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (author_id) REFERENCES community_members(id)
            );

            -- App Settings Table
            CREATE TABLE IF NOT EXISTS app_settings (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              masjid_name TEXT NOT NULL,
              location TEXT NOT NULL, -- JSON object
              prayer_settings TEXT NOT NULL, -- JSON object
              display_settings TEXT NOT NULL, -- JSON object
              notification_settings TEXT NOT NULL, -- JSON object
              backup_settings TEXT NOT NULL, -- JSON object
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            -- Backup Metadata Table
            CREATE TABLE IF NOT EXISTS backup_meta (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              file_name TEXT NOT NULL,
              file_path TEXT NOT NULL,
              file_size INTEGER NOT NULL,
              backup_date TEXT NOT NULL,
              app_version TEXT NOT NULL,
              data_version TEXT NOT NULL,
              record_counts TEXT NOT NULL, -- JSON object
              checksum TEXT NOT NULL,
              is_compressed BOOLEAN NOT NULL DEFAULT 0,
              notes TEXT,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            -- Create indexes for better performance
            CREATE INDEX IF NOT EXISTS idx_prayer_times_date ON prayer_times(date);
            CREATE INDEX IF NOT EXISTS idx_community_members_active ON community_members(is_active);
            CREATE INDEX IF NOT EXISTS idx_announcements_active ON announcements(is_active);
            CREATE INDEX IF NOT EXISTS idx_announcements_publish_date ON announcements(publish_date);
            CREATE INDEX IF NOT EXISTS idx_backup_meta_date ON backup_meta(backup_date);
          `
        },
        {
          version: '002_default_settings',
          sql: `
            -- Insert default settings if none exist
            INSERT OR IGNORE INTO app_settings (
              id, masjid_name, location, prayer_settings, display_settings, 
              notification_settings, backup_settings
            ) VALUES (
              1,
              'Local Masjid',
              '{"address": "", "city": "", "country": "", "timezone": "UTC", "latitude": null, "longitude": null}',
              '{"calculationMethod": "MWL", "asrMethod": "Standard", "adjustments": {"fajr": 0, "sunrise": 0, "dhuhr": 0, "asr": 0, "maghrib": 0, "isha": 0}, "iqamahDelays": {"fajr": 20, "dhuhr": 10, "asr": 10, "maghrib": 5, "isha": 15}}',
              '{"theme": "light", "language": "en", "showHijriDate": true, "show24HourTime": false, "announcementDisplayDuration": 30}',
              '{"enablePrayerNotifications": true, "enableAnnouncementNotifications": true, "notificationSound": true, "reminderMinutes": 15}',
              '{"autoBackup": true, "backupInterval": "weekly", "backupLocation": "", "maxBackupFiles": 10}'
            );
          `
        }
      ];

      // Apply migrations
      for (const migration of migrations) {
        const existing = this.db.prepare('SELECT version FROM migrations WHERE version = ?').get(migration.version);
        if (!existing) {
          this.db.exec(migration.sql);
          this.db.prepare('INSERT INTO migrations (version) VALUES (?)').run(migration.version);
          console.log(`Applied migration: ${migration.version}`);
        }
      }

      console.log('Database migrations completed successfully');
    } catch (error) {
      console.error('Migration error:', error);
      throw error;
    }
  }

  // Prayer Times CRUD operations
  getPrayerTimes(date?: string): DbResult<PrayerTime[]> {
    try {
      let query = 'SELECT * FROM prayer_times';
      let params: any[] = [];

      if (date) {
        query += ' WHERE date = ?';
        params.push(date);
      }

      query += ' ORDER BY date DESC';
      const rows = this.db.prepare(query).all(...params) as any[];
      
      const prayerTimes: PrayerTime[] = rows.map((row) => ({
        id: row.id,
        date: row.date,
        fajr: row.fajr,
        sunrise: row.sunrise,
        dhuhr: row.dhuhr,
        asr: row.asr,
        maghrib: row.maghrib,
        isha: row.isha,
        location: row.location,
        hijriDate: row.hijri_date,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));

      return { success: true, data: prayerTimes };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  addPrayerTime(prayerTime: Omit<PrayerTime, 'id'>): DbResult<PrayerTime> {
    try {
      const stmt = this.db.prepare(`
        INSERT INTO prayer_times 
        (date, fajr, sunrise, dhuhr, asr, maghrib, isha, location, hijri_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const result = stmt.run(
        prayerTime.date,
        prayerTime.fajr,
        prayerTime.sunrise,
        prayerTime.dhuhr,
        prayerTime.asr,
        prayerTime.maghrib,
        prayerTime.isha,
        prayerTime.location,
        prayerTime.hijriDate
      );

      const newPrayerTime = this.db.prepare('SELECT * FROM prayer_times WHERE id = ?').get(result.lastInsertRowid) as any;
      
      return {
        success: true,
        data: {
          id: newPrayerTime.id,
          date: newPrayerTime.date,
          fajr: newPrayerTime.fajr,
          sunrise: newPrayerTime.sunrise,
          dhuhr: newPrayerTime.dhuhr,
          asr: newPrayerTime.asr,
          maghrib: newPrayerTime.maghrib,
          isha: newPrayerTime.isha,
          location: newPrayerTime.location,
          hijriDate: newPrayerTime.hijri_date,
          createdAt: newPrayerTime.created_at,
          updatedAt: newPrayerTime.updated_at
        },
        lastInsertId: result.lastInsertRowid as number
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  updatePrayerTime(id: number, prayerTime: Partial<PrayerTime>): DbResult<PrayerTime> {
    try {
      const updates = [];
      const values = [];

      if (prayerTime.date !== undefined) { updates.push('date = ?'); values.push(prayerTime.date); }
      if (prayerTime.fajr !== undefined) { updates.push('fajr = ?'); values.push(prayerTime.fajr); }
      if (prayerTime.sunrise !== undefined) { updates.push('sunrise = ?'); values.push(prayerTime.sunrise); }
      if (prayerTime.dhuhr !== undefined) { updates.push('dhuhr = ?'); values.push(prayerTime.dhuhr); }
      if (prayerTime.asr !== undefined) { updates.push('asr = ?'); values.push(prayerTime.asr); }
      if (prayerTime.maghrib !== undefined) { updates.push('maghrib = ?'); values.push(prayerTime.maghrib); }
      if (prayerTime.isha !== undefined) { updates.push('isha = ?'); values.push(prayerTime.isha); }
      if (prayerTime.location !== undefined) { updates.push('location = ?'); values.push(prayerTime.location); }
      if (prayerTime.hijriDate !== undefined) { updates.push('hijri_date = ?'); values.push(prayerTime.hijriDate); }

      updates.push('updated_at = CURRENT_TIMESTAMP');
      values.push(id);

      const stmt = this.db.prepare(`
        UPDATE prayer_times 
        SET ${updates.join(', ')} 
        WHERE id = ?
      `);

      const result = stmt.run(...values);
      
      if (result.changes === 0) {
        return { success: false, error: 'Prayer time not found' };
      }

      const updatedPrayerTime = this.db.prepare('SELECT * FROM prayer_times WHERE id = ?').get(id) as any;
      
      return {
        success: true,
        data: {
          id: updatedPrayerTime.id,
          date: updatedPrayerTime.date,
          fajr: updatedPrayerTime.fajr,
          sunrise: updatedPrayerTime.sunrise,
          dhuhr: updatedPrayerTime.dhuhr,
          asr: updatedPrayerTime.asr,
          maghrib: updatedPrayerTime.maghrib,
          isha: updatedPrayerTime.isha,
          location: updatedPrayerTime.location,
          hijriDate: updatedPrayerTime.hijri_date,
          createdAt: updatedPrayerTime.created_at,
          updatedAt: updatedPrayerTime.updated_at
        },
        rowsAffected: result.changes
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  deletePrayerTime(id: number): DbResult<void> {
    try {
      const stmt = this.db.prepare('DELETE FROM prayer_times WHERE id = ?');
      const result = stmt.run(id);
      
      if (result.changes === 0) {
        return { success: false, error: 'Prayer time not found' };
      }

      return { success: true, rowsAffected: result.changes };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Community Members CRUD operations
  getCommunityMembers(): DbResult<CommunityMember[]> {
    try {
      const rows = this.db.prepare('SELECT * FROM community_members ORDER BY first_name, last_name').all() as any[];
      
      const members: CommunityMember[] = rows.map((row) => ({
        id: row.id,
        firstName: row.first_name,
        lastName: row.last_name,
        email: row.email,
        phone: row.phone,
        address: row.address,
        membershipType: row.membership_type,
        joinDate: row.join_date,
        isActive: Boolean(row.is_active),
        notes: row.notes,
        emergencyContact: row.emergency_contact ? JSON.parse(row.emergency_contact) : undefined,
        skills: row.skills ? JSON.parse(row.skills) : undefined,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));

      return { success: true, data: members };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  addCommunityMember(member: Omit<CommunityMember, 'id'>): DbResult<CommunityMember> {
    try {
      const stmt = this.db.prepare(`
        INSERT INTO community_members 
        (first_name, last_name, email, phone, address, membership_type, join_date, is_active, notes, emergency_contact, skills)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const result = stmt.run(
        member.firstName,
        member.lastName,
        member.email,
        member.phone,
        member.address,
        member.membershipType,
        member.joinDate,
        member.isActive,
        member.notes,
        member.emergencyContact ? JSON.stringify(member.emergencyContact) : null,
        member.skills ? JSON.stringify(member.skills) : null
      );

      const newMember = this.db.prepare('SELECT * FROM community_members WHERE id = ?').get(result.lastInsertRowid) as any;
      
      return {
        success: true,
        data: {
          id: newMember.id,
          firstName: newMember.first_name,
          lastName: newMember.last_name,
          email: newMember.email,
          phone: newMember.phone,
          address: newMember.address,
          membershipType: newMember.membership_type,
          joinDate: newMember.join_date,
          isActive: Boolean(newMember.is_active),
          notes: newMember.notes,
          emergencyContact: newMember.emergency_contact ? JSON.parse(newMember.emergency_contact) : undefined,
          skills: newMember.skills ? JSON.parse(newMember.skills) : undefined,
          createdAt: newMember.created_at,
          updatedAt: newMember.updated_at
        },
        lastInsertId: result.lastInsertRowid as number
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  updateCommunityMember(id: number, member: Partial<CommunityMember>): DbResult<CommunityMember> {
    try {
      const updates = [];
      const values = [];

      if (member.firstName !== undefined) { updates.push('first_name = ?'); values.push(member.firstName); }
      if (member.lastName !== undefined) { updates.push('last_name = ?'); values.push(member.lastName); }
      if (member.email !== undefined) { updates.push('email = ?'); values.push(member.email); }
      if (member.phone !== undefined) { updates.push('phone = ?'); values.push(member.phone); }
      if (member.address !== undefined) { updates.push('address = ?'); values.push(member.address); }
      if (member.membershipType !== undefined) { updates.push('membership_type = ?'); values.push(member.membershipType); }
      if (member.joinDate !== undefined) { updates.push('join_date = ?'); values.push(member.joinDate); }
      if (member.isActive !== undefined) { updates.push('is_active = ?'); values.push(member.isActive); }
      if (member.notes !== undefined) { updates.push('notes = ?'); values.push(member.notes); }
      if (member.emergencyContact !== undefined) { 
        updates.push('emergency_contact = ?'); 
        values.push(member.emergencyContact ? JSON.stringify(member.emergencyContact) : null); 
      }
      if (member.skills !== undefined) { 
        updates.push('skills = ?'); 
        values.push(member.skills ? JSON.stringify(member.skills) : null); 
      }

      updates.push('updated_at = CURRENT_TIMESTAMP');
      values.push(id);

      const stmt = this.db.prepare(`
        UPDATE community_members 
        SET ${updates.join(', ')} 
        WHERE id = ?
      `);

      const result = stmt.run(...values);
      
      if (result.changes === 0) {
        return { success: false, error: 'Community member not found' };
      }

      const updatedMember = this.db.prepare('SELECT * FROM community_members WHERE id = ?').get(id) as any;
      
      return {
        success: true,
        data: {
          id: updatedMember.id,
          firstName: updatedMember.first_name,
          lastName: updatedMember.last_name,
          email: updatedMember.email,
          phone: updatedMember.phone,
          address: updatedMember.address,
          membershipType: updatedMember.membership_type,
          joinDate: updatedMember.join_date,
          isActive: Boolean(updatedMember.is_active),
          notes: updatedMember.notes,
          emergencyContact: updatedMember.emergency_contact ? JSON.parse(updatedMember.emergency_contact) : undefined,
          skills: updatedMember.skills ? JSON.parse(updatedMember.skills) : undefined,
          createdAt: updatedMember.created_at,
          updatedAt: updatedMember.updated_at
        },
        rowsAffected: result.changes
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  deleteCommunityMember(id: number): DbResult<void> {
    try {
      const stmt = this.db.prepare('DELETE FROM community_members WHERE id = ?');
      const result = stmt.run(id);
      
      if (result.changes === 0) {
        return { success: false, error: 'Community member not found' };
      }

      return { success: true, rowsAffected: result.changes };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Announcements CRUD operations
  getAnnouncements(activeOnly?: boolean): DbResult<Announcement[]> {
    try {
      let query = 'SELECT * FROM announcements';
      let params: any[] = [];

      if (activeOnly) {
        query += ' WHERE is_active = 1';
      }

      query += ' ORDER BY publish_date DESC';
      const rows = this.db.prepare(query).all(...params);
      
      const announcements: Announcement[] = rows.map((row: any) => ({
        id: row.id,
        title: row.title,
        content: row.content,
        type: row.type,
        priority: row.priority,
        authorId: row.author_id,
        publishDate: row.publish_date,
        expiryDate: row.expiry_date,
        isActive: Boolean(row.is_active),
        targetAudience: row.target_audience,
        attachments: row.attachments ? JSON.parse(row.attachments) : undefined,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));

      return { success: true, data: announcements };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  addAnnouncement(announcement: Omit<Announcement, 'id'>): DbResult<Announcement> {
    try {
      const stmt = this.db.prepare(`
        INSERT INTO announcements 
        (title, content, type, priority, author_id, publish_date, expiry_date, is_active, target_audience, attachments)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const result = stmt.run(
        announcement.title,
        announcement.content,
        announcement.type,
        announcement.priority,
        announcement.authorId,
        announcement.publishDate,
        announcement.expiryDate,
        announcement.isActive,
        announcement.targetAudience,
        announcement.attachments ? JSON.stringify(announcement.attachments) : null
      );

      const newAnnouncement = this.db.prepare('SELECT * FROM announcements WHERE id = ?').get(result.lastInsertRowid) as any;
      
      return {
        success: true,
        data: {
          id: newAnnouncement.id,
          title: newAnnouncement.title,
          content: newAnnouncement.content,
          type: newAnnouncement.type,
          priority: newAnnouncement.priority,
          authorId: newAnnouncement.author_id,
          publishDate: newAnnouncement.publish_date,
          expiryDate: newAnnouncement.expiry_date,
          isActive: Boolean(newAnnouncement.is_active),
          targetAudience: newAnnouncement.target_audience,
          attachments: newAnnouncement.attachments ? JSON.parse(newAnnouncement.attachments) : undefined,
          createdAt: newAnnouncement.created_at,
          updatedAt: newAnnouncement.updated_at
        },
        lastInsertId: result.lastInsertRowid as number
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  updateAnnouncement(id: number, announcement: Partial<Announcement>): DbResult<Announcement> {
    try {
      const updates = [];
      const values = [];

      if (announcement.title !== undefined) { updates.push('title = ?'); values.push(announcement.title); }
      if (announcement.content !== undefined) { updates.push('content = ?'); values.push(announcement.content); }
      if (announcement.type !== undefined) { updates.push('type = ?'); values.push(announcement.type); }
      if (announcement.priority !== undefined) { updates.push('priority = ?'); values.push(announcement.priority); }
      if (announcement.authorId !== undefined) { updates.push('author_id = ?'); values.push(announcement.authorId); }
      if (announcement.publishDate !== undefined) { updates.push('publish_date = ?'); values.push(announcement.publishDate); }
      if (announcement.expiryDate !== undefined) { updates.push('expiry_date = ?'); values.push(announcement.expiryDate); }
      if (announcement.isActive !== undefined) { updates.push('is_active = ?'); values.push(announcement.isActive); }
      if (announcement.targetAudience !== undefined) { updates.push('target_audience = ?'); values.push(announcement.targetAudience); }
      if (announcement.attachments !== undefined) { 
        updates.push('attachments = ?'); 
        values.push(announcement.attachments ? JSON.stringify(announcement.attachments) : null); 
      }

      updates.push('updated_at = CURRENT_TIMESTAMP');
      values.push(id);

      const stmt = this.db.prepare(`
        UPDATE announcements 
        SET ${updates.join(', ')} 
        WHERE id = ?
      `);

      const result = stmt.run(...values);
      
      if (result.changes === 0) {
        return { success: false, error: 'Announcement not found' };
      }

      const updatedAnnouncement = this.db.prepare('SELECT * FROM announcements WHERE id = ?').get(id) as any;
      
      return {
        success: true,
        data: {
          id: updatedAnnouncement.id,
          title: updatedAnnouncement.title,
          content: updatedAnnouncement.content,
          type: updatedAnnouncement.type,
          priority: updatedAnnouncement.priority,
          authorId: updatedAnnouncement.author_id,
          publishDate: updatedAnnouncement.publish_date,
          expiryDate: updatedAnnouncement.expiry_date,
          isActive: Boolean(updatedAnnouncement.is_active),
          targetAudience: updatedAnnouncement.target_audience,
          attachments: updatedAnnouncement.attachments ? JSON.parse(updatedAnnouncement.attachments) : undefined,
          createdAt: updatedAnnouncement.created_at,
          updatedAt: updatedAnnouncement.updated_at
        },
        rowsAffected: result.changes
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  deleteAnnouncement(id: number): DbResult<void> {
    try {
      const stmt = this.db.prepare('DELETE FROM announcements WHERE id = ?');
      const result = stmt.run(id);
      
      if (result.changes === 0) {
        return { success: false, error: 'Announcement not found' };
      }

      return { success: true, rowsAffected: result.changes };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Settings operations
  getSettings(): DbResult<AppSettings> {
    try {
      const row = this.db.prepare('SELECT * FROM app_settings WHERE id = 1').get() as any;
      
      if (!row) {
        return { success: false, error: 'Settings not found' };
      }

      const settings: AppSettings = {
        id: row.id,
        masjidName: row.masjid_name,
        location: JSON.parse(row.location),
        prayerSettings: JSON.parse(row.prayer_settings),
        displaySettings: JSON.parse(row.display_settings),
        notificationSettings: JSON.parse(row.notification_settings),
        backupSettings: JSON.parse(row.backup_settings),
        createdAt: row.created_at,
        updatedAt: row.updated_at
      };

      return { success: true, data: settings };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  updateSettings(settings: Partial<AppSettings>): DbResult<AppSettings> {
    try {
      const updates = [];
      const values = [];

      if (settings.masjidName !== undefined) { updates.push('masjid_name = ?'); values.push(settings.masjidName); }
      if (settings.location !== undefined) { updates.push('location = ?'); values.push(JSON.stringify(settings.location)); }
      if (settings.prayerSettings !== undefined) { updates.push('prayer_settings = ?'); values.push(JSON.stringify(settings.prayerSettings)); }
      if (settings.displaySettings !== undefined) { updates.push('display_settings = ?'); values.push(JSON.stringify(settings.displaySettings)); }
      if (settings.notificationSettings !== undefined) { updates.push('notification_settings = ?'); values.push(JSON.stringify(settings.notificationSettings)); }
      if (settings.backupSettings !== undefined) { updates.push('backup_settings = ?'); values.push(JSON.stringify(settings.backupSettings)); }

      updates.push('updated_at = CURRENT_TIMESTAMP');
      values.push(1); // Settings always have ID 1

      const stmt = this.db.prepare(`
        UPDATE app_settings 
        SET ${updates.join(', ')} 
        WHERE id = ?
      `);

      const result = stmt.run(...values);
      
      if (result.changes === 0) {
        return { success: false, error: 'Settings not found' };
      }

      const updatedSettings = this.db.prepare('SELECT * FROM app_settings WHERE id = 1').get() as any;
      
      return {
        success: true,
        data: {
          id: updatedSettings.id,
          masjidName: updatedSettings.masjid_name,
          location: JSON.parse(updatedSettings.location),
          prayerSettings: JSON.parse(updatedSettings.prayer_settings),
          displaySettings: JSON.parse(updatedSettings.display_settings),
          notificationSettings: JSON.parse(updatedSettings.notification_settings),
          backupSettings: JSON.parse(updatedSettings.backup_settings),
          createdAt: updatedSettings.created_at,
          updatedAt: updatedSettings.updated_at
        },
        rowsAffected: result.changes
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Backup operations
  getBackupList(): DbResult<BackupMeta[]> {
    try {
      const rows = this.db.prepare('SELECT * FROM backup_meta ORDER BY backup_date DESC').all();
      
      const backups: BackupMeta[] = rows.map((row: any) => ({
        id: row.id,
        fileName: row.file_name,
        filePath: row.file_path,
        fileSize: row.file_size,
        backupDate: row.backup_date,
        appVersion: row.app_version,
        dataVersion: row.data_version,
        recordCounts: JSON.parse(row.record_counts),
        checksum: row.checksum,
        isCompressed: Boolean(row.is_compressed),
        notes: row.notes,
        createdAt: row.created_at
      }));

      return { success: true, data: backups };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  addBackupMeta(backupMeta: Omit<BackupMeta, 'id'>): DbResult<BackupMeta> {
    try {
      const stmt = this.db.prepare(`
        INSERT INTO backup_meta 
        (file_name, file_path, file_size, backup_date, app_version, data_version, record_counts, checksum, is_compressed, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const result = stmt.run(
        backupMeta.fileName,
        backupMeta.filePath,
        backupMeta.fileSize,
        backupMeta.backupDate,
        backupMeta.appVersion,
        backupMeta.dataVersion,
        JSON.stringify(backupMeta.recordCounts),
        backupMeta.checksum,
        backupMeta.isCompressed,
        backupMeta.notes
      );

      const newBackup = this.db.prepare('SELECT * FROM backup_meta WHERE id = ?').get(result.lastInsertRowid) as any;
      
      return {
        success: true,
        data: {
          id: newBackup.id,
          fileName: newBackup.file_name,
          filePath: newBackup.file_path,
          fileSize: newBackup.file_size,
          backupDate: newBackup.backup_date,
          appVersion: newBackup.app_version,
          dataVersion: newBackup.data_version,
          recordCounts: JSON.parse(newBackup.record_counts),
          checksum: newBackup.checksum,
          isCompressed: Boolean(newBackup.is_compressed),
          notes: newBackup.notes,
          createdAt: newBackup.created_at
        },
        lastInsertId: result.lastInsertRowid as number
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  deleteBackupMeta(id: number): DbResult<void> {
    try {
      const stmt = this.db.prepare('DELETE FROM backup_meta WHERE id = ?');
      const result = stmt.run(id);
      
      if (result.changes === 0) {
        return { success: false, error: 'Backup metadata not found' };
      }

      return { success: true, rowsAffected: result.changes };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Utility methods
  close(): void {
    this.db.close();
  }

  getDbPath(): string {
    return this.dbPath;
  }
}

export default DatabaseManager;
