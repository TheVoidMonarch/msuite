import React from 'react';
import { Card, CardBody, CardHeader, Heading, Button, TextInput } from '../../ui';

export const BackupSecurity: React.FC = () => {
  const [backupInProgress, setBackupInProgress] = React.useState(false);

  const handleBackup = () => {
    setBackupInProgress(true);
    // Simulate backup process
    setTimeout(() => {
      setBackupInProgress(false);
    }, 3000);
  };

  return (
    <div className="backup-security">
      <Heading level={1} size="4xl" color="primary" style={{ marginBottom: '2rem' }}>
        Backup & Security
      </Heading>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
        
        {/* Backup Section */}
        <Card variant="elevated" padding="lg">
          <CardHeader>
            <Heading level={2} size="xl">Data Backup</Heading>
          </CardHeader>
          <CardBody>
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span>Last Backup:</span>
                <span style={{ fontWeight: '500', color: 'var(--color-success)' }}>
                  Today, 3:00 AM
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span>Backup Size:</span>
                <span style={{ fontWeight: '500' }}>245 MB</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span>Auto Backup:</span>
                <span style={{ fontWeight: '500', color: 'var(--color-success)' }}>
                  ✅ Enabled (Daily)
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Button 
                variant="primary" 
                fullWidth 
                onClick={handleBackup}
                disabled={backupInProgress}
              >
                {backupInProgress ? 'Creating Backup...' : 'Create Manual Backup'}
              </Button>
              <Button variant="outline" fullWidth>
                Restore from Backup
              </Button>
              <Button variant="outline" fullWidth>
                Configure Auto Backup
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Security Section */}
        <Card variant="elevated" padding="lg">
          <CardHeader>
            <Heading level={2} size="xl">Security Settings</Heading>
          </CardHeader>
          <CardBody>
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span>Encryption:</span>
                <span style={{ fontWeight: '500', color: 'var(--color-success)' }}>
                  ✅ AES-256 Enabled
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span>Database Lock:</span>
                <span style={{ fontWeight: '500', color: 'var(--color-success)' }}>
                  ✅ Protected
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span>Access Logs:</span>
                <span style={{ fontWeight: '500', color: 'var(--color-success)' }}>
                  ✅ Active
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Button variant="primary" fullWidth>
                Change Master Password
              </Button>
              <Button variant="outline" fullWidth>
                View Access Logs
              </Button>
              <Button variant="outline" fullWidth>
                Export Security Report
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Backup History */}
      <Card variant="elevated" padding="lg" style={{ marginBottom: '2rem' }}>
        <CardHeader>
          <Heading level={2} size="xl">Recent Backups</Heading>
        </CardHeader>
        <CardBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { date: '2024-01-15 03:00', size: '245 MB', type: 'Automatic', status: 'Success' },
              { date: '2024-01-14 03:00', size: '243 MB', type: 'Automatic', status: 'Success' },
              { date: '2024-01-13 15:30', size: '241 MB', type: 'Manual', status: 'Success' },
              { date: '2024-01-13 03:00', size: '240 MB', type: 'Automatic', status: 'Success' },
              { date: '2024-01-12 03:00', size: '238 MB', type: 'Automatic', status: 'Success' },
            ].map((backup, index) => (
              <div 
                key={index}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 100px 100px 80px 80px',
                  gap: '1rem',
                  padding: '1rem',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>
                    {backup.date}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                    {backup.type} Backup
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  {backup.size}
                </div>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ 
                    color: backup.status === 'Success' ? 'var(--color-success)' : 'var(--color-error)',
                    fontWeight: '500'
                  }}>
                    {backup.status}
                  </span>
                </div>
                <Button variant="outline" size="sm">
                  Download
                </Button>
                <Button variant="outline" size="sm">
                  Restore
                </Button>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Security Settings Form */}
      <Card variant="elevated" padding="lg">
        <CardHeader>
          <Heading level={2} size="xl">Advanced Security Configuration</Heading>
        </CardHeader>
        <CardBody>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <div>
              <TextInput
                label="Backup Encryption Password"
                type="password"
                placeholder="Enter encryption password"
                description="Used to encrypt backup files"
                fullWidth
              />
            </div>
            <div>
              <TextInput
                label="Backup Retention (Days)"
                type="number"
                placeholder="30"
                description="How long to keep backup files"
                fullWidth
              />
            </div>
            <div>
              <TextInput
                label="Auto Backup Schedule"
                placeholder="Daily at 3:00 AM"
                description="When to perform automatic backups"
                fullWidth
              />
            </div>
            <div>
              <TextInput
                label="Backup Location"
                placeholder="Local storage"
                description="Where to store backup files"
                fullWidth
              />
            </div>
          </div>

          <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
            <Button variant="primary">
              Save Security Settings
            </Button>
            <Button variant="outline">
              Reset to Defaults
            </Button>
            <Button variant="outline">
              Test Backup System
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
