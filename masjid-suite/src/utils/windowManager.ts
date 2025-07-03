import { BrowserWindow, BrowserWindowConstructorOptions } from 'electron';
import path from 'path';

const isDevelopment = process.env.NODE_ENV === 'development';

let prayerWindow: BrowserWindow | null = null;

export async function openPrayerTimesWindow() {
  if (prayerWindow) {
    prayerWindow.focus();
    return prayerWindow;
  }

  const { screen } = require('electron');
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  const windowOptions: BrowserWindowConstructorOptions = {
    width,
    height,
    x: 0,
    y: 0,
    frame: false,
    fullscreen: true,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      // enableRemoteModule is no longer needed in newer Electron versions
      // as remote is enabled by default when contextIsolation is false
    },
    backgroundColor: '#1e1b4b',
    show: false,
  };

  prayerWindow = new BrowserWindow(windowOptions);

  // Load the app in the window
  if (isDevelopment) {
    await prayerWindow.loadURL('http://localhost:3000/prayer-display');
    prayerWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    await prayerWindow.loadFile(
      path.join(__dirname, '../renderer/index.html'),
      { hash: '/prayer-display' }
    );
  }

  // Show window when ready to prevent flickering
  prayerWindow.once('ready-to-show', () => {
    if (prayerWindow) {
      prayerWindow.show();
    }
  });

  // Clean up on window close
  prayerWindow.on('closed', () => {
    prayerWindow = null;
  });

  return prayerWindow;
}

export function closePrayerTimesWindow() {
  if (prayerWindow) {
    prayerWindow.close();
    prayerWindow = null;
  }
}

export function togglePrayerTimesWindow() {
  if (prayerWindow) {
    closePrayerTimesWindow();
  } else {
    openPrayerTimesWindow();
  }
}
