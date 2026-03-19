import express from 'express';
import http from 'http';

export function createApiRouteApp(basePath, router, { adminMock } = {}) {
  const app = express();
  const jsonParser = express.json();

  app.use((req, res, next) => {
    if (req.originalUrl.startsWith('/api/stripe/webhook')) {
      return next();
    }
    return jsonParser(req, res, next);
  });

  if (adminMock) {
    app.use((req, res, next) => {
      req.admin = adminMock;
      req.db = adminMock.firestore();
      next();
    });
  }

  app.use(basePath, router);

  return app;
}

export function createStripeRouteApp(router, { adminMock } = {}) {
  return createApiRouteApp('/api/stripe', router, { adminMock });
}

export async function requestApp(
  app,
  {
    method = 'GET',
    path = '/',
    headers = {},
    body,
  } = {},
) {
  return new Promise((resolve, reject) => {
    const server = app.listen(0, '127.0.0.1', () => {
      let payload = body;
      const normalizedHeaders = { ...headers };

      if (
        payload &&
        typeof payload === 'object' &&
        !Buffer.isBuffer(payload) &&
        !ArrayBuffer.isView(payload)
      ) {
        payload = JSON.stringify(payload);
        if (!normalizedHeaders['Content-Type']) {
          normalizedHeaders['Content-Type'] = 'application/json';
        }
      }

      if (payload != null && !normalizedHeaders['Content-Length']) {
        normalizedHeaders['Content-Length'] = Buffer.byteLength(payload);
      }

      const request = http.request(
        {
          hostname: '127.0.0.1',
          port: server.address().port,
          method,
          path,
          headers: normalizedHeaders,
        },
        (response) => {
          const chunks = [];

          response.on('data', (chunk) => {
            chunks.push(chunk);
          });

          response.on('end', () => {
            const text = Buffer.concat(chunks).toString('utf8');
            let json = null;

            try {
              json = text ? JSON.parse(text) : null;
            } catch (error) {
              json = null;
            }

            server.close((closeError) => {
              if (closeError) {
                reject(closeError);
                return;
              }

              resolve({
                status: response.statusCode,
                headers: response.headers,
                text,
                json,
              });
            });
          });
        },
      );

      request.on('error', (error) => {
        server.close(() => {
          reject(error);
        });
      });

      if (payload != null) {
        request.write(payload);
      }

      request.end();
    });
  });
}
