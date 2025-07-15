// Service Worker Registration with Performance Monitoring
const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  window.location.hostname === '[::1]' ||
  window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
);

export function register() {
  if ('serviceWorker' in navigator) {
    const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href);
    if (publicUrl.origin !== window.location.origin) {
      return;
    }

    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL}/sw.js`;

      if (isLocalhost) {
        checkValidServiceWorker(swUrl);
        navigator.serviceWorker.ready.then(() => {
          console.log('🔧 Service Worker running in localhost mode');
        });
      } else {
        registerValidSW(swUrl);
      }
    });
  }
}

function registerValidSW(swUrl) {
  navigator.serviceWorker
    .register(swUrl)
    .then(registration => {
      console.log('✅ Service Worker registered successfully');
      
      // Performance monitoring
      monitorPerformance(registration);
      
      // Listen for updates
      registration.addEventListener('updatefound', () => {
        const installingWorker = registration.installing;
        if (installingWorker == null) {
          return;
        }
        
        installingWorker.addEventListener('statechange', () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              console.log('🔄 New content available; please refresh');
              
              // Show update available notification
              showUpdateNotification();
            } else {
              console.log('🎉 Content cached for offline use');
            }
          }
        });
      });
    })
    .catch(error => {
      console.error('❌ Service Worker registration failed:', error);
    });
}

function checkValidServiceWorker(swUrl) {
  fetch(swUrl, {
    headers: { 'Service-Worker': 'script' },
  })
    .then(response => {
      const contentType = response.headers.get('content-type');
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf('javascript') === -1)
      ) {
        navigator.serviceWorker.ready.then(registration => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        registerValidSW(swUrl);
      }
    })
    .catch(() => {
      console.log('🔌 No internet connection. App running in offline mode.');
    });
}

function monitorPerformance(registration) {
  // Monitor cache effectiveness
  if ('performance' in window && 'getEntriesByType' in performance) {
    setTimeout(() => {
      const resources = performance.getEntriesByType('resource');
      let cacheHits = 0;
      let networkRequests = 0;
      
      resources.forEach(resource => {
        if (resource.transferSize === 0 && resource.decodedBodySize > 0) {
          cacheHits++;
        } else {
          networkRequests++;
        }
      });
      
      console.log(`📊 Cache Performance: ${cacheHits} hits, ${networkRequests} network requests`);
      console.log(`🎯 Cache Hit Rate: ${((cacheHits / (cacheHits + networkRequests)) * 100).toFixed(1)}%`);
    }, 3000);
  }
}

function showUpdateNotification() {
  // Show a simple notification about updates
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('UltraSAT Update Available', {
      body: 'New content is available. Please refresh the page.',
      icon: '/images/optimized/logo.webp',
      tag: 'app-update'
    });
  } else {
    // Fallback: Show a banner or modal
    const banner = document.createElement('div');
    banner.innerHTML = `
      <div style="
        position: fixed; 
        top: 0; 
        left: 0; 
        right: 0; 
        background: #3498db; 
        color: white; 
        padding: 1rem; 
        text-align: center; 
        z-index: 10000;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      ">
        ✨ New version available! 
        <button onclick="window.location.reload()" style="
          background: white; 
          color: #3498db; 
          border: none; 
          padding: 0.5rem 1rem; 
          margin-left: 1rem; 
          border-radius: 4px; 
          cursor: pointer;
        ">
          Refresh Now
        </button>
        <button onclick="this.parentElement.parentElement.remove()" style="
          background: transparent; 
          color: white; 
          border: 1px solid white; 
          padding: 0.5rem 1rem; 
          margin-left: 0.5rem; 
          border-radius: 4px; 
          cursor: pointer;
        ">
          Later
        </button>
      </div>
    `;
    document.body.appendChild(banner);
  }
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then(registration => {
        registration.unregister();
      })
      .catch(error => {
        console.error(error.message);
      });
  }
}

// Cache management utilities
export const cacheManager = {
  // Clear all caches
  async clearAll() {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('🗑️ All caches cleared');
    }
  },
  
  // Get cache size
  async getSize() {
    if ('caches' in window && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      const cacheSize = estimate.usage || 0;
      const quota = estimate.quota || 0;
      
      console.log(`💾 Cache Usage: ${(cacheSize / 1024 / 1024).toFixed(2)}MB / ${(quota / 1024 / 1024).toFixed(2)}MB`);
      return { usage: cacheSize, quota };
    }
  },
  
  // Preload critical resources
  async preloadCritical() {
    const criticalResources = [
      '/images/optimized/middle.webp',
      '/images/optimized/aihot.webp',
      '/manifest.json'
    ];
    
    await Promise.all(
      criticalResources.map(async (url) => {
        try {
          const response = await fetch(url);
          if (response.ok) {
            console.log(`✅ Preloaded: ${url}`);
          }
        } catch (error) {
          console.warn(`❌ Failed to preload: ${url}`, error);
        }
      })
    );
  }
}; 