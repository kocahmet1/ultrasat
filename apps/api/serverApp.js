/**
 * Express app factory for the Veritas Blue API.
 * Keeping app construction separate from process startup makes backend tests practical.
 */

const path = require('path');
const workspaceRoot = path.resolve(__dirname, '../..');
require('dotenv').config({ path: path.join(workspaceRoot, '.env') });
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const admin = require('firebase-admin');
const {
  createRequestLoggingMiddleware,
  installConsoleBridge,
  logger: defaultLogger,
  normalizeLogger,
} = require('./logger');

function loadDefaultRouters() {
  return {
    quizAnalysisRouter: require('./quizAnalysis'),
    conceptDrillsRouter: require('./conceptDrills'),
    assistantRouter: require('./assistant'),
    bankRouter: require('./bankRoutes'),
    conceptsRouter: require('./conceptsAPI'),
    conceptDetailRouter: require('./conceptDetailRoutes'),
    questionsRouter: require('./questionsAPI'),
    profileRouter: require('./profileRoutes'),
    stripeRouter: require('./stripeRoutes'),
    couponRouter: require('./couponRoutes'),
    blogRouter: require('./blogRoutes'),
    reportRouter: require('./reportRoutes'),
    questionQualityRouter: require('./questionQualityRoutes'),
    emailRouter: require('./emailRoutes'),
    companionRouter: require('./companionRouter'),
  };
}

function resolveGraphGeneration({ graphGeneration, logger }) {
  if (graphGeneration) {
    return graphGeneration;
  }

  logger.log('--- ENV VARS FOR GRAPH GENERATION ---');
  logger.log(`ENABLE_GRAPH_GENERATION: ${process.env.ENABLE_GRAPH_GENERATION}`);
  logger.log(`GEMINI_API_KEY set: ${!!process.env.GEMINI_API_KEY}`);
  logger.log(`OPENAI_API_KEY set: ${!!process.env.OPENAI_API_KEY}`);

  const enabledByEnv =
    process.env.ENABLE_GRAPH_GENERATION === 'true' &&
    (process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY);

  let router = null;

  if (enabledByEnv) {
    try {
      router = require('./graphGenerationPlotly');
      logger.log('Graph generation features loaded successfully (Plotly + Puppeteer)');
    } catch (error) {
      logger.warn('Graph generation modules failed to load:', error.message);
      logger.log('Graph generation features will be disabled');
    }
  } else {
    logger.log('Graph generation features disabled - set ENABLE_GRAPH_GENERATION=true to enable');
  }

  return {
    hasGraphGeneration: Boolean(enabledByEnv && router),
    router,
  };
}

function initializeFirebaseAdmin({ adminModule = admin, logger = console } = {}) {
  let firebaseAdmin = null;

  try {
    if (!adminModule.apps?.length) {
      let credential;

      if (process.env.NODE_ENV === 'production' && process.env.FIREBASE_PRIVATE_KEY) {
        logger.log('Initializing Firebase Admin with environment variables...');
        const serviceAccount = {
          type: 'service_account',
          project_id: process.env.FIREBASE_PROJECT_ID || 'ultrasat-5e4c4',
          private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
          private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          client_email: process.env.FIREBASE_CLIENT_EMAIL,
          client_id: process.env.FIREBASE_CLIENT_ID,
          auth_uri: 'https://accounts.google.com/o/oauth2/auth',
          token_uri: 'https://oauth2.googleapis.com/token',
          auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
          universe_domain: 'googleapis.com',
        };
        credential = adminModule.credential.cert(serviceAccount);
      } else {
        logger.log('Initializing Firebase Admin with service account key file...');
        const serviceAccountPath = path.join(workspaceRoot, 'ultrasat-5e4c4-369f564bdaef.json');
        credential = adminModule.credential.cert(serviceAccountPath);
      }

      adminModule.initializeApp({
        credential,
        databaseURL: 'https://ultrasat-5e4c4.firebaseio.com',
        storageBucket: 'ultrasat-5e4c4.firebasestorage.app',
      });
    }

    firebaseAdmin = adminModule;
    logger.log('Firebase Admin SDK initialized successfully');
  } catch (error) {
    logger.warn('Firebase Admin initialization error:', error);
    logger.log('Some features requiring Firebase Admin may not work properly');
  }

  return firebaseAdmin;
}

function createAttachFirebaseAdmin(firebaseAdmin) {
  return (req, res, next) => {
    if (firebaseAdmin) {
      req.firebaseAdmin = firebaseAdmin;
      req.admin = firebaseAdmin;
      req.db = firebaseAdmin.firestore();
    }
    next();
  };
}

function registerGraphFallbackRoutes(app) {
  app.post('/api/generate-graph', (req, res) => {
    res.status(503).json({
      success: false,
      error: 'Graph generation feature is disabled in this environment',
      reason: 'Missing required dependencies or environment variables',
      suggestion: 'Set ENABLE_GRAPH_GENERATION=true and required API keys to enable this feature',
    });
  });

  app.post('/api/generate-graph-plotly', (req, res) => {
    res.status(503).json({
      success: false,
      error: 'Graph generation feature is disabled in this environment',
      reason: 'Missing required dependencies or environment variables',
      suggestion: 'Set ENABLE_GRAPH_GENERATION=true and required API keys to enable this feature',
    });
  });

  app.get('/api/check-python', (req, res) => {
    res.status(503).json({
      available: false,
      error: 'Graph generation feature is disabled',
      requirements: 'Set ENABLE_GRAPH_GENERATION=true to enable',
    });
  });

  app.get('/api/check-plotly-environment', (req, res) => {
    res.status(503).json({
      available: false,
      error: 'Graph generation feature is disabled',
      requirements: 'Set ENABLE_GRAPH_GENERATION=true to enable',
    });
  });
}

function createServerApp(options = {}) {
  const logger = normalizeLogger(options.logger || defaultLogger);
  if (options.installConsoleBridge !== false) {
    installConsoleBridge(logger);
  }
  const routers = options.routers || loadDefaultRouters();
  const graphGeneration = resolveGraphGeneration({
    graphGeneration: options.graphGeneration,
    logger,
  });
  const firebaseAdmin = Object.prototype.hasOwnProperty.call(options, 'firebaseAdmin')
    ? options.firebaseAdmin
    : initializeFirebaseAdmin({
        adminModule: options.adminModule || admin,
        logger,
      });

  const attachFirebaseAdmin = createAttachFirebaseAdmin(firebaseAdmin);
  const app = express();
  const port = options.port || process.env.PORT || 3001;

  logger.log('Environment:', process.env.NODE_ENV || 'development');
  logger.log('PORT from env:', process.env.PORT);
  logger.log('Final PORT value:', port);

  app.set('trust proxy', 1);
  app.use(createRequestLoggingMiddleware(logger));

  const jsonParser = express.json();
  app.use((req, res, next) => {
    if (req.originalUrl.startsWith('/api/stripe/webhook')) {
      return next();
    }
    return jsonParser(req, res, next);
  });

  app.use(attachFirebaseAdmin);

  const corsOptions = {
    origin:
      process.env.NODE_ENV === 'production'
        ? [
            'https://ultrasatprep.com',
            'https://veritas-blue.netlify.app',
            'https://veritas-blue-web.onrender.com',
          ]
        : process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
    exposedHeaders: ['X-Request-Id'],
    credentials: true,
  };
  app.use(cors(corsOptions));

  logger.log(`API Server running in ${process.env.NODE_ENV || 'development'} mode`);
  logger.log(`CORS configured for: ${corsOptions.origin}`);
  logger.log(
    `Gemini Model: ${process.env.GEMINI_ASSISTANT_MODEL || 'gemini-2.5-flash-preview-04-17'}`,
  );

  if (process.env.NODE_ENV !== 'production') {
    app.get('/api/debug/env', (req, res) => {
      res.json({
        nodeEnv: process.env.NODE_ENV,
        hasGeminiKey: !!process.env.GEMINI_API_KEY,
        geminiKeyLength: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0,
        geminiModel: process.env.GEMINI_ASSISTANT_MODEL || 'gemini-pro',
        timestamp: new Date().toISOString(),
        firebaseInitialized: !!firebaseAdmin,
      });
    });
  }

  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' },
  });
  app.use('/api/', apiLimiter);

  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use('/api/static', express.static(path.join(__dirname, 'static')));

  app.use('/api', routers.quizAnalysisRouter);
  app.use('/api', routers.conceptDrillsRouter);
  app.use('/api/assistant', routers.assistantRouter);
  app.use('/api/bank', routers.bankRouter);
  app.use('/api/concepts', routers.conceptsRouter);
  app.use('/api/concepts', routers.conceptDetailRouter);
  app.use('/api/questions', routers.questionsRouter);
  app.use('/api/profile', attachFirebaseAdmin, routers.profileRouter);
  app.use('/api/stripe', attachFirebaseAdmin, routers.stripeRouter);
  app.use('/api/coupons', attachFirebaseAdmin, routers.couponRouter);
  app.use('/api/blog', routers.blogRouter);
  app.use('/api/reports', attachFirebaseAdmin, routers.reportRouter);
  app.use('/api/question-quality', attachFirebaseAdmin, routers.questionQualityRouter);
  app.use('/api/email', attachFirebaseAdmin, routers.emailRouter);
  app.use('/api/companion', attachFirebaseAdmin, routers.companionRouter);

  logger.log(
    `AI Companion features ${process.env.OPENAI_API_KEY ? 'enabled' : 'disabled (no OPENAI_API_KEY)'}`,
  );

  app.get('/api/help', (req, res) => {
    res.json({
      sections: [
        {
          section: 'General',
          faqs: [
            { question: 'What is this app?', answer: 'Placeholder answer for what this app is.' },
            { question: 'How do I use the app?', answer: 'Placeholder answer for how to use the app.' },
          ],
        },
        {
          section: 'Account',
          faqs: [
            {
              question: 'What features are unlocked with a Pro membership?',
              answer:
                'Upgrading to Pro unlocks a variety of premium features, including: unlimited practice exams, detailed progress analytics, full access to our suite of study tools, and priority email support. The specific features depend on the selected Pro tier (Plus or Max).',
            },
            {
              question: 'How do I upgrade my account to Pro?',
              answer:
                'You can upgrade to a Pro membership at any time from the membership upgrade page. Open the upgrade flow from your profile or any premium feature prompt, choose the plan that fits your needs, and complete checkout securely.',
            },
            {
              question: 'Where can I manage my profile and account settings?',
              answer:
                'Your profile and account settings can be managed from the profile page. You can access this by clicking on your profile icon in the top navigation bar. From there, you can view your stats, manage your membership, and log out.',
            },
          ],
        },
      ],
    });
  });

  app.get('/sitemap.xml', async (req, res) => {
    try {
      res.set('Content-Type', 'application/xml');

      let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Main Public Pages -->
  <url>
    <loc>https://ultrasatprep.com/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>
  
  <url>
    <loc>https://ultrasatprep.com/login</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>
  
  <url>
    <loc>https://ultrasatprep.com/signup</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>
  
  <url>
    <loc>https://ultrasatprep.com/help</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>
  
  <url>
    <loc>https://ultrasatprep.com/auth-notice</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>

  <!-- Company & Information Pages -->
  <url>
    <loc>https://ultrasatprep.com/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>
  
  <url>
    <loc>https://ultrasatprep.com/contact</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>
  
  <url>
    <loc>https://ultrasatprep.com/careers</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>
  
  <url>
    <loc>https://ultrasatprep.com/press</loc>
    <changefreq>monthly</changefreq>
    <priority>0.4</priority>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>

  <!-- SAT Resources & Tools -->
  <url>
    <loc>https://ultrasatprep.com/sat-guide</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>
  
  <url>
    <loc>https://ultrasatprep.com/score-calculator</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>

  <!-- Blog Section -->
  <url>
    <loc>https://ultrasatprep.com/blog</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>`;

      try {
        if (firebaseAdmin) {
          const db = firebaseAdmin.firestore();
          const blogQuery = db
            .collection('blogPosts')
            .where('status', '==', 'published')
            .orderBy('createdAt', 'desc')
            .limit(100);

          const snapshot = await blogQuery.get();

          logger.log(`Found ${snapshot.docs.length} published blog posts for sitemap`);

          snapshot.docs.forEach((doc) => {
            const post = doc.data();
            const lastMod = post.updatedAt || post.createdAt;
            const lastModDate = lastMod?.toDate?.() || new Date(lastMod);

            sitemap += `
  
  <url>
    <loc>https://ultrasatprep.com/blog/${doc.id}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
    <lastmod>${lastModDate.toISOString().split('T')[0]}</lastmod>
  </url>`;
          });
        }
      } catch (error) {
        logger.error('Error fetching blog posts for sitemap:', error);
      }

      sitemap += `

  <!-- Legal Pages -->
  <url>
    <loc>https://ultrasatprep.com/privacy</loc>
    <changefreq>yearly</changefreq>
    <priority>0.4</priority>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>
  
  <url>
    <loc>https://ultrasatprep.com/terms</loc>
    <changefreq>yearly</changefreq>
    <priority>0.4</priority>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>
  
  <url>
    <loc>https://ultrasatprep.com/cookies</loc>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>
  
  <url>
    <loc>https://ultrasatprep.com/accessibility</loc>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>

</urlset>`;

      res.send(sitemap);
    } catch (error) {
      logger.error('Error generating sitemap:', error);
      res.status(500).send('Error generating sitemap');
    }
  });

  if (process.env.NODE_ENV === 'production') {
    const clientBuildPath = path.join(workspaceRoot, 'build');
    app.use(express.static(clientBuildPath));
    app.get('*', (req, res) => {
      if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API endpoint not found' });
      }
      return res.sendFile(path.join(clientBuildPath, 'index.html'));
    });
  }

  if (graphGeneration.hasGraphGeneration && graphGeneration.router) {
    app.use('/api', graphGeneration.router);
    logger.log('Graph generation API endpoints registered (Plotly + Puppeteer)');
  } else {
    registerGraphFallbackRoutes(app);
    logger.log('Graph generation API endpoints disabled - fallback routes registered');
  }

  app.use((err, req, res, next) => {
    const requestLogger = req?.log || logger;
    requestLogger.error(
      {
        err,
        path: req?.originalUrl || req?.url,
        method: req?.method,
      },
      'request.unhandled',
    );
    res.status(500).json({ error: 'Internal Server Error' });
  });

  return {
    app,
    firebaseAdmin,
    port,
  };
}

module.exports = {
  createServerApp,
  initializeFirebaseAdmin,
};
