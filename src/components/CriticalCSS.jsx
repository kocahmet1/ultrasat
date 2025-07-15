import { useEffect } from 'react';

// Critical CSS that should be loaded immediately for initial paint
const criticalCSS = `
  /* Critical above-the-fold styles */
  * { box-sizing: border-box; }
  body { 
    margin: 0; 
    padding: 0; 
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    background: #ffffff;
    color: #333;
    line-height: 1.6;
  }
  
  /* Layout essentials */
  .app { 
    display: flex; 
    flex-direction: column; 
    min-height: 100vh; 
  }
  
  /* Header critical styles */
  .header, .top-nav-bar {
    position: sticky;
    top: 0;
    z-index: 1000;
    background: #fff;
    border-bottom: 1px solid #e0e0e0;
  }
  
  /* Hero section critical styles */
  .hero-section-new {
    padding: 2rem 1rem;
    text-align: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }
  
  .hero-title-center {
    font-size: clamp(2rem, 5vw, 3.5rem);
    font-weight: 700;
    margin: 1rem 0;
    line-height: 1.2;
  }
  
  /* Loading spinner */
  .loading-spinner {
    display: inline-block;
    width: 20px;
    height: 20px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #3498db;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  /* Image loading states */
  .optimized-image, .image {
    transition: opacity 0.3s ease;
  }
  
  .optimized-image.loading, .image.loading {
    opacity: 0.6;
  }
  
  .image-placeholder {
    animation: pulse 1.5s ease-in-out infinite alternate;
  }
  
  @keyframes pulse {
    0% { opacity: 1; }
    100% { opacity: 0.4; }
  }
  
  /* Container and responsive layout */
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
  }
  
  /* Button essentials */
  .btn, .button, button {
    display: inline-block;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
    text-decoration: none;
    transition: all 0.2s ease;
  }
  
  .btn-primary {
    background: #3498db;
    color: white;
  }
  
  .btn-primary:hover {
    background: #2980b9;
    transform: translateY(-1px);
  }
  
  /* Responsive utilities */
  @media (max-width: 768px) {
    .container { padding: 0 0.5rem; }
    .hero-section-new { padding: 1rem 0.5rem; }
  }
`;

// Non-critical styles that can be loaded after initial paint
const nonCriticalStyles = [
  '/src/styles/LandingPage.css',
  '/src/styles/ExamModuleManager.css', 
  '/src/styles/Results.css',
  '/src/styles/ProgressDashboard.css',
  '/src/styles/Dashboard.css',
  '/src/styles/AdminDashboard.css',
  // Add other large CSS files here
];

const CriticalCSS = () => {
  useEffect(() => {
    // Inject critical CSS immediately
    const criticalStyle = document.createElement('style');
    criticalStyle.textContent = criticalCSS;
    criticalStyle.setAttribute('data-critical', 'true');
    document.head.insertBefore(criticalStyle, document.head.firstChild);

    // Load non-critical CSS after initial paint
    const loadNonCriticalCSS = () => {
      nonCriticalStyles.forEach(href => {
        // Check if already loaded
        if (document.querySelector(`link[href="${href}"]`)) return;
        
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        link.media = 'print'; // Load as print to avoid render blocking
        link.onload = function() {
          this.media = 'all'; // Apply to all media after load
        };
        document.head.appendChild(link);
      });
    };

    // Use requestIdleCallback if available, otherwise setTimeout
    if ('requestIdleCallback' in window) {
      requestIdleCallback(loadNonCriticalCSS);
    } else {
      setTimeout(loadNonCriticalCSS, 100);
    }

    // Cleanup function
    return () => {
      const criticalStyleEl = document.querySelector('style[data-critical="true"]');
      if (criticalStyleEl) {
        criticalStyleEl.remove();
      }
    };
  }, []);

  return null; // This component doesn't render anything
};

export default CriticalCSS; 