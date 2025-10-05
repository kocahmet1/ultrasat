import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../styles/TopNavBar.css';
import UltraSATLogo from './UltraSATLogo';
import {
  FaChartBar,
  FaClipboardList,
  FaBookOpen,
  FaUserCircle,
  FaBook,
  FaPuzzlePiece,
  FaHome,
  FaBullseye,
  FaEllipsisH
} from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

// Primary items: Most frequently used features (visible on mobile)
const primaryNavItems = [
  { path: '/progress', icon: <FaChartBar />, label: 'Progress', isPrimary: true },
  { path: '/practice-exams', icon: <FaClipboardList />, label: 'Exams', isPrimary: true },
  { path: '/subject-quizzes', icon: <FaBookOpen />, label: 'Practice', isPrimary: true },
  { path: '/profile', icon: <FaUserCircle />, label: 'Profile', isPrimary: true }
];

// Secondary items: Less frequently used (hidden on mobile, shown in sidebar on desktop)
const secondaryNavItems = [
  { path: '/predictive-exam', icon: <FaBullseye />, label: 'Predictive', isPrimary: false },
  { path: '/word-bank', icon: <FaBook />, label: 'Words', isPrimary: false },
  { path: '/concept-bank', icon: <FaPuzzlePiece />, label: 'Concepts', isPrimary: false }
];

const navItems = [...primaryNavItems, ...secondaryNavItems];

const TopNavBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
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
      if (appContainer) {
        appContainer.classList.remove('sidebar-mobile');
      }
    };
  }, []);

  const handleMoreItemClick = (path) => {
    navigate(path);
    setShowMoreMenu(false);
  };

  return (
    <div className={`top-navbar ${scrolled ? 'minimized' : ''}`}>
      <ul>
        <li>
          <Link to={currentUser ? "/progress" : "/"}>
            <UltraSATLogo 
              size="small" 
              variant="sidebar" 
              style={{ height: scrolled ? 28 : 32, verticalAlign: 'middle' }} 
            />
          </Link>
        </li>
        {primaryNavItems.map((item) => (
          <li
            key={item.path}
            className={location.pathname.startsWith(item.path) ? 'active' : ''}
          >
            <Link to={item.path}>
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          </li>
        ))}
        <li className={`more-menu-container ${showMoreMenu ? 'active' : ''}`}>
          <button 
            className="more-menu-button"
            onClick={() => setShowMoreMenu(!showMoreMenu)}
          >
            <span className="nav-icon"><FaEllipsisH /></span>
            <span className="nav-label">More</span>
          </button>
          {showMoreMenu && (
            <div className="more-menu-dropdown">
              {secondaryNavItems.map((item) => (
                <button
                  key={item.path}
                  className={`more-menu-item ${location.pathname.startsWith(item.path) ? 'active' : ''}`}
                  onClick={() => handleMoreItemClick(item.path)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
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
