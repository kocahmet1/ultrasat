import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { MEMBERSHIP_TIERS } from '../../utils/membershipUtils';
import './UpgradePrompt.css';

/**
 * A reusable component to prompt users to upgrade their membership.
 * @param {{ requiredTier: 'Plus' | 'Max', featureName: string, message?: string }} props
 */
const UpgradePrompt = ({ requiredTier, featureName, message }) => {
  const { currentUser } = useAuth();

  if (!currentUser || !requiredTier || !featureName) {
    return null;
  }

  const userTierIndex = MEMBERSHIP_TIERS[currentUser.membershipTier]?.level || 0;
  const requiredTierIndex = MEMBERSHIP_TIERS[requiredTier]?.level || 1;

  // Only show the prompt if the user's tier is below the required tier
  if (userTierIndex >= requiredTierIndex) {
    return null;
  }

  const defaultMessage = `Unlock ${featureName} and more with our ${requiredTier} plan.`;

  return (
    <div className="upgrade-prompt-widget">
      <p>{message || defaultMessage}</p>
      <Link to="/membership" className="upgrade-prompt-button">Upgrade Now</Link>
    </div>
  );
};

export default UpgradePrompt;
