import React from 'react';
import { useSettingsStore } from '../store';
import { Button, Card, CardBody, CardHeader, Heading, TextInput, Dialog, DialogBody, DialogFooter, DialogHeader, useTheme } from '../../ui';

export const Home: React.FC = () => {
  const theme = useSettingsStore((state) => state.settings?.displaySettings.theme || "light");
  const toggleTheme = () => {};
  const { toggleHighContrast, highContrast } = useTheme();
  const [showDialog, setShowDialog] = React.useState(false);
  const [inputValue, setInputValue] = React.useState('');

  return (
    <div className="home">
      <Heading level={1} size="5xl" color="primary">
        Welcome to Masjid Suite
      </Heading>
      <p>
        A comprehensive Islamic management system built with modern web technologies and accessibility in mind.
      </p>
      
      <div className="features">
        <Heading level={2} size="2xl" style={{ marginBottom: '1rem' }}>
          Design System Features
        </Heading>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', margin: '2rem 0' }}>
          <Card variant="elevated" padding="lg">
            <CardHeader>
              <Heading level={3} size="lg">Accessibility First</Heading>
            </CardHeader>
            <CardBody>
              <p>✅ ARIA attributes, focus management, and screen reader support</p>
              <p>✅ High contrast mode and prefers-contrast media query</p>
              <p>✅ Minimum 60px button height and 120px width</p>
            </CardBody>
          </Card>
          
          <Card variant="elevated" padding="lg">
            <CardHeader>
              <Heading level={3} size="lg">Design Tokens</Heading>
            </CardHeader>
            <CardBody>
              <p>✅ Comprehensive color palette with semantic colors</p>
              <p>✅ Typography scale with 18px root font size</p>
              <p>✅ Consistent spacing and border radius system</p>
            </CardBody>
          </Card>
          
          <Card variant="elevated" padding="lg">
            <CardHeader>
              <Heading level={3} size="lg">UI Components</Heading>
            </CardHeader>
            <CardBody>
              <p>✅ Button, Heading, Card, Dialog, TextInput</p>
              <p>✅ Focus rings and large hit-boxes</p>
              <p>✅ Loading states and interactive feedback</p>
            </CardBody>
          </Card>
        </div>
        
        <div style={{ marginTop: '2rem' }}>
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
      </div>
      
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '2rem' }}>
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
