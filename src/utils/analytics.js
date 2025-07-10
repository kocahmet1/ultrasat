export const trackPageView = (path) => {
  console.log('Analytics: Attempting to track page view for:', path);
  console.log('Analytics: Current domain:', window.location.hostname);
  
  if (typeof window !== 'undefined' && window.gtag) {
    console.log('Analytics: gtag found, sending page view...');
    window.gtag('config', 'G-VRG24M0NE4', {
      page_path: path,
    });
    console.log('Analytics: Page view sent successfully');
  } else {
    console.error('Analytics: gtag not available!');
    console.log('Analytics: window.gtag =', typeof window !== 'undefined' ? window.gtag : 'window not available');
  }
}; 