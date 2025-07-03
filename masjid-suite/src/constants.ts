// Environment constants
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProduction = process.env.NODE_ENV === 'production';

// App constants
export const APP_NAME = 'Masjid Suite';
export const APP_VERSION = '1.0.0';

// Database constants
export const DB_NAME = 'masjid-suite-db';
export const DB_VERSION = 1;

// Prayer times constants
export const PRAYER_TIMES_CALCULATION_METHOD = 'Makkah';
export const PRAYER_TIMES_ADJUSTMENTS = {
  fajr: 0,
  sunrise: 0,
  dhuhr: 0,
  asr: 0,
  maghrib: 0,
  isha: 0,
};

// Default location (Kuala Lumpur, Malaysia)
export const DEFAULT_LOCATION = {
  latitude: 3.1390,
  longitude: 101.6869,
  city: 'Kuala Lumpur',
  country: 'Malaysia',
  timezone: 'Asia/Kuala_Lumpur',
};

// UI constants
export const THEME_COLORS = {
  primary: '#1e40af',
  secondary: '#1e3a8a',
  success: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
  light: '#f3f4f6',
  dark: '#1f2937',
};

// API endpoints (if any)
export const API_ENDPOINTS = {
  PRAYER_TIMES: 'https://api.aladhan.com/v1/timings',
  GEOLOCATION: 'https://geolocation-db.com/json/',
};

// Window names
export const WINDOW_NAMES = {
  MAIN: 'main',
  PRAYER_TIMES: 'prayer-times',
};
