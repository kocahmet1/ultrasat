import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLock, FiCheck } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { hasAccess, getTierInfo, getAvailableUpgrades, hasFeatureAccess as hasFeatureTierAccess } from '../../utils/membershipUtils';
import { PRO_BENEFITS, PRO_PRICE_LINE, SHOW_PRICES, PRICE_TBD_LINE } from './ProUpgradeModal';
import './MembershipGate.css';

// Max is never sold through the gate today, but keep its price honest
// (verified against components/MembershipUpgrade.jsx).
const PRICE_LINE_BY_TIER = {
  plus: PRO_PRICE_LINE,
  max: '$19.99/mo or $199.99/yr',
};

const MembershipGate = ({
  requiredTier,
  children,
  fallback = null,
  showUpgradePrompt = true,
  feature = null,
  featureName = null
}) => {
  const { userMembership } = useAuth();
  const navigate = useNavigate();

  if (!userMembership) {
    return fallback || (
      <div className="membership-gate-loading" role="status" aria-label="Checking your access">
        <div className="membership-gate-skeleton" />
      </div>
    );
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
    const tierName = targetTierInfo.name;
    const benefits = targetTier === 'plus' ? PRO_BENEFITS : targetTierInfo.features.slice(0, 4);
    const priceLine = PRICE_LINE_BY_TIER[targetTier] || PRO_PRICE_LINE;

    return (
      <div className="membership-gate">
        <div className="ut-card ut-card--accent membership-gate-card">
          <div className="membership-gate-badge">
            <FiLock aria-hidden="true" />
          </div>

          <h3 className="membership-gate-title">
            {featureName ? `${featureName} is a ${tierName} feature` : `This is a ${tierName} feature`}
          </h3>
          <p className="membership-gate-sub">
            One upgrade opens all of it — here's what comes with {tierName}:
          </p>

          <ul className="membership-gate-benefits">
            {benefits.map((benefit) => (
              <li key={benefit}>
                <FiCheck aria-hidden="true" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>

          <p className="membership-gate-price">
            {SHOW_PRICES ? (
              <>
                {priceLine}
                <span> · cancel anytime</span>
              </>
            ) : (
              PRICE_TBD_LINE
            )}
          </p>

          <div className="membership-gate-actions">
            <button
              type="button"
              className="ut-btn ut-btn--primary ut-btn--lg"
              onClick={() => navigate('/membership/upgrade')}
            >
              Upgrade to {tierName}
            </button>
            <button
              type="button"
              className="ut-btn ut-btn--ghost"
              onClick={() => navigate('/dashboard')}
            >
              Back to dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default MembershipGate;
