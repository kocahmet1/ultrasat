# Coupon System Guide

## Overview

The coupon system allows administrators to create and manage discount codes that users can apply during the membership upgrade process. Coupons can be configured with various discount types, expiration dates, usage limits, and tier/billing restrictions.

## Features

- **Admin Panel**: Full CRUD interface for managing coupons
- **Flexible Discounts**: Percentage-based or fixed amount discounts
- **Usage Tracking**: Monitor how many times each coupon has been used
- **Expiration Dates**: Set optional expiration dates for time-limited promotions
- **Usage Limits**: Limit the total number of times a coupon can be used
- **Tier-Specific**: Apply coupons only to specific membership tiers (Plus/Max)
- **Billing-Specific**: Apply coupons only to monthly or yearly billing cycles
- **Real-time Validation**: Users see discounted prices before checkout

## Admin Panel Access

### Accessing Coupon Management

1. Log in as an admin
2. Navigate to `/admin/coupon-management` or click "Coupon Management" in the Admin Dashboard
3. The coupon management interface will display all existing coupons

### Creating a Coupon

1. Click the **"Create New Coupon"** button
2. Fill in the required fields:
   - **Coupon Code** (required): A unique code users will enter (automatically converted to uppercase)
   - **Description** (optional): Internal description for admin reference
   - **Discount Type** (required): Choose between:
     - **Percentage**: Discount as a percentage (0-100%)
     - **Fixed Amount**: Dollar amount discount
   - **Discount Value** (required): The percentage or dollar amount
   - **Expiry Date** (optional): Date when the coupon expires
   - **Max Uses** (optional): Maximum number of times the coupon can be used
   - **Applicable Tiers**: Select which membership tiers the coupon applies to (Plus, Max, or both)
   - **Applicable Billing**: Select which billing cycles the coupon applies to (Monthly, Yearly, or both)
   - **Active**: Toggle to enable/disable the coupon
3. Click **"Create Coupon"** to save

### Editing a Coupon

1. Find the coupon in the table
2. Click the **"Edit"** button
3. Modify the fields as needed
4. Click **"Update Coupon"** to save changes

**Note**: The `timesUsed` field cannot be edited manually - it's automatically updated when users successfully apply the coupon.

### Deleting a Coupon

1. Find the coupon in the table
2. Click the **"Delete"** button
3. Confirm the deletion in the popup

**Warning**: Deleting a coupon is permanent and cannot be undone. Consider deactivating it instead if you want to preserve the usage history.

### Viewing Coupon Usage

The coupon table displays:
- Code and description
- Discount type and amount
- Applicable tiers and billing cycles
- Expiration date
- Usage statistics (times used / max uses)
- Active/Inactive status

Usage history is stored in the `couponUsage` collection in Firestore, which includes:
- Coupon ID
- User ID
- Amount paid
- Tier and billing cycle
- Timestamp

## User Experience

### Applying a Coupon

1. Navigate to `/membership/upgrade`
2. Select a billing cycle (Monthly/Yearly)
3. In the "Have a coupon code?" section:
   - Enter the coupon code in the input field
   - Click **"Apply"** to validate
4. If valid:
   - A success message appears
   - The price updates to show the original price (struck through) and the discounted price
   - A discount badge shows the savings
5. Click the upgrade button on the desired membership tier
6. The checkout session will include the discount

### Removing a Coupon

If a coupon has been applied, users can click the **"Remove"** button to clear it and return to the original pricing.

### Invalid Coupon Codes

If a coupon is invalid, expired, or reached its usage limit, an error message will be displayed explaining the issue.

## API Endpoints

### Public Endpoints

#### Validate Coupon
```
POST /api/coupons/validate
Body: { code: "COUPON_CODE" }
```

Returns coupon details if valid, or an error message if invalid.

### Admin Endpoints (Require Admin Authentication)

#### Get All Coupons
```
GET /api/coupons
Headers: { Authorization: "Bearer <token>" }
```

#### Create Coupon
```
POST /api/coupons
Headers: { Authorization: "Bearer <token>" }
Body: {
  code: "SUMMER2025",
  description: "Summer promotion",
  discountType: "percentage",
  discountValue: 20,
  expiryDate: "2025-09-01",
  maxUses: 100,
  applicableTiers: ["plus", "max"],
  applicableBilling: ["monthly", "yearly"],
  isActive: true
}
```

#### Update Coupon
```
PUT /api/coupons/:couponId
Headers: { Authorization: "Bearer <token>" }
Body: { /* fields to update */ }
```

#### Delete Coupon
```
DELETE /api/coupons/:couponId
Headers: { Authorization: "Bearer <token>" }
```

## Backend Integration

### Stripe Integration

When a user applies a coupon and proceeds to checkout:

1. The coupon is validated in `MembershipUpgrade.jsx`
2. If valid, the `couponId` is included in the checkout session request
3. `stripeRoutes.js` applies the discount to the Stripe checkout session
4. The discounted price is used for the subscription
5. Coupon metadata is stored in the Stripe session for tracking

### Webhook Handling

When a payment is completed:

1. The Stripe webhook triggers `handleCheckoutSessionCompleted`
2. If a coupon was used, the system:
   - Increments the `timesUsed` counter
   - Records the usage in the `couponUsage` collection
   - Updates `lastUsedAt` timestamp

## Firestore Collections

### coupons
```javascript
{
  code: "SUMMER2025",              // Unique coupon code (uppercase)
  description: "Summer promotion", // Internal description
  discountType: "percentage",      // "percentage" or "fixed"
  discountValue: 20,               // Percentage (0-100) or dollar amount
  expiryDate: "2025-09-01",       // ISO date string or null
  maxUses: 100,                    // Number or null for unlimited
  timesUsed: 15,                   // Automatically incremented
  applicableTiers: ["plus", "max"], // Array of tier IDs
  applicableBilling: ["monthly", "yearly"], // Array of billing cycles
  isActive: true,                  // Boolean
  createdAt: "2025-01-15T...",    // ISO timestamp
  createdBy: "adminUserId",        // Admin user ID
  lastUsedAt: "2025-01-20T..."    // ISO timestamp (null if never used)
}
```

### couponUsage
```javascript
{
  couponId: "couponDocId",
  userId: "userDocId",
  amount: 7.99,                    // Amount paid after discount
  tier: "plus",
  billing: "monthly",
  usedAt: "2025-01-20T..."        // ISO timestamp
}
```

## Security

### Firestore Rules

- **Coupons**: Only admins can read/write directly in Firestore
- **CouponUsage**: Only admins can read; writing is handled by backend only
- Users validate coupons through the API endpoint, which has its own validation logic

### API Security

- Admin endpoints require Bearer token authentication
- Token is verified using Firebase Admin SDK
- User document is checked for `isAdmin: true` flag
- Coupon validation endpoint is public but includes business logic validation

## Example Use Cases

### Limited-Time Promotion
Create a coupon with:
- 20% discount
- Expiry date set to end of month
- Active status

### First 100 Users
Create a coupon with:
- Fixed $5 discount
- Max uses: 100
- No expiry date

### Annual Plan Promotion
Create a coupon with:
- 25% discount
- Applicable to yearly billing only
- Both Plus and Max tiers

### Tier-Specific Discount
Create a coupon with:
- $10 off
- Applicable to Plus tier only
- Both monthly and yearly billing

## Best Practices

1. **Use descriptive coupon codes**: Make them memorable and related to the promotion
2. **Set expiration dates**: Even for "unlimited" promotions, set a far-future date for tracking
3. **Monitor usage**: Regularly check the usage statistics to measure promotion effectiveness
4. **Deactivate instead of delete**: Preserve usage history by deactivating old coupons
5. **Test before launch**: Create a test coupon and verify it works end-to-end
6. **Document promotions**: Use the description field to note the purpose and marketing campaign

## Troubleshooting

### Coupon not applying to checkout
- Verify the coupon is active
- Check if the coupon applies to the selected tier and billing cycle
- Ensure the coupon hasn't reached its usage limit
- Verify the expiration date hasn't passed

### "Invalid coupon code" error
- Check for typos (codes are case-insensitive, automatically uppercase)
- Verify the coupon exists in the admin panel
- Check if the coupon is active

### Discount not showing in Stripe
- Verify the backend is correctly calculating the discount
- Check the server logs for any errors during checkout session creation
- Ensure the coupon ID is being passed to the Stripe checkout endpoint

## Future Enhancements

Potential features to consider adding:

- **User-specific coupons**: Limit coupons to specific users or email addresses
- **Recurring discounts**: Apply discounts to multiple billing cycles
- **Minimum purchase amount**: Require a minimum subscription length
- **Bulk coupon generation**: Create multiple unique codes at once
- **Analytics dashboard**: Visual charts showing coupon performance
- **Email integration**: Automatically send coupon codes to users
- **Referral codes**: Generate unique codes for users to share

## Support

For technical issues or questions about the coupon system:
1. Check the browser console for client-side errors
2. Check the server logs for API errors
3. Verify Firestore security rules are properly deployed
4. Ensure environment variables are configured correctly

