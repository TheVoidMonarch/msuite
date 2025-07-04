import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';
import { Activity, Users, Calendar, DollarSign } from 'lucide-react';
import { PrayerTimePlayer } from '../components/PrayerTimePlayer';
import './DashboardPage.css';

export const DashboardPage: React.FC = () => {
  // Mock data - replace with actual data from your API
  const stats = [
    { 
      title: 'Total Members', 
      value: '1,248', 
      change: '+12%', 
      icon: <Users size={24} />,
      trend: 'up'
    },
    { 
      title: 'Today\'s Attendance', 
      value: '187', 
      change: '+5.2%', 
      icon: <Activity size={24} />,
      trend: 'up'
    },
    { 
      title: 'Upcoming Events', 
      value: '3', 
      change: '2 new', 
      icon: <Calendar size={24} />,
      trend: 'neutral'
    },
    { 
      title: 'Monthly Donations', 
      value: 'RM 12,450', 
      change: '+8.4%', 
      icon: <DollarSign size={24} />,
      trend: 'up'
    }
  ];

  // Mock prayer times
  const prayerTimes = [
    { name: 'Fajr', time: '05:30' },
    { name: 'Dhuhr', time: '13:15' },
    { name: 'Asr', time: '16:30' },
    { name: 'Maghrib', time: '19:20' },
    { name: 'Isha', time: '20:30' },
  ];

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1 className="page-title">Dashboard</h1>
        <div className="date-display">
          {new Date().toLocaleDateString('en-MY', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <Card key={index} className="stat-card">
            <CardHeader className="stat-card-header">
              <div className="stat-icon">
                {stat.icon}
              </div>
              <CardTitle className="stat-title">{stat.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="stat-value">{stat.value}</div>
              <div className={`stat-change ${stat.trend}`}>
                {stat.change}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="dashboard-content">
        {/* Prayer Times */}
        <div className="dashboard-section">
          <h2 className="section-title">Prayer Times</h2>
          <PrayerTimePlayer prayerTimes={prayerTimes} />
        </div>

        <div className="dashboard-row">
          {/* Recent Activities */}
          <div className="dashboard-section">
            <h2 className="section-title">Recent Activities</h2>
            <Card className="recent-activities">
              <CardContent>
                <div className="activity-list">
                  {[
                    { id: 1, user: 'Ahmad Ali', action: 'checked in for Asr prayer', time: '10 min ago' },
                    { id: 2, user: 'Siti Aishah', action: 'registered for Quran class', time: '25 min ago' },
                    { id: 3, user: 'Mohd Farid', action: 'made a donation of RM 100', time: '1 hour ago' },
                    { id: 4, user: 'Aminah Yusof', action: 'updated her profile', time: '2 hours ago' },
                    { id: 5, user: 'System', action: 'Backup completed successfully', time: '3 hours ago' },
                  ].map(activity => (
                    <div key={activity.id} className="activity-item">
                      <div className="activity-dot"></div>
                      <div className="activity-details">
                        <div className="activity-text">
                          <strong>{activity.user}</strong> {activity.action}
                        </div>
                        <div className="activity-time">{activity.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Events */}
          <div className="dashboard-section">
            <h2 className="section-title">Upcoming Events</h2>
            <Card className="upcoming-events">
              <CardContent>
                {[
                  { 
                    id: 1, 
                    title: 'Weekly Tafseer Class', 
                    date: 'Tomorrow, 8:30 PM',
                    location: 'Main Prayer Hall',
                    type: 'class'
                  },
                  { 
                    id: 2, 
                    title: 'Jumu\'ah Prayer', 
                    date: 'Friday, 1:00 PM',
                    location: 'Main Prayer Hall',
                    type: 'prayer'
                  },
                  { 
                    id: 3, 
                    title: 'Community Iftar', 
                    date: 'Next Week, 6:45 PM',
                    location: 'Community Hall',
                    type: 'event'
                  },
                ].map(event => (
                  <div key={event.id} className="event-item">
                    <div className="event-icon">
                      {event.type === 'class' && <BookOpen size={16} />}
                      {event.type === 'prayer' && <Clock size={16} />}
                      {event.type === 'event' && <Calendar size={16} />}
                    </div>
                    <div className="event-details">
                      <div className="event-title">{event.title}</div>
                      <div className="event-meta">
                        <span>{event.date}</span>
                        <span>•</span>
                        <span>{event.location}</span>
                      </div>
                    </div>
                    <button className="event-action">
                      <ChevronRight size={16} />
                    </button>
                  </div>
                ))}
                <Button variant="outline" className="view-all-events">
                  View All Events
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
