import { createStripeRouteApp, requestApp } from '../test/apiTestUtils';

function createFirestoreDouble() {
  const userSet = jest.fn().mockResolvedValue();
  const userGet = jest.fn().mockResolvedValue({
    exists: false,
    data: () => ({}),
  });
  const subscriptionLookupGet = jest.fn().mockResolvedValue({ empty: true, docs: [] });
  const couponGet = jest.fn().mockResolvedValue({ exists: false, data: () => ({}) });
  const couponUpdate = jest.fn().mockResolvedValue();
  const couponUsageAdd = jest.fn().mockResolvedValue();

  const firestore = {
    collection: jest.fn((name) => {
      if (name === 'users') {
        return {
          doc: jest.fn(() => ({
            set: userSet,
            get: userGet,
          })),
          where: jest.fn(() => ({
            get: subscriptionLookupGet,
          })),
        };
      }

      if (name === 'coupons') {
        return {
          doc: jest.fn(() => ({
            get: couponGet,
            update: couponUpdate,
          })),
        };
      }

      if (name === 'couponUsage') {
        return {
          add: couponUsageAdd,
        };
      }

      throw new Error(`Unexpected Firestore collection: ${name}`);
    }),
  };

  return {
    firestore,
    userSet,
    userGet,
    subscriptionLookupGet,
    couponGet,
    couponUpdate,
    couponUsageAdd,
  };
}

function loadStripeTestSubject() {
  jest.resetModules();

  const firestoreDouble = createFirestoreDouble();
  const mockAuth = {
    verifyIdToken: jest.fn(),
    getUser: jest.fn(),
  };
  const mockStripeClient = {
    checkout: {
      sessions: {
        create: jest.fn(),
        retrieve: jest.fn(),
      },
    },
    subscriptions: {
      retrieve: jest.fn(),
      update: jest.fn(),
    },
    webhooks: {
      constructEvent: jest.fn(),
    },
  };
  const increment = jest.fn((value) => ({ __increment: value }));
  const firestoreFactory = jest.fn(() => firestoreDouble.firestore);
  firestoreFactory.FieldValue = { increment };

  const mockAdminModule = {
    apps: [{}],
    firestore: firestoreFactory,
  };

  jest.doMock('stripe', () => jest.fn(() => mockStripeClient));
  jest.doMock('firebase-admin', () => mockAdminModule);

  let router;

  jest.isolateModules(() => {
    router = require('../../../api/stripeRoutes');
  });

  const reqAdmin = {
    auth: () => mockAuth,
    firestore: jest.fn(() => firestoreDouble.firestore),
  };

  return {
    router,
    reqAdmin,
    mockAuth,
    mockStripeClient,
    increment,
    subscriptionLookupGet: firestoreDouble.subscriptionLookupGet,
    ...firestoreDouble,
  };
}

describe('stripe backend routes', () => {
  let consoleErrorSpy;
  let consoleLogSpy;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    consoleLogSpy.mockRestore();
    jest.clearAllMocks();
    jest.resetModules();
  });

  it('rejects checkout creation when the caller is unauthenticated', async () => {
    const { router, reqAdmin, mockStripeClient } = loadStripeTestSubject();
    const app = createStripeRouteApp(router, { adminMock: reqAdmin });

    const response = await requestApp(app, {
      method: 'POST',
      path: '/api/stripe/create-checkout-session',
      body: {
        tier: 'plus',
        billing: 'monthly',
      },
    });

    expect(response.status).toBe(401);
    expect(response.json).toEqual({ error: 'Unauthorized' });
    expect(mockStripeClient.checkout.sessions.create).not.toHaveBeenCalled();
  });

  it('creates checkout sessions using the authenticated user context', async () => {
    const { router, reqAdmin, mockAuth, mockStripeClient } = loadStripeTestSubject();
    const app = createStripeRouteApp(router, { adminMock: reqAdmin });

    mockAuth.verifyIdToken.mockResolvedValue({
      uid: 'user-123',
      email: 'student@example.com',
    });
    mockStripeClient.checkout.sessions.create.mockResolvedValue({
      id: 'sess_123',
      url: 'https://stripe.test/sess_123',
    });

    const response = await requestApp(app, {
      method: 'POST',
      path: '/api/stripe/create-checkout-session',
      headers: {
        Authorization: 'Bearer token-123',
      },
      body: {
        tier: 'plus',
        billing: 'monthly',
        userId: 'user-123',
        userEmail: 'student@example.com',
      },
    });

    expect(response.status).toBe(200);
    expect(response.json).toEqual({
      sessionId: 'sess_123',
      url: 'https://stripe.test/sess_123',
      couponApplied: false,
      finalPrice: 9.99,
    });
    expect(mockStripeClient.checkout.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        customer_email: 'student@example.com',
        metadata: {
          userId: 'user-123',
          tier: 'plus',
          billing: 'monthly',
        },
      }),
    );
    expect(
      mockStripeClient.checkout.sessions.create.mock.calls[0][0].line_items[0].price_data.unit_amount,
    ).toBe(999);
  });

  it('rejects mismatched route-level user access', async () => {
    const { router, reqAdmin, mockAuth, mockStripeClient } = loadStripeTestSubject();
    const app = createStripeRouteApp(router, { adminMock: reqAdmin });

    mockAuth.verifyIdToken.mockResolvedValue({
      uid: 'user-123',
      email: 'student@example.com',
    });

    const response = await requestApp(app, {
      method: 'GET',
      path: '/api/stripe/subscription-status/other-user',
      headers: {
        Authorization: 'Bearer token-123',
      },
    });

    expect(response.status).toBe(403);
    expect(response.json).toEqual({ error: 'Authenticated user mismatch' });
    expect(mockStripeClient.subscriptions.retrieve).not.toHaveBeenCalled();
  });

  it('prevents users from reading another user session result', async () => {
    const { router, reqAdmin, mockAuth, mockStripeClient } = loadStripeTestSubject();
    const app = createStripeRouteApp(router, { adminMock: reqAdmin });

    mockAuth.verifyIdToken.mockResolvedValue({
      uid: 'user-123',
      email: 'student@example.com',
    });
    mockStripeClient.checkout.sessions.retrieve.mockResolvedValue({
      id: 'sess_123',
      metadata: {
        userId: 'other-user',
      },
    });

    const response = await requestApp(app, {
      method: 'GET',
      path: '/api/stripe/verify-session/sess_123',
      headers: {
        Authorization: 'Bearer token-123',
      },
    });

    expect(response.status).toBe(403);
    expect(response.json).toEqual({ error: 'Unauthorized session access' });
  });

  it('rejects webhook payloads with invalid signatures', async () => {
    const { router, reqAdmin, mockStripeClient } = loadStripeTestSubject();
    const app = createStripeRouteApp(router, { adminMock: reqAdmin });

    mockStripeClient.webhooks.constructEvent.mockImplementation(() => {
      throw new Error('bad signature');
    });

    const response = await requestApp(app, {
      method: 'POST',
      path: '/api/stripe/webhook',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': 'sig_test',
      },
      body: Buffer.from('{"ok":true}'),
    });

    expect(response.status).toBe(400);
    expect(response.text).toContain('Webhook Error: bad signature');
  });

  it('records membership and coupon usage from completed checkout webhooks', async () => {
    const {
      router,
      reqAdmin,
      mockStripeClient,
      userSet,
      couponUpdate,
      couponUsageAdd,
      increment,
    } = loadStripeTestSubject();
    const app = createStripeRouteApp(router, { adminMock: reqAdmin });

    mockStripeClient.subscriptions.retrieve.mockResolvedValue({
      id: 'sub_123',
      status: 'active',
      customer: 'cus_123',
      start_date: 1710000000,
      current_period_start: 1710000000,
      current_period_end: 1712592000,
      cancel_at_period_end: false,
      metadata: {
        userId: 'user-123',
        tier: 'plus',
        billing: 'monthly',
      },
      items: {
        data: [
          {
            price: {
              unit_amount: 999,
              recurring: {
                interval: 'month',
              },
            },
          },
        ],
      },
    });
    mockStripeClient.webhooks.constructEvent.mockReturnValue({
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_123',
          subscription: 'sub_123',
          metadata: {
            userId: 'user-123',
            tier: 'plus',
            billing: 'monthly',
            couponId: 'coupon_123',
            discountedPrice: '799',
          },
        },
      },
    });

    const response = await requestApp(app, {
      method: 'POST',
      path: '/api/stripe/webhook',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': 'sig_valid',
      },
      body: Buffer.from('{"id":"evt_123"}'),
    });

    expect(response.status).toBe(200);
    expect(response.json).toEqual({ received: true });
    expect(userSet).toHaveBeenCalledWith(
      expect.objectContaining({
        membershipTier: 'plus',
        membershipPlanTier: 'plus',
        membershipBillingCycle: 'monthly',
        stripeSubscriptionId: 'sub_123',
        stripeSubscriptionStatus: 'active',
      }),
      { merge: true },
    );
    expect(increment).toHaveBeenCalledWith(1);
    expect(couponUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        timesUsed: { __increment: 1 },
      }),
    );
    expect(couponUsageAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        couponId: 'coupon_123',
        userId: 'user-123',
        amount: 7.99,
        tier: 'plus',
        billing: 'monthly',
      }),
    );
  });

  it('syncs membership changes from customer.subscription.updated webhooks', async () => {
    const { router, reqAdmin, mockStripeClient, userSet } = loadStripeTestSubject();
    const app = createStripeRouteApp(router, { adminMock: reqAdmin });

    mockStripeClient.webhooks.constructEvent.mockReturnValue({
      type: 'customer.subscription.updated',
      data: {
        object: {
          id: 'sub_upgrade',
          status: 'active',
          customer: 'cus_upgrade',
          start_date: 1710000000,
          current_period_start: 1712592000,
          current_period_end: 1744128000,
          cancel_at_period_end: false,
          metadata: {
            userId: 'user-123',
            tier: 'max',
            billing: 'yearly',
          },
          items: {
            data: [
              {
                price: {
                  unit_amount: 19999,
                  recurring: {
                    interval: 'year',
                  },
                },
              },
            ],
          },
        },
      },
    });

    const response = await requestApp(app, {
      method: 'POST',
      path: '/api/stripe/webhook',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': 'sig_valid',
      },
      body: Buffer.from('{"id":"evt_sub_updated"}'),
    });

    expect(response.status).toBe(200);
    expect(response.json).toEqual({ received: true });
    expect(userSet).toHaveBeenCalledWith(
      expect.objectContaining({
        membershipTier: 'max',
        membershipPlanTier: 'max',
        membershipBillingCycle: 'yearly',
        stripeSubscriptionId: 'sub_upgrade',
        stripeSubscriptionStatus: 'active',
        stripeCustomerId: 'cus_upgrade',
      }),
      { merge: true },
    );
  });

  it('downgrades access and records invoice context when a payment fails', async () => {
    const { router, reqAdmin, mockStripeClient, userSet } = loadStripeTestSubject();
    const app = createStripeRouteApp(router, { adminMock: reqAdmin });

    mockStripeClient.subscriptions.retrieve.mockResolvedValue({
      id: 'sub_past_due',
      status: 'past_due',
      customer: 'cus_past_due',
      start_date: 1710000000,
      current_period_start: 1712592000,
      current_period_end: 1715270400,
      cancel_at_period_end: false,
      metadata: {
        userId: 'user-123',
        tier: 'plus',
        billing: 'monthly',
      },
      items: {
        data: [
          {
            price: {
              unit_amount: 999,
              recurring: {
                interval: 'month',
              },
            },
          },
        ],
      },
    });
    mockStripeClient.webhooks.constructEvent.mockReturnValue({
      type: 'invoice.payment_failed',
      data: {
        object: {
          id: 'in_failed',
          subscription: 'sub_past_due',
          status: 'open',
          next_payment_attempt: 1713000000,
          status_transitions: {
            finalized_at: 1712900000,
          },
        },
      },
    });

    const response = await requestApp(app, {
      method: 'POST',
      path: '/api/stripe/webhook',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': 'sig_valid',
      },
      body: Buffer.from('{"id":"evt_payment_failed"}'),
    });

    expect(response.status).toBe(200);
    expect(response.json).toEqual({ received: true });
    expect(userSet).toHaveBeenCalledWith(
      expect.objectContaining({
        membershipTier: 'free',
        membershipPlanTier: 'plus',
        membershipBillingCycle: 'monthly',
        stripeSubscriptionId: 'sub_past_due',
        stripeSubscriptionStatus: 'past_due',
        stripeLastInvoiceId: 'in_failed',
        stripeLastInvoiceStatus: 'open',
        stripeLastPaymentFailedAt: expect.any(String),
        stripeNextPaymentAttempt: expect.any(String),
      }),
      { merge: true },
    );
  });

  it('restores paid access from successful renewal invoices using stored plan metadata', async () => {
    const { router, reqAdmin, mockStripeClient, userSet, userGet } = loadStripeTestSubject();
    const app = createStripeRouteApp(router, { adminMock: reqAdmin });

    userGet.mockResolvedValue({
      exists: true,
      data: () => ({
        membershipTier: 'free',
        membershipPlanTier: 'plus',
        membershipBillingCycle: 'monthly',
        stripeLastPaymentFailedAt: '2026-03-19T08:00:00.000Z',
      }),
    });
    mockStripeClient.subscriptions.retrieve.mockResolvedValue({
      id: 'sub_discounted',
      status: 'active',
      customer: 'cus_discounted',
      start_date: 1710000000,
      current_period_start: 1712592000,
      current_period_end: 1715270400,
      cancel_at_period_end: false,
      metadata: {
        userId: 'user-123',
      },
      items: {
        data: [
          {
            price: {
              unit_amount: 799,
              recurring: {
                interval: 'month',
              },
            },
          },
        ],
      },
    });
    mockStripeClient.webhooks.constructEvent.mockReturnValue({
      type: 'invoice.payment_succeeded',
      data: {
        object: {
          id: 'in_succeeded',
          subscription: 'sub_discounted',
          status: 'paid',
          status_transitions: {
            paid_at: 1712800000,
          },
        },
      },
    });

    const response = await requestApp(app, {
      method: 'POST',
      path: '/api/stripe/webhook',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': 'sig_valid',
      },
      body: Buffer.from('{"id":"evt_payment_succeeded"}'),
    });

    expect(response.status).toBe(200);
    expect(response.json).toEqual({ received: true });
    expect(userSet).toHaveBeenCalledWith(
      expect.objectContaining({
        membershipTier: 'plus',
        membershipPlanTier: 'plus',
        membershipBillingCycle: 'monthly',
        stripeSubscriptionId: 'sub_discounted',
        stripeSubscriptionStatus: 'active',
        stripeLastInvoiceId: 'in_succeeded',
        stripeLastInvoiceStatus: 'paid',
        stripeLastPaymentSucceededAt: expect.any(String),
        stripeLastPaymentFailedAt: null,
      }),
      { merge: true },
    );
  });
});
