import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import AnalyticsTracker from './AnalyticsTracker';
import SiteFooter from './SiteFooter';
import './LandingPageLayout.css';

/**
 * Layout for the public (no-sidebar) routes: legal pages, company pages,
 * blog, auth, and the landing page itself.
 *
 * Before P0-B this was a bare <Outlet/>, so /privacy, /terms, /about etc.
 * rendered with zero navigation — no way home, no footer. Now every child
 * gets a slim header (wordmark + login/signup) and the global SiteFooter.
 *
 * Exception: "/" (LandingPageV3) ships its own full nav and renders
 * SiteFooter inside its scaled design canvas, so it stays bare here —
 * otherwise the landing page would get a double header and double footer.
 */
const LandingPageLayout = () => {
  const { pathname } = useLocation();
  const isLanding = pathname === '/';

  if (isLanding) {
    return (
      <>
        <AnalyticsTracker />
        <div className="landing-app-container">
          <Outlet />
        </div>
      </>
    );
  }

  return (
    <>
      <AnalyticsTracker />
      <div className="landing-app-container lpl-frame">
        <header className="lpl-header">
          <div className="lpl-header-inner">
            <Link to="/" className="lpl-brand" aria-label="UltraSAT home">
              <span className="lpl-brand-mark" aria-hidden="true"></span>
              <span className="lpl-brand-word">UltraSAT</span>
            </Link>

            <nav className="lpl-header-links" aria-label="Account">
              <Link to="/login" className="lpl-login">Log in</Link>
              <Link to="/signup" className="lpl-signup">Sign up</Link>
            </nav>
          </div>
        </header>

        <main className="lpl-main">
          <Outlet />
        </main>

        <SiteFooter />
      </div>
    </>
  );
};

export default LandingPageLayout;
