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
const questionsRouter = require('./questionsAPI');
const graphGenerationRouter = require('./graphGeneration');
const graphGenerationPlotlyRouter = require('./graphGenerationPlotly');

// Initialize Firebase Admin SDK
// For local development, use the service account key file
// For production (Render.com), use environment variables
let firebaseAdmin;
try {
  const serviceAccountPath = path.resolve(__dirname, '../ultrasat-5e4c4-369f564bdaef.json');
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountPath),
    databaseURL: 'https://ultrasat-5e4c4.firebaseio.com',
    storageBucket: 'ultrasat-5e4c4.firebasestorage.app'
  });
  
  firebaseAdmin = admin;
  console.log('Firebase Admin SDK initialized successfully');
} catch (error) {
  console.warn('Firebase Admin initialization error:', error);
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
// Always use port 3001 for API to avoid conflict with React's default port 3000
const PORT = 3001;

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

// API Routes
app.use('/api', quizAnalysisRouter);
app.use('/api', conceptDrillsRouter);
app.use('/api/assistant', assistantRouter);
app.use('/api/bank', bankRouter);
app.use('/api/concepts', conceptsRouter);
app.use('/api/questions', questionsRouter);
app.use('/api', graphGenerationRouter);
app.use('/api', graphGenerationPlotlyRouter);

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
