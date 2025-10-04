/**
 * Email Routes
 * Handles email sending endpoints for verification and password reset
 */

const express = require('express');
const router = express.Router();
const emailService = require('./emailService');

/**
 * Generate email verification link using Firebase Admin
 * @param {object} admin - Firebase Admin instance
 * @param {string} email - User email
 * @returns {Promise<string>} Verification link
 */
async function generateVerificationLink(admin, email) {
  try {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const link = await admin.auth().generateEmailVerificationLink(email, {
      url: `${frontendUrl}/verify-email`,
      handleCodeInApp: false
    });
    return link;
  } catch (error) {
    console.error('Error generating verification link:', error);
    throw error;
  }
}

/**
 * Generate password reset link using Firebase Admin
 * @param {object} admin - Firebase Admin instance
 * @param {string} email - User email
 * @returns {Promise<string>} Password reset link
 */
async function generatePasswordResetLink(admin, email) {
  try {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const link = await admin.auth().generatePasswordResetLink(email, {
      url: `${frontendUrl}/login`,
      handleCodeInApp: false
    });
    return link;
  } catch (error) {
    console.error('Error generating password reset link:', error);
    throw error;
  }
}

/**
 * POST /api/email/send-verification
 * Send verification email to user
 */
router.post('/send-verification', async (req, res) => {
  try {
    const { email, name } = req.body;

    // Validate input
    if (!email || !name) {
      return res.status(400).json({ 
        error: 'Missing required fields: email, name' 
      });
    }

    // Check if Firebase Admin is available
    if (!req.admin) {
      return res.status(500).json({ 
        error: 'Email service not available - Firebase Admin not initialized' 
      });
    }

    // Generate Firebase verification link
    const verificationLink = await generateVerificationLink(req.admin, email);

    // Send email via SendGrid
    const result = await emailService.sendVerificationEmail(email, name, verificationLink);

    if (result.success) {
      res.json({ 
        success: true, 
        message: 'Verification email sent successfully' 
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to send email', 
        details: result.error 
      });
    }
  } catch (error) {
    console.error('Error in send-verification endpoint:', error);
    
    // Handle specific Firebase errors
    if (error.code === 'auth/user-not-found') {
      return res.status(404).json({ error: 'User not found' });
    }
    if (error.code === 'auth/invalid-email') {
      return res.status(400).json({ error: 'Invalid email address' });
    }
    
    res.status(500).json({ 
      error: 'Failed to send verification email',
      details: error.message 
    });
  }
});

/**
 * POST /api/email/send-password-reset
 * Send password reset email to user
 */
router.post('/send-password-reset', async (req, res) => {
  try {
    const { email } = req.body;

    // Validate input
    if (!email) {
      return res.status(400).json({ 
        error: 'Missing required field: email' 
      });
    }

    // Check if Firebase Admin is available
    if (!req.admin) {
      return res.status(500).json({ 
        error: 'Email service not available - Firebase Admin not initialized' 
      });
    }

    // Generate Firebase password reset link
    const resetLink = await generatePasswordResetLink(req.admin, email);

    // Send email via SendGrid
    const result = await emailService.sendPasswordResetEmail(email, resetLink);

    if (result.success) {
      res.json({ 
        success: true, 
        message: 'Password reset email sent successfully' 
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to send email', 
        details: result.error 
      });
    }
  } catch (error) {
    console.error('Error in send-password-reset endpoint:', error);
    
    // Handle specific Firebase errors
    if (error.code === 'auth/user-not-found') {
      return res.status(404).json({ error: 'User not found' });
    }
    if (error.code === 'auth/invalid-email') {
      return res.status(400).json({ error: 'Invalid email address' });
    }
    
    res.status(500).json({ 
      error: 'Failed to send password reset email',
      details: error.message 
    });
  }
});

/**
 * POST /api/email/test
 * Test endpoint to verify email service is working
 */
router.post('/test', async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email || !name) {
      return res.status(400).json({ 
        error: 'Missing required fields: email, name' 
      });
    }

    // Send a test email with a dummy link
    const testLink = 'https://example.com/test-verification-link';
    const result = await emailService.sendVerificationEmail(email, name, testLink);

    if (result.success) {
      res.json({ 
        success: true, 
        message: 'Test email sent successfully',
        note: 'This was a test email with a non-functional link'
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to send test email', 
        details: result.error 
      });
    }
  } catch (error) {
    console.error('Error in test endpoint:', error);
    res.status(500).json({ 
      error: 'Failed to send test email',
      details: error.message 
    });
  }
});

module.exports = router;

