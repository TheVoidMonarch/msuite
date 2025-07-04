import { app } from 'electron';
import path from 'path';
import { Database } from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

// Types
type Gender = 'male' | 'female' | 'other';
type MaritalStatus = 'single' | 'married' | 'divorced' | 'widowed';
type MemberStatus = 'active' | 'inactive' | 'suspended' | 'deceased';

interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface ContactInfo {
  phone: string;
  email?: string;
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
}

interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  age?: number;
}

interface Member {
  id: string;
  membershipId: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  gender: Gender;
  dateOfBirth: string;
  placeOfBirth?: string;
  nationality: string;
  maritalStatus: MaritalStatus;
  occupation?: string;
  educationLevel?: string;
  address: Address;
  contact: ContactInfo;
  familyMembers?: FamilyMember[];
  joinDate: string;
  status: MemberStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  profilePicture?: string;
  quranReadingLevel?: string;
  prayerAttendance?: {
    lastMonth: number;
    lastThreeMonths: number;
    lastYear: number;
  };
  tags?: string[];
}

interface PrayerAttendance {
  id: string;
  memberId: string;
  prayerTime: string; // 'fajr', 'dhuhr', 'asr', 'maghrib', 'isha'
  date: string;
  attended: boolean;
  masjidId: string;
  recordedBy: string;
  notes?: string;
  createdAt: string;
}

interface EventAttendance {
  id: string;
  eventId: string;
  memberId: string;
  attended: boolean;
  checkInTime?: string;
  checkOutTime?: string;
  recordedBy: string;
  notes?: string;
  createdAt: string;
}

interface Donation {
  id: string;
  memberId?: string; // Optional for anonymous donations
  amount: number;
  currency: string;
  donationType: string; // 'zakat', 'sadaqah', 'fidyah', 'general', etc.
  paymentMethod: string;
  transactionId?: string;
  receiptNumber: string;
  date: string;
  notes?: string;
  createdAt: string;
  createdBy: string;
}

interface Class {
  id: string;
  name: string;
  description?: string;
  teacherId: string;
  schedule: {
    day: string;
    startTime: string;
    endTime: string;
  }[];
  startDate: string;
  endDate?: string;
  maxStudents?: number;
  currentStudents: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

interface ClassEnrollment {
  id: string;
  classId: string;
  memberId: string;
  enrollmentDate: string;
  status: 'active' | 'completed' | 'dropped' | 'suspended';
  progress?: number; // 0-100
  lastAttended?: string;
  attendanceCount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

class DatabaseService {
  private db: Database;
  private static instance: DatabaseService;
  private dbPath: string;

  private constructor() {
    // Ensure app data directory exists
    const userDataPath = app.getPath('userData');
    const dbDir = path.join(userDataPath, 'database');
    
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    
    this.dbPath = path.join(dbDir, 'masjid-suite.db');
    const Database = require('better-sqlite3');
    this.db = new Database(this.dbPath);
    
    this.initializeDatabase();
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  private initializeDatabase() {
    // Enable foreign keys
    this.db.pragma('foreign_keys = ON');
    
    // Create tables if they don't exist
    this.createTables();
    this.createIndexes();
  }

  private createTables() {
    // Members table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS members (
        id TEXT PRIMARY KEY,
        membership_id TEXT UNIQUE,
        first_name TEXT NOT NULL,
        middle_name TEXT,
        last_name TEXT NOT NULL,
        gender TEXT CHECK(gender IN ('male', 'female', 'other')) NOT NULL,
        date_of_birth TEXT NOT NULL,
        place_of_birth TEXT,
        nationality TEXT NOT NULL,
        marital_status TEXT CHECK(marital_status IN ('single', 'married', 'divorced', 'widowed')),
        occupation TEXT,
        education_level TEXT,
        address_street TEXT,
        address_city TEXT,
        address_state TEXT,
        address_postal_code TEXT,
        address_country TEXT,
        phone TEXT NOT NULL,
        email TEXT,
        emergency_contact_name TEXT,
        emergency_contact_relationship TEXT,
        emergency_contact_phone TEXT,
        join_date TEXT NOT NULL,
        status TEXT CHECK(status IN ('active', 'inactive', 'suspended', 'deceased')) NOT NULL,
        notes TEXT,
        profile_picture TEXT,
        quran_reading_level TEXT,
        tags TEXT, -- JSON array of tags
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);

    // Family members table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS family_members (
        id TEXT PRIMARY KEY,
        member_id TEXT NOT NULL,
        name TEXT NOT NULL,
        relationship TEXT NOT NULL,
        age INTEGER,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
      )
    `);

    // Prayer attendance table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS prayer_attendance (
        id TEXT PRIMARY KEY,
        member_id TEXT NOT NULL,
        prayer_time TEXT NOT NULL,
        date TEXT NOT NULL,
        attended INTEGER NOT NULL DEFAULT 0,
        masjid_id TEXT NOT NULL,
        recorded_by TEXT NOT NULL,
        notes TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
      )
    `);

    // Events table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS events (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        location TEXT,
        organizer TEXT,
        max_attendees INTEGER,
        status TEXT CHECK(status IN ('upcoming', 'ongoing', 'completed', 'cancelled')) NOT NULL,
        created_by TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);

    // Event attendance table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS event_attendance (
        id TEXT PRIMARY KEY,
        event_id TEXT NOT NULL,
        member_id TEXT NOT NULL,
        attended INTEGER NOT NULL DEFAULT 0,
        check_in_time TEXT,
        check_out_time TEXT,
        recorded_by TEXT NOT NULL,
        notes TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
        FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
      )
    `);

    // Donations table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS donations (
        id TEXT PRIMARY KEY,
        member_id TEXT,
        amount REAL NOT NULL,
        currency TEXT NOT NULL,
        donation_type TEXT NOT NULL,
        payment_method TEXT NOT NULL,
        transaction_id TEXT,
        receipt_number TEXT UNIQUE NOT NULL,
        date TEXT NOT NULL,
        notes TEXT,
        created_at TEXT NOT NULL,
        created_by TEXT NOT NULL,
        FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE SET NULL
      )
    `);

    // Classes table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS classes (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        teacher_id TEXT NOT NULL,
        schedule TEXT NOT NULL, -- JSON array of {day, startTime, endTime}
        start_date TEXT NOT NULL,
        end_date TEXT,
        max_students INTEGER,
        current_students INTEGER DEFAULT 0,
        status TEXT CHECK(status IN ('upcoming', 'ongoing', 'completed', 'cancelled')) NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (teacher_id) REFERENCES members(id)
      )
    `);

    // Class enrollments table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS class_enrollments (
        id TEXT PRIMARY KEY,
        class_id TEXT NOT NULL,
        member_id TEXT NOT NULL,
        enrollment_date TEXT NOT NULL,
        status TEXT CHECK(status IN ('active', 'completed', 'dropped', 'suspended')) NOT NULL,
        progress REAL DEFAULT 0,
        last_attended TEXT,
        attendance_count INTEGER DEFAULT 0,
        notes TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
        FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
        UNIQUE(class_id, member_id)
      )
    `);
  }

  private createIndexes() {
    // Create indexes for better query performance
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_members_name ON members(last_name, first_name);
      CREATE INDEX IF NOT EXISTS idx_members_phone ON members(phone);
      CREATE INDEX IF NOT EXISTS idx_members_status ON members(status);
      CREATE INDEX IF NOT EXISTS idx_prayer_attendance_date ON prayer_attendance(date);
      CREATE INDEX IF NOT EXISTS idx_prayer_attendance_member ON prayer_attendance(member_id);
      CREATE INDEX IF NOT EXISTS idx_event_attendance_event ON event_attendance(event_id);
      CREATE INDEX IF NOT EXISTS idx_donations_member ON donations(member_id);
      CREATE INDEX IF NOT EXISTS idx_donations_date ON donations(date);
      CREATE INDEX IF NOT EXISTS idx_classes_teacher ON classes(teacher_id);
      CREATE INDEX IF NOT EXISTS idx_class_enrollments_member ON class_enrollments(member_id);
      CREATE INDEX IF NOT EXISTS idx_class_enrollments_class ON class_enrollments(class_id);
    `);
  }

  // Member CRUD Operations
  public async createMember(memberData: Omit<Member, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = uuidv4();
    const now = new Date().toISOString();
    
    const stmt = this.db.prepare(`
      INSERT INTO members (
        id, membership_id, first_name, middle_name, last_name, gender, 
        date_of_birth, place_of_birth, nationality, marital_status, 
        occupation, education_level, address_street, address_city, 
        address_state, address_postal_code, address_country, phone, 
        email, emergency_contact_name, emergency_contact_relationship, 
        emergency_contact_phone, join_date, status, notes, 
        profile_picture, quran_reading_level, tags, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `);

    try {
      await stmt.run(
        id,
        memberData.membershipId,
        memberData.firstName,
        memberData.middleName || null,
        memberData.lastName,
        memberData.gender,
        memberData.dateOfBirth,
        memberData.placeOfBirth || null,
        memberData.nationality,
        memberData.maritalStatus || null,
        memberData.occupation || null,
        memberData.educationLevel || null,
        memberData.address.street,
        memberData.address.city,
        memberData.address.state,
        memberData.address.postalCode,
        memberData.address.country,
        memberData.contact.phone,
        memberData.contact.email || null,
        memberData.contact.emergencyContact?.name || null,
        memberData.contact.emergencyContact?.relationship || null,
        memberData.contact.emergencyContact?.phone || null,
        memberData.joinDate,
        memberData.status,
        memberData.notes || null,
        memberData.profilePicture || null,
        memberData.quranReadingLevel || null,
        memberData.tags ? JSON.stringify(memberData.tags) : null,
        now,
        now
      );

      // Insert family members if any
      if (memberData.familyMembers && memberData.familyMembers.length > 0) {
        const familyStmt = this.db.prepare(`
          INSERT INTO family_members (
            id, member_id, name, relationship, age, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `);

        const insertFamily = this.db.transaction((members) => {
          for (const member of members) {
            familyStmt.run(
              member.id || uuidv4(),
              id,
              member.name,
              member.relationship,
              member.age || null,
              now,
              now
            );
          }
        });

        insertFamily(memberData.familyMembers);
      }

      return id;
    } catch (error) {
      console.error('Error creating member:', error);
      throw error;
    }
  }

  public getMember(id: string): Member | null {
    try {
      const member = this.db.prepare(`
        SELECT 
          m.*,
          json_group_array(
            json_object(
              'id', fm.id,
              'name', fm.name,
              'relationship', fm.relationship,
              'age', fm.age
            )
          ) as family_members_json
        FROM members m
        LEFT JOIN family_members fm ON m.id = fm.member_id
        WHERE m.id = ?
        GROUP BY m.id
      `).get(id);

      if (!member) return null;

      // Parse family members JSON
      const familyMembers = member.family_members_json 
        ? JSON.parse(member.family_members_json).filter((fm: any) => fm.id !== null)
        : [];

      return {
        id: member.id,
        membershipId: member.membership_id,
        firstName: member.first_name,
        middleName: member.middle_name || undefined,
        lastName: member.last_name,
        gender: member.gender as Gender,
        dateOfBirth: member.date_of_birth,
        placeOfBirth: member.place_of_birth || undefined,
        nationality: member.nationality,
        maritalStatus: member.marital_status as MaritalStatus,
        occupation: member.occupation || undefined,
        educationLevel: member.education_level || undefined,
        address: {
          street: member.address_street,
          city: member.address_city,
          state: member.address_state,
          postalCode: member.address_postal_code,
          country: member.address_country
        },
        contact: {
          phone: member.phone,
          email: member.email || undefined,
          emergencyContact: member.emergency_contact_name ? {
            name: member.emergency_contact_name,
            relationship: member.emergency_contact_relationship || '',
            phone: member.emergency_contact_phone || ''
          } : undefined
        },
        familyMembers: familyMembers.length > 0 ? familyMembers : undefined,
        joinDate: member.join_date,
        status: member.status as MemberStatus,
        notes: member.notes || undefined,
        profilePicture: member.profile_picture || undefined,
        quranReadingLevel: member.quran_reading_level || undefined,
        tags: member.tags ? JSON.parse(member.tags) : undefined,
        createdAt: member.created_at,
        updatedAt: member.updated_at
      };
    } catch (error) {
      console.error('Error getting member:', error);
      throw error;
    }
  }

  // Add other CRUD operations (updateMember, deleteMember, listMembers, etc.)
  // Add methods for other tables (prayer attendance, events, donations, etc.)
  
  // Backup database
  public backupDatabase(backupPath: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        const backupDB = new (require('better-sqlite3'))(backupPath);
        this.db.backup(backupDB, {
          progress: (remaining: number) => {
            console.log(`Backup progress: ${remaining} pages remaining`);
          }
        })
        .then(() => {
          backupDB.close();
          resolve(true);
        })
        .catch((err: Error) => {
          console.error('Backup failed:', err);
          reject(err);
        });
      } catch (error) {
        console.error('Error during backup:', error);
        reject(error);
      }
    });
  }

  // Close database connection
  public close() {
    this.db.close();
  }
}

export default DatabaseService.getInstance();
