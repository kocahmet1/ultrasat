import { db } from './config';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit,
  startAfter,
  Timestamp 
} from 'firebase/firestore';

/**
 * Get users who signed up on a specific date
 * @param {Date} date - The date to filter signups (defaults to today)
 * @returns {Promise<Array>} Array of user objects with basic info
 */
export const getUsersSignedUpOnDate = async (date = new Date()) => {
  try {
    // Set up date range for the specified day (start of day to end of day)
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    console.log(`Fetching users who signed up between ${startOfDay.toISOString()} and ${endOfDay.toISOString()}`);
    
    // Query users collection for signups in the date range
    const usersRef = collection(db, 'users');
    const q = query(
      usersRef,
      where('createdAt', '>=', startOfDay.toISOString()),
      where('createdAt', '<=', endOfDay.toISOString()),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const users = [];
    
    querySnapshot.forEach((doc) => {
      const userData = doc.data();
      users.push({
        id: doc.id,
        email: userData.email,
        name: userData.name,
        createdAt: userData.createdAt,
        membershipTier: userData.membershipTier || 'free'
      });
    });
    
    console.log(`Found ${users.length} users who signed up on ${date.toDateString()}`);
    return users;
  } catch (error) {
    console.error('Error fetching users by signup date:', error);
    throw error;
  }
};

/**
 * Get practice exam results for a specific user
 * @param {string} userId - The user ID
 * @returns {Promise<Array>} Array of practice exam results
 */
export const getUserPracticeExamResults = async (userId) => {
  try {
    console.log(`Fetching practice exam results for user: ${userId}`);
    
    const practiceExamsRef = collection(db, `users/${userId}/practiceExams`);
    const q = query(practiceExamsRef, orderBy('completedAt', 'desc'));
    
    const querySnapshot = await getDocs(q);
    const examResults = [];
    
    querySnapshot.forEach((doc) => {
      const examData = doc.data();
      examResults.push({
        id: doc.id,
        examTitle: examData.examTitle,
        overallScore: examData.overallScore,
        totalQuestions: examData.totalQuestions,
        correctAnswers: examData.correctAnswers,
        completedAt: examData.completedAt,
        scores: examData.scores, // Section scores (reading/writing, math)
        isDiagnostic: examData.isDiagnostic || false
      });
    });
    
    console.log(`Found ${examResults.length} practice exam results for user ${userId}`);
    return examResults;
  } catch (error) {
    console.error('Error fetching practice exam results:', error);
    throw error;
  }
};

/**
 * Get quiz results for a specific user from the smartQuizzes collection
 * @param {string} userId - The user ID
 * @returns {Promise<Array>} Array of quiz results
 */
export const getUserQuizResults = async (userId) => {
  try {
    console.log(`Fetching quiz results for user: ${userId}`);
    
    const smartQuizzesRef = collection(db, 'smartQuizzes');
    const q = query(
      smartQuizzesRef,
      where('userId', '==', userId),
      where('status', '==', 'completed'),
      orderBy('completedAt', 'desc'),
      limit(50) // Limit to last 50 quizzes to avoid fetching too much data
    );
    
    const querySnapshot = await getDocs(q);
    const quizResults = [];
    
    querySnapshot.forEach((doc) => {
      const quizData = doc.data();
      
      // Calculate total time spent if we have startedAt and completedAt
      let totalTimeSpent = null;
      if (quizData.startedAt && quizData.completedAt) {
        const startTime = quizData.startedAt.toDate ? quizData.startedAt.toDate() : new Date(quizData.startedAt);
        const endTime = quizData.completedAt.toDate ? quizData.completedAt.toDate() : new Date(quizData.completedAt);
        totalTimeSpent = Math.round((endTime - startTime) / 1000); // in seconds
      }
      
      quizResults.push({
        id: doc.id,
        subcategoryId: quizData.subcategoryId,
        level: quizData.level,
        score: quizData.score,
        questionCount: quizData.questionCount,
        completedAt: quizData.completedAt,
        startedAt: quizData.startedAt,
        totalTimeSpent: totalTimeSpent, // in seconds
        passed: quizData.passed || false
      });
    });
    
    console.log(`Found ${quizResults.length} quiz results for user ${userId}`);
    return quizResults;
  } catch (error) {
    console.error('Error fetching quiz results:', error);
    throw error;
  }
};

/**
 * Get user progress data to show overall performance metrics
 * @param {string} userId - The user ID
 * @returns {Promise<Object>} User progress summary
 */
export const getUserProgressSummary = async (userId) => {
  try {
    console.log(`Fetching progress summary for user: ${userId}`);
    
    const progressRef = collection(db, `users/${userId}/progress`);
    const querySnapshot = await getDocs(progressRef);
    
    let totalSubcategories = 0;
    let masteredSubcategories = 0;
    let totalQuestions = 0;
    let totalCorrect = 0;
    const subcategoryProgress = [];
    
    querySnapshot.forEach((doc) => {
      const progressData = doc.data();
      totalSubcategories++;
      
      if (progressData.mastered) {
        masteredSubcategories++;
      }
      
      if (progressData.totalQuestions) {
        totalQuestions += progressData.totalQuestions;
      }
      
      if (progressData.correctTotal) {
        totalCorrect += progressData.correctTotal;
      }
      
      subcategoryProgress.push({
        subcategoryId: doc.id,
        level: progressData.level || 1,
        accuracy: progressData.accuracy || 0,
        mastered: progressData.mastered || false,
        lastAttemptDate: progressData.lastAttemptDate,
        totalQuestions: progressData.totalQuestions || 0,
        correctTotal: progressData.correctTotal || 0
      });
    });
    
    const overallAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
    
    const summary = {
      totalSubcategories,
      masteredSubcategories,
      totalQuestions,
      totalCorrect,
      overallAccuracy,
      subcategoryProgress
    };
    
    console.log(`Progress summary for user ${userId}:`, summary);
    return summary;
  } catch (error) {
    console.error('Error fetching user progress summary:', error);
    throw error;
  }
};

/**
 * Get user's word bank count
 * @param {string} userId - The user ID
 * @returns {Promise<number>} Count of words in user's word bank
 */
export const getUserWordBankCount = async (userId) => {
  try {
    const q = query(
      collection(db, 'users', userId, 'bankItems'),
      where('type', '==', 'word')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error) {
    console.error('Error fetching user word bank count:', error);
    return 0;
  }
};

/**
 * Get user's concept bank count
 * @param {string} userId - The user ID
 * @returns {Promise<number>} Count of concepts in user's concept bank
 */
export const getUserConceptBankCount = async (userId) => {
  try {
    const q = query(
      collection(db, 'users', userId, 'bankItems'),
      where('type', '==', 'concept')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error) {
    console.error('Error fetching user concept bank count:', error);
    return 0;
  }
};

/**
 * Get comprehensive user activity data combining all activity types
 * @param {string} userId - The user ID
 * @returns {Promise<Object>} Complete user activity data
 */
export const getCompleteUserActivity = async (userId) => {
  try {
    console.log(`Fetching complete activity data for user: ${userId}`);
    
    // Fetch all data in parallel for better performance
    const [practiceExams, quizzes, progressSummary, wordBankCount, conceptBankCount] = await Promise.all([
      getUserPracticeExamResults(userId),
      getUserQuizResults(userId),
      getUserProgressSummary(userId),
      getUserWordBankCount(userId),
      getUserConceptBankCount(userId)
    ]);
    
    return {
      userId,
      practiceExams,
      quizzes,
      progressSummary,
      wordBankCount,
      conceptBankCount
    };
  } catch (error) {
    console.error('Error fetching complete user activity:', error);
    throw error;
  }
};

/**
 * Get recent signups with pagination support
 * @param {number} daysBack - Number of days to look back (defaults to 7)
 * @param {number} limitCount - Maximum number of users to return (defaults to 100)
 * @returns {Promise<Array>} Array of recent user signups
 */
export const getRecentSignups = async (daysBack = 7, limitCount = 100) => {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);
    startDate.setHours(0, 0, 0, 0);
    
    console.log(`Fetching signups from last ${daysBack} days (since ${startDate.toISOString()})`);
    
    const usersRef = collection(db, 'users');
    const q = query(
      usersRef,
      where('createdAt', '>=', startDate.toISOString()),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    const users = [];
    
    querySnapshot.forEach((doc) => {
      const userData = doc.data();
      users.push({
        id: doc.id,
        email: userData.email,
        name: userData.name,
        createdAt: userData.createdAt,
        membershipTier: userData.membershipTier || 'free'
      });
    });
    
    console.log(`Found ${users.length} recent signups`);
    return users;
  } catch (error) {
    console.error('Error fetching recent signups:', error);
    throw error;
  }
}; 