import { BrowserWindow, ipcMain, screen } from 'electron';
import path from 'path';
import { isDevelopment } from '../constants';

let prayerWindow: BrowserWindow | null = null;

export function setupWindowHandlers() {
  ipcMain.handle('window:open-prayer-times', async () => {
    if (prayerWindow) {
      prayerWindow.focus();
      return;
    }

    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.workAreaSize;

    const windowOptions: Electron.BrowserWindowConstructorOptions = {
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
  });
}

export function closePrayerTimesWindow() {
  if (prayerWindow) {
    prayerWindow.close();
    prayerWindow = null;
  }
}
