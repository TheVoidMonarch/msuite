import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Calendar, 
  BookOpen, 
  DollarSign, 
  Settings, 
  Menu, 
  X,
  Clock,
  Megaphone,
  FileText,
  UserCheck,
  Bookmark
} from 'lucide-react';
import { Button } from '../ui/Button';
import './DashboardLayout.css';

const menuItems = [
  { path: '/', icon: <Home size={20} />, label: 'Dashboard' },
  { path: '/prayer-times', icon: <Clock size={20} />, label: 'Prayer Times' },
  { path: '/members', icon: <Users size={20} />, label: 'Members' },
  { path: '/attendance', icon: <UserCheck size={20} />, label: 'Attendance' },
  { path: '/events', icon: <Calendar size={20} />, label: 'Events' },
  { path: '/announcements', icon: <Megaphone size={20} />, label: 'Announcements' },
  { path: '/quran-classes', icon: <BookOpen size={20} />, label: 'Quran Classes' },
  { path: '/donations', icon: <DollarSign size={20} />, label: 'Donations' },
  { path: '/reports', icon: <FileText size={20} />, label: 'Reports' },
  { path: '/settings', icon: <Settings size={20} />, label: 'Settings' },
];

export const DashboardLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className={`dashboard-layout ${isSidebarOpen ? 'sidebar-open' : 'sidebar-collapsed'}`}>
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <Bookmark className="logo-icon" />
            <span className="logo-text">Masjid Suite</span>
          </div>
          <button className="toggle-sidebar" onClick={toggleSidebar}>
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        
        <nav className="sidebar-nav">
          <ul>
            {menuItems.map((item) => (
              <li key={item.path} className={location.pathname === item.path ? 'active' : ''}>
                <Link to={item.path}>
                  <span className="icon">{item.icon}</span>
                  {isSidebarOpen && <span className="label">{item.label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="avatar">
              {localStorage.getItem('userName')?.charAt(0).toUpperCase() || 'U'}
            </div>
            {isSidebarOpen && (
              <div className="user-details">
                <div className="user-name">{localStorage.getItem('userName') || 'User'}</div>
                <div className="user-role">Admin</div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-bar">
          <div className="page-title">
            {menuItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
          </div>
          <div className="top-bar-actions">
            <button className="notification-button">
              <span className="badge">3</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
            </button>
            <div className="user-menu">
              <div className="user-avatar">
                {localStorage.getItem('userName')?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>
          </div>
        </header>
        
        <div className="content-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
