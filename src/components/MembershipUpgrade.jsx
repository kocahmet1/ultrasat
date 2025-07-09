import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { loadStripe } from '@stripe/stripe-js';
import './MembershipUpgrade.css';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const CheckIcon = () => (
  <svg className="icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const LoadingSpinner = () => <div className="loading-spinner"></div>;

const MembershipUpgrade = () => {
  const { currentUser, userMembership, getMembershipDisplayName } = useAuth();
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [loading, setLoading] = useState({ plus: false, max: false });
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);

  useEffect(() => {
    if (currentUser) {
      fetchSubscriptionStatus();
    }
  }, [currentUser]);

  const fetchSubscriptionStatus = async () => {
    try {
      const response = await fetch(`/api/stripe/subscription-status/${currentUser.uid}`);
      if (!response.ok) throw new Error('Failed to fetch status');
      const data = await response.json();
      setSubscriptionStatus(data);
    } catch (error) {
      console.error('Error fetching subscription status:', error);
    }
  };

  const handleCheckout = async (tier) => {
    if (!currentUser) return;

    setLoading(prev => ({ ...prev, [tier]: true }));
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier,
          billing: billingCycle,
          userId: currentUser.uid,
          userEmail: currentUser.email,
        }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      const stripe = await stripePromise;
      const { error } = await stripe.redirectToCheckout({ sessionId: data.sessionId });
      if (error) console.error('Stripe redirect error:', error);

    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Failed to start checkout process. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, [tier]: false }));
    }
  };

  const plans = {
    plus: {
      name: 'Plus',
      prices: { monthly: 9.99, yearly: 99.99 },
      description: 'Unlock detailed analytics and unlimited practice.',
      features: [
        'All Free features',
        'Unlimited Practice Exams',
        'Detailed Progress Analytics',
        'Full access to Study Tools',
        'Priority email support',
      ],
    },
    max: {
      name: 'Max',
      prices: { monthly: 19.99, yearly: 199.99 },
      description: 'The ultimate prep experience with AI tools and tutoring.',
      features: [
        'All Plus features',
        'Advanced AI-powered Analytics',
        'AI-powered Study Tools',
        '1-on-1 tutoring sessions',
        'Score Guarantee Program',
      ],
    },
  };

  // Hide Max plan from the upgrade page
  const visiblePlans = Object.entries(plans).filter(([tierId]) => tierId !== 'max');

  const renderPrice = (price) => {
    const [integer, decimal] = price.toFixed(2).split('.');
    return (
      <>
        <span className="price">${integer}</span>
        <span className="currency">.{decimal}</span>
      </>
    );
  };

  const renderPlanButton = (tier) => {
    const currentTier = userMembership?.tier;
    const isCurrentPlan = currentTier === tier;
    const isProcessing = loading[tier];

    if (isCurrentPlan) {
      return (
        <button className="plan-button secondary" disabled>
          Your Current Plan
        </button>
      );
    }

    const buttonText = currentTier === 'free' ? 'Upgrade' : 'Switch to this Plan';

    return (
      <button
        className="plan-button primary"
        onClick={() => handleCheckout(tier)}
        disabled={isProcessing}
      >
        {isProcessing ? <LoadingSpinner /> : buttonText}
      </button>
    );
  };

  const renderSubscriptionStatus = () => {
    if (!subscriptionStatus?.subscription) return null;

    const { current_period_end, cancel_at_period_end } = subscriptionStatus.subscription;
    const endDate = new Date(current_period_end * 1000).toLocaleDateString();

    return (
      <div className="subscription-status">
        <h3>Current Subscription</h3>
        <p>
          You are on the <strong>{getMembershipDisplayName(userMembership?.tier)}</strong> plan.
        </p>
        {cancel_at_period_end ? (
          <p className="cancellation-notice">
            Your subscription is set to cancel on {endDate}.
          </p>
        ) : (
          <p>Your plan will renew on {endDate}.</p>
        )}
      </div>
    );
  };

  if (!currentUser) {
    return (
      <div className="membership-upgrade-page">
        <div className="upgrade-header">
          <h1>Please log in to view membership options</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="membership-upgrade-page">
      <div className="upgrade-header">
        <h1>Upgrade your plan</h1>
        <div className="billing-toggle">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={billingCycle === 'monthly' ? 'active' : ''}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={billingCycle === 'yearly' ? 'active' : ''}
          >
            Yearly
          </button>
        </div>
      </div>

      {renderSubscriptionStatus()}

      <div className="plans-container">
        {visiblePlans.map(([tierId, plan]) => (
          <div className="plan-card" key={tierId}>
            <h2>{plan.name}</h2>
            <div className="plan-price">
              {renderPrice(plan.prices[billingCycle])}
              <span className="period"> / {billingCycle === 'monthly' ? 'month' : 'year'}</span>
            </div>
            <p className="plan-description">{plan.description}</p>
            <ul className="plan-features">
              {plan.features.map((feature, index) => (
                <li key={index}>
                  <CheckIcon />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            {renderPlanButton(tierId)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MembershipUpgrade;
