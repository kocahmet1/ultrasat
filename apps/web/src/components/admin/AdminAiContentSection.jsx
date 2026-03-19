import React from 'react';

function AdminAiContentSection({ onGoToAiContentManager }) {
  return (
    <div className="ai-content-tab">
      <div className="tab-header">
        <h2>AI Content Validation</h2>
        <button className="primary-button" onClick={onGoToAiContentManager}>
          Go to AI Content Manager
        </button>
      </div>

      <div className="ai-content-overview">
        <div className="info-card">
          <h3>About AI Content Validation</h3>
          <p>Review and approve AI-generated lessons and skill drills before they are shown to students.</p>
          <ul>
            <li>Validate content accuracy and educational quality</li>
            <li>Edit AI-generated content as needed</li>
            <li>Monitor token usage and costs</li>
            <li>Ensure lessons align with curriculum standards</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default AdminAiContentSection;
