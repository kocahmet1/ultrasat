const { createServerApp } = require('./serverApp');
const { logger } = require('./logger');

const { app, firebaseAdmin, port } = createServerApp();

function startServer() {
  return app.listen(port, () => {
    logger.info({ port }, 'server.started');
    logger.info({ apiUrl: `http://localhost:${port}/api` }, 'server.api_available');
    logger.info('Use npm run dev to run both frontend and API servers concurrently');
  });
}

if (require.main === module) {
  startServer();
}

module.exports = app;
module.exports.firebaseAdmin = firebaseAdmin;
module.exports.createServerApp = createServerApp;
module.exports.startServer = startServer;
