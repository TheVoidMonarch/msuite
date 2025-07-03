import { useMemo } from 'react';
import { usePrayerStore, useCommunityStore, useAnnouncementStore, useSettingsStore } from '../store';
import { PrayerTime, CommunityMember, Announcement } from '../../types';

// Prayer Store Selectors
export const usePrayerSelectors = () => {
  // Get all prayer times (memoized)
  const prayerTimes = usePrayerStore(state => state.prayerTimes);
  const isLoading = usePrayerStore(state => state.isLoading);
  const error = usePrayerStore(state => state.error);
  const isOnline = usePrayerStore(state => state.isOnline);

  // Memoized today's prayer times
  const todaysPrayerTimes = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return prayerTimes.filter(pt => pt.date === today);
  }, [prayerTimes]);

  // Memoized upcoming prayer time
  const upcomingPrayer = useMemo(() => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
    
    const todaysSchedule = prayerTimes.find(pt => pt.date === today);
    if (!todaysSchedule) return null;

    const prayers = [
      { name: 'Fajr', time: todaysSchedule.fajr },
      { name: 'Sunrise', time: todaysSchedule.sunrise },
      { name: 'Dhuhr', time: todaysSchedule.dhuhr },
      { name: 'Asr', time: todaysSchedule.asr },
      { name: 'Maghrib', time: todaysSchedule.maghrib },
      { name: 'Isha', time: todaysSchedule.isha }
    ];

    return prayers.find(prayer => prayer.time > currentTime) || prayers[0];
  }, [prayerTimes]);

  // Memoized current prayer
  const currentPrayer = useMemo(() => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().slice(0, 5);
    
    const todaysSchedule = prayerTimes.find(pt => pt.date === today);
    if (!todaysSchedule) return null;

    const prayers = [
      { name: 'Fajr', time: todaysSchedule.fajr },
      { name: 'Sunrise', time: todaysSchedule.sunrise },
      { name: 'Dhuhr', time: todaysSchedule.dhuhr },
      { name: 'Asr', time: todaysSchedule.asr },
      { name: 'Maghrib', time: todaysSchedule.maghrib },
      { name: 'Isha', time: todaysSchedule.isha }
    ];

    let current = prayers[0];
    for (const prayer of prayers) {
      if (prayer.time <= currentTime) {
        current = prayer;
      } else {
        break;
      }
    }
    return current;
  }, [prayerTimes]);

  // Memoized week's prayer times
  const weeksPrayerTimes = useMemo(() => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    return prayerTimes.filter(pt => {
      const date = new Date(pt.date);
      return date >= weekStart && date <= weekEnd;
    });
  }, [prayerTimes]);

  return {
    prayerTimes,
    todaysPrayerTimes,
    upcomingPrayer,
    currentPrayer,
    weeksPrayerTimes,
    isLoading,
    error,
    isOnline
  };
};

// Community Store Selectors
export const useCommunitySelectors = () => {
  const communityMembers = useCommunityStore(state => state.communityMembers);
  const isLoading = useCommunityStore(state => state.isLoading);
  const error = useCommunityStore(state => state.error);
  const isOnline = useCommunityStore(state => state.isOnline);

  // Memoized active members
  const activeMembers = useMemo(() => {
    return communityMembers.filter(member => member.isActive);
  }, [communityMembers]);

  // Memoized members by type
  const membersByType = useMemo(() => {
    return communityMembers.reduce((acc, member) => {
      if (!acc[member.membershipType]) {
        acc[member.membershipType] = [];
      }
      acc[member.membershipType].push(member);
      return acc;
    }, {} as Record<string, CommunityMember[]>);
  }, [communityMembers]);

  // Memoized member statistics
  const memberStats = useMemo(() => {
    const total = communityMembers.length;
    const active = activeMembers.length;
    const inactive = total - active;
    
    const typeStats = Object.entries(membersByType).map(([type, members]) => ({
      type,
      count: members.length,
      percentage: total > 0 ? Math.round((members.length / total) * 100) : 0
    }));

    return {
      total,
      active,
      inactive,
      typeStats
    };
  }, [communityMembers, activeMembers, membersByType]);

  // Memoized recent joiners (last 30 days)
  const recentJoiners = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    return communityMembers.filter(member => {
      const joinDate = new Date(member.joinDate);
      return joinDate >= thirtyDaysAgo;
    }).sort((a, b) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime());
  }, [communityMembers]);

  // Memoized members with skills
  const membersWithSkills = useMemo(() => {
    return communityMembers.filter(member => member.skills && member.skills.length > 0);
  }, [communityMembers]);

  return {
    communityMembers,
    activeMembers,
    membersByType,
    memberStats,
    recentJoiners,
    membersWithSkills,
    isLoading,
    error,
    isOnline
  };
};

// Announcements Store Selectors
export const useAnnouncementSelectors = () => {
  const announcements = useAnnouncementStore(state => state.announcements);
  const isLoading = useAnnouncementStore(state => state.isLoading);
  const error = useAnnouncementStore(state => state.error);
  const isOnline = useAnnouncementStore(state => state.isOnline);

  // Memoized active announcements
  const activeAnnouncements = useMemo(() => {
    const now = new Date();
    return announcements.filter(announcement => {
      if (!announcement.isActive) return false;
      if (announcement.expiryDate) {
        const expiryDate = new Date(announcement.expiryDate);
        return expiryDate > now;
      }
      return true;
    });
  }, [announcements]);

  // Memoized announcements by type
  const announcementsByType = useMemo(() => {
    return announcements.reduce((acc, announcement) => {
      if (!acc[announcement.type]) {
        acc[announcement.type] = [];
      }
      acc[announcement.type].push(announcement);
      return acc;
    }, {} as Record<string, Announcement[]>);
  }, [announcements]);

  // Memoized announcements by priority
  const announcementsByPriority = useMemo(() => {
    return announcements.reduce((acc, announcement) => {
      if (!acc[announcement.priority]) {
        acc[announcement.priority] = [];
      }
      acc[announcement.priority].push(announcement);
      return acc;
    }, {} as Record<string, Announcement[]>);
  }, [announcements]);

  // Memoized urgent announcements
  const urgentAnnouncements = useMemo(() => {
    return activeAnnouncements.filter(announcement => 
      announcement.priority === 'high' || announcement.type === 'urgent'
    ).sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());
  }, [activeAnnouncements]);

  // Memoized recent announcements (last 7 days)
  const recentAnnouncements = useMemo(() => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    return announcements.filter(announcement => {
      const publishDate = new Date(announcement.publishDate);
      return publishDate >= sevenDaysAgo;
    }).sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());
  }, [announcements]);

  // Memoized upcoming events (event type announcements)
  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return activeAnnouncements.filter(announcement => 
      announcement.type === 'event'
    ).sort((a, b) => new Date(a.publishDate).getTime() - new Date(b.publishDate).getTime());
  }, [activeAnnouncements]);

  return {
    announcements,
    activeAnnouncements,
    announcementsByType,
    announcementsByPriority,
    urgentAnnouncements,
    recentAnnouncements,
    upcomingEvents,
    isLoading,
    error,
    isOnline
  };
};

// Settings Store Selectors
export const useSettingsSelectors = () => {
  const settings = useSettingsStore(state => state.settings);
  const isLoading = useSettingsStore(state => state.isLoading);
  const error = useSettingsStore(state => state.error);
  const isOnline = useSettingsStore(state => state.isOnline);

  // Memoized theme
  const theme = useMemo(() => {
    if (!settings) return 'light';
    if (settings.displaySettings.theme === 'auto') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return settings.displaySettings.theme;
  }, [settings]);

  // Memoized language
  const language = useMemo(() => {
    return settings?.displaySettings.language || 'en';
  }, [settings]);

  // Memoized notification settings
  const notificationSettings = useMemo(() => {
    return settings?.notificationSettings || {
      enablePrayerNotifications: true,
      enableAnnouncementNotifications: true,
      notificationSound: true,
      reminderMinutes: 15
    };
  }, [settings]);

  // Memoized prayer calculation settings
  const prayerCalculationSettings = useMemo(() => {
    return settings?.prayerSettings || {
      calculationMethod: 'MWL' as const,
      asrMethod: 'Standard' as const,
      adjustments: {
        fajr: 0,
        sunrise: 0,
        dhuhr: 0,
        asr: 0,
        maghrib: 0,
        isha: 0
      },
      iqamahDelays: {
        fajr: 15,
        dhuhr: 10,
        asr: 10,
        maghrib: 5,
        isha: 10
      }
    };
  }, [settings]);

  // Memoized location settings
  const locationSettings = useMemo(() => {
    return settings?.location || {
      address: '',
      city: '',
      country: '',
      timezone: 'UTC'
    };
  }, [settings]);

  return {
    settings,
    theme,
    language,
    notificationSettings,
    prayerCalculationSettings,
    locationSettings,
    isLoading,
    error,
    isOnline
  };
};

// Combined network status selector for global offline handling
export const useNetworkStatus = () => {
  const prayerOnline = usePrayerStore(state => state.isOnline);
  const communityOnline = useCommunityStore(state => state.isOnline);
  const announcementOnline = useAnnouncementStore(state => state.isOnline);
  const settingsOnline = useSettingsStore(state => state.isOnline);

  const isOnline = useMemo(() => {
    return prayerOnline && communityOnline && announcementOnline && settingsOnline;
  }, [prayerOnline, communityOnline, announcementOnline, settingsOnline]);

  const hasErrors = useMemo(() => {
    const prayerError = usePrayerStore(state => state.error);
    const communityError = useCommunityStore(state => state.error);
    const announcementError = useAnnouncementStore(state => state.error);
    const settingsError = useSettingsStore(state => state.error);

    return !!(prayerError || communityError || announcementError || settingsError);
  }, []);

  return {
    isOnline,
    hasErrors
  };
};
