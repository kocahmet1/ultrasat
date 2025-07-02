import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSidebar } from './SidebarContext';

const SidebarVisibility = ({ children }) => {
  const location = useLocation();
  const { setSidebarHidden } = useSidebar();

  useEffect(() => {
    const isExamPage = location.pathname.includes('/practice-exam/') || location.pathname.includes('/exam/');
    setSidebarHidden(isExamPage);
  }, [location, setSidebarHidden]);

  return <>{children}</>;
};

export default SidebarVisibility;
