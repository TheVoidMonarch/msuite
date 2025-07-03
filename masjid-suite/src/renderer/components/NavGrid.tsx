import React from 'react';
import { Card, CardBody, CardHeader, Heading, Button } from '../../ui';

interface NavAction {
  label: string;
  icon: string;
  description: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
}

interface NavGridProps {
  actions?: NavAction[];
  title?: string;
}

export const NavGrid: React.FC<NavGridProps> = ({
  title = "Quick Actions",
  actions = [
    {
      label: 'Prayer Management',
      icon: '🕌',
      description: 'Update prayer times and settings',
      onClick: () => console.log('Navigate to Prayer Management'),
      variant: 'primary'
    },
    {
      label: 'Announcements',
      icon: '📢',
      description: 'Create and manage announcements',
      onClick: () => console.log('Navigate to Announcements'),
      variant: 'secondary'
    },
    {
      label: 'Community',
      icon: '👥',
      description: 'Manage community members',
      onClick: () => console.log('Navigate to Community'),
      variant: 'outline'
    }
  ]
}) => {
  // Ensure only 3 actions are displayed
  const limitedActions = actions.slice(0, 3);

  return (
    <Card variant="elevated" padding="lg">
      <CardHeader>
        <Heading level={2} size="xl" color="primary">
          {title}
        </Heading>
      </CardHeader>
      <CardBody>
        <nav
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem',
            maxWidth: '100%'
          }}
          aria-label="Primary navigation actions"
        >
          {limitedActions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || 'primary'}
              onClick={action.onClick}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '120px',
                padding: '1.5rem',
                fontSize: '1rem',
                fontWeight: '500',
                textAlign: 'center',
                gap: '0.75rem',
                border: '2px solid transparent',
                transition: 'all 0.2s ease-in-out'
              }}
              aria-describedby={`action-description-${index}`}
            >
              <span 
                style={{ 
                  fontSize: '2rem', 
                  lineHeight: 1 
                }} 
                aria-hidden="true"
              >
                {action.icon}
              </span>
              <span style={{ lineHeight: 1.3 }}>
                {action.label}
              </span>
              <span
                id={`action-description-${index}`}
                style={{
                  fontSize: '0.75rem',
                  opacity: 0.8,
                  lineHeight: 1.2,
                  display: 'none'
                }}
              >
                {action.description}
              </span>
            </Button>
          ))}
        </nav>
        
        {/* Screen reader description for actions */}
        <div style={{ position: 'absolute', left: '-10000px', width: '1px', height: '1px', overflow: 'hidden' }}>
          {limitedActions.map((action, index) => (
            <div key={`sr-${index}`} id={`action-description-${index}`}>
              {action.description}
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
