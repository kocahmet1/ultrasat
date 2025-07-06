import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './ProfileDropdown.css';
import { FaUserCircle, FaCog, FaSignOutAlt, FaGem, FaUser, FaChartBar, FaQuestionCircle } from 'react-icons/fa';
import { MembershipBadge } from './membership';

const ProfileDropdown = () => {
  const { currentUser, logout, userMembership } = useAuth();
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
          <div className="dropdown-header" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: '0.25rem'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center'}}>
              <FaUser className="dropdown-icon" />
              <span>{currentUser.email}</span>
            </div>
            {userMembership && (
              <div className="dropdown-membership-badge" style={{marginTop: '0.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <MembershipBadge tier={userMembership.tier} size="small" showName={false} />
                <span className="membership-badge-text" style={{marginLeft: 6, fontWeight: 500, fontSize: '0.85em', color: '#555'}}>
                  {userMembership.tier === 'free' ? 'Free Tier' : userMembership.tier.charAt(0).toUpperCase() + userMembership.tier.slice(1) + ' Tier'}
                </span>
              </div>
            )}
          </div>
          <Link to="/profile" className="dropdown-item" onClick={() => setIsOpen(false)}>
            <FaChartBar className="dropdown-icon" />
            Profile
          </Link>

          <Link to="/membership/upgrade" className="dropdown-item upgrade-link" onClick={() => setIsOpen(false)}>
            <FaGem className="dropdown-icon" />
            Upgrade
          </Link>
          <Link to="/help" className="dropdown-item" onClick={() => setIsOpen(false)}>
            <FaQuestionCircle className="dropdown-icon" />
            Help
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
