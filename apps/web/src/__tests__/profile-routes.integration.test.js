import { createApiRouteApp, requestApp } from '../test/apiTestUtils';

function createProfileFirestoreDouble({
  userDocs = {},
  progressDocsByUser = {},
  userProgressCounts = {},
  userStatsCacheDocs = {},
} = {}) {
  const cacheDocs = { ...userStatsCacheDocs };
  const cacheSetCalls = [];

  const db = {
    collection: jest.fn((name) => {
      if (name === 'users') {
        return {
          doc: jest.fn((userId) => ({
            get: jest.fn().mockResolvedValue(
              userDocs[userId]
                ? { exists: true, data: () => userDocs[userId] }
                : { exists: false, data: () => null },
            ),
            collection: jest.fn((subcollection) => {
              if (subcollection !== 'progress') {
                throw new Error(`Unexpected users subcollection: ${subcollection}`);
              }

              return {
                get: jest.fn().mockResolvedValue({
                  docs: (progressDocsByUser[userId] || []).map((data, index) => ({
                    id: `progress-${index}`,
                    data: () => data,
                  })),
                }),
              };
            }),
          })),
        };
      }

      if (name === 'userProgress') {
        return {
          where: jest.fn((field, operator, userId) => {
            if (field !== 'userId' || operator !== '==') {
              throw new Error(`Unexpected userProgress query: ${field} ${operator}`);
            }

            return {
              get: jest.fn().mockResolvedValue({
                size: userProgressCounts[userId] || 0,
              }),
            };
          }),
        };
      }

      if (name === 'userStatsCache') {
        return {
          doc: jest.fn((userId) => ({
            set: jest.fn(async (data, options) => {
              cacheSetCalls.push({ userId, data, options });
              cacheDocs[userId] = {
                ...(cacheDocs[userId] || {}),
                ...data,
              };
            }),
          })),
          get: jest.fn().mockResolvedValue({
            docs: Object.entries(cacheDocs).map(([userId, data]) => ({
              id: userId,
              data: () => data,
            })),
          }),
        };
      }

      throw new Error(`Unexpected Firestore collection: ${name}`);
    }),
  };

  return {
    db,
    cacheDocs,
    cacheSetCalls,
  };
}

function loadProfileRouteTestSubject(options = {}) {
  jest.resetModules();

  const firestoreDouble = createProfileFirestoreDouble(options);
  const mockAuth = {
    verifyIdToken: jest.fn(),
  };
  const serverTimestamp = jest.fn(() => ({ __serverTimestamp: true }));
  const mockAdminModule = {
    firestore: Object.assign(
      jest.fn(() => firestoreDouble.db),
      {
        FieldValue: {
          serverTimestamp,
        },
      },
    ),
  };

  jest.doMock('firebase-admin', () => mockAdminModule);

  let router;

  jest.isolateModules(() => {
    router = require('../../../api/profileRoutes');
  });

  const reqAdmin = {
    auth: () => mockAuth,
    firestore: jest.fn(() => firestoreDouble.db),
  };

  return {
    router,
    reqAdmin,
    mockAuth,
    serverTimestamp,
    ...firestoreDouble,
  };
}

describe('profile backend routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it('rejects unauthenticated ranking requests', async () => {
    const { router, reqAdmin } = loadProfileRouteTestSubject();
    const app = createApiRouteApp('/api/profile', router, { adminMock: reqAdmin });

    const response = await requestApp(app, {
      method: 'GET',
      path: '/api/profile/rankings',
    });

    expect(response.status).toBe(401);
    expect(response.json).toEqual({ error: 'Unauthorized - No token provided' });
  });

  it('refreshes the authenticated user stats cache via the backend', async () => {
    const { router, reqAdmin, mockAuth, cacheSetCalls } = loadProfileRouteTestSubject({
      userDocs: {
        'user-123': { isAdmin: false },
      },
      progressDocsByUser: {
        'user-123': [
          { totalQuestions: 5, correctTotal: 4 },
          { totalQuestions: 5, correctTotal: 3 },
        ],
      },
      userProgressCounts: {
        'user-123': 4,
      },
    });
    const app = createApiRouteApp('/api/profile', router, { adminMock: reqAdmin });

    mockAuth.verifyIdToken.mockResolvedValue({
      uid: 'user-123',
    });

    const response = await requestApp(app, {
      method: 'POST',
      path: '/api/profile/stats-cache/refresh',
      headers: {
        Authorization: 'Bearer token-123',
      },
      body: {
        userId: 'user-123',
      },
    });

    expect(response.status).toBe(200);
    expect(response.json).toEqual({
      success: true,
      stats: {
        userId: 'user-123',
        totalQuestions: 14,
        accuracy: 70,
      },
    });
    expect(cacheSetCalls).toHaveLength(1);
    expect(cacheSetCalls[0]).toEqual({
      userId: 'user-123',
      data: expect.objectContaining({
        userId: 'user-123',
        totalQuestions: 14,
        accuracy: 70,
        managedBy: 'server',
        version: 2,
      }),
      options: { merge: true },
    });
  });

  it('rejects requests for another user when the caller is not an admin', async () => {
    const { router, reqAdmin, mockAuth } = loadProfileRouteTestSubject({
      userDocs: {
        'user-123': { isAdmin: false },
      },
    });
    const app = createApiRouteApp('/api/profile', router, { adminMock: reqAdmin });

    mockAuth.verifyIdToken.mockResolvedValue({
      uid: 'user-123',
    });

    const response = await requestApp(app, {
      method: 'GET',
      path: '/api/profile/rankings/other-user',
      headers: {
        Authorization: 'Bearer token-123',
      },
    });

    expect(response.status).toBe(403);
    expect(response.json).toEqual({ error: 'Authenticated user mismatch' });
  });

  it('returns ranking data using the backend-managed stats cache', async () => {
    const { router, reqAdmin, mockAuth } = loadProfileRouteTestSubject({
      userDocs: {
        'user-123': { isAdmin: false },
      },
      progressDocsByUser: {
        'user-123': [
          { totalQuestions: 5, correctTotal: 4 },
          { totalQuestions: 5, correctTotal: 3 },
        ],
      },
      userProgressCounts: {
        'user-123': 4,
      },
      userStatsCacheDocs: {
        'other-user': {
          userId: 'other-user',
          totalQuestions: 10,
          accuracy: 60,
        },
      },
    });
    const app = createApiRouteApp('/api/profile', router, { adminMock: reqAdmin });

    mockAuth.verifyIdToken.mockResolvedValue({
      uid: 'user-123',
    });

    const response = await requestApp(app, {
      method: 'GET',
      path: '/api/profile/rankings',
      headers: {
        Authorization: 'Bearer token-123',
      },
    });

    expect(response.status).toBe(200);
    expect(response.json).toEqual({
      success: true,
      stats: {
        userId: 'user-123',
        totalQuestions: 14,
        accuracy: 70,
      },
      rankings: {
        questionsRanking: {
          percentile: 100,
          position: 1,
          total: 2,
        },
        accuracyRanking: {
          percentile: 100,
          position: 1,
          total: 2,
        },
      },
    });
  });
});
