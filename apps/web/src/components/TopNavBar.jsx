import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../styles/TopNavBar.css';
import UltraSATLogo from './UltraSATLogo';
import { FiUser, FiMoreHorizontal, FiLogIn } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { getNavItems } from '../config/navigation';

/**
 * Mobile navigation (Overhaul Phase A): consumes config/navigation.js — the
 * same items and labels as the desktop sidebar. Fixes the audit gaps: Progress
 * now exists on mobile, guests get the guest question bank instead of four
 * login-walled links, and Pro items are labeled.
 */
const TopNavBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const { currentUser, hasFeatureAccess } = useAuth();

  const items = getNavItems(!!currentUser);
  // `end` items (e.g. /practice) match exactly so they don't light up on
  // sibling paths like /practice/history or /practice-exams.
  const isItemActive = (item) => (
    item.end ? location.pathname === item.path : location.pathname.startsWith(item.path)
  );
  const primary = items.filter((i) => i.mobilePrimary);
  const secondary = [
    ...items.filter((i) => !i.mobilePrimary),
    ...(currentUser ? [{ path: '/profile', label: 'Profile', Icon: FiUser }] : []),
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const appContainer = document.querySelector('.app-container');
    if (appContainer) {
      appContainer.classList.add('sidebar-mobile');
      appContainer.classList.remove('sidebar-collapsed');
    }
    return () => {
      if (appContainer) appContainer.classList.remove('sidebar-mobile');
    };
  }, []);

  const go = (item) => {
    setShowMoreMenu(false);
    // Guests tapping a Pro feature get the signup pitch, not a login wall.
    if (!currentUser && item.pro) {
      navigate('/signup');
      return;
    }
    navigate(item.path);
  };

  const renderLabel = (item) => (
    <span className="nav-label">
      {item.label}
      {item.pro && currentUser && !hasFeatureAccess('plus') && <span className="pro-badge"> Pro</span>}
    </span>
  );

  return (
    <div className={`top-navbar ${scrolled ? 'minimized' : ''}`}>
      <ul>
        <li>
          <Link to={currentUser ? '/dashboard' : '/'}>
            <UltraSATLogo
              size="small"
              variant="sidebar"
              style={{ height: scrolled ? 28 : 32, verticalAlign: 'middle' }}
            />
          </Link>
        </li>
        {primary.map((item) => (
          <li key={item.path} className={isItemActive(item) ? 'active' : ''}>
            <button className="more-menu-item" style={{ background: 'none', border: 'none', padding: 0, font: 'inherit' }} onClick={() => go(item)}>
              <span className="nav-icon"><item.Icon /></span>
              {renderLabel(item)}
            </button>
          </li>
        ))}
        {!currentUser && (
          <li className={location.pathname === '/login' ? 'active' : ''}>
            <Link to="/login">
              <span className="nav-icon"><FiLogIn /></span>
              <span className="nav-label">Login</span>
            </Link>
          </li>
        )}
        <li className={`more-menu-container ${showMoreMenu ? 'active' : ''}`}>
          <button className="more-menu-button" onClick={() => setShowMoreMenu(!showMoreMenu)}>
            <span className="nav-icon"><FiMoreHorizontal /></span>
            <span className="nav-label">More</span>
          </button>
          {showMoreMenu && (
            <div className="more-menu-dropdown">
              {secondary.map((item) => (
                <button
                  key={item.path}
                  className={`more-menu-item ${isItemActive(item) ? 'active' : ''}`}
                  onClick={() => go(item)}
                >
                  <span className="nav-icon"><item.Icon /></span>
                  {renderLabel(item)}
                </button>
              ))}
            </div>
          )}
        </li>
      </ul>
      {showMoreMenu && (
        <div className="more-menu-overlay" onClick={() => setShowMoreMenu(false)}></div>
      )}
    </div>
  );
};

export default TopNavBar;
