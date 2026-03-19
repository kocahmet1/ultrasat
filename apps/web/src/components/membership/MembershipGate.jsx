import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { hasAccess, getTierInfo, getAvailableUpgrades, hasFeatureAccess as hasFeatureTierAccess } from '../../utils/membershipUtils';
import MembershipBadge from './MembershipBadge';
import './MembershipGate.css';

const MembershipGate = ({
  requiredTier,
  children,
  fallback = null,
  showUpgradePrompt = true,
  feature = null
}) => {
  const { userMembership } = useAuth();
  const navigate = useNavigate();

  if (!userMembership) {
    return fallback || <div className="membership-gate-loading">Loading...</div>;
  }

  const hasAccessToFeature = feature
    ? hasFeatureTierAccess(userMembership.tier, feature)
    : hasAccess(userMembership.tier, requiredTier);

  if (hasAccessToFeature) {
    return children;
  }

  if (fallback) {
    return fallback;
  }

  if (showUpgradePrompt) {
    const availableUpgrades = getAvailableUpgrades(userMembership.tier);
    const targetTier = requiredTier || (availableUpgrades.length > 0 ? availableUpgrades[0].tier : 'plus');
    const targetTierInfo = getTierInfo(targetTier);

    return (
      <div className="membership-gate">
        <div className="membership-gate-content">
          <div className="membership-gate-icon">LOCKED</div>
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
              {targetTierInfo.features.slice(0, 3).map((featureName, index) => (
                <li key={index}>{featureName}</li>
              ))}
              {targetTierInfo.features.length > 3 && (
                <li>...and {targetTierInfo.features.length - 3} more features</li>
              )}
            </ul>
          </div>

          <div className="membership-gate-actions">
            <button
              className="membership-gate-upgrade-btn"
              onClick={() => navigate('/membership/upgrade')}
            >
              Upgrade to {targetTierInfo.name} - {targetTierInfo.price}
            </button>
            <button
              className="membership-gate-learn-more-btn"
              onClick={() => navigate('/membership/upgrade')}
            >
              Learn More
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default MembershipGate;
