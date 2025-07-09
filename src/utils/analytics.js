export const trackPageView = (path) => {
  if (window.gtag) {
    window.gtag('config', 'G-ZYQR480DRN', {
      page_path: path,
    });
  }
}; 