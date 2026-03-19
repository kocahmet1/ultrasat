import express from 'express';
import { requestApp } from '../test/apiTestUtils';

const { createServerApp } = require('../../../api/serverApp');

function createEmptyRouters(overrides = {}) {
  const empty = () => express.Router();

  return {
    quizAnalysisRouter: empty(),
    conceptDrillsRouter: empty(),
    assistantRouter: empty(),
    bankRouter: empty(),
    conceptsRouter: empty(),
    conceptDetailRouter: empty(),
    questionsRouter: empty(),
    profileRouter: empty(),
    stripeRouter: empty(),
    couponRouter: empty(),
    blogRouter: empty(),
    reportRouter: empty(),
    questionQualityRouter: empty(),
    emailRouter: empty(),
    companionRouter: empty(),
    ...overrides,
  };
}

function createSilentLogger() {
  return {
    debug: jest.fn(),
    info: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    child: jest.fn(function child() {
      return this;
    }),
  };
}

describe('server app middleware', () => {
  it('preserves raw webhook bodies for Stripe signature verification', async () => {
    const stripeRouter = express.Router();

    stripeRouter.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
      res.json({
        hasBody: req.body != null,
        isBuffer: Buffer.isBuffer(req.body),
        rawBody: Buffer.isBuffer(req.body) ? req.body.toString('utf8') : null,
        bodyType: typeof req.body,
      });
    });

    const { app } = createServerApp({
      firebaseAdmin: null,
      logger: createSilentLogger(),
      routers: createEmptyRouters({ stripeRouter }),
      graphGeneration: { hasGraphGeneration: false, router: null },
    });

    const response = await requestApp(app, {
      method: 'POST',
      path: '/api/stripe/webhook',
      headers: {
        'Content-Type': 'application/json',
      },
      body: Buffer.from('{"event":"stripe"}'),
    });

    expect(response.status).toBe(200);
    expect(response.json).toEqual({
      hasBody: true,
      isBuffer: true,
      rawBody: '{"event":"stripe"}',
      bodyType: 'object',
    });
  });

  it('continues to parse JSON for normal API routes', async () => {
    const quizAnalysisRouter = express.Router();

    quizAnalysisRouter.post('/parser-check', (req, res) => {
      res.json({
        body: req.body,
      });
    });

    const { app } = createServerApp({
      firebaseAdmin: null,
      logger: createSilentLogger(),
      routers: createEmptyRouters({ quizAnalysisRouter }),
      graphGeneration: { hasGraphGeneration: false, router: null },
    });

    const response = await requestApp(app, {
      method: 'POST',
      path: '/api/parser-check',
      body: {
        ok: true,
        nested: { value: 1 },
      },
    });

    expect(response.status).toBe(200);
    expect(response.json).toEqual({
      body: {
        ok: true,
        nested: { value: 1 },
      },
    });
  });

  it('adds request correlation ids and emits request lifecycle logs', async () => {
    const quizAnalysisRouter = express.Router();
    const logger = createSilentLogger();

    quizAnalysisRouter.get('/request-id-check', (req, res) => {
      res.json({
        requestId: req.requestId,
        hasLogger: Boolean(req.log),
      });
    });

    const { app } = createServerApp({
      firebaseAdmin: null,
      logger,
      routers: createEmptyRouters({ quizAnalysisRouter }),
      graphGeneration: { hasGraphGeneration: false, router: null },
    });

    const response = await requestApp(app, {
      method: 'GET',
      path: '/api/request-id-check',
      headers: {
        'X-Request-Id': 'req-test-123',
      },
    });

    expect(response.status).toBe(200);
    expect(response.headers['x-request-id']).toBe('req-test-123');
    expect(response.json).toEqual({
      requestId: 'req-test-123',
      hasLogger: true,
    });
    expect(logger.info).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'request.started',
        method: 'GET',
        path: '/api/request-id-check',
      }),
      'request.started',
    );
    expect(logger.info).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'request.completed',
        method: 'GET',
        path: '/api/request-id-check',
        statusCode: 200,
      }),
      'request.completed',
    );
  });
});
