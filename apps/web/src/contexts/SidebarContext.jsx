import React, { createContext, useContext, useState, useEffect } from 'react';

const SidebarContext = createContext();

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

export const SidebarProvider = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [forceCollapsed, setForceCollapsed] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
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
      } else if (forceCollapsed) {
        setIsCollapsed(true); // Force collapse when requested
      } else {
        // On desktop, maintain user preference or default to expanded
        // Only auto-expand if user hasn't manually collapsed it and not forced
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [forceCollapsed]);

  // Update body class for responsive layout
  useEffect(() => {
    const appContainer = document.querySelector('.app-container');
    if (appContainer) {
      if (isHidden) {
        appContainer.classList.add('sidebar-hidden');
        appContainer.classList.remove('sidebar-collapsed');
      } else if (isCollapsed) {
        appContainer.classList.add('sidebar-collapsed');
        appContainer.classList.remove('sidebar-hidden');
      } else {
        appContainer.classList.remove('sidebar-collapsed', 'sidebar-hidden');
      }
      
      if (isMobile) {
        appContainer.classList.add('sidebar-mobile');
      } else {
        appContainer.classList.remove('sidebar-mobile');
      }
    }
    
    return () => {
      if (appContainer) {
        appContainer.classList.remove('sidebar-collapsed', 'sidebar-mobile', 'sidebar-hidden');
      }
    };
  }, [isCollapsed, isMobile, isHidden]);

  const toggleSidebar = () => {
    if (!forceCollapsed) {
      setIsCollapsed(!isCollapsed);
    }
  };

  const setSidebarCollapsed = (collapsed) => {
    setIsCollapsed(collapsed);
  };

  const setForceSidebarCollapsed = (forced) => {
    setForceCollapsed(forced);
    if (forced) {
      setIsCollapsed(true);
    }
  };

  const setSidebarHidden = (hidden) => {
    setIsHidden(hidden);
  };

  const value = {
    isCollapsed,
    isMobile,
    isHidden,
    toggleSidebar,
    setSidebarCollapsed,
    setForceSidebarCollapsed,
    setSidebarHidden,
    forceCollapsed
  };

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
};
