// This file demonstrates how to integrate the membership system into existing components
// These are examples that can be copied and adapted for your actual pages

import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { MembershipGate, MembershipCard, MembershipBadge, UpgradePrompt } from '../components/membership';
import { FEATURE_ACCESS } from '../utils/membershipUtils';

// Example 1: Basic Feature Gate
const ExampleFeatureGate = () => {
  return (
    <div>
      <h2>Advanced Analytics</h2>
      <MembershipGate requiredTier="plus">
        <div className="advanced-analytics">
          <p>This is premium content only available to Plus and Max members!</p>
          <div className="analytics-charts">
            {/* Your premium analytics content here */}
          </div>
        </div>
      </MembershipGate>
    </div>
  );
};

// Example 2: Using Feature-Based Access Control
const ExampleFeatureBasedAccess = () => {
  return (
    <div>
      <h2>Study Tools</h2>
      
      {/* Flashcards - requires Plus tier */}
      <MembershipGate feature={FEATURE_ACCESS.FLASHCARDS}>
        <div className="flashcard-section">
          <h3>Flashcards</h3>
          <p>Create and study with custom flashcards</p>
          {/* Flashcard component here */}
        </div>
      </MembershipGate>
      
      {/* AI Recommendations - requires Max tier */}
      <MembershipGate feature={FEATURE_ACCESS.AI_RECOMMENDATIONS}>
        <div className="ai-recommendations">
          <h3>AI-Powered Recommendations</h3>
          <p>Get personalized study recommendations based on your performance</p>
          {/* AI recommendations component here */}
        </div>
      </MembershipGate>
    </div>
  );
};

// Example 3: Conditional Rendering Based on Membership
const ExampleConditionalRendering = () => {
  const { userMembership, hasFeatureAccess } = useAuth();
  
  const canAccessAdvancedFeatures = hasFeatureAccess('plus');
  const canAccessPremiumFeatures = hasFeatureAccess('max');
  
  return (
    <div>
      <h2>Dashboard</h2>
      
      {/* Always show basic content */}
      <div className="basic-dashboard">
        <h3>Basic Progress</h3>
        <p>Your current progress and recent activity</p>
      </div>
      
      {/* Conditionally show advanced features */}
      {canAccessAdvancedFeatures && (
        <div className="advanced-dashboard">
          <h3>Detailed Analytics</h3>
          <p>Advanced performance insights and trends</p>
        </div>
      )}
      
      {/* Show premium features only to Max members */}
      {canAccessPremiumFeatures && (
        <div className="premium-dashboard">
          <h3>AI Insights</h3>
          <p>Personalized recommendations and study plans</p>
        </div>
      )}
      
      {/* Show membership info */}
      <div className="membership-info">
        <h3>Your Membership</h3>
        <MembershipBadge tier={userMembership?.tier} />
        {userMembership?.tier === 'free' && (
          <p>
            <a href="/membership">Upgrade to unlock more features!</a>
          </p>
        )}
      </div>
    </div>
  );
};

// Example 4: Custom Fallback Content
const ExampleCustomFallback = () => {
  const customFallback = (
    <div className="upgrade-prompt">
      <h3>🚀 Unlock Premium Features</h3>
      <p>Upgrade to Plus to access unlimited practice questions and detailed explanations!</p>
      <button onClick={() => window.location.href = '/membership'}>
        View Plans
      </button>
    </div>
  );
  
  return (
    <div>
      <h2>Practice Questions</h2>
      
      {/* Basic questions available to all */}
      <div className="basic-questions">
        <h3>Basic Practice (Free)</h3>
        <p>5 questions per day</p>
      </div>
      
      {/* Premium questions with custom fallback */}
      <MembershipGate 
        requiredTier="plus" 
        fallback={customFallback}
        showUpgradePrompt={false}
      >
        <div className="premium-questions">
          <h3>Unlimited Practice (Plus/Max)</h3>
          <p>Unlimited questions with detailed explanations</p>
        </div>
      </MembershipGate>
    </div>
  );
};

// Example 5: Progress Dashboard Integration
const ExampleProgressDashboard = () => {
  const { userMembership } = useAuth();
  
  return (
    <div className="progress-dashboard">
      <div className="dashboard-header">
        <h1>My Progress</h1>
        <MembershipBadge tier={userMembership?.tier} size="large" />
      </div>
      
      {/* Basic progress - available to all */}
      <div className="basic-progress">
        <h2>Recent Activity</h2>
        {/* Basic progress components */}
      </div>
      
      {/* Advanced analytics - Plus and above */}
      <MembershipGate requiredTier="plus">
        <div className="advanced-progress">
          <h2>Detailed Analytics</h2>
          <div className="analytics-grid">
            {/* Advanced analytics components */}
          </div>
        </div>
      </MembershipGate>
      
      {/* AI insights - Max only */}
      <MembershipGate requiredTier="max">
        <div className="ai-insights">
          <h2>AI-Powered Insights</h2>
          <div className="insights-content">
            {/* AI insights components */}
          </div>
        </div>
      </MembershipGate>
      
      {/* Membership card */}
      <div className="membership-section">
        <MembershipCard compact={true} />
      </div>
    </div>
  );
};

// Example 6: Exam Results with Tier-Based Features
const ExampleExamResults = () => {
  const { userMembership, hasFeatureAccess } = useAuth();
  
  return (
    <div className="exam-results">
      <h1>Exam Results</h1>
      
      {/* Basic results - available to all */}
      <div className="basic-results">
        <h2>Your Score: 1450</h2>
        <p>Math: 750 | Reading & Writing: 700</p>
      </div>
      
      {/* Detailed breakdown - Plus and above */}
      <MembershipGate requiredTier="plus">
        <div className="detailed-results">
          <h3>Detailed Breakdown</h3>
          <div className="breakdown-charts">
            {/* Detailed charts and analysis */}
          </div>
        </div>
      </MembershipGate>
      
      {/* Performance insights - Max only */}
      <MembershipGate requiredTier="max">
        <div className="performance-insights">
          <h3>Performance Insights</h3>
          <div className="insights">
            <p>🎯 Focus on algebra and geometry for maximum improvement</p>
            <p>📈 Your reading comprehension has improved 15% this month</p>
            <p>⚡ Recommended next steps: Practice advanced math concepts</p>
          </div>
        </div>
      </MembershipGate>
      
      {/* Upgrade prompt for free users */}
      {userMembership?.tier === 'free' && (
        <div className="upgrade-prompt">
          <h3>Want more detailed insights?</h3>
          <p>Upgrade to Plus for detailed breakdowns and performance tracking!</p>
          <button onClick={() => window.location.href = '/membership'}>
            Upgrade Now
          </button>
        </div>
      )}
    </div>
  );
};

// Export all examples
// Example 7: Using the UpgradePrompt Widget
const ExampleUpgradePrompts = () => {
  return (
    <div className="upgrade-prompts-example">
      <h2>Feature Showcase</h2>

      <div className="feature-item">
        <h3>Advanced Charting Tools</h3>
        <p>This feature is available to all users, but Plus members get more options.</p>
        {/* An upgrade prompt can be placed next to a feature description */}
        <UpgradePrompt requiredTier="Plus" featureName="advanced charting" />
      </div>

      <div className="feature-item">
        <h3>AI-Powered Study Planner</h3>
        <p>Let our AI create a personalized study plan for you.</p>
        {/* This prompt will only show for users below the Max tier */}
        <UpgradePrompt 
          requiredTier="Max" 
          featureName="AI Study Planner" 
          message="Get your personalized AI-powered study plan with our Max membership."
        />
      </div>

      <div className="feature-item">
        <h3>Basic Analytics</h3>
        <p>All users can see their basic performance metrics.</p>
        {/* This prompt will not render if the user is already a Max member */}
        <UpgradePrompt requiredTier="Max" featureName="deeper insights" />
      </div>
    </div>
  );
};

// Export all examples
export {
  ExampleFeatureGate,
  ExampleFeatureBasedAccess,
  ExampleConditionalRendering,
  ExampleCustomFallback,
  ExampleProgressDashboard,
  ExampleExamResults,
  ExampleUpgradePrompts
};
