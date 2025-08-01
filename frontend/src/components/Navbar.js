import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/" className="navbar-brand">
          FixPoint
        </Link>
        
        <ul className="navbar-nav">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/map">Map View</Link></li>
          {user && (
            <>
              <li><Link to="/dashboard">Dashboard</Link></li>
              <li><Link to="/report/new">Report Issue</Link></li>
            </>
          )}
        </ul>

        <div className="navbar-actions">
          {user ? (
            <>
              <span style={{ color: 'white', marginRight: '1rem' }}>
                Welcome, {user.fullName || user.username}
              </span>
              <button onClick={handleLogout} className="btn btn-outline">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
