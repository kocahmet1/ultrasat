import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/Sidebar.css';
import {
  FaChartBar,          // Progress Dashboard
  FaClipboardList,     // Practice Exams
  FaBookOpen,          // Study Resources
  FaUserCircle,        // Profile
  FaGraduationCap,     // SAT Prep
  FaBook,              // Word Bank
  FaPuzzlePiece,       // Concept Bank
  FaBars,              // Menu toggle icon
  FaTimes              // Close icon
} from 'react-icons/fa';

const navItems = [
  { path: '/progress', icon: <FaChartBar />, label: 'My Progress' },
  { path: '/practice-exams', icon: <FaClipboardList />, label: 'Practice Exams' },
  { path: '/study-resources', icon: <FaBookOpen />, label: 'Study Resources' },
  { path: '/word-bank', icon: <FaBook />, label: 'Word Bank' },
  { path: '/concept-bank', icon: <FaPuzzlePiece />, label: 'Concept Bank' },
  { path: '/profile', icon: <FaUserCircle />, label: 'Profile' },
];

const Sidebar = () => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if screen is mobile size
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      const tablet = window.innerWidth > 768 && window.innerWidth <= 1024;
      
      setIsMobile(mobile);
      
      if (mobile) {
        setIsCollapsed(true); // Auto-collapse on mobile
      } else if (tablet) {
        setIsCollapsed(true); // Auto-collapse on tablet
      } else {
        // On desktop, maintain user preference or default to expanded
        // Only auto-expand if user hasn't manually collapsed it
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Update body class for responsive layout
  useEffect(() => {
    const appContainer = document.querySelector('.app-container');
    if (appContainer) {
      if (isCollapsed) {
        appContainer.classList.add('sidebar-collapsed');
      } else {
        appContainer.classList.remove('sidebar-collapsed');
      }
      
      if (isMobile) {
        appContainer.classList.add('sidebar-mobile');
      } else {
        appContainer.classList.remove('sidebar-mobile');
      }
    }
    
    return () => {
      if (appContainer) {
        appContainer.classList.remove('sidebar-collapsed', 'sidebar-mobile');
      }
    };
  }, [isCollapsed, isMobile]);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && !isCollapsed && (
        <div className="sidebar-overlay" onClick={toggleSidebar}></div>
      )}
      
      <div className={`sidebar ${isCollapsed ? 'sidebar-collapsed' : ''} ${isMobile ? 'sidebar-mobile' : ''}`}>
        {/* Toggle button */}
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          {isCollapsed ? <FaBars /> : <FaTimes />}
        </button>

        <div className="sidebar-header">
          {/* You can put a logo or app name here */}
          <h3>BlueBook Prep</h3>
        </div>
        <nav className="sidebar-nav">
          <ul>
            {navItems.map((item) => (
              <li key={item.path} className={location.pathname.startsWith(item.path) ? 'active' : ''}>
                <Link to={item.path} onClick={isMobile ? toggleSidebar : undefined}>
                  <span className="sidebar-icon">{item.icon}</span>
                  <span className="sidebar-label">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="sidebar-footer">
          {/* Optional: Footer content like logout, help, etc. */}
          <p>&copy; {new Date().getFullYear()} Veritas Blue</p>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
