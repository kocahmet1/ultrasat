import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '../utils/analytics';
import { useAuth } from '../contexts/AuthContext';
import { logEvent, EVENT_TYPES } from '../coach/events';

// A new coach "session" starts when the user shows up after this much inactivity.
const SESSION_GAP_MS = 4 * 60 * 60 * 1000; // 4 hours
const LS_KEY = 'coach_last_session_ts';

const AnalyticsTracker = () => {
  const location = useLocation();
  const { currentUser } = useAuth();

  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location]);

  // === AI Coach event stream: session_start (gap-detected, once per session) ===
  useEffect(() => {
    if (!currentUser) return;
    try {
      const last = parseInt(localStorage.getItem(LS_KEY) || '0', 10);
      const now = Date.now();
      if (now - last > SESSION_GAP_MS) {
        localStorage.setItem(LS_KEY, String(now));
        logEvent(EVENT_TYPES.SESSION_START, {
          entryRoute: location.pathname,
          device: window.innerWidth <= 768 ? 'mobile' : 'desktop',
        }).catch(() => {});
      } else {
        // Keep the session warm so the gap is measured from last activity.
        localStorage.setItem(LS_KEY, String(now));
      }
    } catch (e) {
      // localStorage unavailable (private mode etc.) — never break the app.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, location.pathname]);

  return null;
};

export default AnalyticsTracker;
