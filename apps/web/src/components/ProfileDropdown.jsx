import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './ProfileDropdown.css';
import { FiLogOut, FiZap, FiUser, FiHelpCircle, FiChevronDown } from 'react-icons/fi';

const tierLabel = (tier) => {
  if (!tier || tier === 'free') return 'Free tier';
  return `${tier.charAt(0).toUpperCase()}${tier.slice(1)} tier`;
};

const ProfileDropdown = () => {
  const { currentUser, logout, userMembership } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();

  const toggleDropdown = () => setIsOpen(!isOpen);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close dropdown on route/location change
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  if (!currentUser) {
    return null;
  }

  const displayName = currentUser.displayName || currentUser.email?.split('@')[0] || 'Student';
  const initial = (displayName || 'S').trim().charAt(0);

  return (
    <div className="profile-dropdown-container" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="profile-trigger-btn"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="Account menu"
      >
        <span className="profile-trigger-avatar">{initial}</span>
        <FiChevronDown className="profile-trigger-chevron" aria-hidden="true" />
      </button>

      {isOpen && (
        <div className="dropdown-menu" role="menu">
          <div className="dropdown-header">
            <span className="dropdown-header-avatar">{initial}</span>
            <div className="dropdown-header-id">
              <span className="dropdown-header-name">{displayName}</span>
              <span className="dropdown-header-email">{currentUser.email}</span>
              {userMembership && (
                <span className="dropdown-tier">{tierLabel(userMembership.tier)}</span>
              )}
            </div>
          </div>

          <div className="dropdown-body">
            <Link to="/profile" className="dropdown-item" onClick={() => setIsOpen(false)}>
              <FiUser className="dropdown-icon" />
              Profile
            </Link>
            {(!userMembership || userMembership.tier === 'free') && (
              <Link to="/membership/upgrade" className="dropdown-item upgrade-link" onClick={() => setIsOpen(false)}>
                <FiZap className="dropdown-icon" />
                Upgrade
                <span className="dropdown-item-meta">Pro</span>
              </Link>
            )}
            <Link to="/help" className="dropdown-item" onClick={() => setIsOpen(false)}>
              <FiHelpCircle className="dropdown-icon" />
              Help
            </Link>
            <div className="dropdown-divider"></div>
            <button onClick={logout} className="dropdown-item-logout dropdown-item">
              <FiLogOut className="dropdown-icon" />
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
