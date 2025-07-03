import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useSettingsStore } from './store';
import { ThemeProvider } from '../ui';
import { AppShell } from './components/AppShell';
import { Dashboard } from './components/Dashboard';
import { PrayerTimes } from './components/PrayerTimes';
import { Announcements } from './components/Announcements';
import { Community } from './components/Community';
import { BackupSecurity } from './components/BackupSecurity';
import { Settings } from './components/Settings';

export const App: React.FC = () => {
  const theme = useSettingsStore((state) => state.settings?.displaySettings.theme || "light");

  return (
    <ThemeProvider>
      <div className={`app ${theme}`} style={{ 
        height: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        <AppShell>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/prayer-times" element={<PrayerTimes />} />
            <Route path="/announcements" element={<Announcements />} />
            <Route path="/community" element={<Community />} />
            <Route path="/backup-security" element={<BackupSecurity />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </AppShell>
      </div>
    </ThemeProvider>
  );
};
