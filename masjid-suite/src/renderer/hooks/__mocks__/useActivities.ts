import { Activity } from '../../types';

export const useActivities = () => {
  return {
    activities: [
      { 
        id: 1, 
        action: 'New member registered', 
        timestamp: new Date().toISOString(),
        userId: 1,
        userName: 'Test User',
        entityType: 'Member',
        entityId: 1,
      },
      { 
        id: 2, 
        action: 'Prayer time updated', 
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        userId: 1,
        userName: 'Test User',
        entityType: 'PrayerTime',
        entityId: 1,
      },
    ] as Activity[],
    loading: false,
    error: null,
    refresh: jest.fn(),
  };
};
