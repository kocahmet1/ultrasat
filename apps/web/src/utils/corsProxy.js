/**
 * CORS Proxy utility for development
 * This provides a workaround for CORS issues when developing locally
 * In production, this should be replaced with proper CORS configuration on the server
 */

// Function to fetch from Firebase Functions with CORS proxy in development
export const fetchWithCorsProxy = async (functionUrl, data) => {
  // In development, use a CORS proxy
  if (window.location.hostname === 'localhost') {
    // Use the cors-anywhere public demo proxy (for development only)
    // IMPORTANT: This is just for development and has rate limits
    const corsProxyUrl = 'https://cors-anywhere.herokuapp.com/';
    
    try {
      const response = await fetch(`${corsProxyUrl}${functionUrl}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest', // Required by cors-anywhere
        },
        body: JSON.stringify({ data })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error using CORS proxy:', error);
      throw error;
    }
  } else {
    // In production, use direct fetch
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return await response.json();
  }
};

// Development note for React app
console.log('Note: To use the CORS proxy during development:');
console.log('1. Visit https://cors-anywhere.herokuapp.com/corsdemo');
console.log('2. Click "Request temporary access to the demo server"');
console.log('3. Refresh your React application');
