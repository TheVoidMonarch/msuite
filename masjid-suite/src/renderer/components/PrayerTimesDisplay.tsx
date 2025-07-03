import React, { useEffect, useState } from 'react';
import { format, addDays, isSameDay, parseISO } from 'date-fns';
import { Card, CardBody, CardHeader, Heading, Button } from '../../ui';

// Temporary type until we fix the hook import
type PrayerTimeRecord = {
  date: string;
  times: {
    fajr: string;
    sunrise: string;
    dhuhr: string;
    asr: string;
    maghrib: string;
    isha: string;
  };
  hijriDate: string;
  location: string;
  calculationMethod: string;
  lastUpdated: string;
};

// Temporary mock hook until we fix the import
const usePrayerTimes = (date: Date) => {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimeRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadPrayerTimes = async () => {
      try {
        setIsLoading(true);
        // Mock data for now
        const mockTimes: PrayerTimeRecord = {
          date: format(date, 'yyyy-MM-dd'),
          times: {
            fajr: '05:30',
            sunrise: '07:00',
            dhuhr: '13:15',
            asr: '16:30',
            maghrib: '19:30',
            isha: '20:45',
          },
          hijriDate: '1445-01-01',
          location: 'Kuala Lumpur, Malaysia',
          calculationMethod: 'Makkah',
          lastUpdated: new Date().toISOString(),
        };
        
        setPrayerTimes(mockTimes);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load prayer times'));
      } finally {
        setIsLoading(false);
      }
    };

    loadPrayerTimes();
  }, [date]);

  return { prayerTimes, isLoading, error };
};

interface PrayerTimesDisplayProps {
  onClose?: () => void;
  isFullScreen?: boolean;
}

export const PrayerTimesDisplay: React.FC<PrayerTimesDisplayProps> = ({ 
  onClose, 
  isFullScreen = false 
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { prayerTimes, isLoading, error } = usePrayerTimes(currentDate);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [nextPrayer, setNextPrayer] = useState<{ name: string; time: string; timeRemaining: string } | null>(null);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Calculate next prayer
  useEffect(() => {
    if (!prayerTimes) return;

    const prayers = [
      { name: 'Fajr', time: prayerTimes.times.fajr },
      { name: 'Sunrise', time: prayerTimes.times.sunrise },
      { name: 'Dhuhr', time: prayerTimes.times.dhuhr },
      { name: 'Asr', time: prayerTimes.times.asr },
      { name: 'Maghrib', time: prayerTimes.times.maghrib },
      { name: 'Isha', time: prayerTimes.times.isha },
    ];

    const now = currentTime;
    const currentTimeStr = format(now, 'HH:mm');
    
    // Find the next prayer
    let nextPrayerFound = false;
    let nextPrayerInfo = null;
    let isNextDay = false;
    
    for (const prayer of prayers) {
      if (prayer.time > currentTimeStr) {
        nextPrayerFound = true;
        nextPrayerInfo = prayer;
        break;
      }
    }

    // If no more prayers today, use first prayer of next day
    if (!nextPrayerFound && prayers.length > 0) {
      nextPrayerInfo = prayers[0];
      isNextDay = true;
    }

    if (nextPrayerInfo) {
      const [hours, minutes] = nextPrayerInfo.time.split(':').map(Number);
      const prayerTime = new Date(now);
      prayerTime.setHours(hours, minutes, 0, 0);
      
      // If the prayer time is for tomorrow, add a day
      if (isNextDay) {
        prayerTime.setDate(prayerTime.getDate() + 1);
      }
      
      const diffMs = prayerTime.getTime() - now.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const hoursRemaining = Math.floor(diffMins / 60);
      const minutesRemaining = diffMins % 60;
      
      setNextPrayer({
        name: nextPrayerInfo.name,
        time: nextPrayerInfo.time,
        timeRemaining: `${hoursRemaining}h ${minutesRemaining}m`
      });
    }
  }, [prayerTimes, currentTime]);

  const getTimeRemainingString = () => {
    if (!nextPrayer) return '';
    return `Next: ${nextPrayer.name} in ${nextPrayer.timeRemaining}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="text-2xl font-bold mb-4">Loading prayer times...</div>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-300 rounded w-48 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-red-50">
        <div className="text-center p-6 bg-white rounded-lg shadow-lg">
          <div className="text-red-500 text-2xl font-bold mb-4">Error</div>
          <div className="text-gray-700 mb-4">{error.message}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!prayerTimes) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-700">No prayer times available</div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isFullScreen ? 'h-screen w-screen' : 'h-full w-full'} bg-gradient-to-br from-blue-900 to-indigo-900 text-white p-6 overflow-hidden`}>
      {/* Header with date and location */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold">Prayer Times</h1>
          <div className="text-xl opacity-80">
            {format(currentDate, 'EEEE, MMMM d, yyyy')}
          </div>
          <div className="text-lg opacity-70">
            {prayerTimes.location}
          </div>
        </div>
        <div className="text-right">
          <div className="text-5xl font-mono font-bold">
            {format(currentTime, 'h:mm')}
            <span className="text-3xl opacity-70">{format(currentTime, 'a')}</span>
          </div>
          <div className="text-lg opacity-80">
            {nextPrayer && (
              <span>
                {nextPrayer.name} at {nextPrayer.time} • {nextPrayer.timeRemaining}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Prayer times grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {[
          { name: 'Fajr', time: prayerTimes.times.fajr, icon: '🌅' },
          { name: 'Sunrise', time: prayerTimes.times.sunrise, icon: '☀️' },
          { name: 'Dhuhr', time: prayerTimes.times.dhuhr, icon: '🕌' },
          { name: 'Asr', time: prayerTimes.times.asr, icon: '🕋' },
          { name: 'Maghrib', time: prayerTimes.times.maghrib, icon: '🌇' },
          { name: 'Isha', time: prayerTimes.times.isha, icon: '🌙' },
        ].map((prayer) => {
          const isCurrent = nextPrayer?.name === prayer.name;
          return (
            <div 
              key={prayer.name}
              className={`p-6 rounded-2xl transition-all duration-300 ${
                isCurrent 
                  ? 'bg-white text-blue-900 transform scale-105 shadow-2xl' 
                  : 'bg-white bg-opacity-10 hover:bg-opacity-20'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-4xl mb-2">{prayer.icon}</div>
                  <div className="text-2xl font-bold">{prayer.name}</div>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-mono font-bold">
                    {prayer.time}
                  </div>
                  {isCurrent && (
                    <div className="text-sm font-medium mt-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full inline-block">
                      Next Prayer
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Hijri date and controls */}
      <div className="fixed bottom-0 left-0 right-0 bg-black bg-opacity-30 p-4 flex justify-between items-center">
        <div className="text-lg opacity-80">
          {prayerTimes.hijriDate || 'Hijri date loading...'}
        </div>
        <div className="flex space-x-4">
          <button 
            onClick={() => setCurrentDate(addDays(currentDate, -1))}
            className="px-4 py-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
          >
            Previous Day
          </button>
          <button 
            onClick={() => setCurrentDate(new Date())}
            className="px-4 py-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
          >
            Today
          </button>
          <button 
            onClick={() => setCurrentDate(addDays(currentDate, 1))}
            className="px-4 py-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
          >
            Next Day
          </button>
          {onClose && (
            <button 
              onClick={onClose}
              className="px-4 py-2 bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
            >
              Exit Full Screen
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrayerTimesDisplay;
