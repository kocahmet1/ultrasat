import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/Sidebar.css';
import {
  FaChartBar,          // Progress Dashboard
  FaClipboardList,     // Practice Exams
  FaBookOpen,          // Study Resources
  FaUserCircle,        // Profile
  FaGraduationCap,     // SAT Prep
  FaBook,              // Word Bank
  FaPuzzlePiece        // Concept Bank
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

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        {/* You can put a logo or app name here */}
        <h3>BlueBook Prep</h3>
      </div>
      <nav className="sidebar-nav">
        <ul>
          {navItems.map((item) => (
            <li key={item.path} className={location.pathname.startsWith(item.path) ? 'active' : ''}>
              <Link to={item.path}>
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
  );
};

export default Sidebar;
