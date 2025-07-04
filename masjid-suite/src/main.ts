import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { setupWindowHandlers } from './main/windowManager';
import DatabaseManager from './main/db';

// Initialize database manager
const dbManager = new DatabaseManager();

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  try {
    // Set up window handlers
    setupWindowHandlers();
    
    // Create the main window
    createWindow();
    
    // Auto-update functionality can be implemented here
    // Consider using electron-updater or a similar solution in the future
  } catch (error) {
    console.error('Failed to start application:', error);
    app.quit();
  }
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

async function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // and load the index.html of the app.
  if (process.env.NODE_ENV === 'development') {
    await mainWindow.loadURL('http://localhost:3000');
  } else {
    await mainWindow.loadFile(
      path.join(__dirname, '../renderer/index.html')
    );
  }

  // Open the DevTools in development mode.
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
}

// Handle any uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
});
