import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { loadStripe } from '@stripe/stripe-js';
import './MembershipUpgrade.css';

// Initialize Stripe
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const MembershipUpgrade = () => {
  const { currentUser, userMembership, getMembershipDisplayName } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedTier, setSelectedTier] = useState('plus');
  const [selectedBilling, setSelectedBilling] = useState('monthly');
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);

  useEffect(() => {
    if (currentUser) {
      fetchSubscriptionStatus();
    }
  }, [currentUser]);

  const fetchSubscriptionStatus = async () => {
    try {
      const response = await fetch(`/api/stripe/subscription-status/${currentUser.uid}`);
      const data = await response.json();
      setSubscriptionStatus(data);
    } catch (error) {
      console.error('Error fetching subscription status:', error);
    }
  };

  const handleUpgrade = async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tier: selectedTier,
          billing: selectedBilling,
          userId: currentUser.uid,
          userEmail: currentUser.email,
        }),
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      // Redirect to Stripe Checkout
      const stripe = await stripePromise;
      const { error } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      });

      if (error) {
        console.error('Stripe redirect error:', error);
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Failed to start checkout process. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!currentUser || !subscriptionStatus?.subscription) return;

    if (!window.confirm('Are you sure you want to cancel your subscription? It will remain active until the end of your current billing period.')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/stripe/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser.uid,
        }),
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      alert('Subscription cancelled successfully. You will retain access until the end of your current billing period.');
      fetchSubscriptionStatus(); // Refresh status
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      alert('Failed to cancel subscription. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const getPriceDisplay = (tier, billing) => {
    const prices = {
      plus: { monthly: '$9.99', yearly: '$99.99' },
      max: { monthly: '$19.99', yearly: '$199.99' }
    };
    return prices[tier][billing];
  };

  const getSavingsDisplay = (tier) => {
    const savings = {
      plus: '$19.89',
      max: '$39.89'
    };
    return savings[tier];
  };

  if (!currentUser) {
    return (
      <div className="membership-upgrade">
        <div className="upgrade-container">
          <h2>Please log in to view membership options</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="membership-upgrade">
      <div className="upgrade-container">
        <h1>Upgrade Your Membership</h1>
        
        {/* Current Membership Status */}
        <div className="current-membership">
          <h3>Current Plan: {getMembershipDisplayName(userMembership?.tier || 'free')}</h3>
          {subscriptionStatus?.subscription && (
            <div className="subscription-info">
              <p><strong>Status:</strong> {subscriptionStatus.subscription.status}</p>
              <p><strong>Current Period Ends:</strong> {formatDate(subscriptionStatus.subscription.current_period_end)}</p>
              {subscriptionStatus.subscription.cancel_at_period_end && (
                <p className="cancellation-notice">⚠️ Your subscription will be cancelled at the end of the current period</p>
              )}
            </div>
          )}
        </div>

        {/* Membership Tiers */}
        <div className="membership-tiers">
          <div className="tier-selector">
            <h3>Choose Your Plan</h3>
            <div className="tier-options">
              <div 
                className={`tier-option ${selectedTier === 'plus' ? 'selected' : ''}`}
                onClick={() => setSelectedTier('plus')}
              >
                <h4>Plus</h4>
                <div className="tier-features">
                  <p>✓ Unlimited practice exams</p>
                  <p>✓ Detailed progress analytics</p>
                  <p>✓ Advanced study tools</p>
                  <p>✓ Priority support</p>
                </div>
              </div>
              
              <div 
                className={`tier-option ${selectedTier === 'max' ? 'selected' : ''}`}
                onClick={() => setSelectedTier('max')}
              >
                <h4>Max</h4>
                <div className="tier-features">
                  <p>✓ Everything in Plus</p>
                  <p>✓ AI-powered personalized study plans</p>
                  <p>✓ 1-on-1 tutoring sessions</p>
                  <p>✓ Exclusive content and materials</p>
                  <p>✓ Score guarantee program</p>
                </div>
                <div className="popular-badge">Most Popular</div>
              </div>
            </div>
          </div>

          {/* Billing Options */}
          <div className="billing-selector">
            <h3>Billing Frequency</h3>
            <div className="billing-options">
              <div 
                className={`billing-option ${selectedBilling === 'monthly' ? 'selected' : ''}`}
                onClick={() => setSelectedBilling('monthly')}
              >
                <h4>Monthly</h4>
                <p className="price">{getPriceDisplay(selectedTier, 'monthly')}/month</p>
              </div>
              
              <div 
                className={`billing-option ${selectedBilling === 'yearly' ? 'selected' : ''}`}
                onClick={() => setSelectedBilling('yearly')}
              >
                <h4>Yearly</h4>
                <p className="price">{getPriceDisplay(selectedTier, 'yearly')}/year</p>
                <p className="savings">Save {getSavingsDisplay(selectedTier)} per year!</p>
                <div className="savings-badge">2 Months Free</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            {userMembership?.tier === 'free' || !subscriptionStatus?.subscription ? (
              <button 
                className="upgrade-button"
                onClick={handleUpgrade}
                disabled={loading}
              >
                {loading ? 'Processing...' : `Upgrade to ${selectedTier.charAt(0).toUpperCase() + selectedTier.slice(1)}`}
              </button>
            ) : (
              <div className="subscription-actions">
                {!subscriptionStatus.subscription.cancel_at_period_end && (
                  <button 
                    className="cancel-button"
                    onClick={handleCancelSubscription}
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : 'Cancel Subscription'}
                  </button>
                )}
                <button 
                  className="upgrade-button"
                  onClick={handleUpgrade}
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Change Plan'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Feature Comparison */}
        <div className="feature-comparison">
          <h3>Feature Comparison</h3>
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Feature</th>
                <th>Free</th>
                <th>Plus</th>
                <th>Max</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Practice Exams</td>
                <td>3 per month</td>
                <td>Unlimited</td>
                <td>Unlimited</td>
              </tr>
              <tr>
                <td>Progress Analytics</td>
                <td>Basic</td>
                <td>Detailed</td>
                <td>Advanced AI-powered</td>
              </tr>
              <tr>
                <td>Study Tools</td>
                <td>Limited</td>
                <td>Full access</td>
                <td>Full access + AI tools</td>
              </tr>
              <tr>
                <td>Support</td>
                <td>Community</td>
                <td>Priority email</td>
                <td>1-on-1 tutoring</td>
              </tr>
              <tr>
                <td>Score Guarantee</td>
                <td>❌</td>
                <td>❌</td>
                <td>✅</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MembershipUpgrade;
