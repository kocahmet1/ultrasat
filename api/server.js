/**
 * Main server file for the Veritas Blue API
 * This Express server provides endpoints for quiz analysis and concept drills
 */

// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const admin = require('firebase-admin');
const path = require('path');
const quizAnalysisRouter = require('./quizAnalysis');
const conceptDrillsRouter = require('./conceptDrills');
const assistantRouter = require('./assistant');
const bankRouter = require('./bankRoutes');
const conceptsRouter = require('./conceptsAPI');
const conceptDetailRouter = require('./conceptDetailRoutes');
const questionsRouter = require('./questionsAPI');
// Conditionally load graph generation modules only if dependencies are available
let graphGenerationPlotlyRouter;
console.log('--- ENV VARS FOR GRAPH GENERATION ---');
console.log(`ENABLE_GRAPH_GENERATION: ${process.env.ENABLE_GRAPH_GENERATION}`);
console.log(`GEMINI_API_KEY set: ${!!process.env.GEMINI_API_KEY}`);
console.log(`OPENAI_API_KEY set: ${!!process.env.OPENAI_API_KEY}`);
const hasGraphGeneration = process.env.ENABLE_GRAPH_GENERATION === 'true' && 
                           (process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY);

if (hasGraphGeneration) {
  try {
    // Only load the working Plotly-based graph generation module
    // Skip the disabled graphGeneration.js module
    graphGenerationPlotlyRouter = require('./graphGenerationPlotly');
    console.log('✅ Graph generation features loaded successfully (Plotly + Puppeteer)');
  } catch (error) {
    console.warn('⚠️ Graph generation modules failed to load:', error.message);
    console.log('Graph generation features will be disabled');
  }
} else {
  console.log('📊 Graph generation features disabled - set ENABLE_GRAPH_GENERATION=true to enable');
}

// Initialize Firebase Admin SDK
// For local development, use the service account key file
// For production (Render.com), use environment variables
let firebaseAdmin;
try {
  let credential;
  
  if (process.env.NODE_ENV === 'production' && process.env.FIREBASE_PRIVATE_KEY) {
    // Production: Use environment variables (only if Firebase env vars are available)
    console.log('Initializing Firebase Admin with environment variables...');
    const serviceAccount = {
      type: "service_account",
      project_id: process.env.FIREBASE_PROJECT_ID || 'ultrasat-5e4c4',
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      universe_domain: "googleapis.com"
    };
    credential = admin.credential.cert(serviceAccount);
  } else {
    // Development: Use service account key file
    console.log('Initializing Firebase Admin with service account key file...');
    const serviceAccountPath = path.resolve(__dirname, '../ultrasat-5e4c4-369f564bdaef.json');
    credential = admin.credential.cert(serviceAccountPath);
  }
  
  admin.initializeApp({
    credential: credential,
    databaseURL: 'https://ultrasat-5e4c4.firebaseio.com',
    storageBucket: 'ultrasat-5e4c4.firebasestorage.app'
  });
  
  firebaseAdmin = admin;
  console.log('✅ Firebase Admin SDK initialized successfully');
} catch (error) {
  console.warn('⚠️ Firebase Admin initialization error:', error);
  console.log('Some features requiring Firebase Admin may not work properly');
}

// Middleware to attach Firebase Admin to the request object
const attachFirebaseAdmin = (req, res, next) => {
  if (firebaseAdmin) {
    req.admin = firebaseAdmin;
    req.db = firebaseAdmin.firestore();
  }
  next();
};

// Create Express app
const app = express();

// Use Render's PORT environment variable in production, fallback to 3001 for local development
const PORT = process.env.PORT || 3001;
console.log('Environment:', process.env.NODE_ENV || 'development');
console.log('PORT from env:', process.env.PORT);
console.log('Final PORT value:', PORT);

// Trust proxy for rate limiting (fixes X-Forwarded-For header issue)
app.set('trust proxy', 1);

// Middleware
app.use(express.json());

// Attach Firebase Admin to requests
app.use(attachFirebaseAdmin);

// Configure CORS
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://veritas-blue.netlify.app', 'https://veritas-blue-web.onrender.com'] 
    : process.env.CLIENT_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};
app.use(cors(corsOptions));

// Log environment information
console.log(`API Server running in ${process.env.NODE_ENV || 'development'} mode`);
console.log(`CORS configured for: ${corsOptions.origin}`);
console.log(`Gemini Model: ${process.env.GEMINI_ASSISTANT_MODEL || 'gemini-2.5-flash-preview-04-17'}`);

// Debug endpoint to check environment configuration
app.get('/api/debug/env', (req, res) => {
  res.json({
    nodeEnv: process.env.NODE_ENV,
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
    geminiKeyLength: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0,
    geminiModel: process.env.GEMINI_ASSISTANT_MODEL || 'gemini-pro',
    timestamp: new Date().toISOString(),
    firebaseInitialized: !!firebaseAdmin
  });
});

// Configure rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', apiLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static graph files as fallback when Firebase Storage is unavailable
app.use('/api/static', express.static(path.join(__dirname, 'static')));

// API Routes - MUST come before React catch-all route
app.use('/api', quizAnalysisRouter);
app.use('/api', conceptDrillsRouter);
app.use('/api/assistant', assistantRouter);
app.use('/api/bank', bankRouter);
app.use('/api/concepts', conceptsRouter);
app.use('/api/concepts', conceptDetailRouter);
app.use('/api/questions', questionsRouter);

// Serve React build files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../build')));
  
  // Handle React routing - send all non-API requests to React app
  // This MUST come after API routes to avoid intercepting API calls
  app.get('*', (req, res) => {
    // Don't interfere with API routes
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ error: 'API endpoint not found' });
    }
    res.sendFile(path.join(__dirname, '../build/index.html'));
  });
}

// Conditionally register graph generation routes
if (hasGraphGeneration && graphGenerationPlotlyRouter) {
  app.use('/api', graphGenerationPlotlyRouter);
  console.log('📊 Graph generation API endpoints registered (Plotly + Puppeteer)');
} else {
  // Add fallback routes for disabled graph generation features
  app.post('/api/generate-graph', (req, res) => {
    res.status(503).json({ 
      success: false,
      error: 'Graph generation feature is disabled in this environment',
      reason: 'Missing required dependencies or environment variables',
      suggestion: 'Set ENABLE_GRAPH_GENERATION=true and required API keys to enable this feature'
    });
  });
  
  app.post('/api/generate-graph-plotly', (req, res) => {
    res.status(503).json({ 
      success: false,
      error: 'Graph generation feature is disabled in this environment',
      reason: 'Missing required dependencies or environment variables',
      suggestion: 'Set ENABLE_GRAPH_GENERATION=true and required API keys to enable this feature'
    });
  });
  
  app.get('/api/check-python', (req, res) => {
    res.status(503).json({ 
      available: false,
      error: 'Graph generation feature is disabled',
      requirements: 'Set ENABLE_GRAPH_GENERATION=true to enable'
    });
  });
  
  app.get('/api/check-plotly-environment', (req, res) => {
    res.status(503).json({ 
      available: false,
      error: 'Graph generation feature is disabled',
      requirements: 'Set ENABLE_GRAPH_GENERATION=true to enable'
    });
  });
  
  console.log('📊 Graph generation API endpoints disabled - fallback routes registered');
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at: http://localhost:${PORT}/api`);
  console.log('Use npm run dev to run both frontend and API servers concurrently');
});

// Export the app for backward compatibility
module.exports = app;
// Also export the admin instance for those who need it
module.exports.firebaseAdmin = firebaseAdmin;
