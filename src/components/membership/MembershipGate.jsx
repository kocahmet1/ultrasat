import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { hasAccess, getTierInfo, getAvailableUpgrades } from '../../utils/membershipUtils';
import MembershipBadge from './MembershipBadge';
import './MembershipGate.css';

const MembershipGate = ({ 
  requiredTier, 
  children, 
  fallback = null,
  showUpgradePrompt = true,
  feature = null 
}) => {
  const { userMembership, hasFeatureAccess } = useAuth();
  
  // If no membership data yet, show loading or deny access
  if (!userMembership) {
    return fallback || <div className="membership-gate-loading">Loading...</div>;
  }
  
  // Check access based on tier or specific feature
  const hasAccessToFeature = feature 
    ? hasFeatureAccess(userMembership.tier, feature)
    : hasAccess(userMembership.tier, requiredTier);
  
  // If user has access, render children
  if (hasAccessToFeature) {
    return children;
  }
  
  // If fallback is provided, use it
  if (fallback) {
    return fallback;
  }
  
  // Show upgrade prompt if enabled
  if (showUpgradePrompt) {
    const currentTierInfo = getTierInfo(userMembership.tier);
    const availableUpgrades = getAvailableUpgrades(userMembership.tier);
    const targetTier = requiredTier || (availableUpgrades.length > 0 ? availableUpgrades[0].tier : 'plus');
    const targetTierInfo = getTierInfo(targetTier);
    
    return (
      <div className="membership-gate">
        <div className="membership-gate-content">
          <div className="membership-gate-icon">🔒</div>
          <h3 className="membership-gate-title">Premium Feature</h3>
          <p className="membership-gate-description">
            This feature requires {targetTierInfo.displayName} membership or higher.
          </p>
          
          <div className="membership-gate-tiers">
            <div className="membership-gate-current">
              <span className="membership-gate-label">Your current plan:</span>
              <MembershipBadge tier={userMembership.tier} size="small" />
            </div>
            <div className="membership-gate-required">
              <span className="membership-gate-label">Required plan:</span>
              <MembershipBadge tier={targetTier} size="small" />
            </div>
          </div>
          
          <div className="membership-gate-benefits">
            <h4>Upgrade to unlock:</h4>
            <ul>
              {targetTierInfo.features.slice(0, 3).map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
              {targetTierInfo.features.length > 3 && (
                <li>...and {targetTierInfo.features.length - 3} more features</li>
              )}
            </ul>
          </div>
          
          <div className="membership-gate-actions">
            <button 
              className="membership-gate-upgrade-btn"
              onClick={() => {
                // TODO: Implement upgrade flow
                console.log('Upgrade to', targetTier);
              }}
            >
              Upgrade to {targetTierInfo.name} - {targetTierInfo.price}
            </button>
            <button 
              className="membership-gate-learn-more-btn"
              onClick={() => {
                // TODO: Navigate to pricing page
                console.log('Learn more about plans');
              }}
            >
              Learn More
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Default: don't render anything
  return null;
};

export default MembershipGate;
