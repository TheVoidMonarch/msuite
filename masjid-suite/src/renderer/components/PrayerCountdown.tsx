import React, { useEffect, useState } from 'react';
import { Card, CardBody, CardHeader, Heading } from '../../ui';

interface PrayerTime {
  name: string;
  time: string;
}

interface PrayerCountdownProps {
  prayerTimes?: PrayerTime[];
}

export const PrayerCountdown: React.FC<PrayerCountdownProps> = ({ 
  prayerTimes = [
    { name: 'Fajr', time: '05:30' },
    { name: 'Dhuhr', time: '12:45' },
    { name: 'Asr', time: '16:15' },
    { name: 'Maghrib', time: '18:30' },
    { name: 'Isha', time: '20:00' },
  ]
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [nextPrayer, setNextPrayer] = useState<{ name: string; timeRemaining: string } | null>(null);
  const [lastAnnouncement, setLastAnnouncement] = useState<string>('');

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      
      // Find next prayer time
      const todayPrayers = prayerTimes.map(prayer => {
        const [hours, minutes] = prayer.time.split(':').map(Number);
        const prayerTime = new Date(now);
        prayerTime.setHours(hours, minutes, 0, 0);
        
        // If prayer time has passed today, set it for tomorrow
        if (prayerTime <= now) {
          prayerTime.setDate(prayerTime.getDate() + 1);
        }
        
        return {
          name: prayer.name,
          time: prayerTime,
          timeRemaining: prayerTime.getTime() - now.getTime()
        };
      });

      // Find the prayer with the shortest time remaining
      const upcoming = todayPrayers.reduce((nearest, current) => 
        current.timeRemaining < nearest.timeRemaining ? current : nearest
      );

      // Calculate hours, minutes, and seconds remaining
      const hoursRemaining = Math.floor(upcoming.timeRemaining / (1000 * 60 * 60));
      const minutesRemaining = Math.floor((upcoming.timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
      const secondsRemaining = Math.floor((upcoming.timeRemaining % (1000 * 60)) / 1000);

      const timeRemainingStr = `${hoursRemaining.toString().padStart(2, '0')}:${minutesRemaining.toString().padStart(2, '0')}:${secondsRemaining.toString().padStart(2, '0')}`;

      setNextPrayer({
        name: upcoming.name,
        timeRemaining: timeRemainingStr
      });

      // Announce upcoming prayer for screen readers (only when less than 5 minutes)
      if (minutesRemaining < 5 && hoursRemaining === 0) {
        const announcement = `${upcoming.name} prayer in ${minutesRemaining} minutes and ${secondsRemaining} seconds`;
        if (announcement !== lastAnnouncement) {
          setLastAnnouncement(announcement);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [prayerTimes, lastAnnouncement]);

  return (
    <Card variant="elevated" padding="lg" style={{ textAlign: 'center' }}>
      <CardHeader>
        <Heading level={2} size="xl" color="primary">
          Next Prayer
        </Heading>
      </CardHeader>
      <CardBody>
        {nextPrayer && (
          <div>
            <div style={{ marginBottom: '1rem' }}>
              <Heading level={3} size="lg" style={{ marginBottom: '0.5rem' }}>
                {nextPrayer.name}
              </Heading>
            </div>
            <div
              style={{
                fontSize: '48px',
                fontWeight: 'bold',
                color: 'var(--color-primary)',
                letterSpacing: '2px',
                fontFamily: 'monospace',
                marginBottom: '1rem'
              }}
              aria-label={`Time remaining until ${nextPrayer.name} prayer: ${nextPrayer.timeRemaining}`}
            >
              {nextPrayer.timeRemaining}
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
              Current time: {currentTime.toLocaleTimeString()}
            </div>
          </div>
        )}
        
        {/* Screen reader announcement area */}
        <div 
          aria-live="polite" 
          aria-atomic="true"
          style={{ 
            position: 'absolute', 
            left: '-10000px',
            width: '1px',
            height: '1px',
            overflow: 'hidden'
          }}
        >
          {lastAnnouncement}
        </div>
      </CardBody>
    </Card>
  );
};
