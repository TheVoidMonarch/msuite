import React from 'react';
import { render, screen } from '../../../../src/test-utils';
import { DashboardPage } from '../DashboardPage';
import '@testing-library/jest-dom';
import { Activity } from '../../types';

// Mock the useActivities hook
const mockActivities: Activity[] = [
  { 
    id: 1, 
    action: 'New member registered', 
    timestamp: new Date().toISOString(),
    userId: 1,
    userName: 'Test User',
    entityType: 'Member',
    entityId: 1,
  },
  { 
    id: 2, 
    action: 'Prayer time updated', 
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    userId: 1,
    userName: 'Test User',
    entityType: 'PrayerTime',
    entityId: 1,
  },
];

jest.mock('../../hooks/useActivities', () => ({
  __esModule: true,
  default: () => ({
    activities: mockActivities,
    loading: false,
    error: null,
    refresh: jest.fn(),
  }),
}));

// Mock the PrayerTimePlayer component
jest.mock('../../components/PrayerTimePlayer', () => ({
  PrayerTimePlayer: () => <div data-testid="prayer-time-player">Prayer Time Player</div>,
}));

describe('DashboardPage', () => {
  beforeEach(() => {
    // Mock the current date
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-07-04T12:00:00'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders the dashboard with all sections', () => {
    render(<DashboardPage />);
    
    // Check for main sections
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByTestId('prayer-time-player')).toBeInTheDocument();
    
    // Check for section headings
    expect(screen.getByText('Recent Activities')).toBeInTheDocument();
    
    // Check for stat cards
    expect(screen.getByText('Total Members')).toBeInTheDocument();
    expect(screen.getByText("Today's Attendance")).toBeInTheDocument();
    expect(screen.getAllByText('Upcoming Events').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Monthly Donations')).toBeInTheDocument();
  });

  it('displays the current date', () => {
    render(<DashboardPage />);
    
    // Check if the current date is displayed in the expected format
    const dateElement = screen.getByText(/Friday, 4 July 2025/);
    expect(dateElement).toBeInTheDocument();
  });

  it('shows recent activities', () => {
    render(<DashboardPage />);
    
    // Check for activity section using a more flexible query
    const activitiesSection = screen.getByText('Recent Activities').closest('section, div');
    expect(activitiesSection).toBeInTheDocument();
    
    // Check for activity items - look for activity content in the section
    if (activitiesSection) {
      const activityItems = activitiesSection.querySelectorAll('[class*="activity"], [data-testid*="activity"]');
      expect(activityItems.length).toBeGreaterThan(0);
    }
  });

  it('displays upcoming events', () => {
    render(<DashboardPage />);
    
    // Check for sample events
    expect(screen.getByText("Weekly Tafseer Class")).toBeInTheDocument();
    expect(screen.getByText("Jumu'ah Prayer")).toBeInTheDocument();
    expect(screen.getByText('Community Iftar')).toBeInTheDocument();
  });
});
