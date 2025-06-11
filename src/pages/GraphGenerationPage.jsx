import React from 'react';
import '../styles/GraphGeneration.css';

const GraphGenerationPage = () => {
  return (
    <div className="graph-generation-page">
      <div className="page-header">
        <h1>Graph Generation</h1>
        <p>AI-powered graph generation from text descriptions</p>
      </div>

      {/* Feature Disabled Notice */}
      <div className="environment-status">
        <div className="status-card disabled">
          <span className="status-icon">🚫</span>
          <div className="status-content">
            <h3>Graph Generation Disabled</h3>
            <p>
              Graph generation functionality has been disabled in this deployment version 
              to optimize performance and reduce resource usage.
            </p>
            <div className="disabled-details">
              <h4>Why is this disabled?</h4>
              <ul>
                <li>⚡ <strong>Faster deployments</strong> - Reduced build times</li>
                <li>💰 <strong>Lower resource usage</strong> - Smaller memory footprint</li>
                <li>🚀 <strong>Improved stability</strong> - Fewer dependencies</li>
                <li>🔧 <strong>Streamlined codebase</strong> - Focus on core features</li>
              </ul>
            </div>
            <div className="contact-info">
              <p>
                <strong>Need graph generation?</strong> Contact the administrator to enable 
                this feature or use an alternative deployment with full AI capabilities.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Alternative Solutions */}
      <div className="alternatives-section">
        <h3>Alternative Solutions</h3>
        <div className="alternatives-grid">
          <div className="alternative-card">
            <h4>📊 Manual Graph Upload</h4>
            <p>Create graphs using external tools and upload them directly to questions</p>
          </div>
          <div className="alternative-card">
            <h4>🌐 Online Graph Tools</h4>
            <p>Use online graphing tools like Desmos, GeoGebra, or Wolfram Alpha</p>
          </div>
          <div className="alternative-card">
            <h4>🖼️ Static Images</h4>
            <p>Upload pre-created graph images for mathematical concepts</p>
          </div>
        </div>
      </div>

      {/* Core Features Still Available */}
      <div className="available-features">
        <h3>✅ Available Features</h3>
        <div className="features-grid">
          <div className="feature-card available">
            <span className="feature-icon">❓</span>
            <h4>Question Management</h4>
            <p>Create, edit, and organize questions</p>
          </div>
          <div className="feature-card available">
            <span className="feature-icon">🧠</span>
            <h4>Adaptive Quizzes</h4>
            <p>AI-powered personalized learning paths</p>
          </div>
          <div className="feature-card available">
            <span className="feature-icon">📊</span>
            <h4>Analytics</h4>
            <p>Track learning progress and performance</p>
          </div>
          <div className="feature-card available">
            <span className="feature-icon">👥</span>
            <h4>User Management</h4>
            <p>Manage students and instructors</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GraphGenerationPage; 