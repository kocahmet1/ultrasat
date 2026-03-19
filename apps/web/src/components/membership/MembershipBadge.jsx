import React from 'react';
import { getTierInfo } from '../../utils/membershipUtils';
import './MembershipBadge.css';

const MembershipBadge = ({ tier, size = 'medium', showName = true }) => {
  const tierInfo = getTierInfo(tier);
  
  const sizeClasses = {
    small: 'membership-badge-small',
    medium: 'membership-badge-medium',
    large: 'membership-badge-large'
  };

  return (
    <div 
      className={`membership-badge ${sizeClasses[size]}`}
      style={{ 
        backgroundColor: tierInfo.bgColor,
        color: tierInfo.color,
        borderColor: tierInfo.color
      }}
    >
      <div className="membership-badge-icon">
        {tier === 'free' && '🆓'}
        {tier === 'plus' && '⭐'}
        {tier === 'max' && '👑'}
      </div>
      {showName && (
        <span className="membership-badge-text">
          {tierInfo.name}
        </span>
      )}
    </div>
  );
};

export default MembershipBadge;
