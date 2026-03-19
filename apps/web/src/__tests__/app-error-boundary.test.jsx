import React from 'react';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import AppErrorBoundary from '../components/errors/AppErrorBoundary';
import RouteErrorBoundary from '../components/errors/RouteErrorBoundary';

function ExplodingPage() {
  throw new Error('Kaboom');
}

describe('application error boundaries', () => {
  let consoleErrorSpy;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('shows a fallback for uncaught render errors outside the router', async () => {
    render(
      <AppErrorBoundary>
        <ExplodingPage />
      </AppErrorBoundary>,
    );

    expect(await screen.findByRole('heading', { name: /something went wrong/i })).toBeInTheDocument();
    expect(screen.getByText(/kaboom/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reload page/i })).toBeInTheDocument();
  });

  it('shows a route fallback when a route element throws', async () => {
    const router = createMemoryRouter([
      {
        path: '/',
        element: <ExplodingPage />,
        errorElement: <RouteErrorBoundary />,
      },
    ], {
      future: {
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      },
    });

    render(
      <RouterProvider
        router={router}
        future={{ v7_startTransition: true }}
      />,
    );

    expect(await screen.findByRole('heading', { name: /something went wrong/i })).toBeInTheDocument();
    expect(screen.getByText(/kaboom/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /go to home page/i })).toBeInTheDocument();
  });
});
