/**
 * Graph Generation API - DISABLED
 * This module is disabled for lightweight deployment
 */

const express = require('express');
const router = express.Router();

// Simple authentication middleware
const authenticateUser = async (req, res, next) => {
  // For disabled endpoints, just return early
  next();
};

/**
 * All graph generation endpoints are disabled
 */
const disabledResponse = {
  success: false,
  disabled: true,
  message: 'Graph generation is disabled in this deployment version',
  error: 'Feature not available - contact administrator if needed'
};

// Disable all graph generation endpoints
router.post('/generate-graph', authenticateUser, (req, res) => {
  res.status(503).json(disabledResponse);
});

router.post('/generate-graph-plotly', authenticateUser, (req, res) => {
  res.status(503).json(disabledResponse);
});

router.get('/check-python', authenticateUser, (req, res) => {
  res.json({
    ...disabledResponse,
    pythonInstalled: false,
    available: false
  });
});

router.get('/check-plotly-environment', authenticateUser, (req, res) => {
  res.json({
    ...disabledResponse,
    plotlyReady: false,
    available: false
  });
});

module.exports = router; 