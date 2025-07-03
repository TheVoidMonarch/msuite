import React from 'react';
import { Link } from 'react-router-dom';

export const Navigation: React.FC = () => {
  return (
    <nav className="navigation">
      <div className="nav-brand">
        <Link to="/">Masjid Suite</Link>
      </div>
      <ul className="nav-links">
        <li><Link to="/">Home</Link></li>
      </ul>
    </nav>
  );
};
