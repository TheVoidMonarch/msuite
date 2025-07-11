import { useState, useEffect } from 'react';
import { Activity } from '../types';

export const useActivities = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = async () => {
    try {
      setLoading(true);
      // This would be replaced with an actual API call
      const response = await fetch('/api/activities');
      const data = await response.json();
      setActivities(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  return { activities, loading, error, refresh };
};

export default useActivities;
