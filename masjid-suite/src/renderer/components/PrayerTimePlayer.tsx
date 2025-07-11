import React, { useState, useEffect, useRef } from 'react';
import { Card, CardBody, CardHeader, Heading, Button } from '../../ui';
import './PrayerTimePlayer.css';

type PrayerTime = {
  name: string;
  time: string;
  audioFile?: string;
};

interface PrayerTimePlayerProps {
  prayerTimes: PrayerTime[];
  onPrayerTimeReached?: (prayer: string) => void;
  isMuted?: boolean;
}

export const PrayerTimePlayer: React.FC<PrayerTimePlayerProps> = ({
  prayerTimes = [],
  onPrayerTimeReached,
  isMuted: initialMuted = false,
}) => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [nextPrayer, setNextPrayer] = useState<PrayerTime | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(initialMuted);
  const [currentPrayer, setCurrentPrayer] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<number | null>(null);

  // Default Azan audio files (can be overridden by prayerTimes)
  const defaultAudioFiles: Record<string, string> = {
    Fajr: '/sounds/azan-fajr.mp3',
    Dhuhr: '/sounds/azan.mp3',
    Asr: '/sounds/azan.mp3',
    Maghrib: '/sounds/azan.mp3',
    Isha: '/sounds/azan.mp3',
  };

  // Format time as HH:MM
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  // Parse time string (HH:MM) to Date object
  const parseTime = (timeStr: string): Date => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  // Calculate time until next prayer
  const updateNextPrayer = () => {
    const now = new Date();
    setCurrentTime(now);
    
    // Add audio files to prayer times if not provided
    const prayerTimesWithAudio = prayerTimes.map(prayer => ({
      ...prayer,
      audioFile: prayer.audioFile || defaultAudioFiles[prayer.name] || '/sounds/azan.mp3'
    }));

    // Sort prayer times by time of day
    const sortedPrayers = [...prayerTimesWithAudio].sort((a, b) => {
      return parseTime(a.time).getTime() - parseTime(b.time).getTime();
    });

    // Find the next prayer
    let nextPrayerFound = null;
    for (const prayer of sortedPrayers) {
      const prayerTime = parseTime(prayer.time);
      if (prayerTime > now) {
        nextPrayerFound = prayer;
        break;
      }
    }

    // If no next prayer found, use first prayer of next day
    if (!nextPrayerFound && sortedPrayers.length > 0) {
      nextPrayerFound = { ...sortedPrayers[0] };
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const [hours, minutes] = nextPrayerFound.time.split(':').map(Number);
      tomorrow.setHours(hours, minutes, 0, 0);
      
      // @ts-ignore - We're adding a temporary property
      nextPrayerFound.timeObj = tomorrow;
    } else if (nextPrayerFound) {
      // @ts-ignore - We're adding a temporary property
      nextPrayerFound.timeObj = parseTime(nextPrayerFound.time);
    }

    setNextPrayer(nextPrayerFound);

    // Check if any prayer time is now
    for (const prayer of prayerTimesWithAudio) {
      const prayerTime = parseTime(prayer.time);
      const diff = Math.abs(now.getTime() - prayerTime.getTime());
      
      // If current time is within 30 seconds of prayer time
      if (diff < 30000) { // 30 seconds window
        if (currentPrayer !== prayer.name) {
          setCurrentPrayer(prayer.name);
          if (!isMuted) {
            playAzan(prayer.audioFile || defaultAudioFiles[prayer.name] || '/sounds/azan.mp3');
          }
          onPrayerTimeReached?.(prayer.name);
        }
        break;
      }
    }
  };

  // Play Azan audio
  const playAzan = (audioSrc: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
    } else {
      audioRef.current = new Audio();
    }

    audioRef.current.src = audioSrc;
    audioRef.current.volume = isMuted ? 0 : 1;
    
    const playPromise = audioRef.current.play();
    
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
        })
        .catch(error => {
          console.error('Error playing Azan:', error);
          setIsPlaying(false);
        });
    }

    // When audio ends
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentPrayer(null);
    };

    audioRef.current.addEventListener('ended', handleEnded);
    
    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('ended', handleEnded);
      }
    };
  };

  // Stop Azan
  const stopAzan = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setCurrentPrayer(null);
    }
  };

  // Toggle mute
  const toggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    
    if (audioRef.current) {
      audioRef.current.volume = newMutedState ? 0 : 1;
    }
    
    // If we're unmuting during prayer time, play the Azan
    if (newMutedState === false && currentPrayer) {
      const prayer = prayerTimes.find(p => p.name === currentPrayer);
      if (prayer) {
        playAzan(prayer.audioFile || defaultAudioFiles[prayer.name] || '/sounds/azan.mp3');
      }
    }
    
    // If we're muting, stop the Azan
    if (newMutedState === true) {
      stopAzan();
    }
  };

  // Update time remaining until next prayer
  useEffect(() => {
    if (nextPrayer) {
      // @ts-ignore - We added timeObj to nextPrayer
      const prayerTime = nextPrayer.timeObj || parseTime(nextPrayer.time);
      const now = new Date();
      
      let diff = prayerTime.getTime() - now.getTime();
      
      // If the time is negative, it means the prayer is tomorrow
      if (diff < 0) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        
        const [hours, minutes] = nextPrayer.time.split(':').map(Number);
        tomorrow.setHours(hours, minutes, 0, 0);
        
        diff = tomorrow.getTime() - now.getTime();
      }
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      setTimeRemaining(`${hours}h ${minutes}m`);
    }
  }, [currentTime, nextPrayer]);

  // Set up timer to update current time and check prayer times
  useEffect(() => {
    updateNextPrayer();
    
    // Update every second
    timerRef.current = window.setInterval(() => {
      updateNextPrayer();
    }, 1000);
    
    // Clean up interval on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [prayerTimes]);

  // Handle mute state changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : 1;
    }
  }, [isMuted]);

  return (
    <Card className="prayer-time-player">
      <CardHeader>
        <div className="player-header">
          <Heading level={2} size="lg">Prayer Times</Heading>
          <Button 
            variant="ghost" 
            onClick={toggleMute}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
            className="mute-button"
          >
            {isMuted ? (
              <span role="img" aria-label="Muted">🔇</span>
            ) : (
              <span role="img" aria-label="Unmuted">🔊</span>
            )}
          </Button>
        </div>
      </CardHeader>
      
      <CardBody>
        <div className="player-content">
          {currentPrayer ? (
            <div className="current-prayer">
              <div className="current-prayer-label">Now Playing:</div>
              <div className="current-prayer-name">{currentPrayer} Azan</div>
              <Button 
                variant="danger" 
                onClick={stopAzan}
                className="stop-button"
              >
                Stop
              </Button>
            </div>
          ) : nextPrayer ? (
            <div className="next-prayer">
              <div className="next-prayer-label">Next Prayer:</div>
              <div className="next-prayer-name">{nextPrayer.name}</div>
              <div className="next-prayer-time">{nextPrayer.time}</div>
              <div className="time-remaining">in {timeRemaining}</div>
            </div>
          ) : (
            <div className="no-prayer">
              No prayer times available
            </div>
          )}
          
          <div className="prayer-times-list">
            {prayerTimes.map((prayer, index) => (
              <div 
                key={index} 
                className={`prayer-time-item ${currentPrayer === prayer.name ? 'active' : ''}`}
              >
                <span className="prayer-name">{prayer.name}</span>
                <span className="prayer-time">{prayer.time}</span>
              </div>
            ))}
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default PrayerTimePlayer;
