// Type definitions for the Electron API exposed via contextBridge

declare namespace ElectronAPI {
  interface WindowsAPI {
    openPrayerTimesWindow: () => Promise<void>;
  }

  interface ElectronAPI {
    // Add other API methods here as needed
    windows: WindowsAPI;
  }
}

declare global {
  interface Window {
    electronAPI: ElectronAPI.ElectronAPI;
  }
}

export {};
