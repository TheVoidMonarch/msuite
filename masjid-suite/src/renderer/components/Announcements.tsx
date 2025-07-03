import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { 
  Card, 
  CardHeader, 
  CardBody,
  Heading, 
  Button, 
  TextInput,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter
} from '../../ui';
import { Announcement, DbResult } from '../../types';
import { format, parseISO } from 'date-fns';
import { Plus, Edit, Trash2, X } from 'react-feather';

// Simple toast notification function
const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  const toast = document.createElement('div');
  toast.style.position = 'fixed';
  toast.style.bottom = '20px';
  toast.style.right = '20px';
  toast.style.padding = '12px 24px';
  toast.style.borderRadius = '4px';
  toast.style.color = 'white';
  toast.style.backgroundColor = type === 'success' ? '#48BB78' : '#F56565';
  toast.style.zIndex = '1000';
  toast.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
  toast.textContent = message;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.transition = 'opacity 0.5s';
    toast.style.opacity = '0';
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 500);
  }, 3000);
};

type Priority = 'low' | 'medium' | 'high';

interface AnnouncementFormData extends Omit<Announcement, 'id' | 'createdAt' | 'updatedAt' | 'expiryDate'> {
  startDate: string;
  endDate?: string;
  publishDate: string;
}

export const Announcements: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [formData, setFormData] = useState<AnnouncementFormData>({
    title: '',
    content: '',
    type: 'general',
    priority: 'medium',
    authorId: 1, // TODO: Get from auth context
    isActive: true,
    targetAudience: 'all',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    publishDate: new Date().toISOString()
  });
  const [filter, setFilter] = useState<'all' | Priority>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchAnnouncements = async () => {
    try {
      setIsLoading(true);
      const result = await window.electronAPI.announcements.get();
      if (result.success && result.data) {
        setAnnouncements(result.data);
      } else {
        throw new Error(result.error || 'Failed to load announcements');
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
      showToast(
        error instanceof Error ? error.message : 'Failed to load announcements',
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const { startDate, endDate, ...restData } = formData;
      const announcementData: Omit<Announcement, 'id' | 'createdAt' | 'updatedAt'> = {
        ...restData,
        publishDate: new Date(startDate).toISOString(),
        expiryDate: endDate ? new Date(endDate).toISOString() : undefined,
      };

      let result: DbResult<Announcement>;
      if (editingAnnouncement?.id) {
        result = await window.electronAPI.announcements.update(
          editingAnnouncement.id,
          announcementData
        );
      } else {
        result = await window.electronAPI.announcements.add(announcementData);
      }

      if (result.success) {
        showToast(
          editingAnnouncement 
            ? 'Announcement updated successfully' 
            : 'Announcement created successfully',
          'success'
        );
        setIsDialogOpen(false);
        setFormData({
          title: '',
          content: '',
          type: 'general',
          priority: 'medium',
          authorId: 1,
          isActive: true,
          targetAudience: 'all',
          startDate: new Date().toISOString().split('T')[0],
          endDate: '',
          publishDate: new Date().toISOString()
        });
        setEditingAnnouncement(null);
        fetchAnnouncements();
      } else {
        throw new Error(result.error?.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Error saving announcement:', error);
      showToast(
        error instanceof Error ? error.message : 'An unknown error occurred',
        'error'
      );
    }
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    const { publishDate, expiryDate, ...rest } = announcement;
    setFormData({
      ...rest,
      startDate: publishDate.split('T')[0],
      endDate: expiryDate ? expiryDate.split('T')[0] : '',
      publishDate: publishDate
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      try {
        const result = await window.electronAPI.announcements.delete(id);
        if (result.success) {
          showToast(
            'Announcement deleted successfully',
            'success'
          );
          fetchAnnouncements();
        } else {
          throw new Error(result.error || 'Failed to delete announcement');
        }
      } catch (error) {
        console.error('Error deleting announcement:', error);
        showToast(
          error instanceof Error ? error.message : 'An unknown error occurred',
          'error'
        );
      }
    }
  };

  const getPriorityColor = (priority: Priority): string => {
    switch (priority) {
      case 'high': return '#E53E3E';
      case 'medium': return '#DD6B20';
      case 'low': 
      default: 
        return '#718096';
    }
  };

  const filteredAnnouncements = filter === 'all' 
    ? announcements 
    : announcements.filter(a => a.priority === filter);

  const sortedAnnouncements = [...filteredAnnouncements].sort((a, b) => 
    new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
  );

  const filteredBySearch = sortedAnnouncements.filter(announcement => 
    announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (announcement.content || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPriorityLabel = (priority: string) => {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  };

  return (
    <div style={{ padding: '1rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <Heading level={1}>Announcements</Heading>
          <Button 
            variant="primary"
            onClick={() => {
              setFormData({
                title: '',
                content: '',
                type: 'general',
                priority: 'medium',
                authorId: 1,
                isActive: true,
                targetAudience: 'all',
                startDate: new Date().toISOString().split('T')[0],
                endDate: '',
                publishDate: new Date().toISOString()
              });
              setEditingAnnouncement(null);
              setIsDialogOpen(true);
            }}
          >
            <Plus size={16} style={{ marginRight: '0.5rem' }} />
            New Announcement
          </Button>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ flex: 1 }}>
            <TextInput
              placeholder="Search announcements..."
              value={searchQuery}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            />
          </div>
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | Priority)}
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '2.5rem 0' }}>
          <div>Loading...</div>
        </div>
      ) : filteredBySearch.length === 0 ? (
        <Card>
          <CardBody>
            <div style={{ textAlign: 'center', padding: '2.5rem 0' }}>
              {searchQuery ? 'No announcements match your search.' : 'No announcements found.'}
            </div>
          </CardBody>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredBySearch.map((announcement) => (
            <Card key={announcement.id}>
              <CardHeader>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Heading level={3}>{announcement.title}</Heading>
                  <span style={{
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    backgroundColor: getPriorityColor(announcement.priority),
                    color: 'white',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    textTransform: 'capitalize'
                  }}>
                    {announcement.priority}
                  </span>
                </div>
                <div style={{ 
                  display: 'flex', 
                  gap: '1rem', 
                  color: '#666', 
                  fontSize: '0.875rem',
                  marginTop: '0.5rem'
                }}>
                  <span>By Admin</span>
                  <span>
                    {format(parseISO(announcement.publishDate), 'MMM d, yyyy')}
                  </span>
                </div>
              </CardHeader>
              <CardBody>
                <div style={{ whiteSpace: 'pre-line', marginBottom: '1rem' }}>
                  {announcement.content}
                </div>
                <div style={{ 
                  borderTop: '1px solid #eee', 
                  margin: '0.75rem 0',
                  paddingTop: '0.75rem',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '0.5rem'
                }}>
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(announcement)}
                  >
                    <Edit size={14} style={{ marginRight: '0.25rem' }} />
                    Edit
                  </Button>
                  <Button 
                    variant="outline"
                    size="sm"
                    style={{ color: '#e53e3e' }}
                    onClick={() => announcement.id && handleDelete(announcement.id)}
                  >
                    <Trash2 size={14} style={{ marginRight: '0.25rem' }} />
                    Delete
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Announcement Dialog */}
      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} size="lg">
        <DialogHeader>
          {editingAnnouncement ? 'Edit Announcement' : 'New Announcement'}
          <button 
            onClick={() => setIsDialogOpen(false)}
            style={{
              position: 'absolute',
              right: '1rem',
              top: '1rem',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1.25rem',
              color: '#666'
            }}
          >
            <X size={20} />
          </button>
        </DialogHeader>
        <DialogBody>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Title</label>
              <TextInput
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter announcement title"
                required
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Content</label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="Enter announcement content"
                required
                style={{
                  width: '100%',
                  minHeight: '150px',
                  padding: '0.5rem',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Priority</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontFamily: 'inherit'
                  }}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontFamily: 'inherit'
                  }}
                >
                  <option value="general">General</option>
                  <option value="event">Event</option>
                  <option value="urgent">Urgent</option>
                  <option value="prayer">Prayer</option>
                  <option value="fundraising">Fundraising</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>End Date (Optional)</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate || ''}
                  onChange={handleInputChange}
                  min={formData.startDate}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="primary"
              >
                {editingAnnouncement ? 'Update' : 'Create'} Announcement
              </Button>
            </div>
          </form>
        </DialogBody>
      </Dialog>
    </div>
  );
};
