import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Navbar.css';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <nav className="portal-navbar">
      <div className="navbar-container">
        {/* College Portal Branding */}
        <div className="brand-section">
          <div className="brand-icon">🎓</div>
          <div>
            <h1 className="brand-title">College Leave Portal</h1>
            <p className="brand-subtitle">Student Request Management</p>
          </div>
        </div>

        {/* User profile & controls */}
        {currentUser && (
          <div className="nav-actions">
            <div className="user-badge-container">
              <div className="user-avatar-circle">
                {getInitials(currentUser.name)}
              </div>
              <div className="user-details">
                <span className="user-name">{currentUser.name}</span>
                <span className="role-tag">{currentUser.role}</span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="btn-nav-logout"
              title="Sign out of system"
            >
              <span>Logout</span>
              <span>→</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
