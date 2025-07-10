export const trackPageView = (path) => {
  if (window.gtag) {
    window.gtag('config', 'G-VRG24M0NE4', {
      page_path: path,
    });
  }
}; 