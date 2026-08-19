import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/tokens.css'; // V3 design tokens (Overhaul Phase F) — before all other styles
import './styles/ut-kit.css'; // shared UI kit built on the tokens (Phase G)
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import AppErrorBoundary from './components/errors/AppErrorBoundary';
import { register as registerSW, cacheManager } from './utils/serviceWorkerRegistration';
import posthog from 'posthog-js';
import { PostHogProvider } from '@posthog/react';

// Initialize PostHog — keys are read from environment variables and guarded
// so a missing config never breaks the app in production.
const POSTHOG_TOKEN = import.meta.env.VITE_PUBLIC_POSTHOG_PROJECT_TOKEN;
const POSTHOG_HOST = import.meta.env.VITE_PUBLIC_POSTHOG_HOST;

if (POSTHOG_TOKEN && POSTHOG_HOST) {
  posthog.init(POSTHOG_TOKEN, {
    api_host: POSTHOG_HOST,
    defaults: '2026-01-30',
  });
} else if (import.meta.env.DEV) {
  // Loudly warn in development so misconfigured envs are caught early.
  console.error(
    'VITE_PUBLIC_POSTHOG_PROJECT_TOKEN or VITE_PUBLIC_POSTHOG_HOST variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once both variables are configured.'
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <PostHogProvider client={posthog}>
      <AppErrorBoundary>
        <App />
      </AppErrorBoundary>
    </PostHogProvider>
  </React.StrictMode>
);

// Register service worker for aggressive caching only in production
if (process.env.NODE_ENV === 'production') {
  registerSW();
} else {
  import('./utils/serviceWorkerRegistration').then(sw => sw.unregister());
}

// Preload critical resources after initial load
window.addEventListener('load', () => {
  setTimeout(() => {
    cacheManager.preloadCritical();
    cacheManager.getSize(); // Log cache usage
  }, 2000);
});

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
