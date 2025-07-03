import React, { useEffect } from 'react';
import { Card, CardBody, CardHeader, Heading, Button, TextInput } from '../../ui';
import { openPrayerTimesWindow } from '../../utils/windowManager';

declare global {
  interface Window {
    electron: {
      openPrayerTimesWindow: () => Promise<void>;
    };
  }
}

export const PrayerTimes: React.FC = () => {
  const [editMode, setEditMode] = React.useState(false);
  
  const handleFullScreen = async () => {
    try {
      if (window.electron) {
        await window.electron.openPrayerTimesWindow();
      } else {
        // Fallback for development
        openPrayerTimesWindow();
      }
    } catch (error) {
      console.error('Error opening prayer times window:', error);
    }
  };
  
  const prayerTimes = [
    { name: 'Fajr', time: '05:30' },
    { name: 'Dhuhr', time: '12:45' },
    { name: 'Asr', time: '16:15' },
    { name: 'Maghrib', time: '18:30' },
    { name: 'Isha', time: '20:00' },
  ];

  return (
    <div className="prayer-times">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <Heading level={1} size="4xl" color="primary">
          Prayer Times
        </Heading>
        <div className="flex space-x-4">
          <Button 
            variant="outline"
            onClick={handleFullScreen}
            className="flex items-center space-x-2"
          >
            <span>Full Screen</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 9V7a1 1 0 011-1h4a1 1 0 110 2H7v2a1 1 0 11-2 0zm6-5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 110-2h3v-3a1 1 0 011-1zm14 0a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 110-2h3v-3a1 1 0 011-1zm-3 6a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 110-2h3v-3a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          </Button>
          <Button 
            variant={editMode ? 'outline' : 'primary'} 
            onClick={() => setEditMode(!editMode)}
          >
            {editMode ? 'Cancel' : 'Edit Times'}
          </Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        {prayerTimes.map((prayer) => (
          <Card key={prayer.name} variant="elevated" padding="lg">
            <CardHeader>
              <Heading level={3} size="lg" style={{ textAlign: 'center' }}>
                {prayer.name}
              </Heading>
            </CardHeader>
            <CardBody>
              <div style={{ textAlign: 'center' }}>
                {editMode ? (
                  <TextInput
                    label={`${prayer.name} time`}
                    value={prayer.time}
                    onChange={(e) => {
                      // TODO: Implement prayer time update
                      console.log('Prayer time updated:', e.target.value);
                    }}
                    style={{ fontSize: '1.5rem', textAlign: 'center' }}
                  />
                ) : (
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                    {prayer.time}
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <Card variant="elevated" padding="lg">
        <CardHeader>
          <Heading level={2} size="xl">Prayer Time Settings</Heading>
        </CardHeader>
        <CardBody>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <div>
              <TextInput
                label="Location"
                placeholder="Enter your location"
                description="Used for automatic prayer time calculation"
                fullWidth
              />
            </div>
            <div>
              <TextInput
                label="Calculation Method"
                placeholder="Select calculation method"
                description="Different methods for prayer time calculation"
                fullWidth
              />
            </div>
            <div>
              <TextInput
                label="Timezone"
                placeholder="Select timezone"
                description="Your local timezone"
                fullWidth
              />
            </div>
          </div>
          
          <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
            <Button variant="primary">
              Calculate Automatically
            </Button>
            <Button variant="outline">
              Save Manual Times
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
