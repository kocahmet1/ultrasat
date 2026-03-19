const express = require('express');
const admin = require('firebase-admin');
const { isAdminUser, requireAuth } = require('./middleware/auth');

const router = express.Router();

const verifyFirebaseToken = requireAuth({
  logLabel: '[Profile] Error verifying token',
});

const resolveTargetUserId = async (req, res) => {
  const requestedUserId = req.params.userId || req.body?.userId || req.user.uid;

  if (!requestedUserId) {
    res.status(400).json({ error: 'userId is required' });
    return null;
  }

  if (requestedUserId !== req.user.uid && !(await isAdminUser(req))) {
    res.status(403).json({ error: 'Authenticated user mismatch' });
    return null;
  }

  return requestedUserId;
};

const computeUserStats = async (db, userId) => {
  const progressSnapshot = await db
    .collection('users')
    .doc(userId)
    .collection('progress')
    .get();

  const userProgressSnapshot = await db
    .collection('userProgress')
    .where('userId', '==', userId)
    .get();

  let quizQuestionsCount = 0;
  let correctTotal = 0;

  progressSnapshot.docs.forEach((snapshot) => {
    const data = snapshot.data() || {};
    if (typeof data.totalQuestions === 'number') {
      quizQuestionsCount += data.totalQuestions;
    }
    if (typeof data.correctTotal === 'number') {
      correctTotal += data.correctTotal;
    }
  });

  const totalQuestions = quizQuestionsCount + userProgressSnapshot.size;
  const accuracy = quizQuestionsCount > 0
    ? Math.round((correctTotal / quizQuestionsCount) * 100)
    : 0;

  return {
    userId,
    totalQuestions,
    accuracy,
  };
};

const persistUserStatsCache = async (db, stats) => {
  await db.collection('userStatsCache').doc(stats.userId).set(
    {
      ...stats,
      managedBy: 'server',
      version: 2,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  return stats;
};

const calculatePercentile = (position, total) => {
  if (total <= 0 || position <= 0) return 0;
  if (total === 1) return 100;
  return Math.round(((total - position) / (total - 1)) * 100);
};

const buildRankings = (allUsersStats, userId) => {
  const normalizedUsers = allUsersStats
    .map((user) => ({
      userId: user.userId,
      totalQuestions: typeof user.totalQuestions === 'number' ? user.totalQuestions : 0,
      accuracy: typeof user.accuracy === 'number' ? user.accuracy : 0,
    }))
    .filter((user) => user.userId && user.totalQuestions > 0);

  if (normalizedUsers.length === 0) {
    return {
      questionsRanking: { percentile: 0, position: 0, total: 0 },
      accuracyRanking: { percentile: 0, position: 0, total: 0 },
    };
  }

  const questionsSorted = [...normalizedUsers].sort((a, b) => b.totalQuestions - a.totalQuestions);
  const accuracySorted = [...normalizedUsers].sort((a, b) => b.accuracy - a.accuracy);

  const questionsPosition = questionsSorted.findIndex((user) => user.userId === userId) + 1;
  const accuracyPosition = accuracySorted.findIndex((user) => user.userId === userId) + 1;

  return {
    questionsRanking: {
      percentile: calculatePercentile(questionsPosition, normalizedUsers.length),
      position: questionsPosition > 0 ? questionsPosition : 0,
      total: normalizedUsers.length,
    },
    accuracyRanking: {
      percentile: calculatePercentile(accuracyPosition, normalizedUsers.length),
      position: accuracyPosition > 0 ? accuracyPosition : 0,
      total: normalizedUsers.length,
    },
  };
};

router.post('/stats-cache/refresh', verifyFirebaseToken, async (req, res) => {
  try {
    const userId = await resolveTargetUserId(req, res);
    if (!userId) {
      return;
    }

    const stats = await computeUserStats(req.db, userId);
    await persistUserStatsCache(req.db, stats);

    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('[Profile] Error refreshing stats cache:', error);
    res.status(500).json({ error: 'Failed to refresh user stats cache' });
  }
});

const handleRankingsRequest = async (req, res) => {
  try {
    const userId = await resolveTargetUserId(req, res);
    if (!userId) {
      return;
    }

    const stats = await computeUserStats(req.db, userId);
    await persistUserStatsCache(req.db, stats);

    const cacheSnapshot = await req.db.collection('userStatsCache').get();
    const allUsersStats = cacheSnapshot.docs.map((snapshot) => ({
      userId: snapshot.id,
      ...snapshot.data(),
    }));

    res.json({
      success: true,
      stats,
      rankings: buildRankings(allUsersStats, userId),
    });
  } catch (error) {
    console.error('[Profile] Error fetching user rankings:', error);
    res.status(500).json({ error: 'Failed to fetch user rankings' });
  }
};

router.get('/rankings', verifyFirebaseToken, handleRankingsRequest);
router.get('/rankings/:userId', verifyFirebaseToken, handleRankingsRequest);

module.exports = router;
