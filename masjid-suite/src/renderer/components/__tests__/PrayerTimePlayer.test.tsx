import React from 'react';
import { render, screen, act, waitFor } from '../../../../src/test-utils';
import { PrayerTimePlayer } from '../PrayerTimePlayer';
import '@testing-library/jest-dom';

// Mock the audio element
const mockPlay = jest.fn().mockResolvedValue(undefined);
const mockPause = jest.fn();

Object.defineProperty(window.HTMLMediaElement.prototype, 'play', {
  configurable: true,
  value: mockPlay,
});

Object.defineProperty(window.HTMLMediaElement.prototype, 'pause', {
  configurable: true,
  value: mockPause,
});

describe('PrayerTimePlayer', () => {
  const mockPrayerTimes = [
    { name: 'Fajr', time: '05:30' },
    { name: 'Dhuhr', time: '13:15' },
    { name: 'Asr', time: '16:30' },
    { name: 'Maghrib', time: '19:20' },
    { name: 'Isha', time: '20:30' },
  ];

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-07-04T12:00:00')); // Set to before Dhuhr
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<PrayerTimePlayer prayerTimes={mockPrayerTimes} />);
    expect(screen.getByText('Prayer Times')).toBeInTheDocument();
  });

  it('displays the next prayer correctly', () => {
    render(<PrayerTimePlayer prayerTimes={mockPrayerTimes} />);
    // Find the next prayer section and verify its content
    const nextPrayerSection = screen.getByText('Next Prayer:').closest('.next-prayer');
    expect(nextPrayerSection).toHaveTextContent('Dhuhr');
    expect(nextPrayerSection).toHaveTextContent('13:15');
  });

  it('shows countdown to next prayer', () => {
    render(<PrayerTimePlayer prayerTimes={mockPrayerTimes} />);
    expect(screen.getByText(/in 1h 15m/)).toBeInTheDocument();
  });

  it('highlights the current prayer when it is time', () => {
    // Set time to Dhuhr
    jest.setSystemTime(new Date('2025-07-04T13:15:00'));
    render(<PrayerTimePlayer prayerTimes={mockPrayerTimes} />);
    
    const dhuhrElement = screen.getByText('Dhuhr').closest('div');
    expect(dhuhrElement).toHaveClass('active');
  });

  it('plays audio when prayer time is reached', async () => {
    // Mock the current time to be just before Dhuhr
    const now = new Date();
    now.setHours(13, 14, 59); // 1:14:59 PM
    
    // Mock the Date object
    const mockDate = new Date(now);
    const realDate = Date;
    
    // Create a mock Date class
    class MockDate extends realDate {
      constructor() {
        super();
        return mockDate;
      }
    }
    
    // @ts-ignore - Overriding global Date
    global.Date = MockDate as DateConstructor;

    render(<PrayerTimePlayer prayerTimes={mockPrayerTimes} />);
    
    // Fast-forward time by 1 second to trigger the prayer time
    mockDate.setSeconds(mockDate.getSeconds() + 1);
    
    // Wrap the timer advancement in act
    await act(async () => {
      jest.advanceTimersByTime(1000);
      // Wait for any pending promises to resolve
      await Promise.resolve();
    });
    
    // Check if play was called
    await waitFor(() => {
      expect(mockPlay).toHaveBeenCalled();
    });
    
    // Restore the original Date object
    global.Date = realDate;
  });
});
