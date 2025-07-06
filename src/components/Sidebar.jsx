import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/Sidebar.css';
import { useSidebar } from '../contexts/SidebarContext';
import { useAuth } from '../contexts/AuthContext';
import { MembershipBadge } from './membership';
import ProFeatureModal from './ProFeatureModal';
import {
  FaChartBar,          // Progress Dashboard
  FaClipboardList,     // Practice Exams
  FaBookOpen,          // Study Resources
  FaUserCircle,        // Profile
  FaGraduationCap,     // SAT Prep
  FaBook,              // Word Bank
  FaLayerGroup,        // Flashcards
  FaPuzzlePiece,       // Concept Bank
  FaChevronLeft,       // Collapse icon
  FaChevronRight,      // Expand icon
  FaTrophy,            // All Results
  FaCrown,             // Membership
  FaBookReader,        // Lectures
  FaQuestionCircle     // Help
} from 'react-icons/fa';

const navItems = [
  { path: '/progress', icon: <FaChartBar />, label: 'My Progress' },
  { path: '/practice-exams', icon: <FaClipboardList />, label: 'Practice Exams' },
  { path: '/subject-quizzes', icon: <FaGraduationCap />, label: 'Quizzes' },
  { path: '/lectures', icon: <FaBookReader />, label: 'Lectures' },
  { path: '/study-resources', icon: <FaBookOpen />, label: 'Study Resources' },
  { path: '/word-bank', icon: <FaBook />, label: 'Word Bank' },
  { path: '/flashcards', icon: <FaLayerGroup />, label: 'Flashcards' },
  { path: '/concept-bank', icon: <FaPuzzlePiece />, label: 'Concept Bank' },
  { path: '/all-results', icon: <FaTrophy />, label: 'Exam Results' },
  { path: '/help', icon: <FaQuestionCircle />, label: 'Help' },
];

const Sidebar = () => {
  const location = useLocation();
  const { isCollapsed, isMobile, isHidden, toggleSidebar } = useSidebar();
  const { userMembership, hasFeatureAccess, currentUser } = useAuth();
  const [isModalOpen, setModalOpen] = useState(false);
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });

  // Don't render sidebar at all when hidden (exam mode)
  if (isHidden) {
    return null;
  }

  const handleProLinkClick = (e) => {
    const isProFeature = e.currentTarget.pathname === '/flashcards' || e.currentTarget.pathname === '/concept-bank';
    const userIsPro = currentUser?.membership === 'Plus' || currentUser?.membership === 'Max';

    if (isProFeature && !userIsPro) {
      e.preventDefault();
      const sidebarWidth = isCollapsed ? 80 : 240;
      const modalXPosition = sidebarWidth + 10; // 10px from sidebar edge
      setModalPosition({ x: modalXPosition, y: e.clientY });
      setModalOpen(true);
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && !isCollapsed && (
        <div className="sidebar-overlay" onClick={toggleSidebar}></div>
      )}
      
      <div className={`sidebar ${isCollapsed ? 'sidebar-collapsed' : ''} ${isMobile ? 'sidebar-mobile' : ''}`}>

        <div className="sidebar-collapse" onClick={toggleSidebar}>
          {isCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
        </div>
        <div className="sidebar-header">
          {/* You can put a logo or app name here */}
          <h3>UltraSatPrep</h3>

        </div>
        <nav className="sidebar-nav">
          <ul>
            {navItems.map((item) => {
              const isStudyResources = item.path === '/study-resources';
              const canAccessStudyResources = hasFeatureAccess('plus');

              if (isStudyResources && !canAccessStudyResources) {
                return (
                  <li key={item.path} className={location.pathname.startsWith(item.path) ? 'active' : ''}>
                    <Link to="/membership" onClick={isMobile ? toggleSidebar : undefined}>
                      <span className="sidebar-icon">{item.icon}</span>
                      <span className="sidebar-label">{item.label}</span>
                      <span className="pro-badge">Pro</span>
                    </Link>
                  </li>
                );
              }

              return (
                <li key={item.path} className={location.pathname.startsWith(item.path) ? 'active' : ''}>
                  <Link
                    to={item.path}
                    onClick={(e) => {
                      if (isMobile) toggleSidebar();
                      handleProLinkClick(e);
                    }}
                  >
                    <span className="sidebar-icon">{item.icon}</span>
                    <span className="sidebar-label">
                      {item.label}
                      {(item.path === '/flashcards' || item.path === '/concept-bank') && (
                        <span className="pro-badge">Pro</span>
                      )}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="sidebar-footer">
          {/* Optional: Footer content like logout, help, etc. */}
          <p>&copy; {new Date().getFullYear()} UltraSatPrep</p>
        </div>
      </div>
      <ProFeatureModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        position={modalPosition}
      />
    </>
  );
};

export default Sidebar;
