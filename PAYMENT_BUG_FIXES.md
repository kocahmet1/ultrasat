# Payment and Dashboard Bug Fixes

## Issues Identified

### 1. Dashboard Crash: "m.reduce is not a function"
**Location:** `src/pages/Dashboard.jsx` lines 172 and 177

**Root Cause:** 
The code was calling `.reduce()` on filtered arrays without proper defensive checks. For new users without any practice data, `subcategoryStats` could be empty or improperly structured, causing the `.filter().reduce()` chain to fail.

**Fix Applied:**
- Added defensive checks using `Array.isArray()` to ensure `subcategoryStats` is a valid array
- Added checks for empty filtered arrays before calling `.reduce()`
- Wrapped logic in IIFEs (Immediately Invoked Function Expressions) for cleaner error handling
- Added fallback to return 0 if no data is available

**Code Changes:**
```javascript
// Before:
<p className="accuracy-value">
  {Math.round(subcategoryStats.filter(stat => ['reading', 'writing'].includes(stat.section))
    .reduce((sum, stat) => sum + stat.accuracyRate, 0) / 
    subcategoryStats.filter(stat => ['reading', 'writing'].includes(stat.section)).length || 0)}%
</p>

// After:
<p className="accuracy-value">{(() => {
  if (!Array.isArray(subcategoryStats) || subcategoryStats.length === 0) return 0;
  const filtered = subcategoryStats.filter(stat => ['reading', 'writing'].includes(stat.section));
  if (filtered.length === 0) return 0;
  return Math.round(filtered.reduce((sum, stat) => sum + (stat.accuracyRate || 0), 0) / filtered.length);
})()}%</p>
```

### 2. Membership Not Applied After Payment
**Location:** `api/stripeRoutes.js` line 309

**Root Cause:**
The webhook handler was using `userRef.update()` which fails if the user document doesn't exist in Firestore. For new trial users who just signed up, the user document might not be fully initialized yet.

**Fix Applied:**
- Changed from `userRef.update()` to `userRef.set(updateData, { merge: true })`
- This ensures the operation works for both new and existing user documents
- Added error re-throwing to ensure webhook handler is aware of failures

**Code Changes:**
```javascript
// Before:
await userRef.update(updateData);

// After:
await userRef.set(updateData, { merge: true });
```

### 3. Race Condition: UI Updates Before Webhook Completes
**Location:** `src/pages/PaymentSuccess.jsx`

**Root Cause:**
When users were redirected to the success page, the component immediately tried to refresh membership data. However, Stripe webhooks are processed asynchronously, so the membership might not be updated in Firebase yet.

**Fix Applied:**
- Added `waitForMembershipUpdate()` function with exponential backoff retry logic
- Polls the membership status up to 10 times with increasing delays (1s, 1.5s, 2.25s, etc.)
- Added `membershipUpdated` state to track when the membership is confirmed
- Shows "Setting up your account..." loading screen while waiting for webhook to complete
- After max retries, allows user to continue anyway (payment was successful)

**Code Changes:**
```javascript
// Added retry logic with exponential backoff
const waitForMembershipUpdate = async (expectedTier, maxRetries = 10) => {
  let retries = 0;
  const initialDelay = 1000; // Start with 1 second
  
  while (retries < maxRetries) {
    try {
      const membership = await getUserMembership(currentUser);
      
      if (membership && membership.tier === expectedTier) {
        setMembershipUpdated(true);
        return;
      }
      
      // Wait before next retry with exponential backoff
      const delay = initialDelay * Math.pow(1.5, retries);
      await new Promise(resolve => setTimeout(resolve, delay));
      retries++;
    } catch (err) {
      console.error('Error checking membership status:', err);
      retries++;
    }
  }
  
  // If we've exhausted retries, still mark as updated
  setMembershipUpdated(true);
};
```

## Testing Recommendations

### 1. Test with New User Account
1. Create a brand new user account (no previous data)
2. Purchase an upgrade (use Stripe test mode)
3. Verify the success page shows without errors
4. Verify the "Start Using Premium Features" button works
5. Verify the Dashboard loads without the `.reduce()` error
6. Verify the membership tier is properly applied

### 2. Test Dashboard with Empty Data
1. Create a user with no practice history
2. Navigate to `/dashboard`
3. Verify Reading/Writing and Math accuracy cards show "0%" instead of crashing
4. Verify all sections handle empty data gracefully

### 3. Test Webhook Processing
1. Use Stripe CLI to test webhook locally: `stripe listen --forward-to localhost:5000/api/stripe/webhook`
2. Trigger a test payment
3. Verify webhook receives `checkout.session.completed` event
4. Verify user document in Firestore is updated with correct membership tier
5. Check server logs for any errors

### 4. Monitor Production Webhooks
- Enable webhook logging in Stripe Dashboard
- Monitor for failed webhook deliveries
- Check Firebase logs for any database update errors

## Environment Variables Required

Ensure these are set in your `.env` file:
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
CLIENT_URL=http://localhost:3000 (or production URL)
```

## Stripe Webhook Configuration

1. Go to Stripe Dashboard > Developers > Webhooks
2. Add endpoint: `https://your-domain.com/api/stripe/webhook`
3. Subscribe to these events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`

## Notes

- The retry logic in `PaymentSuccess.jsx` will wait up to ~30 seconds total before timing out
- Users with slow webhook processing will see a "Setting up your account..." message
- The Dashboard now gracefully handles users with no practice data
- All changes are backward compatible with existing users

## Files Modified

1. `src/pages/Dashboard.jsx` - Fixed `.reduce()` error with defensive checks
2. `api/stripeRoutes.js` - Fixed membership update to use `set()` with merge
3. `src/pages/PaymentSuccess.jsx` - Added retry logic for membership verification

