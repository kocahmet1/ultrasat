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
const stripeRouter = require('./stripeRoutes');
const blogRouter = require('./blogRoutes');
const reportRouter = require('./reportRoutes');
const questionQualityRouter = require('./questionQualityRoutes');
const emailRouter = require('./emailRoutes');
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
    ? ['https://ultrasatprep.com', 'https://veritas-blue.netlify.app', 'https://veritas-blue-web.onrender.com'] 
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
app.use('/api/stripe', attachFirebaseAdmin, stripeRouter);
app.use('/api/blog', blogRouter);
app.use('/api/reports', attachFirebaseAdmin, reportRouter);
app.use('/api/question-quality', attachFirebaseAdmin, questionQualityRouter);
app.use('/api/email', attachFirebaseAdmin, emailRouter);

// Help/FAQ endpoint
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
            answer: 'Upgrading to Pro unlocks a variety of premium features, including: unlimited practice exams, detailed progress analytics, full access to our suite of study tools, and priority email support. The specific features depend on the selected Pro tier (Plus or Max).'
          },
          {
            question: 'How do I upgrade my account to Pro?',
            answer: 'You can upgrade to a Pro membership at any time from your profile page. Navigate to your profile, and you will see the available membership tiers. From there, you can select the plan that best fits your needs and proceed with the upgrade.'
          },
          {
            question: 'Where can I manage my profile and account settings?',
            answer: 'Your profile and account settings can be managed from the profile page. You can access this by clicking on your profile icon in the top navigation bar. From there, you can view your stats, manage your membership, and log out.'
          }
        ],
      },
    ],
  });
});

// Dynamic sitemap generation
app.get('/sitemap.xml', async (req, res) => {
  try {
    res.set('Content-Type', 'application/xml');
    
    // Base sitemap content
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

    // Fetch blog posts and add them to sitemap
    try {
      if (firebaseAdmin) {
        const db = firebaseAdmin.firestore();
        const blogQuery = db.collection('blogPosts')
          .where('status', '==', 'published')
          .orderBy('createdAt', 'desc')
          .limit(100); // Reasonable limit for sitemap
        
        const snapshot = await blogQuery.get();
        
        console.log(`Found ${snapshot.docs.length} published blog posts for sitemap`);
        
        snapshot.docs.forEach(doc => {
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
      console.error('Error fetching blog posts for sitemap:', error);
      // Continue without blog posts if there's an error
    }

    // Add remaining static pages
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

  <!-- Main Dashboard & Profile -->
  <url>
    <loc>https://ultrasatprep.com/dashboard</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>
  
  <url>
    <loc>https://ultrasatprep.com/profile</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>
  
  <url>
    <loc>https://ultrasatprep.com/progress</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>

  <!-- Learning & Study Pages -->
  <url>
    <loc>https://ultrasatprep.com/skills</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>
  
  <url>
    <loc>https://ultrasatprep.com/study-resources</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>
  
  <url>
    <loc>https://ultrasatprep.com/lectures</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>
  
  <url>
    <loc>https://ultrasatprep.com/concept-bank</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>
  
  <url>
    <loc>https://ultrasatprep.com/word-bank</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>
  
  <url>
    <loc>https://ultrasatprep.com/flashcards</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>

  <!-- Quiz & Exam Pages -->
  <url>
    <loc>https://ultrasatprep.com/smart-quiz-generator</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>
  
  <url>
    <loc>https://ultrasatprep.com/smart-quiz-intro</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>
  
  <url>
    <loc>https://ultrasatprep.com/subject-quizzes</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>
  
  <url>
    <loc>https://ultrasatprep.com/practice-exams</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>
  
  <url>
    <loc>https://ultrasatprep.com/exam/landing</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>
  
  <url>
    <loc>https://ultrasatprep.com/all-results</loc>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>

  <!-- Membership & Payment Pages -->
  <url>
    <loc>https://ultrasatprep.com/membership/upgrade</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>
  
  <url>
    <loc>https://ultrasatprep.com/payment/success</loc>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>
  
  <url>
    <loc>https://ultrasatprep.com/payment/cancel</loc>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>

  <!-- Admin Pages (Lower priority as they're restricted) -->
  <url>
    <loc>https://ultrasatprep.com/admin</loc>
    <changefreq>monthly</changefreq>
    <priority>0.4</priority>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>
  
  <url>
    <loc>https://ultrasatprep.com/admin/ai-content</loc>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>
  
  <url>
    <loc>https://ultrasatprep.com/admin/practice-exams</loc>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>
  
  <url>
    <loc>https://ultrasatprep.com/admin/question-editor</loc>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>
  
  <url>
    <loc>https://ultrasatprep.com/admin/subcategory-settings</loc>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>
  
  <url>
    <loc>https://ultrasatprep.com/admin/concept-import</loc>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>
  
  <url>
    <loc>https://ultrasatprep.com/admin/question-import</loc>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>
  
  <url>
    <loc>https://ultrasatprep.com/admin/graph-generation</loc>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>
  
  <url>
    <loc>https://ultrasatprep.com/admin/graph-descriptions</loc>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>
  
  <url>
    <loc>https://ultrasatprep.com/admin/learning-content</loc>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>
  
  <url>
    <loc>https://ultrasatprep.com/admin/blog-management</loc>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>
  
  <url>
    <loc>https://ultrasatprep.com/admin/membership-management</loc>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>
</urlset>`;

    res.send(sitemap);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
});

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
