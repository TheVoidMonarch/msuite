import React from 'react';
import { useSettingsStore } from '../store';
import { Button, Card, CardBody, CardHeader, Heading, TextInput, Dialog, DialogBody, DialogFooter, useTheme } from '../../ui';
import { PrayerCountdown } from './PrayerCountdown';
import { StatusIndicators } from './StatusIndicators';
import { NavGrid } from './NavGrid';

export const Dashboard: React.FC = () => {
  const theme = useSettingsStore((state) => state.settings?.displaySettings.theme || "light");
  const toggleTheme = () => {};
  const { toggleHighContrast, highContrast } = useTheme();
  const [showDialog, setShowDialog] = React.useState(false);
  const [inputValue, setInputValue] = React.useState('');

  return (
    <div className="dashboard">
      <Heading level={1} size="4xl" color="primary" style={{ marginBottom: '2rem' }}>
        Dashboard
      </Heading>
      
      <div className="welcome-section" style={{ marginBottom: '3rem' }}>
        <Heading level={2} size="2xl" style={{ marginBottom: '1rem' }}>
          Welcome to Masjid Suite
        </Heading>
        <p style={{ fontSize: '1.125rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
          A comprehensive Islamic management system built with modern web technologies and accessibility in mind.
        </p>
      </div>
      
      {/* Main Dashboard Grid */}
      <div className="dashboard-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
        gap: '2rem',
        marginBottom: '3rem'
      }}>
        {/* Prayer Countdown Component */}
        <PrayerCountdown />
        
        {/* Status Indicators Component */}
        <StatusIndicators />
        
        {/* Navigation Grid Component */}
        <NavGrid />
      </div>
      
      <Card variant="elevated" padding="lg" style={{ marginBottom: '2rem' }}>
        <CardHeader>
          <Heading level={2} size="xl">Design System Demo</Heading>
        </CardHeader>
        <CardBody>
          <div style={{ marginBottom: '2rem' }}>
            <TextInput
              label="Try our accessible input"
              placeholder="Type something here..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              description="This input supports all accessibility features including screen readers"
              clearable
              onClear={() => setInputValue('')}
              fullWidth
            />
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Button variant="primary" onClick={toggleTheme}>
              Switch to {theme === 'light' ? 'Dark' : 'Light'} Theme
            </Button>
            
            <Button variant="outline" onClick={toggleHighContrast}>
              {highContrast ? 'Disable' : 'Enable'} High Contrast
            </Button>
            
            <Button variant="secondary" onClick={() => setShowDialog(true)}>
              Open Example Dialog
            </Button>
          </div>
        </CardBody>
      </Card>
      
      <Dialog
        open={showDialog}
        onClose={() => setShowDialog(false)}
        title="Accessible Dialog Example"
        description="This dialog demonstrates our accessible component with focus management and ARIA attributes."
        size="md"
      >
        <DialogBody>
          <p style={{ marginBottom: '1rem' }}>
            This dialog includes proper focus trapping, escape key handling, and backdrop click to close.
            It also respects the user's motion preferences and high contrast settings.
          </p>
          <TextInput
            label="Dialog Input Example"
            placeholder="Focus is properly managed"
            description="Tab through the dialog to see focus management in action"
          />
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowDialog(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => setShowDialog(false)}>
            Confirm
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
};
