# Email Deliverability Setup Guide

## Problem Statement

Firebase Authentication's default verification emails are being sent from `noreply@ultrasat-5e4c4.firebaseapp.com`, which causes them to land in spam folders because:

1. **Shared Domain Reputation**: The `firebaseapp.com` domain is shared by millions of Firebase projects
2. **No Email Authentication**: Missing SPF, DKIM, and DMARC records
3. **Generic Sender**: Automated appearance triggers spam filters
4. **Limited Customization**: Cannot customize email design/branding

## Solution: Custom Email Service with SendGrid

This guide shows how to implement a custom email service using SendGrid (free tier: 100 emails/day).

---

## Step 1: Set Up SendGrid Account

1. Sign up at [SendGrid](https://sendgrid.com/) (free tier available)
2. Verify your sender identity:
   - **Option A**: Single Sender Verification (quick, for testing)
   - **Option B**: Domain Authentication (recommended for production)

3. Create an API Key:
   - Go to Settings → API Keys → Create API Key
   - Choose "Restricted Access" and enable "Mail Send" permission
   - Copy the API key (you won't see it again!)

---

## Step 2: Configure Domain Authentication (Recommended)

### A. Add DNS Records

1. In SendGrid, go to Settings → Sender Authentication → Authenticate Your Domain
2. Follow the wizard to get your DNS records
3. Add these records to your domain's DNS settings:

```
Type: CNAME | Host: s1._domainkey | Value: s1.domainkey.u12345.wl.sendgrid.net
Type: CNAME | Host: s2._domainkey | Value: s2.domainkey.u12345.wl.sendgrid.net
Type: CNAME | Host: em1234     | Value: u12345.wl.sendgrid.net
```

4. Wait for DNS propagation (5 mins - 48 hours)
5. Verify in SendGrid dashboard

### B. Verify Email Deliverability

Once DNS is configured, SendGrid will automatically set up:
- **SPF** (Sender Policy Framework): Authorizes SendGrid to send emails from your domain
- **DKIM** (DomainKeys Identified Mail): Cryptographically signs your emails
- **DMARC** (Domain-based Message Authentication): Tells email providers how to handle authentication failures

---

## Step 3: Install Dependencies

```bash
npm install @sendgrid/mail
```

Add to your `package.json`:
```json
{
  "dependencies": {
    "@sendgrid/mail": "^7.7.0"
  }
}
```

---

## Step 4: Create Email Service

Create `api/emailService.js`:

```javascript
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
    text: `Hi ${name},\n\nPlease verify your email address by clicking the link below:\n\n${verificationLink}\n\nThis link will expire in 24 hours.\n\nIf you didn't create an account, you can safely ignore this email.\n\nBest regards,\nThe UltraSAT Team`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f4f4; padding: 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">UltraSAT</h1>
                    </td>
                  </tr>
                  <!-- Body -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px;">Hi ${name}! 👋</h2>
                      <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                        Welcome to UltraSAT! We're excited to have you on board. To get started, please verify your email address by clicking the button below:
                      </p>
                      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 30px 0;">
                        <tr>
                          <td align="center">
                            <a href="${verificationLink}" 
                               style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                              Verify Email Address
                            </a>
                          </td>
                        </tr>
                      </table>
                      <p style="margin: 20px 0 0 0; color: #999999; font-size: 14px; line-height: 1.6;">
                        If the button doesn't work, copy and paste this link into your browser:<br>
                        <a href="${verificationLink}" style="color: #667eea; word-break: break-all;">${verificationLink}</a>
                      </p>
                      <p style="margin: 20px 0 0 0; color: #999999; font-size: 14px; line-height: 1.6;">
                        This link will expire in 24 hours.
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
    text: `You requested to reset your password.\n\nClick the link below to set a new password:\n\n${resetLink}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this, you can safely ignore this email.\n\nBest regards,\nThe UltraSAT Team`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f4f4; padding: 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">
                  <tr>
                    <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px;">UltraSAT</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px;">Reset Your Password</h2>
                      <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                        We received a request to reset your password. Click the button below to set a new password:
                      </p>
                      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 30px 0;">
                        <tr>
                          <td align="center">
                            <a href="${resetLink}" 
                               style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                              Reset Password
                            </a>
                          </td>
                        </tr>
                      </table>
                      <p style="margin: 20px 0 0 0; color: #999999; font-size: 14px;">
                        This link will expire in 1 hour.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 30px; background-color: #f9f9f9; text-align: center; border-top: 1px solid #eeeeee;">
                      <p style="margin: 0; color: #999999; font-size: 14px;">
                        If you didn't request this, please ignore this email.
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
    return { success: false, error: error.message };
  }
}

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail
};
```

---

## Step 5: Create Backend API Endpoint

Add to `api/server.js`:

```javascript
const emailService = require('./emailService');

// Email verification endpoint
app.post('/api/send-verification-email', async (req, res) => {
  try {
    const { email, name, verificationLink } = req.body;

    if (!email || !name || !verificationLink) {
      return res.status(400).json({ 
        error: 'Missing required fields: email, name, verificationLink' 
      });
    }

    const result = await emailService.sendVerificationEmail(email, name, verificationLink);

    if (result.success) {
      res.json({ success: true, message: 'Verification email sent' });
    } else {
      res.status(500).json({ 
        error: 'Failed to send email', 
        details: result.error 
      });
    }
  } catch (error) {
    console.error('Error in send-verification-email endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Password reset endpoint
app.post('/api/send-password-reset-email', async (req, res) => {
  try {
    const { email, resetLink } = req.body;

    if (!email || !resetLink) {
      return res.status(400).json({ 
        error: 'Missing required fields: email, resetLink' 
      });
    }

    const result = await emailService.sendPasswordResetEmail(email, resetLink);

    if (result.success) {
      res.json({ success: true, message: 'Password reset email sent' });
    } else {
      res.status(500).json({ 
        error: 'Failed to send email', 
        details: result.error 
      });
    }
  } catch (error) {
    console.error('Error in send-password-reset-email endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

---

## Step 6: Update Frontend to Use Custom Emails

Update `src/contexts/AuthContext.jsx`:

```javascript
import { createUserWithEmailAndPassword } from 'firebase/auth';

async function signup(email, password, name) {
  try {
    setError('');
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    await updateProfile(userCredential.user, {
      displayName: name
    });
    
    // Create user document...
    await setDoc(doc(db, "users", userCredential.user.uid), {
      name, email,
      createdAt: new Date().toISOString(),
      membershipTier: 'free',
      // ... other fields
    });
    
    // Generate Firebase verification link
    try {
      // Get the verification link from Firebase
      const actionCodeSettings = {
        url: `${window.location.origin}/verify-email`,
        handleCodeInApp: false
      };
      
      // Send custom email via backend
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
      const response = await fetch(`${API_URL}/send-verification-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userCredential.user.email,
          name: name,
          verificationLink: `https://ultrasat-5e4c4.firebaseapp.com/__/auth/action?mode=verifyEmail&oobCode=${userCredential.user.uid}`
          // Note: You'll need to generate proper Firebase action links using Admin SDK
        })
      });
      
      if (response.ok) {
        console.log('Custom verification email sent');
      } else {
        // Fallback to Firebase default
        await sendEmailVerification(userCredential.user, actionCodeSettings);
      }
    } catch (emailErr) {
      console.error('Failed to send verification email:', emailErr);
    }
    
    return userCredential.user;
  } catch (err) {
    setError(err.message);
    throw err;
  }
}
```

**Important**: For proper Firebase action links, you need to use Firebase Admin SDK to generate them:

```javascript
// In your backend (api/server.js or api/emailService.js)
const admin = require('firebase-admin');

async function generateVerificationLink(email) {
  try {
    const link = await admin.auth().generateEmailVerificationLink(email, {
      url: `${process.env.FRONTEND_URL}/verify-email`,
      handleCodeInApp: false
    });
    return link;
  } catch (error) {
    console.error('Error generating verification link:', error);
    throw error;
  }
}
```

---

## Step 7: Environment Variables

Add to `.env` and `env.example`:

```env
# SendGrid Configuration
SENDGRID_API_KEY=SG.your_api_key_here
SENDGRID_VERIFIED_SENDER=noreply@yourdomain.com

# Frontend URL (for email links)
FRONTEND_URL=https://yourdomain.com
```

For production (Render.com), add these in the dashboard:
- `SENDGRID_API_KEY`
- `SENDGRID_VERIFIED_SENDER`
- `FRONTEND_URL`

---

## Step 8: Testing

### Local Testing

1. Start backend: `npm start` (in `api/` directory)
2. Test endpoint with curl:

```bash
curl -X POST http://localhost:5001/api/send-verification-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "verificationLink": "https://yourapp.com/verify?code=123"
  }'
```

### Production Testing

1. Sign up with a real email address
2. Check inbox (should no longer be in spam)
3. Monitor SendGrid dashboard for deliverability stats

---

## Alternative Solutions

### Option 2: Use Firebase Custom SMTP (More Complex)

Firebase allows custom SMTP configuration, but it requires Firebase Blaze plan and is more complex to set up.

### Option 3: Use Other Email Services

- **AWS SES**: Very cheap for high volume, requires AWS account
- **Mailgun**: Similar to SendGrid, 100 emails/day free
- **Postmark**: Excellent deliverability, $10/month minimum
- **Resend**: Developer-friendly, modern API

---

## Monitoring & Maintenance

### SendGrid Dashboard

Monitor these metrics:
- **Delivered**: Emails successfully delivered
- **Bounced**: Invalid email addresses
- **Spam Reports**: Users marking as spam
- **Opens/Clicks**: Engagement metrics

### Best Practices

1. **Keep bounce rate low** (< 5%): Validate emails before sending
2. **Monitor spam complaints** (< 0.1%): Ensure emails are expected
3. **Regular testing**: Test emails in Gmail, Outlook, Yahoo
4. **Update templates**: Keep branding consistent and professional
5. **Set up alerts**: Get notified of delivery issues

---

## Troubleshooting

### Emails Still Going to Spam

1. **Verify DNS records**: Check SPF, DKIM, DMARC setup
2. **Warm up your domain**: Send gradually increasing volumes
3. **Test with Mail-Tester**: https://www.mail-tester.com/
4. **Check sender reputation**: https://senderscore.org/

### SendGrid API Errors

- **403 Forbidden**: Check API key permissions
- **401 Unauthorized**: Regenerate API key
- **550 Bounce**: Invalid recipient email

---

## Cost Comparison

| Service | Free Tier | Paid Tier |
|---------|-----------|-----------|
| SendGrid | 100 emails/day | $19.95/month (40k emails) |
| Mailgun | 100 emails/day | $35/month (50k emails) |
| AWS SES | 62,000 emails/month (free with EC2) | $0.10 per 1,000 emails |
| Postmark | 100 emails/month trial | $10/month (10k emails) |

For your use case (user verifications), SendGrid free tier should be sufficient unless you get >100 signups/day.

---

## Implementation Checklist

- [ ] Create SendGrid account
- [ ] Set up domain authentication (DNS records)
- [ ] Generate API key
- [ ] Install `@sendgrid/mail` package
- [ ] Create `api/emailService.js`
- [ ] Add backend endpoints in `api/server.js`
- [ ] Update `src/contexts/AuthContext.jsx`
- [ ] Add environment variables
- [ ] Test locally
- [ ] Deploy to production
- [ ] Test with real email
- [ ] Monitor deliverability in SendGrid dashboard

---

## Need Help?

- SendGrid Documentation: https://docs.sendgrid.com/
- Firebase Email Action Handlers: https://firebase.google.com/docs/auth/custom-email-handler
- Email Deliverability Guide: https://sendgrid.com/resource/email-deliverability/

---

**Next Steps**: Follow this guide step-by-step, and your verification emails will have professional branding and excellent deliverability!

