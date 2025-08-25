const express = require('express');
const admin = require('firebase-admin');
const router = express.Router();

// Middleware to verify Firebase ID token
const verifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized - No token provided' });
    }
    
    const idToken = authHeader.split('Bearer ')[1];
    if (!idToken) {
      return res.status(401).json({ error: 'Unauthorized - Invalid token format' });
    }
    
    const decodedToken = await req.admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    return res.status(401).json({ error: 'Unauthorized - Invalid token' });
  }
};

// Middleware to verify admin access
const verifyAdminAccess = async (req, res, next) => {
  try {
    const userDoc = await req.db.collection('users').doc(req.user.uid).get();
    if (!userDoc.exists || !userDoc.data().isAdmin) {
      return res.status(403).json({ error: 'Unauthorized: Admin access required' });
    }
    next();
  } catch (error) {
    console.error('Error checking admin access:', error);
    return res.status(500).json({ error: 'Server error during admin verification' });
  }
};

/**
 * POST /api/reports/question
 * Report a question by a user
 */
router.post('/question', verifyFirebaseToken, async (req, res) => {
  try {
    const { questionId, quizId, reason } = req.body;
    const userId = req.user.uid;

    if (!questionId) {
      return res.status(400).json({ error: 'Question ID is required' });
    }

    // Check if question exists
    const questionDoc = await req.db.collection('questions').doc(questionId).get();
    if (!questionDoc.exists) {
      return res.status(404).json({ error: 'Question not found' });
    }

    // Check if user has already reported this question
    const existingReport = await req.db
      .collection('questionReports')
      .where('questionId', '==', questionId)
      .where('reportedBy', '==', userId)
      .limit(1)
      .get();

    if (!existingReport.empty) {
      return res.status(400).json({ error: 'You have already reported this question' });
    }

    // Create the report
    const reportData = {
      questionId,
      quizId: quizId || null,
      reason: reason || '',
      reportedBy: userId,
      reportedAt: admin.firestore.FieldValue.serverTimestamp(),
      status: 'pending',
      reviewedBy: null,
      reviewedAt: null,
      resolution: null
    };

    const reportRef = await req.db.collection('questionReports').add(reportData);

    // Get user info for the response
    const userDoc = await req.db.collection('users').doc(userId).get();
    const userData = userDoc.data();

    res.status(201).json({
      success: true,
      reportId: reportRef.id,
      message: 'Question reported successfully. Thank you for your feedback!'
    });

  } catch (error) {
    console.error('Error reporting question:', error);
    res.status(500).json({ error: error.message || 'Failed to report question' });
  }
});

/**
 * GET /api/reports/questions
 * Get all reported questions (admin only)
 */
router.get('/questions', verifyFirebaseToken, verifyAdminAccess, async (req, res) => {
  try {
    const { status = 'all', limit = 50, offset = 0 } = req.query;

    let query = req.db.collection('questionReports');
    
    // Filter by status if provided
    if (status !== 'all') {
      query = query.where('status', '==', status);
    }

    // Order by report date (most recent first)
    query = query.orderBy('reportedAt', 'desc');

    // Add pagination
    if (offset > 0) {
      query = query.offset(parseInt(offset));
    }
    query = query.limit(parseInt(limit));

    const snapshot = await query.get();
    
    if (snapshot.empty) {
      return res.json({
        reports: [],
        total: 0,
        hasMore: false
      });
    }

    // Extract all unique IDs for batch fetching
    const questionIds = [];
    const userIds = new Set();
    const reportsData = [];

    snapshot.docs.forEach(doc => {
      const reportData = doc.data();
      reportsData.push({ id: doc.id, ...reportData });
      
      questionIds.push(reportData.questionId);
      userIds.add(reportData.reportedBy);
      if (reportData.reviewedBy) {
        userIds.add(reportData.reviewedBy);
      }
    });

    // Batch fetch all questions in parallel
    const questionPromises = questionIds.map(id => 
      req.db.collection('questions').doc(id).get()
    );

    // Batch fetch all users in parallel
    const userPromises = Array.from(userIds).map(id => 
      req.db.collection('users').doc(id).get()
    );

    // Execute all database calls in parallel
    const [questionDocs, userDocs] = await Promise.all([
      Promise.all(questionPromises),
      Promise.all(userPromises)
    ]);

    // Create lookup maps for O(1) access
    const questionsMap = new Map();
    questionDocs.forEach((doc, index) => {
      if (doc.exists) {
        questionsMap.set(questionIds[index], doc.data());
      }
    });

    const usersMap = new Map();
    userDocs.forEach((doc, index) => {
      if (doc.exists) {
        const userId = Array.from(userIds)[index];
        usersMap.set(userId, doc.data());
      }
    });

    // Build the final reports array using the lookup maps
    const reports = reportsData.map(reportData => {
      const questionData = questionsMap.get(reportData.questionId);
      const userData = usersMap.get(reportData.reportedBy);
      const reviewerData = reportData.reviewedBy ? usersMap.get(reportData.reviewedBy) : null;

      return {
        ...reportData,
        question: questionData ? {
          id: reportData.questionId,
          text: questionData.text,
          options: questionData.options,
          correctAnswer: questionData.correctAnswer,
          subcategory: questionData.subcategory,
          subcategoryId: questionData.subcategoryId,
          difficulty: questionData.difficulty,
          explanation: questionData.explanation
        } : null,
        reporter: userData ? {
          displayName: userData.displayName || userData.email || 'Unknown User',
          email: userData.email
        } : null,
        reviewer: reviewerData ? {
          displayName: reviewerData.displayName || reviewerData.email || 'Unknown Admin',
          email: reviewerData.email
        } : null
      };
    });

    res.json({
      reports,
      total: reports.length,
      hasMore: reports.length === parseInt(limit)
    });

  } catch (error) {
    console.error('Error fetching reported questions:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch reported questions' });
  }
});

/**
 * DELETE /api/reports/:reportId
 * Delete a report record (admin only)
 */
router.delete('/:reportId', verifyFirebaseToken, verifyAdminAccess, async (req, res) => {
  try {
    const { reportId } = req.params;

    // Check if report exists
    const reportDoc = await req.db.collection('questionReports').doc(reportId).get();
    if (!reportDoc.exists) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Delete the report record
    await req.db.collection('questionReports').doc(reportId).delete();

    res.json({
      success: true,
      message: 'Report deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({ error: error.message || 'Failed to delete report' });
  }
});

/**
 * DELETE /api/reports/question/:questionId
 * Delete a question (admin only)
 */
router.delete('/question/:questionId', verifyFirebaseToken, verifyAdminAccess, async (req, res) => {
  try {
    const { questionId } = req.params;
    const { reportId } = req.body;
    const adminId = req.user.uid;

    // Check if question exists
    const questionDoc = await req.db.collection('questions').doc(questionId).get();
    if (!questionDoc.exists) {
      return res.status(404).json({ error: 'Question not found' });
    }

    // Delete the question
    await req.db.collection('questions').doc(questionId).delete();

    // Update the report status if reportId is provided
    if (reportId) {
      await req.db.collection('questionReports').doc(reportId).update({
        status: 'resolved',
        resolution: 'question_deleted',
        reviewedBy: adminId,
        reviewedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    res.json({
      success: true,
      message: 'Question deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({ error: error.message || 'Failed to delete question' });
  }
});

/**
 * PUT /api/reports/question/:questionId
 * Update a question (admin only)
 */
router.put('/question/:questionId', verifyFirebaseToken, verifyAdminAccess, async (req, res) => {
  try {
    const { questionId } = req.params;
    const { reportId, questionData } = req.body;
    const adminId = req.user.uid;

    // Check if question exists
    const questionDoc = await req.db.collection('questions').doc(questionId).get();
    if (!questionDoc.exists) {
      return res.status(404).json({ error: 'Question not found' });
    }

    // Update the question
    const updateData = {
      ...questionData,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      lastModifiedBy: adminId
    };

    // Clear any legacy subcategory fields to avoid confusion
    if (updateData.subcategory || updateData.subcategoryId) {
      updateData.subCategory = admin.firestore.FieldValue.delete();
    }

    console.log('Updating question with data:', {
      questionId,
      subcategoryId: updateData.subcategoryId,
      subcategory: updateData.subcategory,
      hasSubCategory: 'subCategory' in updateData
    });

    await req.db.collection('questions').doc(questionId).update(updateData);

    // Verify the update by reading the question back
    const updatedQuestionDoc = await req.db.collection('questions').doc(questionId).get();
    const updatedData = updatedQuestionDoc.data();
    console.log('Question after update:', {
      questionId,
      subcategoryId: updatedData.subcategoryId,
      subcategory: updatedData.subcategory,
      subCategory: updatedData.subCategory
    });

    // Update the report status if reportId is provided
    if (reportId) {
      await req.db.collection('questionReports').doc(reportId).update({
        status: 'resolved',
        resolution: 'question_updated',
        reviewedBy: adminId,
        reviewedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    res.json({
      success: true,
      message: 'Question updated successfully'
    });

  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({ error: error.message || 'Failed to update question' });
  }
});

/**
 * PUT /api/reports/:reportId/dismiss
 * Dismiss a report without taking action (admin only)
 */
router.put('/:reportId/dismiss', verifyFirebaseToken, verifyAdminAccess, async (req, res) => {
  try {
    const { reportId } = req.params;
    const { reason } = req.body;
    const adminId = req.user.uid;

    // Check if report exists
    const reportDoc = await req.db.collection('questionReports').doc(reportId).get();
    if (!reportDoc.exists) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Update the report status
    await req.db.collection('questionReports').doc(reportId).update({
      status: 'dismissed',
      resolution: reason || 'no_action_needed',
      reviewedBy: adminId,
      reviewedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({
      success: true,
      message: 'Report dismissed successfully'
    });

  } catch (error) {
    console.error('Error dismissing report:', error);
    res.status(500).json({ error: error.message || 'Failed to dismiss report' });
  }
});

module.exports = router; 