/**
 * Stripe payment routes for membership tier upgrades
 */

const express = require('express');
const admin = require('firebase-admin');
const router = express.Router();

// Initialize Stripe with secret key
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

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

// Create Stripe Checkout Session
router.post('/create-checkout-session', async (req, res) => {
  try {
    const { tier, billing, userId, userEmail, couponId } = req.body;

    // Validate input
    if (!tier || !billing || !userId || !userEmail) {
      return res.status(400).json({ 
        error: 'Missing required fields: tier, billing, userId, userEmail' 
      });
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
router.get('/verify-session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
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
  
  const { userId, tier, billing, couponId, discountedPrice } = session.metadata;
  
  if (userId && tier) {
    // Update user membership in Firebase
    await updateUserMembership(userId, tier, billing, session.subscription);
    
    // Record coupon usage if a coupon was applied
    if (couponId) {
      try {
        const couponRef = admin.firestore().collection('coupons').doc(couponId);
        await couponRef.update({
          timesUsed: admin.firestore.FieldValue.increment(1),
          lastUsedAt: new Date().toISOString()
        });
        
        // Record usage history
        await admin.firestore().collection('couponUsage').add({
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
  // Handle subscription changes (e.g., plan changes, renewals)
}

async function handleSubscriptionDeleted(subscription) {
  console.log('Subscription deleted:', subscription.id);
  // Handle subscription cancellation - downgrade user to free tier
  const userId = await getUserIdFromSubscription(subscription.id);
  if (userId) {
    await updateUserMembership(userId, 'free', null, null);
  }
}

async function handlePaymentSucceeded(invoice) {
  console.log('Payment succeeded:', invoice.id);
  // Handle successful recurring payment
}

async function handlePaymentFailed(invoice) {
  console.log('Payment failed:', invoice.id);
  // Handle failed payment - potentially downgrade user or send notification
}

// Helper function to update user membership in Firebase
async function updateUserMembership(userId, tier, billing, subscriptionId) {
  try {
    if (!admin.apps.length) {
      console.error('Firebase Admin not available');
      return;
    }

    const userRef = admin.firestore().collection('users').doc(userId);
    
    const updateData = {
      membershipTier: tier,
      membershipStartDate: new Date().toISOString(),
      stripeSubscriptionId: subscriptionId,
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
    // Query Firestore to find user with this subscription ID
    const usersRef = admin.firestore().collection('users');
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
router.get('/subscription-status/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
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
});

// Cancel subscription
router.post('/cancel-subscription', async (req, res) => {
  try {
    const { userId } = req.body;
    
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
