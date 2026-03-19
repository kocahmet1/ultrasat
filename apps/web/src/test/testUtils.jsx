import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';

export function renderWithRoute(
  ui,
  {
    path = '/',
    initialEntries = ['/'],
    routes = [],
  } = {},
) {
  return render(
    <MemoryRouter
      initialEntries={initialEntries}
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        <Route path={path} element={ui} />
        {routes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
      </Routes>
    </MemoryRouter>,
  );
}

export function RouteStateViewer({ testId = 'route-state' }) {
  const location = useLocation();

  return (
    <div>
      <div data-testid={`${testId}-pathname`}>{location.pathname}</div>
      <pre data-testid={testId}>{JSON.stringify(location.state ?? null)}</pre>
    </div>
  );
}

export function createMockUser(overrides = {}) {
  return {
    uid: 'user-123',
    email: 'student@example.com',
    emailVerified: true,
    providerData: [{ providerId: 'password' }],
    getIdToken: jest.fn().mockResolvedValue('token-123'),
    ...overrides,
  };
}
