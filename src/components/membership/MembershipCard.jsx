import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getTierInfo, getDaysRemaining, formatMembershipDate } from '../../utils/membershipUtils';
import MembershipBadge from './MembershipBadge';
import './MembershipCard.css';

const MembershipCard = ({ showUpgradeButton = true, compact = false }) => {
  const { userMembership } = useAuth();
  
  if (!userMembership) return null;
  
  const tierInfo = getTierInfo(userMembership.tier);
  const daysRemaining = getDaysRemaining(userMembership.endDate);
  const formattedEndDate = formatMembershipDate(userMembership.endDate);
  
  return (
    <div className={`membership-card ${compact ? 'membership-card-compact' : ''}`}>
      <div className="membership-card-header">
        <MembershipBadge tier={userMembership.tier} size={compact ? 'small' : 'medium'} />
        <div className="membership-card-info">
          <h3 className="membership-card-title">{tierInfo.displayName}</h3>
          <p className="membership-card-description">{tierInfo.description}</p>
        </div>
      </div>
      
      {userMembership.tier !== 'free' && userMembership.endDate && (
        <div className="membership-card-expiry">
          {daysRemaining > 0 ? (
            <p className="membership-expiry-text">
              <span className="membership-expiry-days">{daysRemaining}</span> days remaining
            </p>
          ) : (
            <p className="membership-expiry-text expired">
              Expired on {formattedEndDate}
            </p>
          )}
        </div>
      )}
      
      {!compact && (
        <div className="membership-card-features">
          <h4>Your benefits:</h4>
          <ul>
            {tierInfo.features.map((feature, index) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
        </div>
      )}
      
      {showUpgradeButton && userMembership.tier !== 'max' && (
        <div className="membership-card-actions">
          <button 
            className="membership-upgrade-btn"
            onClick={() => {
              // TODO: Implement upgrade flow
              console.log('Upgrade clicked');
            }}
          >
            {userMembership.tier === 'free' ? 'Upgrade Now' : 'Upgrade to Max'}
          </button>
        </div>
      )}
    </div>
  );
};

export default MembershipCard;
