# Database Layer Implementation

This document describes the TypeScript domain models and persistence layer implementation for the Masjid Suite application.

## Overview

The database layer consists of:
- TypeScript interfaces defining domain models
- SQLite database with better-sqlite3
- IPC channels for CRUD operations
- Migration system for database schema management
- Backup and restore functionality

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Renderer      │    │   Main Process  │    │   SQLite DB     │
│   Process       │    │                 │    │                 │
│                 │    │                 │    │                 │
│ - dbService.ts  │◄──►│ - ipc-handlers  │◄──►│ - Tables        │
│ - Components    │    │ - db.ts         │    │ - Indexes       │
│                 │    │                 │    │ - Migrations    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## TypeScript Interfaces

### Core Domain Models

Located in `src/types/index.ts`:

#### PrayerTime
- Stores daily prayer times for specific locations
- Includes Hijri date support
- Timestamps for creation and updates

#### CommunityMember
- Member information with contact details
- Membership types: regular, family, student, senior
- Emergency contact and skills JSON fields
- Active/inactive status

#### Announcement
- Community announcements with rich content
- Types: general, event, urgent, prayer, fundraising
- Priority levels and target audience
- Expiry date support and attachment handling

#### AppSettings
- Comprehensive application configuration
- Prayer calculation settings and adjustments
- Display, notification, and backup preferences
- Location and masjid information

#### BackupMeta
- Backup file metadata and integrity information
- Record counts and version tracking
- Checksum validation for data integrity

## Database Schema

### Tables

1. **prayer_times**
   - Daily prayer schedules
   - Unique constraint on date + location

2. **community_members**
   - Member directory with contact information
   - JSON fields for complex data (emergency contacts, skills)

3. **announcements**
   - Community notices with metadata
   - Foreign key to author (community member)

4. **app_settings**
   - Single row configuration table
   - JSON fields for complex settings objects

5. **backup_meta**
   - Backup file tracking and validation

6. **migrations**
   - Database version control

### Indexes

Performance indexes on:
- Prayer times by date
- Community members by active status
- Announcements by active status and publish date
- Backup metadata by date

## Migration System

The database uses a migration system to manage schema changes:

- **001_initial_schema**: Creates all tables and indexes
- **002_default_settings**: Inserts default application settings

Migrations are tracked in the `migrations` table and run automatically on first launch.

## IPC Architecture

### Channels

All database operations are exposed through IPC channels with consistent naming:

- `prayer-times:*` - Prayer time operations
- `community:*` - Community member operations  
- `announcements:*` - Announcement operations
- `settings:*` - Settings operations
- `backup:*` - Backup operations

### Type Safety

IPC channels are strongly typed using the `IPCChannels` interface to ensure type safety across the IPC boundary.

## Usage Examples

### In Renderer Process

```typescript
import { dbService } from './services/db-service';

// Test database connection
const connection = await dbService.testConnection();
console.log(connection.message);

// Add a community member
const newMember = await dbService.addCommunityMember({
  firstName: 'Ahmed',
  lastName: 'Hassan',
  email: 'ahmed@example.com',
  membershipType: 'regular',
  joinDate: '2024-07-04',
  isActive: true
});

// Get today's prayer times
const prayerTimes = await dbService.getTodaysPrayerTimes();

// Create a backup
const backup = await dbService.createBackup('Manual backup before update');
```

### Error Handling

All database operations return a `DbResult<T>` object:

```typescript
const result = await dbService.getCommunityMembers();
if (result.success) {
  // Use result.data
  console.log('Members:', result.data);
} else {
  // Handle error
  console.error('Database error:', result.error);
}
```

## Data Storage

- **Database Location**: `{userData}/masjid-suite.db`
- **Backup Location**: `{userData}/backups/`
- **Journal Mode**: WAL (Write-Ahead Logging)
- **Foreign Keys**: Enabled

## Features

### Automatic Backups
- Configurable intervals (daily, weekly, monthly)
- Automatic cleanup of old backups
- Integrity verification with checksums

### Data Validation
- SQLite constraints for data integrity
- TypeScript interfaces for compile-time checking
- JSON validation for complex fields

### Performance
- Optimized indexes for common queries
- WAL mode for better concurrent access
- Prepared statements for security and performance

## Testing

To test the database layer:

1. Run the application: `npm start`
2. Open developer tools in the renderer process
3. Use the dbService in the console:

```javascript
// Test connection
window.electronAPI.settings.get().then(console.log);

// Test adding data
window.electronAPI.community.add({
  firstName: 'Test',
  lastName: 'User',
  membershipType: 'regular',
  joinDate: '2024-07-04',
  isActive: true
}).then(console.log);
```

## Security Considerations

- Context isolation enabled in preload script
- No direct database access from renderer process
- All operations validated in main process
- SQL injection protection through prepared statements

## Future Enhancements

- Connection pooling for heavy loads
- Database encryption for sensitive data
- Real-time sync across multiple instances
- Enhanced backup compression
- Query optimization and caching
