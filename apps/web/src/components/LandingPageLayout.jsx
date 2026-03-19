import React from 'react';
import { Outlet } from 'react-router-dom';
import AnalyticsTracker from './AnalyticsTracker';

const LandingPageLayout = () => {
  return (
    <>
      <AnalyticsTracker />
      <div className="landing-app-container">
        <Outlet />
      </div>
    </>
  );
};

export default LandingPageLayout; 