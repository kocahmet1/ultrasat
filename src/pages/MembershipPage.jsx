import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getTierInfo, getAvailableUpgrades, MEMBERSHIP_TIERS } from '../utils/membershipUtils';
import MembershipCard from '../components/membership/MembershipCard';
import MembershipBadge from '../components/membership/MembershipBadge';
import './MembershipPage.css';

const MembershipPage = () => {
  const { userMembership, updateMembershipTier } = useAuth();
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  if (!userMembership) {
    return (
      <div className="membership-page">
        <div className="membership-loading">
          <div className="loading-spinner"></div>
          <p>Loading membership information...</p>
        </div>
      </div>
    );
  }

  const currentTierInfo = getTierInfo(userMembership.tier);
  const availableUpgrades = getAvailableUpgrades(userMembership.tier);
  
  // Get all tiers for comparison
  const allTiers = [
    { tier: MEMBERSHIP_TIERS.FREE, ...getTierInfo(MEMBERSHIP_TIERS.FREE) },
    { tier: MEMBERSHIP_TIERS.PLUS, ...getTierInfo(MEMBERSHIP_TIERS.PLUS) },
    { tier: MEMBERSHIP_TIERS.MAX, ...getTierInfo(MEMBERSHIP_TIERS.MAX) }
  ];

  const handleUpgrade = async (newTier) => {
    setIsUpgrading(true);
    setSelectedPlan(newTier);
    
    try {
      // In a real app, this would integrate with a payment processor
      // For now, we'll simulate the upgrade process
      console.log(`Upgrading to ${newTier}...`);
      
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update membership tier (12 months for demo)
      const success = await updateMembershipTier(newTier, 12);
      
      if (success) {
        alert(`Successfully upgraded to ${getTierInfo(newTier).displayName}!`);
      } else {
        alert('Upgrade failed. Please try again.');
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      alert('Upgrade failed. Please try again.');
    } finally {
      setIsUpgrading(false);
      setSelectedPlan(null);
    }
  };

  return (
    <div className="membership-page">
      <div className="membership-page-header">
        <h1>Your Membership</h1>
        <p>Manage your subscription and explore premium features</p>
      </div>

      <div className="membership-current-plan">
        <h2>Current Plan</h2>
        <MembershipCard showUpgradeButton={false} />
      </div>

      {availableUpgrades.length > 0 && (
        <div className="membership-upgrade-section">
          <h2>Upgrade Your Plan</h2>
          <p className="membership-upgrade-description">
            Unlock more features and get the most out of your SAT preparation
          </p>
          
          <div className="membership-plans-grid">
            {allTiers.map((tierData) => (
              <div 
                key={tierData.tier}
                className={`membership-plan-card ${
                  tierData.tier === userMembership.tier ? 'current-plan' : ''
                } ${
                  isUpgrading && selectedPlan === tierData.tier ? 'upgrading' : ''
                }`}
              >
                <div className="membership-plan-header">
                  <MembershipBadge tier={tierData.tier} size="large" />
                  <h3>{tierData.displayName}</h3>
                  <p className="membership-plan-price">{tierData.price}</p>
                  <p className="membership-plan-description">{tierData.description}</p>
                </div>
                
                <div className="membership-plan-features">
                  <h4>Features included:</h4>
                  <ul>
                    {tierData.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="membership-plan-actions">
                  {tierData.tier === userMembership.tier ? (
                    <button className="membership-plan-btn current" disabled>
                      Current Plan
                    </button>
                  ) : tierData.tier === MEMBERSHIP_TIERS.FREE ? (
                    <button 
                      className="membership-plan-btn downgrade"
                      onClick={() => handleUpgrade(tierData.tier)}
                      disabled={isUpgrading}
                    >
                      Downgrade to Free
                    </button>
                  ) : (
                    <button 
                      className="membership-plan-btn upgrade"
                      onClick={() => handleUpgrade(tierData.tier)}
                      disabled={isUpgrading}
                    >
                      {isUpgrading && selectedPlan === tierData.tier ? (
                        <span className="upgrading-text">
                          <div className="upgrading-spinner"></div>
                          Processing...
                        </span>
                      ) : (
                        `Upgrade to ${tierData.name}`
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="membership-faq">
        <h2>Frequently Asked Questions</h2>
        <div className="membership-faq-grid">
          <div className="membership-faq-item">
            <h3>Can I cancel anytime?</h3>
            <p>Yes, you can cancel your subscription at any time. You'll continue to have access to premium features until the end of your billing period.</p>
          </div>
          <div className="membership-faq-item">
            <h3>What happens if I downgrade?</h3>
            <p>If you downgrade, you'll lose access to premium features immediately but keep your progress and data.</p>
          </div>
          <div className="membership-faq-item">
            <h3>Is there a free trial?</h3>
            <p>New users start with a Free account that includes basic features. You can upgrade anytime to unlock premium features.</p>
          </div>
          <div className="membership-faq-item">
            <h3>How do I get support?</h3>
            <p>Plus members get email support, while Max members get priority support with faster response times.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MembershipPage;
