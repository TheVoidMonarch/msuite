import React from 'react';
import { Card, CardBody, CardHeader, Heading } from '../../ui';

interface StatusItem {
  label: string;
  status: 'connected' | 'disconnected' | 'warning' | 'error';
  message: string;
  icon: string;
}

interface StatusIndicatorsProps {
  items?: StatusItem[];
}

export const StatusIndicators: React.FC<StatusIndicatorsProps> = ({
  items = [
    {
      label: 'Database',
      status: 'connected',
      message: 'Connected',
      icon: '🟢'
    },
    {
      label: 'Backup',
      status: 'connected',
      message: 'Up to date',
      icon: '🟢'
    },
    {
      label: 'Security',
      status: 'connected',
      message: 'Secure',
      icon: '🟢'
    }
  ]
}) => {
  const getStatusColor = (status: StatusItem['status']) => {
    switch (status) {
      case 'connected':
        return 'var(--color-success)';
      case 'warning':
        return 'var(--color-warning)';
      case 'error':
        return 'var(--color-error)';
      case 'disconnected':
        return 'var(--color-error)';
      default:
        return 'var(--color-text-secondary)';
    }
  };

  const getStatusIcon = (status: StatusItem['status']) => {
    switch (status) {
      case 'connected':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      case 'disconnected':
        return '❌';
      default:
        return '❓';
    }
  };

  return (
    <Card variant="elevated" padding="lg">
      <CardHeader>
        <Heading level={2} size="xl" color="primary">
          System Status
        </Heading>
      </CardHeader>
      <CardBody>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {items.map((item, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.75rem',
                borderRadius: '8px',
                backgroundColor: 'var(--color-surface-secondary)',
                border: '1px solid var(--color-border)'
              }}
              role="status"
              aria-label={`${item.label}: ${item.message}`}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.2rem' }} aria-hidden="true">
                  {getStatusIcon(item.status)}
                </span>
                <span style={{ fontWeight: '500' }}>
                  {item.label}:
                </span>
              </div>
              <span
                style={{
                  color: getStatusColor(item.status),
                  fontWeight: '500',
                  fontSize: '0.875rem'
                }}
              >
                {item.message}
              </span>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
