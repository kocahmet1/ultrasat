const express = require('express');
const { requireAdmin } = require('./middleware/auth');

const router = express.Router();

const verifyAdmin = requireAdmin({
  logLabel: '[AdminUsers] Auth error',
});

// Top-level collections holding per-user docs keyed by a userId field
const USER_LINKED_COLLECTIONS = [
  'smartQuizzes',
  'userProgress',
  'userRecommendations',
  'userSkillStats',
  'questionAttempts',
];

// Top-level collections where the doc ID is the userId
const USER_KEYED_COLLECTIONS = ['userStatsCache'];

const BATCH_SIZE = 400;

/**
 * Delete all docs matching a query in batches. Returns count deleted.
 */
async function deleteQueryDocs(db, collectionName, userId) {
  let deleted = 0;

  // Loop until no matching docs remain
  // (re-query each pass since batches cap at 500 writes)
  for (;;) {
    const snapshot = await db
      .collection(collectionName)
      .where('userId', '==', userId)
      .limit(BATCH_SIZE)
      .get();

    if (snapshot.empty) break;

    const batch = db.batch();
    snapshot.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();

    deleted += snapshot.size;
    if (snapshot.size < BATCH_SIZE) break;
  }

  return deleted;
}

/**
 * DELETE /api/admin/users/:userId
 * Permanently deletes a user: Firebase Auth account, users/{uid} doc with all
 * subcollections, and user-linked docs in top-level collections.
 * Admin only. Admins cannot delete their own account.
 */
router.delete('/:userId', verifyAdmin, async (req, res) => {
  const { userId } = req.params;
  const db = req.db;
  const firebaseAdmin = req.admin;

  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  if (userId === req.user.uid) {
    return res.status(400).json({ error: 'You cannot delete your own account' });
  }

  try {
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    const userEmail = userDoc.exists ? userDoc.data()?.email : null;

    if (userDoc.exists && userDoc.data()?.isAdmin) {
      return res.status(403).json({ error: 'Cannot delete another admin account' });
    }

    const summary = {
      userId,
      email: userEmail,
      authDeleted: false,
      userDocDeleted: false,
      linkedDocsDeleted: {},
    };

    // 1. Delete user-linked docs in top-level collections
    for (const collectionName of USER_LINKED_COLLECTIONS) {
      try {
        const count = await deleteQueryDocs(db, collectionName, userId);
        if (count > 0) summary.linkedDocsDeleted[collectionName] = count;
      } catch (err) {
        console.error(`[AdminUsers] Failed deleting from ${collectionName}:`, err.message);
        summary.linkedDocsDeleted[collectionName] = `error: ${err.message}`;
      }
    }

    // 2. Delete docs keyed by userId
    for (const collectionName of USER_KEYED_COLLECTIONS) {
      try {
        await db.collection(collectionName).doc(userId).delete();
      } catch (err) {
        console.error(`[AdminUsers] Failed deleting ${collectionName}/${userId}:`, err.message);
      }
    }

    // 3. Recursively delete users/{uid} doc and all subcollections
    if (userDoc.exists) {
      await db.recursiveDelete(userRef);
      summary.userDocDeleted = true;
    }

    // 4. Delete the Firebase Auth account
    try {
      await firebaseAdmin.auth().deleteUser(userId);
      summary.authDeleted = true;
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        summary.authDeleted = 'not-found';
      } else {
        throw err;
      }
    }

    console.log(
      `[AdminUsers] Admin ${req.user.uid} deleted user ${userId} (${userEmail || 'no email'})`,
    );

    return res.json({ success: true, ...summary });
  } catch (error) {
    console.error(`[AdminUsers] Error deleting user ${userId}:`, error);
    return res.status(500).json({ error: 'Failed to delete user: ' + error.message });
  }
});

module.exports = router;
