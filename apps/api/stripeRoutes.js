/**
 * Stripe payment routes for membership tier upgrades
 */

const express = require('express');
const admin = require('firebase-admin');
const router = express.Router();
const { requireAuth } = require('./middleware/auth');

// Initialize Stripe with secret key
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const requireAuthenticatedUser = requireAuth({
  missingTokenMessage: 'Unauthorized',
  invalidTokenMessage: 'Invalid authentication',
  logLabel: 'Stripe auth error',
});

const resolveAuthenticatedUserId = (req) => {
  const suppliedUserId = req.params.userId || req.body?.userId || null;
  if (suppliedUserId && suppliedUserId !== req.user.uid) {
    return null;
  }
  return req.user.uid;
};

const getAuthenticatedUserEmail = async (req) => {
  if (req.user?.email) {
    return req.user.email;
  }

  if (!req.admin) {
    return null;
  }

  const userRecord = await req.admin.auth().getUser(req.user.uid);
  return userRecord.email || null;
};

// Membership tier pricing (in cents)
const MEMBERSHIP_PRICES = {
  plus: {
    monthly: 999, // $9.99/month
    yearly: 9999  // $99.99/year (2 months free)
  },
  max: {
    monthly: 1999, // $19.99/month
    yearly: 19999  // $199.99/year (2 months free)
  }
};

const VALID_MEMBERSHIP_TIERS = new Set(['free', 'plus', 'max']);
const VALID_BILLING_CYCLES = new Set(['monthly', 'yearly']);
const ACCESS_GRANTING_SUBSCRIPTION_STATUSES = new Set(['active', 'trialing']);

const normalizeMembershipTier = (tier) => (
  VALID_MEMBERSHIP_TIERS.has(tier) ? tier : null
);

const normalizeBillingCycle = (billing) => (
  VALID_BILLING_CYCLES.has(billing) ? billing : null
);

const toISOStringFromStripeTimestamp = (value) => {
  if (!value) {
    return null;
  }

  const date =
    typeof value === 'number'
      ? new Date(value * 1000)
      : value instanceof Date
        ? value
        : new Date(value);

  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

const getFirestore = () => {
  if (!admin.apps.length) {
    throw new Error('Firebase Admin not available');
  }

  return admin.firestore();
};

const getPrimarySubscriptionItem = (subscription) => {
  if (!Array.isArray(subscription?.items?.data) || subscription.items.data.length === 0) {
    return null;
  }

  return subscription.items.data[0];
};

const getSubscriptionAmount = (subscription) => {
  const item = getPrimarySubscriptionItem(subscription);
  if (!item) {
    return null;
  }

  return item.price?.unit_amount ?? item.plan?.amount ?? null;
};

const getSubscriptionBillingCycle = (subscription) => {
  const item = getPrimarySubscriptionItem(subscription);
  const interval = item?.price?.recurring?.interval || item?.plan?.interval;

  if (interval === 'month') {
    return 'monthly';
  }

  if (interval === 'year') {
    return 'yearly';
  }

  return null;
};

const inferTierFromPriceAmount = (unitAmount, billingCycle) => {
  if (!Number.isInteger(unitAmount)) {
    return null;
  }

  if (billingCycle) {
    const match = Object.entries(MEMBERSHIP_PRICES).find(
      ([, prices]) => prices[billingCycle] === unitAmount,
    );

    return match ? match[0] : null;
  }

  for (const [tier, prices] of Object.entries(MEMBERSHIP_PRICES)) {
    if (Object.values(prices).includes(unitAmount)) {
      return tier;
    }
  }

  return null;
};

const inferMembershipPlan = (subscription, { fallbackTier = null, fallbackBilling = null } = {}) => {
  const item = getPrimarySubscriptionItem(subscription);
  const price = item?.price || item?.plan || null;
  const tierFromMetadata = normalizeMembershipTier(
    subscription?.metadata?.tier || price?.metadata?.tier || item?.metadata?.tier,
  );
  const billingFromMetadata = normalizeBillingCycle(
    subscription?.metadata?.billing || price?.metadata?.billing || item?.metadata?.billing,
  );
  const billing =
    billingFromMetadata ||
    getSubscriptionBillingCycle(subscription) ||
    normalizeBillingCycle(fallbackBilling);
  const tier =
    tierFromMetadata ||
    inferTierFromPriceAmount(getSubscriptionAmount(subscription), billing) ||
    normalizeMembershipTier(fallbackTier);

  return {
    tier,
    billing,
  };
};

const buildMembershipUpdateFromSubscription = ({
  subscription,
  existingUserData,
  resolvedPlanTier,
  resolvedBilling,
  invoice = null,
  paymentOutcome = null,
  clearSubscriptionReference = false,
}) => {
  const now = new Date().toISOString();
  const membershipPlanTier =
    resolvedPlanTier ||
    normalizeMembershipTier(existingUserData?.membershipPlanTier) ||
    normalizeMembershipTier(existingUserData?.membershipTier);
  const membershipBillingCycle =
    resolvedBilling ||
    normalizeBillingCycle(existingUserData?.membershipBillingCycle);
  const membershipEndDate =
    toISOStringFromStripeTimestamp(subscription.current_period_end) ||
    toISOStringFromStripeTimestamp(subscription.canceled_at) ||
    existingUserData?.membershipEndDate ||
    now;

  const updateData = {
    membershipTier:
      ACCESS_GRANTING_SUBSCRIPTION_STATUSES.has(subscription.status) && membershipPlanTier
        ? membershipPlanTier
        : 'free',
    membershipPlanTier: membershipPlanTier || null,
    membershipBillingCycle: membershipBillingCycle || null,
    membershipStartDate:
      toISOStringFromStripeTimestamp(subscription.start_date) ||
      existingUserData?.membershipStartDate ||
      now,
    membershipEndDate,
    stripeSubscriptionId: clearSubscriptionReference ? null : subscription.id || null,
    stripeCustomerId: subscription.customer || existingUserData?.stripeCustomerId || null,
    stripeSubscriptionStatus: subscription.status || null,
    stripeCancelAtPeriodEnd: Boolean(subscription.cancel_at_period_end),
    stripeCurrentPeriodStart: toISOStringFromStripeTimestamp(subscription.current_period_start),
    stripeCurrentPeriodEnd: membershipEndDate,
    lastUpdated: now,
  };

  if (invoice) {
    updateData.stripeLastInvoiceId = invoice.id || null;
    updateData.stripeLastInvoiceStatus = invoice.status || null;
    updateData.stripeNextPaymentAttempt =
      toISOStringFromStripeTimestamp(invoice.next_payment_attempt) || null;
  }

  if (paymentOutcome === 'failed') {
    updateData.stripeLastPaymentFailedAt =
      toISOStringFromStripeTimestamp(invoice?.status_transitions?.finalized_at) || now;
    updateData.stripeLastPaymentSucceededAt =
      existingUserData?.stripeLastPaymentSucceededAt || null;
  }

  if (paymentOutcome === 'succeeded') {
    updateData.stripeLastPaymentSucceededAt =
      toISOStringFromStripeTimestamp(invoice?.status_transitions?.paid_at) || now;
    updateData.stripeLastPaymentFailedAt = null;
    updateData.stripeNextPaymentAttempt = null;
  }

  return updateData;
};

async function syncUserMembershipFromSubscription(
  subscription,
  {
    fallbackUserId = null,
    fallbackTier = null,
    fallbackBilling = null,
    invoice = null,
    paymentOutcome = null,
    clearSubscriptionReference = false,
  } = {},
) {
  if (!subscription?.id) {
    console.warn('Skipping membership sync because the subscription payload is missing an id');
    return null;
  }

  const firestore = getFirestore();
  const userId =
    subscription.metadata?.userId ||
    fallbackUserId ||
    await getUserIdFromSubscription(subscription.id);

  if (!userId) {
    console.warn(`No user found for Stripe subscription ${subscription.id}`);
    return null;
  }

  const userRef = firestore.collection('users').doc(userId);
  const userDoc = await userRef.get();
  const existingUserData = userDoc.exists ? userDoc.data() : {};
  const { tier, billing } = inferMembershipPlan(subscription, {
    fallbackTier:
      fallbackTier ||
      existingUserData.membershipPlanTier ||
      existingUserData.membershipTier,
    fallbackBilling: fallbackBilling || existingUserData.membershipBillingCycle,
  });
  const updateData = buildMembershipUpdateFromSubscription({
    subscription,
    existingUserData,
    resolvedPlanTier: tier,
    resolvedBilling: billing,
    invoice,
    paymentOutcome,
    clearSubscriptionReference,
  });

  await userRef.set(updateData, { merge: true });
  console.log(`Synchronized membership for user ${userId} from subscription ${subscription.id}`);

  return {
    userId,
    updateData,
  };
}

// Create Stripe Checkout Session
router.post('/create-checkout-session', requireAuthenticatedUser, async (req, res) => {
  try {
    const { tier, billing, userEmail: suppliedUserEmail, couponId } = req.body;
    const userId = resolveAuthenticatedUserId(req);
    const userEmail = await getAuthenticatedUserEmail(req);

    if (!userId) {
      return res.status(403).json({ error: 'Authenticated user mismatch' });
    }

    // Validate input
    if (!tier || !billing || !userEmail) {
      return res.status(400).json({ 
        error: 'Missing required fields: tier, billing' 
      });
    }

    if (suppliedUserEmail && suppliedUserEmail !== userEmail) {
      return res.status(403).json({ error: 'Authenticated user mismatch' });
    }

    if (!['plus', 'max'].includes(tier)) {
      return res.status(400).json({ error: 'Invalid tier. Must be plus or max' });
    }

    if (!['monthly', 'yearly'].includes(billing)) {
      return res.status(400).json({ error: 'Invalid billing. Must be monthly or yearly' });
    }

    let price = MEMBERSHIP_PRICES[tier][billing];
    const billingInterval = billing === 'monthly' ? 'month' : 'year';
    let couponData = null;

    // Apply coupon discount if provided
    if (couponId) {
      try {
        const couponDoc = await admin.firestore().collection('coupons').doc(couponId).get();
        
        if (couponDoc.exists) {
          const coupon = couponDoc.data();
          
          // Verify coupon is still valid
          if (coupon.isActive && 
              (!coupon.expiryDate || new Date(coupon.expiryDate) > new Date()) &&
              (!coupon.maxUses || coupon.timesUsed < coupon.maxUses) &&
              coupon.applicableTiers.includes(tier) &&
              coupon.applicableBilling.includes(billing)) {
            
            // Calculate discount
            if (coupon.discountType === 'percentage') {
              price = Math.round(price * (1 - coupon.discountValue / 100));
            } else if (coupon.discountType === 'fixed') {
              // Convert fixed discount to cents
              price = Math.max(0, price - Math.round(coupon.discountValue * 100));
            }
            
            couponData = {
              id: couponId,
              code: coupon.code,
              discountType: coupon.discountType,
              discountValue: coupon.discountValue
            };
          }
        }
      } catch (error) {
        console.error('Error applying coupon:', error);
        // Continue without coupon if there's an error
      }
    }

    // Create Stripe Checkout Session
    const sessionConfig = {
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `UltraSAT ${tier.charAt(0).toUpperCase() + tier.slice(1)} Membership`,
              description: `${tier.charAt(0).toUpperCase() + tier.slice(1)} tier membership - ${billing} billing`,
            },
            unit_amount: price,
            recurring: {
              interval: billingInterval,
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/payment/cancel`,
      customer_email: userEmail,
      metadata: {
        userId: userId,
        tier: tier,
        billing: billing,
      },
      client_reference_id: userId,
      subscription_data: {
        metadata: {
          userId: userId,
          tier: tier,
          billing: billing,
        },
      },
    };

    // Add coupon to metadata if applied
    if (couponData) {
      sessionConfig.metadata.couponId = couponData.id;
      sessionConfig.metadata.couponCode = couponData.code;
      sessionConfig.metadata.originalPrice = MEMBERSHIP_PRICES[tier][billing].toString();
      sessionConfig.metadata.discountedPrice = price.toString();
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    res.json({ 
      sessionId: session.id, 
      url: session.url,
      couponApplied: !!couponData,
      finalPrice: price / 100 // Convert back to dollars for display
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Verify payment success and get session details
router.get('/verify-session/:sessionId', requireAuthenticatedUser, async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session.metadata?.userId || session.metadata.userId !== req.user.uid) {
      return res.status(403).json({ error: 'Unauthorized session access' });
    }
    
    if (session.payment_status === 'paid') {
      // Get subscription details
      const subscription = await stripe.subscriptions.retrieve(session.subscription);
      
      res.json({
        success: true,
        session: {
          id: session.id,
          payment_status: session.payment_status,
          customer_email: session.customer_email,
          metadata: session.metadata,
        },
        subscription: {
          id: subscription.id,
          status: subscription.status,
          current_period_start: subscription.current_period_start,
          current_period_end: subscription.current_period_end,
        }
      });
    } else {
      res.json({
        success: false,
        payment_status: session.payment_status
      });
    }
  } catch (error) {
    console.error('Error verifying session:', error);
    res.status(500).json({ error: 'Failed to verify session' });
  }
});

// Handle Stripe webhooks
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      case 'invoice.paid':
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

// Webhook handler functions
async function handleCheckoutSessionCompleted(session) {
  console.log('Checkout session completed:', session.id);
  
  const {
    userId,
    tier,
    billing,
    couponId,
    discountedPrice,
  } = session.metadata || {};

  if (session.subscription && userId && tier) {
    const subscriptionId =
      typeof session.subscription === 'string'
        ? session.subscription
        : session.subscription.id;
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    await syncUserMembershipFromSubscription(subscription, {
      fallbackUserId: userId,
      fallbackTier: tier,
      fallbackBilling: billing,
    });
  } else if (userId && tier) {
    await updateUserMembership(userId, tier, billing, session.subscription);
  }

  if (userId && tier) {
    // Record coupon usage if a coupon was applied
    if (couponId) {
      try {
        const couponRef = getFirestore().collection('coupons').doc(couponId);
        await couponRef.update({
          timesUsed: admin.firestore.FieldValue.increment(1),
          lastUsedAt: new Date().toISOString()
        });
        
        // Record usage history
        await getFirestore().collection('couponUsage').add({
          couponId,
          userId,
          amount: parseInt(discountedPrice) / 100,
          tier,
          billing,
          usedAt: new Date().toISOString()
        });
        
        console.log(`Coupon ${couponId} usage recorded for user ${userId}`);
      } catch (error) {
        console.error('Error recording coupon usage:', error);
      }
    }
  }
}

async function handleSubscriptionUpdated(subscription) {
  console.log('Subscription updated:', subscription.id);
  await syncUserMembershipFromSubscription(subscription);
}

async function handleSubscriptionDeleted(subscription) {
  console.log('Subscription deleted:', subscription.id);
  await syncUserMembershipFromSubscription(subscription, {
    clearSubscriptionReference: true,
  });
}

async function handlePaymentSucceeded(invoice) {
  console.log('Payment succeeded:', invoice.id);
  const subscriptionId =
    typeof invoice.subscription === 'string'
      ? invoice.subscription
      : invoice.subscription?.id;
  if (!subscriptionId) {
    console.warn(`Invoice ${invoice.id} is not linked to a subscription`);
    return;
  }

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  await syncUserMembershipFromSubscription(subscription, {
    invoice,
    paymentOutcome: 'succeeded',
  });
}

async function handlePaymentFailed(invoice) {
  console.log('Payment failed:', invoice.id);
  const subscriptionId =
    typeof invoice.subscription === 'string'
      ? invoice.subscription
      : invoice.subscription?.id;
  if (!subscriptionId) {
    console.warn(`Invoice ${invoice.id} is not linked to a subscription`);
    return;
  }

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  await syncUserMembershipFromSubscription(subscription, {
    invoice,
    paymentOutcome: 'failed',
  });
}

// Helper function to update user membership in Firebase
async function updateUserMembership(userId, tier, billing, subscriptionId) {
  try {
    const userRef = getFirestore().collection('users').doc(userId);
    const now = new Date();
    
    const updateData = {
      membershipTier: tier,
      membershipPlanTier: tier === 'free' ? null : tier,
      membershipBillingCycle: billing || null,
      membershipStartDate: now.toISOString(),
      stripeSubscriptionId: subscriptionId,
      stripeSubscriptionStatus: tier === 'free' ? 'canceled' : 'active',
      lastUpdated: new Date().toISOString()
    };

    // Set end date for paid tiers
    if (tier !== 'free' && billing) {
      const endDate = new Date();
      if (billing === 'monthly') {
        endDate.setMonth(endDate.getMonth() + 1);
      } else if (billing === 'yearly') {
        endDate.setFullYear(endDate.getFullYear() + 1);
      }
      updateData.membershipEndDate = endDate.toISOString();
    } else {
      updateData.membershipEndDate = null;
    }

    // Use set with merge:true to handle both new and existing users
    await userRef.set(updateData, { merge: true });
    console.log(`Updated membership for user ${userId} to ${tier}`);
  } catch (error) {
    console.error('Error updating user membership:', error);
    throw error; // Re-throw to ensure webhook handler knows about the failure
  }
}

// Helper function to get user ID from subscription
async function getUserIdFromSubscription(subscriptionId) {
  try {
    const firestore = getFirestore();
    // Query Firestore to find user with this subscription ID
    const usersRef = firestore.collection('users');
    const query = usersRef.where('stripeSubscriptionId', '==', subscriptionId);
    const snapshot = await query.get();
    
    if (!snapshot.empty) {
      return snapshot.docs[0].id;
    }
    
    return null;
  } catch (error) {
    console.error('Error finding user by subscription ID:', error);
    return null;
  }
}

// Get current subscription status
const getSubscriptionStatus = async (req, res) => {
  try {
    const userId = resolveAuthenticatedUserId(req);

    if (!userId) {
      return res.status(403).json({ error: 'Authenticated user mismatch' });
    }
    
    if (!req.admin) {
      return res.status(500).json({ error: 'Firebase Admin not available' });
    }

    const userRef = req.admin.firestore().collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data();
    const subscriptionId = userData.stripeSubscriptionId;
    
    if (!subscriptionId) {
      return res.json({
        tier: userData.membershipTier || 'free',
        status: 'free',
        subscription: null
      });
    }

    // Get subscription details from Stripe
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    res.json({
      tier: userData.membershipTier,
      status: subscription.status,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        current_period_start: subscription.current_period_start,
        current_period_end: subscription.current_period_end,
        cancel_at_period_end: subscription.cancel_at_period_end,
      }
    });
  } catch (error) {
    console.error('Error getting subscription status:', error);
    res.status(500).json({ error: 'Failed to get subscription status' });
  }
};

router.get('/subscription-status', requireAuthenticatedUser, getSubscriptionStatus);
router.get('/subscription-status/:userId', requireAuthenticatedUser, getSubscriptionStatus);

// Cancel subscription
router.post('/cancel-subscription', requireAuthenticatedUser, async (req, res) => {
  try {
    const userId = resolveAuthenticatedUserId(req);

    if (!userId) {
      return res.status(403).json({ error: 'Authenticated user mismatch' });
    }
    
    if (!req.admin) {
      return res.status(500).json({ error: 'Firebase Admin not available' });
    }

    const userRef = req.admin.firestore().collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data();
    const subscriptionId = userData.stripeSubscriptionId;
    
    if (!subscriptionId) {
      return res.status(400).json({ error: 'No active subscription found' });
    }

    // Cancel subscription at period end
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    res.json({
      success: true,
      message: 'Subscription will be cancelled at the end of the current period',
      subscription: {
        id: subscription.id,
        status: subscription.status,
        cancel_at_period_end: subscription.cancel_at_period_end,
        current_period_end: subscription.current_period_end,
      }
    });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

module.exports = router;
