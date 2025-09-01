import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../styles/Sidebar.css';
import { useSidebar } from '../contexts/SidebarContext';
import { useAuth } from '../contexts/AuthContext';
import { MembershipBadge } from './membership';
import ProFeatureModal from './ProFeatureModal';
import UltraSATLogo from './UltraSATLogo';
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
  FaQuestionCircle,     // Help
  FaSignInAlt,         // Login
  FaHome,              // Home icon for collapsed sidebar
  FaBullseye
} from 'react-icons/fa';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isCollapsed, isMobile, isHidden, toggleSidebar } = useSidebar();
  const { userMembership, hasFeatureAccess, currentUser } = useAuth();
  const [isModalOpen, setModalOpen] = useState(false);
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });

  const baseNavItems = [
    { path: '/progress', icon: <FaChartBar />, label: 'My Progress' },
    { path: '/predictive-exam', icon: <FaBullseye />, label: 'Predictive Exam' },
    { path: '/practice-exams', icon: <FaClipboardList />, label: 'Practice Exams' },
    { path: '/subject-quizzes', icon: <FaGraduationCap />, label: 'Question Bank' },
    { path: '/word-bank', icon: <FaBook />, label: 'Word Bank' },
    { path: '/concept-bank', icon: <FaPuzzlePiece />, label: 'Concept Bank' },
    { path: '/flashcards', icon: <FaLayerGroup />, label: 'Flashcards' },
    { path: '/lectures', icon: <FaBookReader />, label: 'Lectures' },
    { path: '/all-results', icon: <FaTrophy />, label: 'Exam Results' },
  ];

  const navItems = currentUser ? baseNavItems : [
    ...baseNavItems.filter(item => item.path !== '/all-results'),
    { path: '/login', icon: <FaSignInAlt />, label: 'Login / Sign Up' }
  ];

  // Don't render sidebar at all when hidden (exam mode)
  if (isHidden) {
    return null;
  }

  const handleLinkClick = (e, path) => {
    if (isMobile) toggleSidebar();

    const proFeatures = ['/flashcards', '/concept-bank', '/lectures'];
    const isProFeature = proFeatures.includes(path);

    if (!currentUser) {
      const publicPaths = ['/login', '/signup', '/'];
      if (publicPaths.includes(path)) return;

      const proPaths = ['/concept-bank', '/flashcards', '/lectures'];
      if (proPaths.includes(path)) {
        e.preventDefault();
        const sidebarWidth = isCollapsed ? 80 : 240;
        const modalXPosition = sidebarWidth + 10;
        setModalPosition({ x: modalXPosition, y: e.clientY });
        setModalOpen(true);
      } else {
        e.preventDefault();
        navigate('/auth-notice', { state: { from: { pathname: path } } });
      }
    } else {
      if (isProFeature) {
        if (!hasFeatureAccess('plus')) {
          e.preventDefault();
          const sidebarWidth = isCollapsed ? 80 : 240;
          const modalXPosition = sidebarWidth + 10;
          setModalPosition({ x: modalXPosition, y: e.clientY });
          setModalOpen(true);
        }
      }
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
          {/* Logo when expanded, home icon when collapsed */}
          {isCollapsed ? (
            <Link to={currentUser ? "/progress" : "/"}>
              <FaHome className="sidebar-home-icon" />
            </Link>
          ) : (
            <Link to={currentUser ? "/progress" : "/"}>
              <UltraSATLogo 
                size="medium" 
                variant="sidebar" 
                className="sidebar-logo"
              />
            </Link>
          )}
        </div>
        <nav className="sidebar-nav">
          <ul>
            {navItems.map((item) => {
              return (
                <li key={item.path} className={location.pathname.startsWith(item.path) ? 'active' : ''}>
                  <Link
                    to={item.path}
                    onClick={(e) => handleLinkClick(e, item.path)}
                  >
                    <span className="sidebar-icon">{item.icon}</span>
                    <span className="sidebar-label">
                      {item.label}
                      {(item.path === '/flashcards' || item.path === '/concept-bank' || item.path === '/lectures') && !hasFeatureAccess('plus') && (
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
