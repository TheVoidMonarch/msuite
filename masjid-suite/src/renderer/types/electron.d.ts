import { ElectronAPI } from '../../preload';

declare global {
  interface Window {
    electronAPI: ElectronAPI & {
      windows: {
        openPrayerTimesWindow: () => Promise<void>;
      };
    };
  }
}

export {};
