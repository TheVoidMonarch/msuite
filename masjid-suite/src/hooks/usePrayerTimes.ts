import { useState, useEffect, useCallback } from 'react';
import { prayerTimeService } from '../services/prayer/prayerTimeService';
import { PrayerTimeRecord } from '../services/prayer/prayerTimeService';
import { format, isSameDay } from 'date-fns';

export function usePrayerTimes(date: Date = new Date()) {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimeRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadPrayerTimes = useCallback(async (targetDate: Date) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const dateStr = format(targetDate, 'yyyy-MM-dd');
      const times = await prayerTimeService.getPrayerTimes(targetDate);
      
      // Only update if we're still interested in this date
      if (dateStr === format(targetDate, 'yyyy-MM-dd')) {
        setPrayerTimes(times);
      }
    } catch (err) {
      console.error('Error loading prayer times:', err);
      setError(err instanceof Error ? err : new Error('Failed to load prayer times'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load prayer times when date changes
  useEffect(() => {
    loadPrayerTimes(date);
    
    // Also preload next day's times in the background
    const tomorrow = new Date(date);
    tomorrow.setDate(tomorrow.getDate() + 1);
    prayerTimeService.getPrayerTimes(tomorrow).catch(console.error);
    
  }, [date, loadPrayerTimes]);

  // Function to refresh the prayer times
  const refresh = useCallback(() => {
    return loadPrayerTimes(date);
  }, [date, loadPrayerTimes]);

  return {
    prayerTimes,
    isLoading,
    error,
    refresh,
  };
}

export function usePrayerTimesRange(startDate: Date, endDate: Date) {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimeRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const loadPrayerTimes = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const times = await prayerTimeService.getPrayerTimesRange(startDate, endDate);
        
        if (isMounted) {
          setPrayerTimes(times);
        }
      } catch (err) {
        console.error('Error loading prayer times range:', err);
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to load prayer times'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    loadPrayerTimes();
    
    return () => {
      isMounted = false;
    };
  }, [startDate, endDate]);

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const times = await prayerTimeService.getPrayerTimesRange(startDate, endDate);
      setPrayerTimes(times);
      return times;
    } catch (err) {
      console.error('Error refreshing prayer times:', err);
      setError(err instanceof Error ? err : new Error('Failed to refresh prayer times'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate]);

  return {
    prayerTimes,
    isLoading,
    error,
    refresh,
  };
}
