// Cache Configuration for UltraSAT Performance Optimization
export const CACHE_CONFIG = {
  // Static Assets - Very Long Cache (1 year)
  STATIC_ASSETS: {
    maxAge: 31536000, // 1 year in seconds
    paths: [
      '/static/css/*',
      '/static/js/*', 
      '/static/media/*',
      '*.woff',
      '*.woff2',
      '*.ttf',
      '*.eot'
    ],
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Expires': new Date(Date.now() + 31536000 * 1000).toUTCString()
    }
  },
  
  // Optimized Images - Long Cache (30 days)
  OPTIMIZED_IMAGES: {
    maxAge: 2592000, // 30 days
    paths: [
      '/images/optimized/*',
      '*.webp',
      '*.avif'
    ],
    headers: {
      'Cache-Control': 'public, max-age=2592000',
      'Vary': 'Accept'
    }
  },
  
  // Regular Images - Medium Cache (7 days)
  IMAGES: {
    maxAge: 604800, // 7 days
    paths: [
      '/images/*',
      '*.png',
      '*.jpg', 
      '*.jpeg',
      '*.gif',
      '*.svg'
    ],
    headers: {
      'Cache-Control': 'public, max-age=604800'
    }
  },
  
  // HTML Pages - Short Cache (1 hour)
  HTML: {
    maxAge: 3600, // 1 hour
    paths: [
      '/',
      '*.html'
    ],
    headers: {
      'Cache-Control': 'public, max-age=3600, must-revalidate',
      'Vary': 'Accept-Encoding'
    }
  },
  
  // API Responses - Very Short Cache (5 minutes)
  API: {
    maxAge: 300, // 5 minutes
    paths: [
      '/api/*'
    ],
    headers: {
      'Cache-Control': 'public, max-age=300, must-revalidate',
      'Vary': 'Accept, Authorization'
    }
  },
  
  // Manifest and Service Worker - No Cache
  NO_CACHE: {
    maxAge: 0,
    paths: [
      '/sw.js',
      '/manifest.json',
      '/robots.txt'
    ],
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  }
};

// Express.js middleware for cache headers
export const applyCacheHeaders = (req, res, next) => {
  const url = req.url;
  const method = req.method;
  
  // Only apply cache headers to GET requests
  if (method !== 'GET') {
    return next();
  }
  
  let config = null;
  
  // Determine which cache config to apply
  if (CACHE_CONFIG.NO_CACHE.paths.some(path => matchPath(url, path))) {
    config = CACHE_CONFIG.NO_CACHE;
  } else if (CACHE_CONFIG.STATIC_ASSETS.paths.some(path => matchPath(url, path))) {
    config = CACHE_CONFIG.STATIC_ASSETS;
  } else if (CACHE_CONFIG.OPTIMIZED_IMAGES.paths.some(path => matchPath(url, path))) {
    config = CACHE_CONFIG.OPTIMIZED_IMAGES;
  } else if (CACHE_CONFIG.IMAGES.paths.some(path => matchPath(url, path))) {
    config = CACHE_CONFIG.IMAGES;
  } else if (CACHE_CONFIG.API.paths.some(path => matchPath(url, path))) {
    config = CACHE_CONFIG.API;
  } else if (CACHE_CONFIG.HTML.paths.some(path => matchPath(url, path))) {
    config = CACHE_CONFIG.HTML;
  }
  
  // Apply headers if config found
  if (config) {
    Object.entries(config.headers).forEach(([header, value]) => {
      res.setHeader(header, value);
    });
  }
  
  next();
};

// Helper function to match paths (supports wildcards)
function matchPath(url, pattern) {
  if (pattern.includes('*')) {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return regex.test(url);
  }
  return url === pattern || url.startsWith(pattern);
}

// Nginx configuration generator
export const generateNginxConfig = () => {
  return `
# UltraSAT Performance Cache Configuration
# Add this to your nginx.conf or site configuration

# Enable compression
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_proxied any;
gzip_comp_level 6;
gzip_types
    text/plain
    text/css
    text/xml
    text/javascript
    application/javascript
    application/xml+rss
    application/json
    application/x-font-ttf
    font/opentype
    image/svg+xml;

# Static assets (JS, CSS, fonts) - 1 year cache
location ~* \\.(js|css|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    add_header Vary "Accept-Encoding";
}

# Optimized images - 30 days cache
location ~* /images/optimized/.*\\.(webp|avif)$ {
    expires 30d;
    add_header Cache-Control "public";
    add_header Vary "Accept";
}

# Regular images - 7 days cache
location ~* \\.(png|jpg|jpeg|gif|svg)$ {
    expires 7d;
    add_header Cache-Control "public";
    add_header Vary "Accept-Encoding";
}

# HTML files - 1 hour cache
location ~* \\.(html)$ {
    expires 1h;
    add_header Cache-Control "public, must-revalidate";
    add_header Vary "Accept-Encoding";
}

# Service worker and manifest - no cache
location ~* /(sw\\.js|manifest\\.json|robots\\.txt)$ {
    expires -1;
    add_header Cache-Control "no-cache, no-store, must-revalidate";
    add_header Pragma "no-cache";
}

# API routes - 5 minutes cache
location /api/ {
    expires 5m;
    add_header Cache-Control "public, must-revalidate";
    add_header Vary "Accept, Authorization";
}
`;
};

// CloudFront configuration
export const CLOUDFRONT_CONFIG = {
  defaultCacheBehavior: {
    TargetOriginId: 'ultrasat-origin',
    ViewerProtocolPolicy: 'redirect-to-https',
    CachePolicyId: 'customCachePolicy',
    Compress: true
  },
  
  cacheBehaviors: [
    {
      PathPattern: '/static/*',
      CachePolicyId: 'staticAssetsPolicy', // 1 year cache
      ViewerProtocolPolicy: 'redirect-to-https',
      Compress: true
    },
    {
      PathPattern: '/images/optimized/*', 
      CachePolicyId: 'optimizedImagesPolicy', // 30 days cache
      ViewerProtocolPolicy: 'redirect-to-https',
      Compress: true
    },
    {
      PathPattern: '/api/*',
      CachePolicyId: 'apiPolicy', // 5 minutes cache
      ViewerProtocolPolicy: 'redirect-to-https',
      Compress: false
    }
  ]
};

console.log('📋 Cache configuration loaded for UltraSAT performance optimization'); 