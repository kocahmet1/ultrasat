import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import AppErrorBoundary from './components/errors/AppErrorBoundary';
import { register as registerSW, cacheManager } from './utils/serviceWorkerRegistration';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
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
