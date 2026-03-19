import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { MembershipGate } from '../components/membership';
import MembershipUpgrade from '../components/MembershipUpgrade';
import PaymentSuccess from '../pages/PaymentSuccess';
import { useAuth } from '../contexts/AuthContext';
import { createMockUser, renderWithRoute } from '../test/testUtils';

var mockRedirectToCheckout;

jest.mock('../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@stripe/stripe-js', () => ({
  loadStripe: jest.fn(() => {
    mockRedirectToCheckout = jest.fn();
    return Promise.resolve({ redirectToCheckout: mockRedirectToCheckout });
  }),
}));

describe('membership and billing flows', () => {
  beforeEach(() => {
    useAuth.mockReset();
    if (mockRedirectToCheckout) {
      mockRedirectToCheckout.mockReset().mockResolvedValue({});
    }
    global.fetch = jest.fn();
    window.alert.mockClear();
  });

  it('renders protected membership content for eligible members', () => {
    useAuth.mockReturnValue({
      userMembership: { tier: 'plus' },
    });

    renderWithRoute(
      <MembershipGate requiredTier="plus">
        <div>Study Resources</div>
      </MembershipGate>,
      {
        path: '/study-resources',
        initialEntries: ['/study-resources'],
      },
    );

    expect(screen.getByText('Study Resources')).toBeInTheDocument();
  });

  it('shows an upgrade prompt for locked membership features', () => {
    useAuth.mockReturnValue({
      userMembership: { tier: 'free' },
    });

    renderWithRoute(
      <MembershipGate requiredTier="plus">
        <div>Study Resources</div>
      </MembershipGate>,
      {
        path: '/study-resources',
        initialEntries: ['/study-resources'],
        routes: [
          { path: '/membership/upgrade', element: <div>Upgrade Page</div> },
        ],
      },
    );

    expect(screen.getByText(/premium feature/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /upgrade to plus/i }));

    expect(screen.getByText('Upgrade Page')).toBeInTheDocument();
  });

  it('validates coupons and starts a checkout session with the selected billing plan', async () => {
    const currentUser = createMockUser();

    useAuth.mockReturnValue({
      currentUser,
      userMembership: { tier: 'free' },
      getMembershipDisplayName: jest.fn((tier) => tier),
    });

    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          valid: true,
          coupon: {
            id: 'coupon-1',
            code: 'SAVE20',
            discountType: 'percentage',
            discountValue: 20,
            applicableTiers: ['plus'],
            applicableBilling: ['yearly'],
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ sessionId: 'sess_123' }),
      });

    renderWithRoute(<MembershipUpgrade />, {
      path: '/membership/upgrade',
      initialEntries: ['/membership/upgrade'],
    });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        '/api/stripe/subscription-status',
        expect.objectContaining({
          headers: { Authorization: 'Bearer token-123' },
        }),
      );
    });

    fireEvent.change(screen.getByPlaceholderText(/enter coupon code/i), {
      target: { value: 'save20' },
    });
    fireEvent.click(screen.getByRole('button', { name: /apply/i }));

    expect(await screen.findByRole('button', { name: /remove/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /yearly/i }));
    fireEvent.click(screen.getByRole('button', { name: /^upgrade$/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        '/api/stripe/create-checkout-session',
        expect.any(Object),
      );
    });

    const checkoutRequest = fetch.mock.calls[2][1];

    expect(JSON.parse(checkoutRequest.body)).toEqual({
      tier: 'plus',
      billing: 'yearly',
      couponId: 'coupon-1',
    });

    await waitFor(() => {
      expect(mockRedirectToCheckout).toHaveBeenCalledWith({
        sessionId: 'sess_123',
      });
    });
  });

  it('verifies a successful payment and lets the user continue into the app', async () => {
    const currentUser = createMockUser();
    const getUserMembership = jest.fn().mockResolvedValue({ tier: 'plus' });

    useAuth.mockReturnValue({
      currentUser,
      getUserMembership,
    });

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        session: {
          metadata: {
            tier: 'plus',
            billing: 'monthly',
          },
        },
        subscription: {
          current_period_end: 1700000000,
        },
      }),
    });

    renderWithRoute(<PaymentSuccess />, {
      path: '/payment/success',
      initialEntries: ['/payment/success?session_id=sess_123'],
      routes: [{ path: '/dashboard', element: <div>Dashboard Page</div> }],
    });

    expect(await screen.findByText(/payment successful!/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        '/api/stripe/verify-session/sess_123',
        expect.objectContaining({
          headers: { Authorization: 'Bearer token-123' },
        }),
      );
    });

    expect(getUserMembership).toHaveBeenCalledWith(currentUser);

    fireEvent.click(
      screen.getByRole('button', { name: /start using premium features/i }),
    );

    expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
  });
});
