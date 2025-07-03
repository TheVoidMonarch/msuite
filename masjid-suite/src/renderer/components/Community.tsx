import React from 'react';
import { Card, CardBody, CardHeader, Heading, Button, TextInput } from '../../ui';

export const Community: React.FC = () => {
  const [showAddForm, setShowAddForm] = React.useState(false);

  const members = [
    {
      id: 1,
      name: 'Ahmed Ibrahim',
      role: 'Imam',
      phone: '+1 (555) 123-4567',
      email: 'ahmed@masjid.org',
      joinDate: '2020-01-15'
    },
    {
      id: 2,
      name: 'Fatima Al-Rashid',
      role: 'Community Coordinator',
      phone: '+1 (555) 234-5678',
      email: 'fatima@masjid.org',
      joinDate: '2021-03-22'
    },
    {
      id: 3,
      name: 'Omar Hassan',
      role: 'Youth Leader',
      phone: '+1 (555) 345-6789',
      email: 'omar@masjid.org',
      joinDate: '2022-06-10'
    }
  ];

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'imam': return 'var(--color-primary)';
      case 'community coordinator': return 'var(--color-success)';
      case 'youth leader': return 'var(--color-warning)';
      default: return 'var(--color-text-secondary)';
    }
  };

  return (
    <div className="community">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <Heading level={1} size="4xl" color="primary">
          Community Members
        </Heading>
        <Button 
          variant="primary" 
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? 'Cancel' : 'Add Member'}
        </Button>
      </div>

      {showAddForm && (
        <Card variant="elevated" padding="lg" style={{ marginBottom: '2rem' }}>
          <CardHeader>
            <Heading level={2} size="xl">Add New Member</Heading>
          </CardHeader>
          <CardBody>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              <TextInput
                label="Full Name"
                placeholder="Enter member's full name"
                fullWidth
              />
              <TextInput
                label="Role"
                placeholder="Enter member's role"
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
                label="Address"
                placeholder="Enter address"
                fullWidth
              />
              <TextInput
                label="Emergency Contact"
                placeholder="Enter emergency contact"
                fullWidth
              />
            </div>
            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
              <Button variant="primary">
                Add Member
              </Button>
              <Button variant="outline">
                Save as Draft
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      <div style={{ marginBottom: '2rem' }}>
        <Card variant="elevated" padding="lg">
          <CardHeader>
            <Heading level={2} size="xl">Community Statistics</Heading>
          </CardHeader>
          <CardBody>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                  {members.length}
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                  Total Members
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--color-success)' }}>
                  12
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                  Active This Month
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--color-warning)' }}>
                  5
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                  New This Month
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--color-info)' }}>
                  8
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                  Volunteers
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {members.map((member) => (
          <Card key={member.id} variant="elevated" padding="lg">
            <CardHeader>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                <div>
                  <Heading level={3} size="lg" style={{ margin: 0, marginBottom: '0.5rem' }}>
                    {member.name}
                  </Heading>
                  <span 
                    style={{ 
                      padding: '0.25rem 0.75rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      backgroundColor: getRoleColor(member.role),
                      color: 'white'
                    }}
                  >
                    {member.role}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                  <Button variant="outline" size="sm">
                    Contact
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardBody>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                    Phone
                  </div>
                  <div style={{ color: 'var(--color-text-secondary)' }}>
                    {member.phone}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                    Email
                  </div>
                  <div style={{ color: 'var(--color-text-secondary)' }}>
                    {member.email}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                    Member Since
                  </div>
                  <div style={{ color: 'var(--color-text-secondary)' }}>
                    {new Date(member.joinDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <Button variant="outline">
          Export Member List
        </Button>
        <Button variant="outline">
          Send Group Email
        </Button>
        <Button variant="outline">
          Print Directory
        </Button>
      </div>
    </div>
  );
};
