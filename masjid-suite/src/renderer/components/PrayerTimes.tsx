import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader, Heading, Button, TextInput } from '../../ui';
import './PrayerTimes.css';

// Type assertion for the window object
const customWindow = window as unknown as Window & {
  __electronAPI?: {
    windows?: {
      openPrayerTimesWindow: () => Promise<void>;
    };
  };
};

type PrayerTime = {
  name: string;
  key: string;
  time: string;
};

export const PrayerTimes: React.FC = () => {
  const [editMode, setEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);
  const [prayerTimes, setPrayerTimes] = useState<Record<string, string>>({
    fajr: '05:30',
    sunrise: '06:45',
    dhuhr: '12:30',
    asr: '15:45',
    maghrib: '18:30',
    isha: '20:00',
  });

  // Settings state
  const [settings, setSettings] = useState({
    location: '',
    calculationMethod: 'MWL', // Muslim World League
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    latitude: 0,
    longitude: 0,
  });

  // Available calculation methods
  const calculationMethods = [
    { value: 'MWL', label: 'Muslim World League' },
    { value: 'ISNA', label: 'Islamic Society of North America' },
    { value: 'Egypt', label: 'Egyptian General Authority of Survey' },
    { value: 'Makkah', label: 'Umm Al-Qura University, Makkah' },
    { value: 'Karachi', label: 'University of Islamic Sciences, Karachi' },
    { value: 'Tehran', label: 'Institute of Geophysics, University of Tehran' },
    { value: 'Jafari', label: 'Shia Ithna-Ashari, Leva Research Institute, Qum' },
  ];

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setSettings(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }));
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);

  // Format time to HH:MM
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  // Calculate prayer times based on location and date
  const calculatePrayerTimes = async () => {
    try {
      setIsCalculating(true);
      // This is a simplified calculation. In a real app, you would use a library like Adhan
      const now = new Date();
      
      // Simulate API call to calculate prayer times
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          const times = {
            fajr: formatTime(new Date(now.getTime() - 3 * 60 * 60 * 1000)), // 3 hours before sunrise
            sunrise: formatTime(new Date(now.getTime() - 2 * 60 * 60 * 1000)), // 2 hours before noon
            dhuhr: formatTime(new Date(now.getTime() + 30 * 60 * 1000)), // 30 minutes from now
            asr: formatTime(new Date(now.getTime() + 3 * 60 * 60 * 1000)), // 3 hours after noon
            maghrib: formatTime(new Date(now.getTime() + 6 * 60 * 60 * 1000)), // 6 hours after noon
            isha: formatTime(new Date(now.getTime() + 7 * 60 * 60 * 1000)), // 7 hours after noon
          };
          
          setPrayerTimes(times);
          resolve();
        }, 1000); // Simulate network delay
      });
    } catch (error) {
      console.error('Error calculating prayer times:', error);
      throw error;
    } finally {
      setIsCalculating(false);
    }
  };

  // Update prayer times when settings change
  useEffect(() => {
    const initPrayerTimes = async () => {
      if (settings.latitude !== 0 && settings.longitude !== 0) {
        try {
          await calculatePrayerTimes();
        } catch (error) {
          console.error('Failed to initialize prayer times:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    initPrayerTimes();
  }, [settings.latitude, settings.longitude, settings.calculationMethod]);

  const prayerTimeList: PrayerTime[] = [
    { name: 'Fajr', key: 'fajr', time: prayerTimes.fajr },
    { name: 'Sunrise', key: 'sunrise', time: prayerTimes.sunrise },
    { name: 'Dhuhr', key: 'dhuhr', time: prayerTimes.dhuhr },
    { name: 'Asr', key: 'asr', time: prayerTimes.asr },
    { name: 'Maghrib', key: 'maghrib', time: prayerTimes.maghrib },
    { name: 'Isha', key: 'isha', time: prayerTimes.isha },
  ];
  
  const handleFullScreen = async () => {
    try {
      setIsLoading(true);
      if (customWindow.__electronAPI?.windows?.openPrayerTimesWindow) {
        await customWindow.__electronAPI.windows.openPrayerTimesWindow();
      } else {
        console.warn('Electron API not available. Running in browser mode.');
        window.open('/prayer-display', '_blank');
      }
    } catch (error) {
      console.error('Error opening prayer times window:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrayerTimeChange = (prayerKey: string, time: string) => {
    setPrayerTimes(prev => ({
      ...prev,
      [prayerKey]: time
    }));
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      // TODO: Implement save to database using electronAPI
      console.log('Saving prayer times:', prayerTimes);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setEditMode(false);
    } catch (error) {
      console.error('Error saving prayer times:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettingsChange = (key: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleCalculateAutomatically = async () => {
    try {
      await calculatePrayerTimes();
    } catch (error) {
      console.error('Failed to calculate prayer times:', error);
    }
  };

  return (
    <div className="prayer-times">
      <div className="header-container">
        <Heading level={1} size="4xl" color="primary">
          Prayer Times
        </Heading>
        <div className="actions-container">
          <Button 
            variant="outline"
            onClick={handleFullScreen}
            disabled={isLoading || isCalculating}
            className="flex items-center"
          >
            <span>{isLoading ? 'Opening...' : 'Full Screen'}</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 9V7a1 1 0 011-1h4a1 1 0 110 2H7v2a1 1 0 11-2 0zm6-5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 110-2h3v-3a1 1 0 011-1zm14 0a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 110-2h3v-3a1 1 0 011-1zm-3 6a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 110-2h3v-3a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          </Button>
          <Button 
            variant={editMode ? 'outline' : 'primary'} 
            onClick={() => setEditMode(!editMode)}
            disabled={isLoading || isCalculating}
          >
            {editMode ? 'Cancel' : 'Edit Times'}
          </Button>
          {editMode && (
            <Button 
              variant="primary"
              onClick={handleSave}
              disabled={isLoading || isCalculating}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="loading-container">
          <div>Loading prayer times...</div>
        </div>
      ) : (
        <div className="prayer-grid">
          {prayerTimeList.map((prayer) => (
            <Card key={prayer.key} variant="elevated" padding="lg">
              <CardHeader>
                <Heading level={3} size="lg" className="text-center">
                  {prayer.name}
                </Heading>
              </CardHeader>
              <CardBody>
                <div className="text-center">
                  {editMode ? (
                    <div className="time-input-container">
                      <label className="time-label">
                        {prayer.name} time
                      </label>
                      <input
                        type="time"
                        value={prayer.time}
                        onChange={(e) => {
                          handlePrayerTimeChange(prayer.key, e.target.value);
                        }}
                        className="time-input"
                      />
                    </div>
                  ) : (
                    <div className="time-display">
                      {prayer.time}
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      <Card variant="elevated" padding="lg">
        <CardHeader>
          <Heading level={2} size="xl">Prayer Time Settings</Heading>
        </CardHeader>
        <CardBody>
          <div className="settings-grid">
            <div>
              <TextInput
                label="Location"
                placeholder="Enter your city"
                value={settings.location}
                onChange={(e) => handleSettingsChange('location', e.target.value)}
                description="Used for automatic prayer time calculation"
                fullWidth
              />
            </div>
            <div className="select-container">
              <label className="select-label">
                Calculation Method
              </label>
              <select
                value={settings.calculationMethod}
                onChange={(e) => handleSettingsChange('calculationMethod', e.target.value)}
                className="select-input"
                disabled={isLoading || isCalculating}
              >
                {calculationMethods.map(method => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </select>
              <p className="select-description">
                Different methods for prayer time calculation
              </p>
            </div>
            <div>
              <TextInput
                label="Timezone"
                value={settings.timezone}
                onChange={(e) => handleSettingsChange('timezone', e.target.value)}
                description="Your local timezone"
                fullWidth
                readOnly
              />
            </div>
          </div>
          
          <div className="settings-actions">
            <Button 
              variant="primary"
              onClick={handleCalculateAutomatically}
              disabled={isLoading || isCalculating}
            >
              {isCalculating ? 'Calculating...' : 'Calculate Automatically'}
            </Button>
            <Button 
              variant="outline"
              onClick={() => setEditMode(true)}
              disabled={isLoading || isCalculating}
            >
              Edit Times Manually
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
