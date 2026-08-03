/**
 * PageSkeleton — generic page-shaped loading placeholder (P0-D).
 *
 * Title bar + stat row + two card blocks, composed from the ut-kit skeleton
 * primitives (styles/ut-kit.css). Used as the Suspense fallback in App.jsx
 * and reusable as a page-level loading state anywhere a generic shape fits.
 */
import React from 'react';

const PageSkeleton = () => (
  <div className="ut-page" role="status" aria-label="Loading page">
    <div className="ut-skeleton ut-skeleton--text" style={{ width: 120, marginBottom: 12 }} />
    <div className="ut-skeleton ut-skeleton--title" style={{ width: 260, marginBottom: 26 }} />
    <div className="ut-grid ut-grid--3" style={{ marginBottom: 22 }}>
      <div className="ut-skeleton ut-skeleton--stat" />
      <div className="ut-skeleton ut-skeleton--stat" />
      <div className="ut-skeleton ut-skeleton--stat" />
    </div>
    <div className="ut-skeleton-stack">
      <div className="ut-skeleton ut-skeleton--card" />
      <div className="ut-skeleton ut-skeleton--card" />
    </div>
  </div>
);

export default PageSkeleton;
