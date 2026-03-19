import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import Login from '../components/auth/Login';
import Signup from '../components/auth/Signup';
import PrivateRoute from '../components/auth/PrivateRoute';
import AdminRoute from '../components/auth/AdminRoute';
import { useAuth } from '../contexts/AuthContext';
import {
  createMockUser,
  renderWithRoute,
  RouteStateViewer,
} from '../test/testUtils';

jest.mock('../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

describe('auth and admin access', () => {
  beforeEach(() => {
    useAuth.mockReset();
    sessionStorage.clear();
  });

  it('redirects to the originally requested route after a successful login', async () => {
    const login = jest.fn().mockResolvedValue({});

    useAuth.mockReturnValue({
      login,
      signInWithGoogle: jest.fn(),
    });

    renderWithRoute(<Login />, {
      path: '/login',
      initialEntries: [{ pathname: '/login', state: { from: '/dashboard' } }],
      routes: [{ path: '/dashboard', element: <div>Dashboard Page</div> }],
    });

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'student@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: 'secret123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^log in$/i }));

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith('student@example.com', 'secret123');
    });

    expect(await screen.findByText('Dashboard Page')).toBeInTheDocument();
  });

  it('shows signup validation errors before calling the API', () => {
    const signup = jest.fn();

    useAuth.mockReturnValue({
      signup,
      signInWithGoogle: jest.fn(),
    });

    renderWithRoute(<Signup />, {
      path: '/signup',
      initialEntries: ['/signup'],
    });

    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: 'Ada Lovelace' },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'ada@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: 'secret123' },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'different123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^sign up$/i }));

    expect(signup).not.toHaveBeenCalled();
    expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
  });

  it('sends successful email signups to verification', async () => {
    const signup = jest.fn().mockResolvedValue({});

    useAuth.mockReturnValue({
      signup,
      signInWithGoogle: jest.fn(),
    });

    renderWithRoute(<Signup />, {
      path: '/signup',
      initialEntries: ['/signup'],
      routes: [{ path: '/verify-email', element: <div>Verify Email Page</div> }],
    });

    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: 'Ada Lovelace' },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'ada@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: 'secret123' },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'secret123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^sign up$/i }));

    await waitFor(() => {
      expect(signup).toHaveBeenCalledWith(
        'ada@example.com',
        'secret123',
        'Ada Lovelace',
      );
    });

    expect(await screen.findByText('Verify Email Page')).toBeInTheDocument();
  });

  it('redirects anonymous users away from private routes', () => {
    useAuth.mockReturnValue({ currentUser: null });

    renderWithRoute(
      <PrivateRoute>
        <div>Protected Content</div>
      </PrivateRoute>,
      {
        path: '/dashboard',
        initialEntries: ['/dashboard'],
        routes: [{ path: '/login', element: <RouteStateViewer testId="login" /> }],
      },
    );

    expect(screen.getByTestId('login-pathname')).toHaveTextContent('/login');
    expect(screen.getByTestId('login')).toHaveTextContent('/dashboard');
  });

  it('redirects unverified password users to email verification', () => {
    useAuth.mockReturnValue({
      currentUser: createMockUser({ emailVerified: false }),
    });

    renderWithRoute(
      <PrivateRoute>
        <div>Protected Content</div>
      </PrivateRoute>,
      {
        path: '/dashboard',
        initialEntries: ['/dashboard'],
        routes: [{ path: '/verify-email', element: <div>Verify Email Page</div> }],
      },
    );

    expect(screen.getByText('Verify Email Page')).toBeInTheDocument();
  });

  it('redirects non-admin users away from admin routes', () => {
    useAuth.mockReturnValue({
      currentUser: createMockUser(),
      userMembership: { isAdmin: false },
      loading: false,
    });

    renderWithRoute(
      <AdminRoute>
        <div>Admin Dashboard</div>
      </AdminRoute>,
      {
        path: '/admin',
        initialEntries: ['/admin'],
        routes: [{ path: '/', element: <div>Home Page</div> }],
      },
    );

    expect(screen.getByText('Home Page')).toBeInTheDocument();
  });

  it('allows admins through admin routes', () => {
    useAuth.mockReturnValue({
      currentUser: createMockUser(),
      userMembership: { isAdmin: true },
      loading: false,
    });

    renderWithRoute(
      <AdminRoute>
        <div>Admin Dashboard</div>
      </AdminRoute>,
      {
        path: '/admin',
        initialEntries: ['/admin'],
      },
    );

    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
  });
});
