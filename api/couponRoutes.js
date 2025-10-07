/**
 * Coupon management routes for discount codes
 */

const express = require('express');
const admin = require('firebase-admin');
const router = express.Router();

// Middleware to check if user is admin
const checkAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Get user document to check admin status
    const userDoc = await admin.firestore().collection('users').doc(decodedToken.uid).get();
    const userData = userDoc.data();
    
    if (!userData || !userData.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({ error: 'Invalid authentication' });
  }
};

// Get all coupons (admin only)
router.get('/', checkAdmin, async (req, res) => {
  try {
    const couponsRef = admin.firestore().collection('coupons');
    const snapshot = await couponsRef.orderBy('createdAt', 'desc').get();
    
    const coupons = [];
    snapshot.forEach(doc => {
      coupons.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.json({ coupons });
  } catch (error) {
    console.error('Error fetching coupons:', error);
    res.status(500).json({ error: 'Failed to fetch coupons' });
  }
});

// Validate and get coupon details (public endpoint for checkout)
router.post('/validate', async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'Coupon code is required' });
    }
    
    // Search for coupon by code (case-insensitive)
    const couponsRef = admin.firestore().collection('coupons');
    const snapshot = await couponsRef
      .where('code', '==', code.toUpperCase())
      .limit(1)
      .get();
    
    if (snapshot.empty) {
      return res.status(404).json({ error: 'Invalid coupon code' });
    }
    
    const couponDoc = snapshot.docs[0];
    const coupon = { id: couponDoc.id, ...couponDoc.data() };
    
    // Check if coupon is active
    if (!coupon.isActive) {
      return res.status(400).json({ error: 'This coupon is no longer active' });
    }
    
    // Check expiry date
    if (coupon.expiryDate) {
      const expiryDate = new Date(coupon.expiryDate);
      if (expiryDate < new Date()) {
        return res.status(400).json({ error: 'This coupon has expired' });
      }
    }
    
    // Check usage limit
    if (coupon.maxUses && coupon.timesUsed >= coupon.maxUses) {
      return res.status(400).json({ error: 'This coupon has reached its usage limit' });
    }
    
    // Return valid coupon details
    res.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        description: coupon.description,
        applicableTiers: coupon.applicableTiers || ['plus', 'max'],
        applicableBilling: coupon.applicableBilling || ['monthly', 'yearly']
      }
    });
  } catch (error) {
    console.error('Error validating coupon:', error);
    res.status(500).json({ error: 'Failed to validate coupon' });
  }
});

// Create new coupon (admin only)
router.post('/', checkAdmin, async (req, res) => {
  try {
    const {
      code,
      description,
      discountType, // 'percentage' or 'fixed'
      discountValue,
      expiryDate,
      maxUses,
      applicableTiers, // ['plus', 'max'] or specific tiers
      applicableBilling, // ['monthly', 'yearly'] or specific
      isActive
    } = req.body;
    
    // Validate required fields
    if (!code || !discountType || !discountValue) {
      return res.status(400).json({ 
        error: 'Code, discount type, and discount value are required' 
      });
    }
    
    // Validate discount type
    if (!['percentage', 'fixed'].includes(discountType)) {
      return res.status(400).json({ 
        error: 'Discount type must be "percentage" or "fixed"' 
      });
    }
    
    // Validate discount value
    if (discountType === 'percentage' && (discountValue < 0 || discountValue > 100)) {
      return res.status(400).json({ 
        error: 'Percentage discount must be between 0 and 100' 
      });
    }
    
    if (discountType === 'fixed' && discountValue < 0) {
      return res.status(400).json({ 
        error: 'Fixed discount must be positive' 
      });
    }
    
    // Check if coupon code already exists
    const existingCoupon = await admin.firestore()
      .collection('coupons')
      .where('code', '==', code.toUpperCase())
      .limit(1)
      .get();
    
    if (!existingCoupon.empty) {
      return res.status(400).json({ error: 'Coupon code already exists' });
    }
    
    // Create coupon document
    const couponData = {
      code: code.toUpperCase(),
      description: description || '',
      discountType,
      discountValue: Number(discountValue),
      expiryDate: expiryDate || null,
      maxUses: maxUses ? Number(maxUses) : null,
      timesUsed: 0,
      applicableTiers: applicableTiers || ['plus', 'max'],
      applicableBilling: applicableBilling || ['monthly', 'yearly'],
      isActive: isActive !== false,
      createdAt: new Date().toISOString(),
      createdBy: req.user.uid
    };
    
    const docRef = await admin.firestore().collection('coupons').add(couponData);
    
    res.json({
      success: true,
      coupon: {
        id: docRef.id,
        ...couponData
      }
    });
  } catch (error) {
    console.error('Error creating coupon:', error);
    res.status(500).json({ error: 'Failed to create coupon' });
  }
});

// Update coupon (admin only)
router.put('/:couponId', checkAdmin, async (req, res) => {
  try {
    const { couponId } = req.params;
    const updates = req.body;
    
    // Don't allow changing certain fields
    delete updates.id;
    delete updates.createdAt;
    delete updates.createdBy;
    delete updates.timesUsed;
    
    // If updating code, make it uppercase
    if (updates.code) {
      updates.code = updates.code.toUpperCase();
      
      // Check if new code already exists (excluding current coupon)
      const existingCoupon = await admin.firestore()
        .collection('coupons')
        .where('code', '==', updates.code)
        .limit(1)
        .get();
      
      if (!existingCoupon.empty && existingCoupon.docs[0].id !== couponId) {
        return res.status(400).json({ error: 'Coupon code already exists' });
      }
    }
    
    // Validate discount value if provided
    if (updates.discountValue !== undefined) {
      const couponDoc = await admin.firestore().collection('coupons').doc(couponId).get();
      const currentCoupon = couponDoc.data();
      const discountType = updates.discountType || currentCoupon.discountType;
      
      if (discountType === 'percentage' && (updates.discountValue < 0 || updates.discountValue > 100)) {
        return res.status(400).json({ 
          error: 'Percentage discount must be between 0 and 100' 
        });
      }
      
      if (discountType === 'fixed' && updates.discountValue < 0) {
        return res.status(400).json({ 
          error: 'Fixed discount must be positive' 
        });
      }
      
      updates.discountValue = Number(updates.discountValue);
    }
    
    updates.updatedAt = new Date().toISOString();
    
    await admin.firestore().collection('coupons').doc(couponId).update(updates);
    
    // Get updated coupon
    const updatedDoc = await admin.firestore().collection('coupons').doc(couponId).get();
    
    res.json({
      success: true,
      coupon: {
        id: updatedDoc.id,
        ...updatedDoc.data()
      }
    });
  } catch (error) {
    console.error('Error updating coupon:', error);
    res.status(500).json({ error: 'Failed to update coupon' });
  }
});

// Delete coupon (admin only)
router.delete('/:couponId', checkAdmin, async (req, res) => {
  try {
    const { couponId } = req.params;
    
    await admin.firestore().collection('coupons').doc(couponId).delete();
    
    res.json({ success: true, message: 'Coupon deleted successfully' });
  } catch (error) {
    console.error('Error deleting coupon:', error);
    res.status(500).json({ error: 'Failed to delete coupon' });
  }
});

// Record coupon usage (called after successful payment)
router.post('/record-usage', async (req, res) => {
  try {
    const { couponId, userId, amount } = req.body;
    
    if (!couponId) {
      return res.status(400).json({ error: 'Coupon ID is required' });
    }
    
    const couponRef = admin.firestore().collection('coupons').doc(couponId);
    const couponDoc = await couponRef.get();
    
    if (!couponDoc.exists) {
      return res.status(404).json({ error: 'Coupon not found' });
    }
    
    // Increment usage counter
    await couponRef.update({
      timesUsed: admin.firestore.FieldValue.increment(1),
      lastUsedAt: new Date().toISOString()
    });
    
    // Record usage history
    await admin.firestore().collection('couponUsage').add({
      couponId,
      userId,
      amount,
      usedAt: new Date().toISOString()
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error recording coupon usage:', error);
    res.status(500).json({ error: 'Failed to record coupon usage' });
  }
});

module.exports = router;

