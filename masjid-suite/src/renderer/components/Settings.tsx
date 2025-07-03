import React from 'react';
import { Card, CardBody, CardHeader, Heading, Button, TextInput, useTheme } from '../../ui';
import { useSettingsStore } from "../store";

export const Settings: React.FC = () => {
  const theme = useSettingsStore((state) => state.settings?.displaySettings.theme || "light");
  const toggleTheme = () => {};
  const { toggleHighContrast, highContrast } = useTheme();

  return (
    <div className="settings">
      <Heading level={1} size="4xl" color="primary" style={{ marginBottom: '2rem' }}>
        Settings
      </Heading>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Appearance Settings */}
        <Card variant="elevated" padding="lg">
          <CardHeader>
            <Heading level={2} size="xl">Appearance</Heading>
          </CardHeader>
          <CardBody>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
              <div>
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Theme</strong>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', margin: '0.5rem 0' }}>
                    Choose between light and dark themes
                  </p>
                </div>
                <Button 
                  variant={theme === 'light' ? 'primary' : 'outline'}
                  onClick={theme === 'dark' ? toggleTheme : undefined}
                  style={{ marginRight: '0.5rem' }}
                >
                  Light
                </Button>
                <Button 
                  variant={theme === 'dark' ? 'primary' : 'outline'}
                  onClick={theme === 'light' ? toggleTheme : undefined}
                >
                  Dark
                </Button>
              </div>
              
              <div>
                <div style={{ marginBottom: '1rem' }}>
                  <strong>High Contrast</strong>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', margin: '0.5rem 0' }}>
                    Increase contrast for better visibility
                  </p>
                </div>
                <Button 
                  variant={highContrast ? 'primary' : 'outline'}
                  onClick={toggleHighContrast}
                >
                  {highContrast ? 'Enabled' : 'Disabled'}
                </Button>
              </div>

              <div>
                <TextInput
                  label="Font Size"
                  placeholder="18px"
                  description="Base font size for the application"
                  fullWidth
                />
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Language & Region */}
        <Card variant="elevated" padding="lg">
          <CardHeader>
            <Heading level={2} size="xl">Language & Region</Heading>
          </CardHeader>
          <CardBody>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
              <TextInput
                label="Language"
                placeholder="English"
                description="Application language"
                fullWidth
              />
              <TextInput
                label="Country/Region"
                placeholder="United States"
                description="Used for regional settings"
                fullWidth
              />
              <TextInput
                label="Date Format"
                placeholder="MM/DD/YYYY"
                description="How dates are displayed"
                fullWidth
              />
              <TextInput
                label="Time Format"
                placeholder="12-hour"
                description="12-hour or 24-hour format"
                fullWidth
              />
            </div>
          </CardBody>
        </Card>

        {/* Masjid Information */}
        <Card variant="elevated" padding="lg">
          <CardHeader>
            <Heading level={2} size="xl">Masjid Information</Heading>
          </CardHeader>
          <CardBody>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
              <TextInput
                label="Masjid Name"
                placeholder="Enter masjid name"
                fullWidth
              />
              <TextInput
                label="Address"
                placeholder="Enter complete address"
                fullWidth
              />
              <TextInput
                label="Phone Number"
                placeholder="Enter phone number"
                type="tel"
                fullWidth
              />
              <TextInput
                label="Email Address"
                placeholder="Enter email address"
                type="email"
                fullWidth
              />
              <TextInput
                label="Website"
                placeholder="Enter website URL"
                type="url"
                fullWidth
              />
              <TextInput
                label="Imam Name"
                placeholder="Enter imam's name"
                fullWidth
              />
            </div>
          </CardBody>
        </Card>

        {/* Prayer Settings */}
        <Card variant="elevated" padding="lg">
          <CardHeader>
            <Heading level={2} size="xl">Prayer Settings</Heading>
          </CardHeader>
          <CardBody>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
              <TextInput
                label="Calculation Method"
                placeholder="Islamic Society of North America (ISNA)"
                description="Method used for calculating prayer times"
                fullWidth
              />
              <TextInput
                label="Juristic Method"
                placeholder="Standard (Shafi, Maliki, Hanbali)"
                description="Juristic method for Asr prayer"
                fullWidth
              />
              <TextInput
                label="Higher Latitudes"
                placeholder="None"
                description="Adjustment for higher latitudes"
                fullWidth
              />
              <TextInput
                label="Fajr Angle"
                placeholder="15°"
                description="Angle below horizon for Fajr"
                fullWidth
              />
              <TextInput
                label="Isha Angle"
                placeholder="15°"
                description="Angle below horizon for Isha"
                fullWidth
              />
              <TextInput
                label="Time Zone Offset"
                placeholder="Auto"
                description="Manual timezone offset if needed"
                fullWidth
              />
            </div>
          </CardBody>
        </Card>

        {/* Notification Settings */}
        <Card variant="elevated" padding="lg">
          <CardHeader>
            <Heading level={2} size="xl">Notifications</Heading>
          </CardHeader>
          <CardBody>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
              <div>
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Prayer Time Notifications</strong>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', margin: '0.5rem 0' }}>
                    Get notified before prayer times
                  </p>
                </div>
                <Button variant="primary" style={{ marginRight: '0.5rem' }}>
                  Enabled
                </Button>
                <Button variant="outline">
                  Disabled
                </Button>
              </div>

              <div>
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Announcement Notifications</strong>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', margin: '0.5rem 0' }}>
                    Get notified of new announcements
                  </p>
                </div>
                <Button variant="primary" style={{ marginRight: '0.5rem' }}>
                  Enabled
                </Button>
                <Button variant="outline">
                  Disabled
                </Button>
              </div>

              <TextInput
                label="Notification Sound"
                placeholder="Default"
                description="Sound to play for notifications"
                fullWidth
              />
              
              <TextInput
                label="Notification Time (minutes before)"
                placeholder="15"
                type="number"
                description="How many minutes before prayer time to notify"
                fullWidth
              />
            </div>
          </CardBody>
        </Card>

        {/* Data Management */}
        <Card variant="elevated" padding="lg">
          <CardHeader>
            <Heading level={2} size="xl">Data Management</Heading>
          </CardHeader>
          <CardBody>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
                Manage your application data and settings
              </p>
              
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <Button variant="outline">
                  Export All Data
                </Button>
                <Button variant="outline">
                  Import Data
                </Button>
                <Button variant="outline">
                  Reset Settings
                </Button>
                <Button variant="outline" style={{ color: 'var(--color-error)' }}>
                  Clear All Data
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Save Settings */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <Button variant="outline">
            Reset All Settings
          </Button>
          <Button variant="primary">
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
};
