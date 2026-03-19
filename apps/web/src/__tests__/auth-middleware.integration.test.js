import express from 'express';
import { requestApp } from '../test/apiTestUtils';

const { requireAdmin, requireAuth } = require('../../../api/middleware/auth');

function createAdminMock({
  decodedToken = { uid: 'user-123', email: 'student@example.com' },
  userRecord = { isAdmin: false },
} = {}) {
  const verifyIdToken = jest.fn().mockResolvedValue(decodedToken);
  const getUser = jest.fn().mockResolvedValue(
    userRecord == null
      ? { exists: false, data: () => null }
      : { exists: true, data: () => userRecord },
  );

  const db = {
    collection: jest.fn((name) => {
      if (name !== 'users') {
        throw new Error(`Unexpected collection: ${name}`);
      }

      return {
        doc: jest.fn(() => ({
          get: getUser,
        })),
      };
    }),
  };

  const adminMock = {
    auth: jest.fn(() => ({
      verifyIdToken,
    })),
    firestore: jest.fn(() => db),
  };

  return {
    adminMock,
    db,
    getUser,
    verifyIdToken,
  };
}

function createApp(adminMock, routeBuilder) {
  const app = express();
  app.use((req, res, next) => {
    req.admin = adminMock;
    next();
  });
  routeBuilder(app);
  return app;
}

describe('shared auth middleware', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('populates normalized request auth fields', async () => {
    const { adminMock, verifyIdToken } = createAdminMock();
    const app = createApp(adminMock, (routerApp) => {
      routerApp.get('/secure', requireAuth(), (req, res) => {
        res.json({
          uid: req.user.uid,
          userId: req.userId,
          userEmail: req.userEmail,
          hasAdmin: Boolean(req.admin),
          hasFirebaseAdmin: Boolean(req.firebaseAdmin),
          hasDb: Boolean(req.db),
        });
      });
    });

    const response = await requestApp(app, {
      method: 'GET',
      path: '/secure',
      headers: {
        Authorization: 'Bearer token-123',
      },
    });

    expect(response.status).toBe(200);
    expect(response.json).toEqual({
      uid: 'user-123',
      userId: 'user-123',
      userEmail: 'student@example.com',
      hasAdmin: true,
      hasFirebaseAdmin: true,
      hasDb: true,
    });
    expect(verifyIdToken).toHaveBeenCalledWith('token-123');
  });

  it('allows standalone admin middleware for admin users', async () => {
    const { adminMock, verifyIdToken, getUser } = createAdminMock({
      userRecord: { isAdmin: true },
    });
    const app = createApp(adminMock, (routerApp) => {
      routerApp.get('/admin', requireAdmin(), (req, res) => {
        res.json({ uid: req.user.uid, isAdmin: req.isAdmin });
      });
    });

    const response = await requestApp(app, {
      method: 'GET',
      path: '/admin',
      headers: {
        Authorization: 'Bearer token-123',
      },
    });

    expect(response.status).toBe(200);
    expect(response.json).toEqual({
      uid: 'user-123',
      isAdmin: true,
    });
    expect(verifyIdToken).toHaveBeenCalledWith('token-123');
    expect(getUser).toHaveBeenCalled();
  });

  it('rejects non-admin users from admin routes', async () => {
    const { adminMock } = createAdminMock({
      userRecord: { isAdmin: false },
    });
    const app = createApp(adminMock, (routerApp) => {
      routerApp.get('/admin', requireAdmin(), (req, res) => {
        res.json({ ok: true });
      });
    });

    const response = await requestApp(app, {
      method: 'GET',
      path: '/admin',
      headers: {
        Authorization: 'Bearer token-123',
      },
    });

    expect(response.status).toBe(403);
    expect(response.json).toEqual({
      error: 'Unauthorized: Admin access required',
    });
  });
});
