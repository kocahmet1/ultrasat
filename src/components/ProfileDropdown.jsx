import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './ProfileDropdown.css';
import { FaUserCircle, FaCog, FaSignOutAlt, FaGem, FaUser, FaChartBar } from 'react-icons/fa';

const ProfileDropdown = () => {
  const { currentUser, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

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

  if (!currentUser) {
    return null;
  }

  return (
    <div className="profile-dropdown-container" ref={dropdownRef}> 
      <button onClick={toggleDropdown} className="profile-trigger-btn">
        <FaUserCircle size={32} />
      </button>

      {isOpen && (
        <div className="dropdown-menu">
          <div className="dropdown-header">
            <FaUser className="dropdown-icon" />
            <span>{currentUser.email}</span>
          </div>
          <Link to="/profile" className="dropdown-item" onClick={() => setIsOpen(false)}>
            <FaChartBar className="dropdown-icon" />
            Profile
          </Link>
          <Link to="/membership" className="dropdown-item" onClick={() => setIsOpen(false)}>
            <FaGem className="dropdown-icon" />
            Membership
          </Link>
          <Link to="/membership/upgrade" className="dropdown-item upgrade-link" onClick={() => setIsOpen(false)}>
            <FaGem className="dropdown-icon" />
            Upgrade
          </Link>
          <div className="dropdown-divider"></div>
          <button onClick={logout} className="dropdown-item-logout">
            <FaSignOutAlt className="dropdown-icon" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
