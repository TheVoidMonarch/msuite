import React from 'react';
import { Card, CardBody, CardHeader, Heading, Button, TextInput } from '../../ui';

export const Announcements: React.FC = () => {
  const [showCreateForm, setShowCreateForm] = React.useState(false);

  const announcements = [
    {
      id: 1,
      title: 'Friday Prayer Schedule Update',
      content: 'Starting next week, Friday prayers will begin at 1:00 PM instead of 12:30 PM.',
      date: '2024-01-15',
      author: 'Imam Ahmad',
      priority: 'high'
    },
    {
      id: 2,
      title: 'Community Iftar Event',
      content: 'Join us for a community iftar on Saturday at 6:30 PM. Please bring a dish to share.',
      date: '2024-01-14',
      author: 'Community Board',
      priority: 'medium'
    },
    {
      id: 3,
      title: 'Islamic Studies Classes',
      content: 'New Islamic studies classes for children starting this Sunday. Registration is open.',
      date: '2024-01-13',
      author: 'Education Committee',
      priority: 'low'
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'var(--color-error)';
      case 'medium': return 'var(--color-warning)';
      case 'low': return 'var(--color-success)';
      default: return 'var(--color-text-secondary)';
    }
  };

  return (
    <div className="announcements">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <Heading level={1} size="4xl" color="primary">
          Announcements
        </Heading>
        <Button 
          variant="primary" 
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? 'Cancel' : 'Create Announcement'}
        </Button>
      </div>

      {showCreateForm && (
        <Card variant="elevated" padding="lg" style={{ marginBottom: '2rem' }}>
          <CardHeader>
            <Heading level={2} size="xl">Create New Announcement</Heading>
          </CardHeader>
          <CardBody>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <TextInput
                label="Title"
                placeholder="Enter announcement title"
                fullWidth
              />
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Content
                </label>
                <textarea
                  placeholder="Enter announcement content"
                  style={{
                    width: '100%',
                    minHeight: '120px',
                    padding: '0.75rem',
                    border: '2px solid var(--color-border)',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                  }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <TextInput
                  label="Priority"
                  placeholder="Select priority"
                  fullWidth
                />
                <TextInput
                  label="Author"
                  placeholder="Your name"
                  fullWidth
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <Button variant="primary">
                  Publish Announcement
                </Button>
                <Button variant="outline">
                  Save as Draft
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {announcements.map((announcement) => (
          <Card key={announcement.id} variant="elevated" padding="lg">
            <CardHeader>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                <Heading level={3} size="lg" style={{ margin: 0 }}>
                  {announcement.title}
                </Heading>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                  <span 
                    style={{ 
                      padding: '0.25rem 0.75rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      backgroundColor: getPriorityColor(announcement.priority),
                      color: 'white',
                      textTransform: 'uppercase'
                    }}
                  >
                    {announcement.priority}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardBody>
              <p style={{ 
                marginBottom: '1rem', 
                lineHeight: 1.6,
                color: 'var(--color-text-primary)'
              }}>
                {announcement.content}
              </p>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                fontSize: '0.875rem',
                color: 'var(--color-text-secondary)',
                borderTop: '1px solid var(--color-border)',
                paddingTop: '1rem'
              }}>
                <span>By {announcement.author}</span>
                <span>{new Date(announcement.date).toLocaleDateString()}</span>
              </div>
              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                <Button variant="outline" size="sm">
                  Edit
                </Button>
                <Button variant="outline" size="sm">
                  Archive
                </Button>
                <Button variant="outline" size="sm">
                  Delete
                </Button>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
};
