import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../../ui';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Skip to main content functionality
  const handleSkipToContent = () => {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.focus();
    }
  };

  // Navigation items with icons
  const navItems = [
    { path: '/', label: 'Dashboard', icon: '🏠' },
    { path: '/prayer-times', label: 'Prayer Times', icon: '🕌' },
    { path: '/announcements', label: 'Announcements', icon: '📢' },
    { path: '/community', label: 'Community', icon: '👥' },
    { path: '/backup-security', label: 'Backup & Security', icon: '🔒' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
  ];

  // Get current route info for breadcrumb
  const getCurrentRouteInfo = () => {
    const currentItem = navItems.find(item => item.path === location.pathname);
    return currentItem || { path: '/', label: 'Dashboard', icon: '🏠' };
  };

  const currentRoute = getCurrentRouteInfo();
  const canGoBack = location.pathname !== '/';

  return (
    <div className="app-shell">
      {/* Skip to content link */}
      <a
        href="#main-content"
        className="skip-to-content"
        onClick={(e) => {
          e.preventDefault();
          handleSkipToContent();
        }}
        style={{
          position: 'absolute',
          top: '-100px',
          left: '0',
          zIndex: 1000,
          padding: '8px 16px',
          backgroundColor: '#0066cc',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '4px',
          fontSize: '14px',
          fontWeight: 'bold',
          transition: 'top 0.3s ease',
        }}
        onFocus={(e) => {
          (e.target as HTMLElement).style.top = '16px';
        }}
        onBlur={(e) => {
          (e.target as HTMLElement).style.top = '-100px';
        }}
      >
        Skip to main content
      </a>

      {/* Header */}
      <header className="app-header" style={{
        backgroundColor: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        padding: '1rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: '80px',
      }}>
        <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Logo */}
          <Link 
            to="/" 
            className="logo"
            style={{
              textDecoration: 'none',
              color: 'var(--color-primary)',
              fontWeight: 'bold',
              fontSize: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <span style={{ fontSize: '2rem' }}>🕌</span>
            Masjid Suite
          </Link>

          {/* Back Button */}
          {canGoBack && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(-1)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                minWidth: '120px',
              }}
              aria-label="Go back to previous page"
            >
              <span aria-hidden="true">←</span>
              Back
            </Button>
          )}
        </div>

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="breadcrumb">
          <ol style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            listStyle: 'none',
            padding: 0,
            margin: 0,
          }}>
            {location.pathname !== '/' && (
              <>
                <li>
                  <Link 
                    to="/" 
                    style={{
                      textDecoration: 'none',
                      color: 'var(--color-text-secondary)',
                      fontSize: '0.875rem',
                    }}
                  >
                    Dashboard
                  </Link>
                </li>
                <li aria-hidden="true" style={{ color: 'var(--color-text-secondary)' }}>
                  /
                </li>
              </>
            )}
            <li>
              <span style={{
                color: 'var(--color-text-primary)',
                fontSize: '0.875rem',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}>
                <span aria-hidden="true">{currentRoute.icon}</span>
                {currentRoute.label}
              </span>
            </li>
          </ol>
        </nav>
      </header>

      {/* Main Content */}
      <main
        id="main-content"
        className="main-content"
        tabIndex={-1}
        style={{
          flex: 1,
          padding: '2rem 1.5rem',
          maxWidth: '1200px',
          margin: '0 auto',
          width: '100%',
          outline: 'none',
        }}
      >
        {children}
      </main>

      {/* Navigation Buttons */}
      <nav 
        className="nav-buttons"
        aria-label="Main navigation"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderTop: '1px solid var(--color-border)',
          padding: '1.5rem',
        }}
      >
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '1rem',
          maxWidth: '1200px',
          margin: '0 auto',
        }}>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="nav-button"
              style={{
                textDecoration: 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '1.5rem 1rem',
                borderRadius: '8px',
                backgroundColor: location.pathname === item.path 
                  ? 'var(--color-primary)' 
                  : 'var(--color-surface-variant)',
                color: location.pathname === item.path 
                  ? 'var(--color-on-primary)' 
                  : 'var(--color-text-primary)',
                border: '2px solid transparent',
                transition: 'all 0.2s ease',
                minHeight: '120px',
                minWidth: '120px',
              }}
              onMouseEnter={(e) => {
                if (location.pathname !== item.path) {
                  e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)';
                  e.currentTarget.style.borderColor = 'var(--color-primary)';
                }
              }}
              onMouseLeave={(e) => {
                if (location.pathname !== item.path) {
                  e.currentTarget.style.backgroundColor = 'var(--color-surface-variant)';
                  e.currentTarget.style.borderColor = 'transparent';
                }
              }}
              onFocus={(e) => {
                e.currentTarget.style.outline = '2px solid var(--color-primary)';
                e.currentTarget.style.outlineOffset = '2px';
              }}
              onBlur={(e) => {
                e.currentTarget.style.outline = 'none';
              }}
              aria-current={location.pathname === item.path ? 'page' : undefined}
            >
              <span 
                style={{ 
                  fontSize: '2rem',
                  lineHeight: 1,
                }} 
                aria-hidden="true"
              >
                {item.icon}
              </span>
              <span style={{ 
                fontSize: '0.875rem',
                fontWeight: '500',
                textAlign: 'center',
                lineHeight: 1.2,
              }}>
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
};
