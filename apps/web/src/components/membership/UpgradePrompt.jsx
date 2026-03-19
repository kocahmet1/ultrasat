import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { MEMBERSHIP_TIERS, TIER_HIERARCHY } from '../../utils/membershipUtils';
import './UpgradePrompt.css';

/**
 * A reusable component to prompt users to upgrade their membership.
 * @param {{ requiredTier: 'Plus' | 'Max', featureName: string, message?: string }} props
 */
const UpgradePrompt = ({ requiredTier, featureName, message }) => {
  const { currentUser, userMembership } = useAuth();

  if (!currentUser || !userMembership || !requiredTier || !featureName) {
    return null;
  }

  const normalizedRequiredTier = String(requiredTier).toLowerCase();
  const userTierIndex = TIER_HIERARCHY[userMembership.tier] || 0;
  const requiredTierIndex = TIER_HIERARCHY[normalizedRequiredTier] || TIER_HIERARCHY[MEMBERSHIP_TIERS.PLUS];

  // Only show the prompt if the user's tier is below the required tier
  if (userTierIndex >= requiredTierIndex) {
    return null;
  }

  const defaultMessage = `Unlock ${featureName} and more with our ${normalizedRequiredTier} plan.`;

  return (
    <div className="upgrade-prompt-widget">
      <p>{message || defaultMessage}</p>
      <Link to="/membership/upgrade" className="upgrade-prompt-button">Upgrade Now</Link>
    </div>
  );
};

export default UpgradePrompt;
