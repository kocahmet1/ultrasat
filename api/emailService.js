/**
 * Email Service using SendGrid
 * Handles sending verification and password reset emails
 */

const sgMail = require('@sendgrid/mail');

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  console.log('✅ SendGrid initialized');
} else {
  console.warn('⚠️ SENDGRID_API_KEY not set - email functionality disabled');
}

/**
 * Send verification email
 * @param {string} email - Recipient email
 * @param {string} name - Recipient name
 * @param {string} verificationLink - Firebase verification link
 */
async function sendVerificationEmail(email, name, verificationLink) {
  if (!process.env.SENDGRID_API_KEY) {
    console.error('SendGrid not configured');
    return { success: false, error: 'Email service not configured' };
  }

  const msg = {
    to: email,
    from: {
      email: process.env.SENDGRID_VERIFIED_SENDER || 'noreply@yourdomain.com',
      name: 'UltraSAT'
    },
    subject: 'Verify your UltraSAT account',
    trackingSettings: {
      clickTracking: {
        enable: false,
        enableText: false
      },
      openTracking: {
        enable: true
      }
    },
    text: `Hi ${name},\n\nWelcome to UltraSAT! Please verify your email address by clicking the link below:\n\n${verificationLink}\n\nThis link will expire in 24 hours.\n\nIf you didn't create an account, you can safely ignore this email.\n\nBest regards,\nThe UltraSAT Team`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f4;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f4f4; padding: 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); max-width: 100%;">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold; letter-spacing: 2px;">UltraSAT</h1>
                      <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Your SAT Prep Partner</p>
                    </td>
                  </tr>
                  <!-- Body -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px; font-weight: 600;">Hi ${name}! 👋</h2>
                      <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                        Welcome to <strong>UltraSAT</strong>! We're excited to have you on board. To get started, please verify your email address by clicking the button below:
                      </p>
                      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 30px 0;">
                        <tr>
                          <td align="center">
                            <a href="${verificationLink}" 
                               style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);">
                              Verify Email Address
                            </a>
                          </td>
                        </tr>
                      </table>
                      <div style="margin: 30px 0; padding: 20px; background-color: #f8f9fa; border-left: 4px solid #667eea; border-radius: 4px;">
                        <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px; line-height: 1.6;">
                          <strong>Button not working?</strong> Copy and paste this link into your browser:
                        </p>
                        <p style="margin: 0; font-size: 13px; word-break: break-all;">
                          <a href="${verificationLink}" style="color: #667eea;">${verificationLink}</a>
                        </p>
                      </div>
                      <p style="margin: 20px 0 0 0; color: #999999; font-size: 14px; line-height: 1.6;">
                        ⏱️ This link will expire in <strong>24 hours</strong>.
                      </p>
                    </td>
                  </tr>
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px; background-color: #f9f9f9; text-align: center; border-top: 1px solid #eeeeee;">
                      <p style="margin: 0 0 10px 0; color: #999999; font-size: 14px;">
                        If you didn't create an account, you can safely ignore this email.
                      </p>
                      <p style="margin: 0; color: #999999; font-size: 14px;">
                        © ${new Date().getFullYear()} UltraSAT. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `
  };

  try {
    await sgMail.send(msg);
    console.log(`✅ Verification email sent to ${email}`);
    return { success: true };
  } catch (error) {
    console.error('❌ SendGrid error:', error);
    if (error.response) {
      console.error('Error details:', error.response.body);
    }
    return { success: false, error: error.message };
  }
}

/**
 * Send password reset email
 * @param {string} email - Recipient email
 * @param {string} resetLink - Firebase password reset link
 */
async function sendPasswordResetEmail(email, resetLink) {
  if (!process.env.SENDGRID_API_KEY) {
    console.error('SendGrid not configured');
    return { success: false, error: 'Email service not configured' };
  }

  const msg = {
    to: email,
    from: {
      email: process.env.SENDGRID_VERIFIED_SENDER || 'noreply@yourdomain.com',
      name: 'UltraSAT'
    },
    subject: 'Reset your UltraSAT password',
    trackingSettings: {
      clickTracking: {
        enable: false,
        enableText: false
      },
      openTracking: {
        enable: true
      }
    },
    text: `You requested to reset your password.\n\nClick the link below to set a new password:\n\n${resetLink}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this, you can safely ignore this email.\n\nBest regards,\nThe UltraSAT Team`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f4;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f4f4; padding: 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); max-width: 100%;">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold; letter-spacing: 2px;">UltraSAT</h1>
                      <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Your SAT Prep Partner</p>
                    </td>
                  </tr>
                  <!-- Body -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px; font-weight: 600;">Reset Your Password</h2>
                      <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                        We received a request to reset your password. Click the button below to set a new password:
                      </p>
                      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 30px 0;">
                        <tr>
                          <td align="center">
                            <a href="${resetLink}" 
                               style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);">
                              Reset Password
                            </a>
                          </td>
                        </tr>
                      </table>
                      <div style="margin: 30px 0; padding: 20px; background-color: #f8f9fa; border-left: 4px solid #667eea; border-radius: 4px;">
                        <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px; line-height: 1.6;">
                          <strong>Button not working?</strong> Copy and paste this link into your browser:
                        </p>
                        <p style="margin: 0; font-size: 13px; word-break: break-all;">
                          <a href="${resetLink}" style="color: #667eea;">${resetLink}</a>
                        </p>
                      </div>
                      <p style="margin: 20px 0 0 0; color: #999999; font-size: 14px; line-height: 1.6;">
                        ⏱️ This link will expire in <strong>1 hour</strong>.
                      </p>
                      <div style="margin-top: 30px; padding: 15px; background-color: #fff3cd; border-radius: 4px; border-left: 4px solid #ffc107;">
                        <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.6;">
                          <strong>⚠️ Security Notice:</strong> If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
                        </p>
                      </div>
                    </td>
                  </tr>
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px; background-color: #f9f9f9; text-align: center; border-top: 1px solid #eeeeee;">
                      <p style="margin: 0 0 10px 0; color: #999999; font-size: 14px;">
                        Need help? Contact us at support@ultrasat.com
                      </p>
                      <p style="margin: 0; color: #999999; font-size: 14px;">
                        © ${new Date().getFullYear()} UltraSAT. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `
  };

  try {
    await sgMail.send(msg);
    console.log(`✅ Password reset email sent to ${email}`);
    return { success: true };
  } catch (error) {
    console.error('❌ SendGrid error:', error);
    if (error.response) {
      console.error('Error details:', error.response.body);
    }
    return { success: false, error: error.message };
  }
}

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail
};

