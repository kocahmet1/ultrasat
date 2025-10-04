import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
  FaBullseye
} from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

const navItems = [
  { path: '/progress', icon: <FaChartBar />, label: 'Progress' },
  { path: '/predictive-exam', icon: <FaBullseye />, label: 'Predictive' },
  { path: '/practice-exams', icon: <FaClipboardList />, label: 'Exams' },
  { path: '/subject-quizzes', icon: <FaBookOpen />, label: 'Questions' },
  { path: '/word-bank', icon: <FaBook />, label: 'Words' },
  { path: '/concept-bank', icon: <FaPuzzlePiece />, label: 'Concepts' },
  { path: '/profile', icon: <FaUserCircle />, label: 'Profile' }
];

const TopNavBar = () => {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
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

  return (
    <div className={`top-navbar ${scrolled ? 'minimized' : ''}`}>
      <ul>
        <li>
          <Link to={currentUser ? "/progress" : "/"}>
            <UltraSATLogo 
              size="small" 
              variant="sidebar" 
              style={{ height: 32, marginRight: 8, verticalAlign: 'middle' }} 
            />
          </Link>
        </li>
        {navItems.map((item) => (
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
      </ul>
    </div>
  );
};

export default TopNavBar;
