import React, { useState, useRef, ChangeEvent } from 'react';
import { Card, CardBody, CardHeader, Heading, Button, TextInput, TextArea } from '../../ui';
import './EventManagement.css';

interface EventData {
  title: string;
  date: string;
  time: string;
  venue: string;
  guestOfHonor: string;
  description: string;
  backgroundImage: string | null;
}

export const EventManagement: React.FC = () => {
  const [eventData, setEventData] = useState<EventData>({
    title: '',
    date: '',
    time: '',
    venue: '',
    guestOfHonor: '',
    description: '',
    backgroundImage: null,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEventData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setEventData(prev => ({
        ...prev,
        backgroundImage: base64String
      }));
      setPreviewUrl(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Here you would typically send the data to your backend
      console.log('Submitting event data:', eventData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reset form after successful submission
      setEventData({
        title: '',
        date: '',
        time: '',
        venue: '',
        guestOfHonor: '',
        description: '',
        backgroundImage: null,
      });
      setPreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      alert('Event created successfully!');
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Failed to create event. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="event-management">
      <Card variant="elevated" padding="lg">
        <CardHeader>
          <Heading level={1} size="xl">Create New Event</Heading>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} className="event-form">
            <div className="form-section">
              <h2 className="section-title">Event Details</h2>
              
              <div className="form-group">
                <label htmlFor="title">Event Title</label>
                <TextInput
                  id="title"
                  name="title"
                  value={eventData.title}
                  onChange={handleInputChange}
                  placeholder="Enter event title"
                  required
                  fullWidth
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="date">Date</label>
                  <TextInput
                    id="date"
                    name="date"
                    type="date"
                    value={eventData.date}
                    onChange={handleInputChange}
                    required
                    fullWidth
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="time">Time</label>
                  <TextInput
                    id="time"
                    name="time"
                    type="time"
                    value={eventData.time}
                    onChange={handleInputChange}
                    required
                    fullWidth
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="venue">Venue</label>
                <TextInput
                  id="venue"
                  name="venue"
                  value={eventData.venue}
                  onChange={handleInputChange}
                  placeholder="Enter venue"
                  required
                  fullWidth
                />
              </div>

              <div className="form-group">
                <label htmlFor="guestOfHonor">Guest of Honor</label>
                <TextInput
                  id="guestOfHonor"
                  name="guestOfHonor"
                  value={eventData.guestOfHonor}
                  onChange={handleInputChange}
                  placeholder="Enter guest of honor"
                  fullWidth
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Event Description</label>
                <TextArea
                  id="description"
                  name="description"
                  value={eventData.description}
                  onChange={handleInputChange}
                  placeholder="Enter event description"
                  rows={4}
                  fullWidth
                />
              </div>
            </div>

            <div className="form-section">
              <h2 className="section-title">Background Image</h2>
              <div className="image-upload-container">
                <input
                  type="file"
                  id="backgroundImage"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="file-input"
                />
                <label htmlFor="backgroundImage" className="upload-button">
                  {previewUrl ? 'Change Image' : 'Upload Background Image'}
                </label>
                
                {previewUrl && (
                  <div className="image-preview">
                    <img src={previewUrl} alt="Event background preview" />
                    <button 
                      type="button" 
                      className="remove-image"
                      onClick={() => {
                        setPreviewUrl(null);
                        setEventData(prev => ({ ...prev, backgroundImage: null }));
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                    >
                      Remove
                    </button>
                  </div>
                )}
                
                {!previewUrl && (
                  <div className="upload-hint">
                    <p>Recommended size: 1920x1080px</p>
                    <p>Formats: JPG, PNG, or GIF</p>
                  </div>
                )}
              </div>
            </div>

            <div className="form-actions">
              <Button 
                type="submit" 
                variant="primary"
                disabled={isLoading}
              >
                {isLoading ? 'Creating Event...' : 'Create Event'}
              </Button>
              
              <Button 
                type="button" 
                variant="outline"
                onClick={() => {
                  // Reset form
                  setEventData({
                    title: '',
                    date: '',
                    time: '',
                    venue: '',
                    guestOfHonor: '',
                    description: '',
                    backgroundImage: null,
                  });
                  setPreviewUrl(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                disabled={isLoading}
              >
                Clear Form
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      {/* Preview Section - This would be shown in a separate window in the actual app */}
      {previewUrl && (
        <div className="preview-section">
          <h2>Preview</h2>
          <div className="preview-container" style={{ backgroundImage: `url(${previewUrl})` }}>
            <div className="preview-overlay">
              <div className="preview-content">
                <h1>{eventData.title || 'Event Title'}</h1>
                <div className="event-details">
                  {eventData.date && (
                    <p><strong>Date:</strong> {new Date(eventData.date).toLocaleDateString()}</p>
                  )}
                  {eventData.time && <p><strong>Time:</strong> {eventData.time}</p>}
                  {eventData.venue && <p><strong>Venue:</strong> {eventData.venue}</p>}
                  {eventData.guestOfHonor && (
                    <p><strong>Guest of Honor:</strong> {eventData.guestOfHonor}</p>
                  )}
                </div>
                {eventData.description && (
                  <div className="event-description">
                    <p>{eventData.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventManagement;
