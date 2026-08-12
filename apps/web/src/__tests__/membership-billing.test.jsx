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

    expect(screen.getByText(/is a pro feature/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /upgrade to pro/i }));

    expect(screen.getByText('Upgrade Page')).toBeInTheDocument();
  });

  it('hides coupon and checkout controls while purchases are disabled', async () => {
    const currentUser = createMockUser();

    useAuth.mockReturnValue({
      currentUser,
      userMembership: { tier: 'free' },
      getMembershipDisplayName: jest.fn((tier) => tier),
    });

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
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

    expect(screen.getByText('To be determined')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/enter coupon code/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /apply/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /yearly/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^upgrade$/i })).not.toBeInTheDocument();
    expect(mockRedirectToCheckout).not.toHaveBeenCalled();
    expect(fetch).toHaveBeenCalledTimes(1);
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
      screen.getByRole('button', { name: /start using pro/i }),
    );

    expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
  });
});
