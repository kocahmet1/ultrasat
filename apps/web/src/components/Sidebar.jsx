import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../styles/Sidebar.css';
import { useSidebar } from '../contexts/SidebarContext';
import { useAuth } from '../contexts/AuthContext';
import ProUpgradeModal from './membership/ProUpgradeModal';
import UltraSATLogo from './UltraSATLogo';
import { FiChevronLeft, FiChevronRight, FiLogIn, FiHome, FiZap } from 'react-icons/fi';
import { getNavItems, PRO_PATHS, GUEST_PUBLIC_PATHS } from '../config/navigation';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isCollapsed, isMobile, isHidden, toggleSidebar } = useSidebar();
  const { hasFeatureAccess, currentUser } = useAuth();
  const [isModalOpen, setModalOpen] = useState(false);
  const isLecturesExperience = location.pathname.startsWith('/lectures');

  // ONE navigation, everywhere (Overhaul Phase A). The old dual "modern prep"
  // menu with conflicting labels is gone — config/navigation.js is the source.
  const navItems = [
    ...getNavItems(!!currentUser).map((item) => ({
      path: item.path,
      label: item.label,
      icon: <item.Icon />,
      pro: item.pro,
      end: item.end,
    })),
    ...(!currentUser ? [{ path: '/login', icon: <FiLogIn />, label: 'Login / Sign Up' }] : []),
  ];

  // `end` items (e.g. /practice) match exactly so they don't light up on
  // sibling paths like /practice/history or /practice-exams.
  const isItemActive = (item) => (
    item.end ? location.pathname === item.path : location.pathname.startsWith(item.path)
  );

  // Don't render sidebar at all when hidden (exam mode)
  if (isHidden) {
    return null;
  }

  const handleLinkClick = (e, path) => {
    if (isMobile) toggleSidebar();

    const isProFeature = PRO_PATHS.includes(path);

    if (!currentUser) {
      if (GUEST_PUBLIC_PATHS.includes(path)) return;

      if (isProFeature) {
        e.preventDefault();
        setModalOpen(true);
      } else {
        e.preventDefault();
        navigate('/auth-notice', { state: { from: { pathname: path } } });
      }
    } else {
      if (isProFeature) {
        if (!hasFeatureAccess('plus')) {
          e.preventDefault();
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
      
      <div className={`sidebar ${isCollapsed ? 'sidebar-collapsed' : ''} ${isMobile ? 'sidebar-mobile' : ''} ${isLecturesExperience ? 'sidebar-lectures-shell' : ''}`}>

        <div className="sidebar-collapse" onClick={toggleSidebar}>
          {isCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
        </div>
        <div className="sidebar-header">
          {/* Logo when expanded, home icon when collapsed */}
          {isCollapsed ? (
              <Link to={currentUser ? "/dashboard" : "/"}>
              <FiHome className="sidebar-home-icon" />
            </Link>
          ) : (
              <Link to={currentUser ? "/dashboard" : "/"}>
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
                <li key={item.path} className={isItemActive(item) ? 'active' : ''}>
                  <Link
                    to={item.path}
                    onClick={(e) => handleLinkClick(e, item.path)}
                  >
                    <span className="sidebar-icon">{item.icon}</span>
                    <span className="sidebar-label">
                      {item.label}
                      {item.pro && !hasFeatureAccess('plus') && (
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
          {isLecturesExperience ? (
            <div className="sidebar-ai-card">
              <FiZap aria-hidden="true" />
              <p>Your coach knows where you stand</p>
              <button type="button" onClick={() => navigate('/coach')}>
                Open Coach
              </button>
            </div>
          ) : (
            <p>&copy; {new Date().getFullYear()} SATPractice</p>
          )}
        </div>
      </div>
      <ProUpgradeModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
};

export default Sidebar;
