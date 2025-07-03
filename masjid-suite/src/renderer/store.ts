import { create } from 'zustand';
import { dbService } from './services/db-service';
import { PrayerTime, CommunityMember, Announcement, AppSettings, DbResult } from '../types';

// Network status tracking
interface NetworkState {
  isOnline: boolean;
  retryCount: number;
  lastSyncTime: Date | null;
  pendingActions: Array<{ type: string; payload: any; timestamp: Date }>;
}

// Prayer Store with optimistic UI and reconnect logic
interface PrayerState extends NetworkState {
  prayerTimes: PrayerTime[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  getPrayerTimes: (date?: string) => Promise<void>;
  addPrayerTime: (prayerTime: Omit<PrayerTime, 'id'>) => Promise<void>;
  updatePrayerTime: (id: number, prayerTime: Partial<PrayerTime>) => Promise<void>;
  deletePrayerTime: (id: number) => Promise<void>;
  
  // Network handling
  setOnlineStatus: (isOnline: boolean) => void;
  retryPendingActions: () => Promise<void>;
  clearError: () => void;
}

export const usePrayerStore = create<PrayerState>(
  (set, get) => ({
    // State
    prayerTimes: [],
    isLoading: false,
    error: null,
    isOnline: navigator.onLine,
    retryCount: 0,
    lastSyncTime: null,
    pendingActions: [],

    // Actions
    getPrayerTimes: async (date?: string) => {
      set({ isLoading: true, error: null });
      
      try {
        const result = await dbService.getPrayerTimes(date);
        
        if (result.success && result.data) {
          set({ 
            prayerTimes: result.data, 
            lastSyncTime: new Date(),
            retryCount: 0 
          });
        } else {
          set({ error: result.error || 'Failed to fetch prayer times' });
        }
      } catch (error) {
        set({ error: 'Network error - will retry when online' });
      } finally {
        set({ isLoading: false });
      }
    },

    addPrayerTime: async (prayerTime: Omit<PrayerTime, 'id'>) => {
      const tempId = Date.now(); // Temporary ID for optimistic update
      const optimisticPrayerTime: PrayerTime = { ...prayerTime, id: tempId };
      
      // Optimistic update
      set(state => ({ 
        prayerTimes: [...state.prayerTimes, optimisticPrayerTime] 
      }));

      try {
        const result = await dbService.addPrayerTime(prayerTime);
        
        if (result.success && result.data) {
          // Replace optimistic entry with real data
          set(state => ({
            prayerTimes: state.prayerTimes.map(pt => 
              pt.id === tempId ? result.data! : pt
            ),
            lastSyncTime: new Date()
          }));
        } else {
          throw new Error(result.error || 'Failed to add prayer time');
        }
      } catch (error) {
        // Revert optimistic update
        set(state => ({
          prayerTimes: state.prayerTimes.filter(pt => pt.id !== tempId),
          error: error.message,
          pendingActions: [...state.pendingActions, {
            type: 'ADD_PRAYER_TIME',
            payload: prayerTime,
            timestamp: new Date()
          }]
        }));
      }
    },

    updatePrayerTime: async (id: number, prayerTime: Partial<PrayerTime>) => {
      const previousState = get().prayerTimes;
      
      // Optimistic update
      set(state => ({
        prayerTimes: state.prayerTimes.map(pt => 
          pt.id === id ? { ...pt, ...prayerTime } : pt
        )
      }));

      try {
        const result = await dbService.updatePrayerTime(id, prayerTime);
        
        if (result.success && result.data) {
          set(state => ({
            prayerTimes: state.prayerTimes.map(pt => 
              pt.id === id ? result.data! : pt
            ),
            lastSyncTime: new Date()
          }));
        } else {
          throw new Error(result.error || 'Failed to update prayer time');
        }
      } catch (error) {
        // Revert optimistic update
        set({ 
          prayerTimes: previousState,
          error: error.message 
        });
      }
    },

    deletePrayerTime: async (id: number) => {
      const previousState = get().prayerTimes;
      
      // Optimistic update
      set(state => ({
        prayerTimes: state.prayerTimes.filter(pt => pt.id !== id)
      }));

      try {
        const result = await dbService.deletePrayerTime(id);
        
        if (result.success) {
          set({ lastSyncTime: new Date() });
        } else {
          throw new Error(result.error || 'Failed to delete prayer time');
        }
      } catch (error) {
        // Revert optimistic update
        set({ 
          prayerTimes: previousState,
          error: error.message 
        });
      }
    },

    // Network handling
    setOnlineStatus: (isOnline: boolean) => {
      set({ isOnline });
      if (isOnline) {
        get().retryPendingActions();
      }
    },

    retryPendingActions: async () => {
      const { pendingActions } = get();
      if (pendingActions.length === 0) return;

      set({ retryCount: get().retryCount + 1 });
      
      for (const action of pendingActions) {
        try {
          switch (action.type) {
            case 'ADD_PRAYER_TIME':
              await get().addPrayerTime(action.payload);
              break;
            // Add other action types as needed
          }
        } catch (error) {
          console.error('Retry failed:', error);
        }
      }
      
      // Clear successful actions
      set({ pendingActions: [] });
    },

    clearError: () => set({ error: null })
  })
);

// Community Store with optimistic UI and reconnect logic
interface CommunityState extends NetworkState {
  communityMembers: CommunityMember[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  getCommunityMembers: () => Promise<void>;
  addCommunityMember: (member: Omit<CommunityMember, 'id'>) => Promise<void>;
  updateCommunityMember: (id: number, member: Partial<CommunityMember>) => Promise<void>;
  deleteCommunityMember: (id: number) => Promise<void>;
  
  // Network handling
  setOnlineStatus: (isOnline: boolean) => void;
  retryPendingActions: () => Promise<void>;
  clearError: () => void;
}

export const useCommunityStore = create<CommunityState>(
  (set, get) => ({
    // State
    communityMembers: [],
    isLoading: false,
    error: null,
    isOnline: navigator.onLine,
    retryCount: 0,
    lastSyncTime: null,
    pendingActions: [],

    // Actions
    getCommunityMembers: async () => {
      set({ isLoading: true, error: null });
      
      try {
        const result = await dbService.getCommunityMembers();
        
        if (result.success && result.data) {
          set({ 
            communityMembers: result.data,
            lastSyncTime: new Date(),
            retryCount: 0
          });
        } else {
          set({ error: result.error || 'Failed to fetch community members' });
        }
      } catch (error) {
        set({ error: 'Network error - will retry when online' });
      } finally {
        set({ isLoading: false });
      }
    },

    addCommunityMember: async (member: Omit<CommunityMember, 'id'>) => {
      const tempId = Date.now();
      const optimisticMember: CommunityMember = { 
        ...member, 
        id: tempId,
        isActive: member.isActive ?? true
      };
      
      // Optimistic update
      set(state => ({ 
        communityMembers: [...state.communityMembers, optimisticMember] 
      }));

      try {
        const result = await dbService.addCommunityMember(member);
        
        if (result.success && result.data) {
          // Replace optimistic entry with real data
          set(state => ({
            communityMembers: state.communityMembers.map(cm => 
              cm.id === tempId ? result.data! : cm
            ),
            lastSyncTime: new Date()
          }));
        } else {
          throw new Error(result.error || 'Failed to add community member');
        }
      } catch (error) {
        // Revert optimistic update
        set(state => ({
          communityMembers: state.communityMembers.filter(cm => cm.id !== tempId),
          error: error.message,
          pendingActions: [...state.pendingActions, {
            type: 'ADD_COMMUNITY_MEMBER',
            payload: member,
            timestamp: new Date()
          }]
        }));
      }
    },

    updateCommunityMember: async (id: number, member: Partial<CommunityMember>) => {
      const previousState = get().communityMembers;
      
      // Optimistic update
      set(state => ({
        communityMembers: state.communityMembers.map(cm => 
          cm.id === id ? { ...cm, ...member } : cm
        )
      }));

      try {
        const result = await dbService.updateCommunityMember(id, member);
        
        if (result.success && result.data) {
          set(state => ({
            communityMembers: state.communityMembers.map(cm => 
              cm.id === id ? result.data! : cm
            ),
            lastSyncTime: new Date()
          }));
        } else {
          throw new Error(result.error || 'Failed to update community member');
        }
      } catch (error) {
        // Revert optimistic update
        set({ 
          communityMembers: previousState,
          error: error.message 
        });
      }
    },

    deleteCommunityMember: async (id: number) => {
      const previousState = get().communityMembers;
      
      // Optimistic update
      set(state => ({
        communityMembers: state.communityMembers.filter(cm => cm.id !== id)
      }));

      try {
        const result = await dbService.deleteCommunityMember(id);
        
        if (result.success) {
          set({ lastSyncTime: new Date() });
        } else {
          throw new Error(result.error || 'Failed to delete community member');
        }
      } catch (error) {
        // Revert optimistic update
        set({ 
          communityMembers: previousState,
          error: error.message 
        });
      }
    },

    // Network handling
    setOnlineStatus: (isOnline: boolean) => {
      set({ isOnline });
      if (isOnline) {
        get().retryPendingActions();
      }
    },

    retryPendingActions: async () => {
      const { pendingActions } = get();
      if (pendingActions.length === 0) return;

      set({ retryCount: get().retryCount + 1 });
      
      for (const action of pendingActions) {
        try {
          switch (action.type) {
            case 'ADD_COMMUNITY_MEMBER':
              await get().addCommunityMember(action.payload);
              break;
            // Add other action types as needed
          }
        } catch (error) {
          console.error('Retry failed:', error);
        }
      }
      
      // Clear successful actions
      set({ pendingActions: [] });
    },

    clearError: () => set({ error: null })
  })
);

// Announcements Store
interface AnnouncementState extends NetworkState {
  announcements: Announcement[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  getAnnouncements: (activeOnly?: boolean) => Promise<void>;
  addAnnouncement: (announcement: Omit<Announcement, 'id'>) => Promise<void>;
  updateAnnouncement: (id: number, announcement: Partial<Announcement>) => Promise<void>;
  deleteAnnouncement: (id: number) => Promise<void>;
  
  // Network handling
  setOnlineStatus: (isOnline: boolean) => void;
  retryPendingActions: () => Promise<void>;
  clearError: () => void;
}

export const useAnnouncementStore = create<AnnouncementState>(
  (set, get) => ({
    // State
    announcements: [],
    isLoading: false,
    error: null,
    isOnline: navigator.onLine,
    retryCount: 0,
    lastSyncTime: null,
    pendingActions: [],

    // Actions
    getAnnouncements: async (activeOnly?: boolean) => {
      set({ isLoading: true, error: null });
      
      try {
        const result = await dbService.getAnnouncements(activeOnly);
        
        if (result.success && result.data) {
          set({ 
            announcements: result.data,
            lastSyncTime: new Date(),
            retryCount: 0
          });
        } else {
          set({ error: result.error || 'Failed to fetch announcements' });
        }
      } catch (error) {
        set({ error: 'Network error - will retry when online' });
      } finally {
        set({ isLoading: false });
      }
    },

    addAnnouncement: async (announcement: Omit<Announcement, 'id'>) => {
      const tempId = Date.now();
      const optimisticAnnouncement: Announcement = { 
        ...announcement, 
        id: tempId,
        isActive: announcement.isActive ?? true
      };
      
      // Optimistic update
      set(state => ({ 
        announcements: [...state.announcements, optimisticAnnouncement] 
      }));

      try {
        const result = await dbService.addAnnouncement(announcement);
        
        if (result.success && result.data) {
          // Replace optimistic entry with real data
          set(state => ({
            announcements: state.announcements.map(a => 
              a.id === tempId ? result.data! : a
            ),
            lastSyncTime: new Date()
          }));
        } else {
          throw new Error(result.error || 'Failed to add announcement');
        }
      } catch (error) {
        // Revert optimistic update
        set(state => ({
          announcements: state.announcements.filter(a => a.id !== tempId),
          error: error.message,
          pendingActions: [...state.pendingActions, {
            type: 'ADD_ANNOUNCEMENT',
            payload: announcement,
            timestamp: new Date()
          }]
        }));
      }
    },

    updateAnnouncement: async (id: number, announcement: Partial<Announcement>) => {
      const previousState = get().announcements;
      
      // Optimistic update
      set(state => ({
        announcements: state.announcements.map(a => 
          a.id === id ? { ...a, ...announcement } : a
        )
      }));

      try {
        const result = await dbService.updateAnnouncement(id, announcement);
        
        if (result.success && result.data) {
          set(state => ({
            announcements: state.announcements.map(a => 
              a.id === id ? result.data! : a
            ),
            lastSyncTime: new Date()
          }));
        } else {
          throw new Error(result.error || 'Failed to update announcement');
        }
      } catch (error) {
        // Revert optimistic update
        set({ 
          announcements: previousState,
          error: error.message 
        });
      }
    },

    deleteAnnouncement: async (id: number) => {
      const previousState = get().announcements;
      
      // Optimistic update
      set(state => ({
        announcements: state.announcements.filter(a => a.id !== id)
      }));

      try {
        const result = await dbService.deleteAnnouncement(id);
        
        if (result.success) {
          set({ lastSyncTime: new Date() });
        } else {
          throw new Error(result.error || 'Failed to delete announcement');
        }
      } catch (error) {
        // Revert optimistic update
        set({ 
          announcements: previousState,
          error: error.message 
        });
      }
    },

    // Network handling
    setOnlineStatus: (isOnline: boolean) => {
      set({ isOnline });
      if (isOnline) {
        get().retryPendingActions();
      }
    },

    retryPendingActions: async () => {
      const { pendingActions } = get();
      if (pendingActions.length === 0) return;

      set({ retryCount: get().retryCount + 1 });
      
      for (const action of pendingActions) {
        try {
          switch (action.type) {
            case 'ADD_ANNOUNCEMENT':
              await get().addAnnouncement(action.payload);
              break;
            // Add other action types as needed
          }
        } catch (error) {
          console.error('Retry failed:', error);
        }
      }
      
      // Clear successful actions
      set({ pendingActions: [] });
    },

    clearError: () => set({ error: null })
  })
);

// Settings Store
interface SettingsState extends NetworkState {
  settings: AppSettings | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  getSettings: () => Promise<void>;
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;
  
  // Network handling
  setOnlineStatus: (isOnline: boolean) => void;
  retryPendingActions: () => Promise<void>;
  clearError: () => void;
}

export const useSettingsStore = create<SettingsState>(
  (set, get) => ({
    // State
    settings: null,
    isLoading: false,
    error: null,
    isOnline: navigator.onLine,
    retryCount: 0,
    lastSyncTime: null,
    pendingActions: [],

    // Actions
    getSettings: async () => {
      set({ isLoading: true, error: null });
      
      try {
        const result = await dbService.getSettings();
        
        if (result.success && result.data) {
          set({ 
            settings: result.data,
            lastSyncTime: new Date(),
            retryCount: 0
          });
        } else {
          set({ error: result.error || 'Failed to fetch settings' });
        }
      } catch (error) {
        set({ error: 'Network error - will retry when online' });
      } finally {
        set({ isLoading: false });
      }
    },

    updateSettings: async (settings: Partial<AppSettings>) => {
      const previousState = get().settings;
      
      // Optimistic update
      set(state => ({
        settings: state.settings ? { ...state.settings, ...settings } : null
      }));

      try {
        const result = await dbService.updateSettings(settings);
        
        if (result.success && result.data) {
          set({
            settings: result.data,
            lastSyncTime: new Date()
          });
        } else {
          throw new Error(result.error || 'Failed to update settings');
        }
      } catch (error) {
        // Revert optimistic update
        set({ 
          settings: previousState,
          error: error.message 
        });
      }
    },

    // Network handling
    setOnlineStatus: (isOnline: boolean) => {
      set({ isOnline });
      if (isOnline) {
        get().retryPendingActions();
      }
    },

    retryPendingActions: async () => {
      const { pendingActions } = get();
      if (pendingActions.length === 0) return;

      set({ retryCount: get().retryCount + 1 });
      
      for (const action of pendingActions) {
        try {
          switch (action.type) {
            case 'UPDATE_SETTINGS':
              await get().updateSettings(action.payload);
              break;
          }
        } catch (error) {
          console.error('Retry failed:', error);
        }
      }
      
      // Clear successful actions
      set({ pendingActions: [] });
    },

    clearError: () => set({ error: null })
  })
);

// At the end of the file, add a combined useAppStore export for compatibility
export const useAppStore = {
  usePrayerStore,
  useCommunityStore,
  useAnnouncementStore,
  useSettingsStore,
};
