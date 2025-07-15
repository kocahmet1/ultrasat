import React, { useState, useRef, useEffect } from 'react';

const OptimizedImage = ({ 
  src, 
  alt, 
  className = '', 
  style = {}, 
  lazy = true,
  optimized = true,
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(!lazy);
  const imgRef = useRef();

  // Extract filename without extension for optimized versions
  const getOptimizedSrc = (originalSrc) => {
    if (!optimized) return originalSrc;
    
    const filename = originalSrc.split('/').pop().split('.')[0];
    const optimizedImages = [
      'sat-common-mistakes',
      'sat-time-management', 
      'sat-math-strategies',
      'sat-reading-tips',
      'sat-test-day',
      'phonescreen',
      'middle',
      'aihot'
    ];
    
    if (optimizedImages.includes(filename)) {
      return {
        webp: `/images/optimized/${filename}.webp`,
        fallback: `/images/optimized/${filename}.jpg`
      };
    }
    
    return originalSrc;
  };

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px' // Start loading 50px before image enters viewport
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [lazy, isInView]);

  const optimizedSrc = getOptimizedSrc(src);
  
  // If not optimized or not in view (for lazy loading), show placeholder
  if (lazy && !isInView) {
    return (
      <div 
        ref={imgRef}
        className={`image-placeholder ${className}`}
        style={{
          ...style,
          backgroundColor: '#f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: style.height || '100px'
        }}
        {...props}
      >
        <span style={{ color: '#ccc', fontSize: '12px' }}>Loading...</span>
      </div>
    );
  }

  // If we have optimized versions with WebP support
  if (typeof optimizedSrc === 'object') {
    return (
      <picture className={className} {...props}>
        <source srcSet={optimizedSrc.webp} type="image/webp" />
        <img
          ref={imgRef}
          src={optimizedSrc.fallback}
          alt={alt}
          style={style}
          loading={lazy ? 'lazy' : 'eager'}
          onLoad={() => setIsLoaded(true)}
          className={`optimized-image ${isLoaded ? 'loaded' : 'loading'}`}
        />
      </picture>
    );
  }

  // Fallback for non-optimized images
  return (
    <img
      ref={imgRef}
      src={optimizedSrc}
      alt={alt}
      className={`image ${className} ${isLoaded ? 'loaded' : 'loading'}`}
      style={style}
      loading={lazy ? 'lazy' : 'eager'}
      onLoad={() => setIsLoaded(true)}
      {...props}
    />
  );
};

export default OptimizedImage; 