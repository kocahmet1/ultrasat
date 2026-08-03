// Diagnostic utilities to investigate smart quiz question selection issues
import { db } from '../firebase/config';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import { getQuestionsBySubcategory } from '../firebase/services';
import { getKebabCaseFromAnyFormat } from './subcategoryConstants';

/**
 * Diagnose why graph questions might not be appearing in smart quizzes
 * @param {string} subcategoryId - The subcategory to investigate
 * @returns {Promise<Object>} Diagnostic results
 */
export const diagnoseGraphQuestionsInSmartQuizzes = async (subcategoryId) => {
  console.log(`🔍 Starting diagnostic for subcategory: ${subcategoryId}`);
  
  const results = {
    subcategoryId,
    normalizedSubcategoryId: null,
    totalQuestions: 0,
    questionsWithGraphs: 0,
    questionsWithGeneralContext: 0,
    questionsWithGraphsAndGeneralContext: 0,
    smartQuizEligibleQuestions: 0,
    smartQuizEligibleWithGraphs: 0,
    sampleQuestions: {
      withGraphs: [],
      eligibleForSmartQuiz: [],
      eligibleWithGraphs: []
    },
    issues: []
  };

  try {
    // Step 1: Normalize subcategory ID
    results.normalizedSubcategoryId = getKebabCaseFromAnyFormat(subcategoryId);
    console.log(`📝 Normalized subcategory: ${results.normalizedSubcategoryId}`);

    // Step 2: Get all questions from this subcategory using the same method as smart quizzes
    const smartQuizQuestions = await getQuestionsBySubcategory(results.normalizedSubcategoryId, null, 100);
    results.smartQuizEligibleQuestions = smartQuizQuestions.length;
    
    console.log(`📊 Smart quiz eligible questions: ${results.smartQuizEligibleQuestions}`);

    // Step 3: Analyze the smart quiz questions
    const questionsWithGraphs = smartQuizQuestions.filter(q => 
      (q.graphUrl && q.graphUrl.trim() !== '') || 
      (q.graphDescription && q.graphDescription.trim() !== '' && q.graphDescription !== 'null')
    );
    results.smartQuizEligibleWithGraphs = questionsWithGraphs.length;
    
    console.log(`🖼️ Smart quiz questions with graphs: ${results.smartQuizEligibleWithGraphs}`);

    // Step 4: Get direct database samples for comparison
    console.log(`🔍 Querying database directly for subcategory analysis...`);
    
    // Query database directly
    const questionsRef = collection(db, 'questions');
    
    // Try multiple subcategory formats
    const queryFormats = [
      results.normalizedSubcategoryId,
      subcategoryId,
      subcategoryId.charAt(0).toUpperCase() + subcategoryId.slice(1)
    ];

    let allDbQuestions = [];
    
    for (const format of queryFormats) {
      try {
        const q = query(questionsRef, where('subcategory', '==', format), limit(50));
        const snapshot = await getDocs(q);
        
        snapshot.docs.forEach(doc => {
          const questionData = { id: doc.id, ...doc.data() };
          // Avoid duplicates
          if (!allDbQuestions.find(existing => existing.id === questionData.id)) {
            allDbQuestions.push(questionData);
          }
        });
        
        console.log(`📋 Found ${snapshot.docs.length} questions with subcategory format: "${format}"`);
      } catch (error) {
        console.warn(`⚠️ Error querying with format "${format}":`, error);
      }
    }

    results.totalQuestions = allDbQuestions.length;

    // Step 5: Analyze all database questions
    const dbQuestionsWithGraphs = allDbQuestions.filter(q => 
      (q.graphUrl && q.graphUrl.trim() !== '') || 
      (q.graphDescription && q.graphDescription.trim() !== '' && q.graphDescription !== 'null')
    );
    results.questionsWithGraphs = dbQuestionsWithGraphs.length;

    const dbQuestionsWithGeneralContext = allDbQuestions.filter(q => 
      !q.usageContext || q.usageContext === 'general'
    );
    results.questionsWithGeneralContext = dbQuestionsWithGeneralContext.length;

    const dbQuestionsWithGraphsAndGeneralContext = allDbQuestions.filter(q => 
      ((q.graphUrl && q.graphUrl.trim() !== '') || 
       (q.graphDescription && q.graphDescription.trim() !== '' && q.graphDescription !== 'null')) &&
      (!q.usageContext || q.usageContext === 'general')
    );
    results.questionsWithGraphsAndGeneralContext = dbQuestionsWithGraphsAndGeneralContext.length;

    // Step 6: Collect samples
    results.sampleQuestions.withGraphs = dbQuestionsWithGraphs.slice(0, 3).map(q => ({
      id: q.id,
      subcategory: q.subcategory,
      usageContext: q.usageContext,
      difficulty: q.difficulty,
      hasGraphUrl: !!(q.graphUrl && q.graphUrl.trim()),
      hasGraphDescription: !!(q.graphDescription && q.graphDescription.trim() && q.graphDescription !== 'null'),
      text: q.text?.substring(0, 100) + '...'
    }));

    results.sampleQuestions.eligibleForSmartQuiz = smartQuizQuestions.slice(0, 3).map(q => ({
      id: q.id,
      subcategory: q.subcategory,
      usageContext: q.usageContext,
      difficulty: q.difficulty,
      hasGraphUrl: !!(q.graphUrl && q.graphUrl.trim()),
      hasGraphDescription: !!(q.graphDescription && q.graphDescription.trim() && q.graphDescription !== 'null'),
      text: q.text?.substring(0, 100) + '...'
    }));

    results.sampleQuestions.eligibleWithGraphs = questionsWithGraphs.slice(0, 3).map(q => ({
      id: q.id,
      subcategory: q.subcategory,
      usageContext: q.usageContext,
      difficulty: q.difficulty,
      hasGraphUrl: !!(q.graphUrl && q.graphUrl.trim()),
      hasGraphDescription: !!(q.graphDescription && q.graphDescription.trim() && q.graphDescription !== 'null'),
      text: q.text?.substring(0, 100) + '...'
    }));

    // Step 7: Identify issues
    if (results.questionsWithGraphsAndGeneralContext > 0 && results.smartQuizEligibleWithGraphs === 0) {
      results.issues.push('❌ Database has graph questions with general context, but smart quiz system finds none');
    }

    if (results.totalQuestions !== results.smartQuizEligibleQuestions) {
      results.issues.push(`❌ Database has ${results.totalQuestions} questions, but smart quiz system finds ${results.smartQuizEligibleQuestions}`);
    }

    if (results.questionsWithGraphs > results.smartQuizEligibleWithGraphs) {
      results.issues.push(`❌ Database has ${results.questionsWithGraphs} graph questions, but smart quiz system finds ${results.smartQuizEligibleWithGraphs}`);
    }

    // Check for subcategory mismatches
    const subcategoryFormats = [...new Set(allDbQuestions.map(q => q.subcategory))];
    if (subcategoryFormats.length > 1) {
      results.issues.push(`⚠️ Multiple subcategory formats found: ${subcategoryFormats.join(', ')}`);
    }

    // Check for missing required fields
    const questionsWithMissingFields = allDbQuestions.filter(q => 
      !q.text || !q.options || !q.correctAnswer || !q.subcategory
    );
    if (questionsWithMissingFields.length > 0) {
      results.issues.push(`⚠️ ${questionsWithMissingFields.length} questions missing required fields`);
    }

    if (results.issues.length === 0) {
      results.issues.push('✅ No obvious issues detected');
    }

    console.log(`📋 Diagnostic Results:`, results);
    return results;

  } catch (error) {
    console.error('❌ Error during diagnostic:', error);
    results.issues.push(`❌ Diagnostic error: ${error.message}`);
    return results;
  }
};

/**
 * Enhanced diagnostic that also checks difficulty levels and user progress
 * @param {string} subcategoryId - The subcategory to investigate
 * @param {string} userId - Optional user ID to check their progress
 * @returns {Promise<Object>} Enhanced diagnostic results
 */
export const diagnoseGraphQuestionsDetailed = async (subcategoryId, userId = null) => {
  console.log(`🔍 Starting detailed diagnostic for subcategory: ${subcategoryId}`);
  
  const results = {
    subcategoryId,
    normalizedSubcategoryId: null,
    totalQuestions: 0,
    questionsWithGraphs: 0,
    questionsWithGeneralContext: 0,
    questionsWithGraphsAndGeneralContext: 0,
    smartQuizEligibleQuestions: 0,
    smartQuizEligibleWithGraphs: 0,
    difficultyBreakdown: {
      easy: { total: 0, withGraphs: 0 },
      medium: { total: 0, withGraphs: 0 },
      hard: { total: 0, withGraphs: 0 }
    },
    userProgress: null,
    sampleQuestions: {
      withGraphs: [],
      eligibleForSmartQuiz: [],
      eligibleWithGraphs: []
    },
    issues: []
  };

  try {
    // Step 1: Normalize subcategory ID
    results.normalizedSubcategoryId = getKebabCaseFromAnyFormat(subcategoryId);
    console.log(`📝 Normalized subcategory: ${results.normalizedSubcategoryId}`);

    // Step 2: Get all questions from this subcategory using the same method as smart quizzes
    const smartQuizQuestions = await getQuestionsBySubcategory(results.normalizedSubcategoryId, null, 100);
    results.smartQuizEligibleQuestions = smartQuizQuestions.length;
    
    console.log(`📊 Smart quiz eligible questions: ${results.smartQuizEligibleQuestions}`);

    // Step 3: Analyze the smart quiz questions by difficulty
    smartQuizQuestions.forEach(q => {
      const difficulty = q.difficulty || 'medium';
      const hasGraph = (q.graphUrl && q.graphUrl.trim() !== '') || 
                      (q.graphDescription && q.graphDescription.trim() !== '' && q.graphDescription !== 'null');
      
      if (results.difficultyBreakdown[difficulty]) {
        results.difficultyBreakdown[difficulty].total++;
        if (hasGraph) {
          results.difficultyBreakdown[difficulty].withGraphs++;
        }
      }
    });

    // Step 4: Test smart quiz generation for different difficulty levels
    const difficultyTests = {};
    for (const difficulty of ['easy', 'medium', 'hard']) {
      try {
        const difficultyQuestions = await getQuestionsBySubcategory(results.normalizedSubcategoryId, difficulty, 20);
        const difficultyWithGraphs = difficultyQuestions.filter(q => 
          (q.graphUrl && q.graphUrl.trim() !== '') || 
          (q.graphDescription && q.graphDescription.trim() !== '' && q.graphDescription !== 'null')
        );
        
        difficultyTests[difficulty] = {
          total: difficultyQuestions.length,
          withGraphs: difficultyWithGraphs.length,
          percentage: difficultyQuestions.length > 0 ? Math.round((difficultyWithGraphs.length / difficultyQuestions.length) * 100) : 0
        };
      } catch (error) {
        console.warn(`Error testing ${difficulty} difficulty:`, error);
        difficultyTests[difficulty] = { total: 0, withGraphs: 0, percentage: 0 };
      }
    }

    // Step 5: Get user progress if userId provided
    if (userId && results.normalizedSubcategoryId) {
      try {
        const { getSubcategoryProgress } = await import('./progressUtils');
        const progress = await getSubcategoryProgress(userId, results.normalizedSubcategoryId);
        
        if (progress && progress.exists) {
          results.userProgress = {
            currentLevel: progress.level || 1,
            askedQuestions: progress.askedQuestions || [],
            missedQuestions: progress.missedQuestions || [],
            totalAsked: (progress.askedQuestions || []).length,
            totalMissed: (progress.missedQuestions || []).length
          };
          
          // Check how many asked questions had graphs
          const askedWithGraphs = smartQuizQuestions.filter(q => 
            progress.askedQuestions && progress.askedQuestions.includes(q.id) &&
            ((q.graphUrl && q.graphUrl.trim() !== '') || 
             (q.graphDescription && q.graphDescription.trim() !== '' && q.graphDescription !== 'null'))
          ).length;
          
          results.userProgress.askedWithGraphs = askedWithGraphs;
        }
      } catch (error) {
        console.warn('Error getting user progress:', error);
      }
    }

    // Step 6: Analyze the smart quiz questions
    const questionsWithGraphs = smartQuizQuestions.filter(q => 
      (q.graphUrl && q.graphUrl.trim() !== '') || 
      (q.graphDescription && q.graphDescription.trim() !== '' && q.graphDescription !== 'null')
    );
    results.smartQuizEligibleWithGraphs = questionsWithGraphs.length;
    
    console.log(`🖼️ Smart quiz questions with graphs: ${results.smartQuizEligibleWithGraphs}`);

    // Step 7: Get direct database samples for comparison (keep original logic)
    console.log(`🔍 Querying database directly for subcategory analysis...`);
    
    const questionsRef = collection(db, 'questions');
    const queryFormats = [
      results.normalizedSubcategoryId,
      subcategoryId,
      subcategoryId.charAt(0).toUpperCase() + subcategoryId.slice(1)
    ];

    let allDbQuestions = [];
    
    for (const format of queryFormats) {
      try {
        const q = query(questionsRef, where('subcategory', '==', format), limit(50));
        const snapshot = await getDocs(q);
        
        snapshot.docs.forEach(doc => {
          const questionData = { id: doc.id, ...doc.data() };
          if (!allDbQuestions.find(existing => existing.id === questionData.id)) {
            allDbQuestions.push(questionData);
          }
        });
        
        console.log(`📋 Found ${snapshot.docs.length} questions with subcategory format: "${format}"`);
      } catch (error) {
        console.warn(`⚠️ Error querying with format "${format}":`, error);
      }
    }

    results.totalQuestions = allDbQuestions.length;

    // Step 8: Analyze all database questions (keep original analysis)
    const dbQuestionsWithGraphs = allDbQuestions.filter(q => 
      (q.graphUrl && q.graphUrl.trim() !== '') || 
      (q.graphDescription && q.graphDescription.trim() !== '' && q.graphDescription !== 'null')
    );
    results.questionsWithGraphs = dbQuestionsWithGraphs.length;

    const dbQuestionsWithGeneralContext = allDbQuestions.filter(q => 
      !q.usageContext || q.usageContext === 'general'
    );
    results.questionsWithGeneralContext = dbQuestionsWithGeneralContext.length;

    const dbQuestionsWithGraphsAndGeneralContext = allDbQuestions.filter(q => 
      ((q.graphUrl && q.graphUrl.trim() !== '') || 
       (q.graphDescription && q.graphDescription.trim() !== '' && q.graphDescription !== 'null')) &&
      (!q.usageContext || q.usageContext === 'general')
    );
    results.questionsWithGraphsAndGeneralContext = dbQuestionsWithGraphsAndGeneralContext.length;

    // Step 9: Enhanced samples with difficulty info
    results.sampleQuestions.withGraphs = dbQuestionsWithGraphs.slice(0, 3).map(q => ({
      id: q.id,
      subcategory: q.subcategory,
      usageContext: q.usageContext,
      difficulty: q.difficulty,
      hasGraphUrl: !!(q.graphUrl && q.graphUrl.trim()),
      hasGraphDescription: !!(q.graphDescription && q.graphDescription.trim() && q.graphDescription !== 'null'),
      text: q.text?.substring(0, 100) + '...'
    }));

    results.sampleQuestions.eligibleForSmartQuiz = smartQuizQuestions.slice(0, 3).map(q => ({
      id: q.id,
      subcategory: q.subcategory,
      usageContext: q.usageContext,
      difficulty: q.difficulty,
      hasGraphUrl: !!(q.graphUrl && q.graphUrl.trim()),
      hasGraphDescription: !!(q.graphDescription && q.graphDescription.trim() && q.graphDescription !== 'null'),
      text: q.text?.substring(0, 100) + '...'
    }));

    results.sampleQuestions.eligibleWithGraphs = questionsWithGraphs.slice(0, 5).map(q => ({
      id: q.id,
      subcategory: q.subcategory,
      usageContext: q.usageContext,
      difficulty: q.difficulty,
      hasGraphUrl: !!(q.graphUrl && q.graphUrl.trim()),
      hasGraphDescription: !!(q.graphDescription && q.graphDescription.trim() && q.graphDescription !== 'null'),
      text: q.text?.substring(0, 100) + '...'
    }));

    // Step 10: Enhanced issue detection
    if (results.questionsWithGraphsAndGeneralContext > 0 && results.smartQuizEligibleWithGraphs === 0) {
      results.issues.push('❌ Database has graph questions with general context, but smart quiz system finds none');
    }

    if (results.totalQuestions !== results.smartQuizEligibleQuestions) {
      results.issues.push(`ℹ️ Database query finds ${results.totalQuestions} questions, smart quiz system finds ${results.smartQuizEligibleQuestions} (normalization working)`);
    }

    if (results.smartQuizEligibleWithGraphs > 0) {
      const percentage = Math.round((results.smartQuizEligibleWithGraphs / results.smartQuizEligibleQuestions) * 100);
      results.issues.push(`✅ ${percentage}% of smart quiz questions have graphs (${results.smartQuizEligibleWithGraphs}/${results.smartQuizEligibleQuestions})`);
      
      if (percentage < 20) {
        results.issues.push(`⚠️ Low percentage of graph questions - you might not see them often by chance`);
      }
    }

    // Check difficulty distribution
    Object.entries(difficultyTests).forEach(([difficulty, test]) => {
      if (test.total > 0) {
        results.issues.push(`📊 ${difficulty.toUpperCase()}: ${test.withGraphs}/${test.total} questions have graphs (${test.percentage}%)`);
      } else {
        results.issues.push(`⚠️ No ${difficulty} questions found - this might limit smart quiz options`);
      }
    });

    if (userId && results.userProgress) {
      const progress = results.userProgress;
      results.issues.push(`👤 User has seen ${progress.totalAsked} questions, ${progress.askedWithGraphs} had graphs`);
      
      if (progress.totalAsked > results.smartQuizEligibleQuestions * 0.8) {
        results.issues.push(`⚠️ User has seen most available questions - limited new options`);
      }
    }

    // Store difficulty test results
    results.difficultyTests = difficultyTests;

    if (results.issues.length === 0) {
      results.issues.push('✅ No obvious issues detected');
    }

    console.log(`📋 Enhanced Diagnostic Results:`, results);
    return results;

  } catch (error) {
    console.error('❌ Error during enhanced diagnostic:', error);
    results.issues.push(`❌ Diagnostic error: ${error.message}`);
    return results;
  }
};

/**
 * Run diagnostics for a specific subcategory and log results
 * @param {string} subcategoryId - The subcategory to investigate
 */
export const runGraphQuestionDiagnostic = async (subcategoryId) => {
  console.log(`🚀 Running graph question diagnostic for: ${subcategoryId}`);
  
  const results = await diagnoseGraphQuestionsInSmartQuizzes(subcategoryId);
  
  console.log('\n📊 DIAGNOSTIC RESULTS');
  console.log('='.repeat(50));
  console.log(`Subcategory: ${results.subcategoryId} (normalized: ${results.normalizedSubcategoryId})`);
  console.log(`Total DB Questions: ${results.totalQuestions}`);
  console.log(`Questions with Graphs: ${results.questionsWithGraphs}`);
  console.log(`Questions with General Context: ${results.questionsWithGeneralContext}`);
  console.log(`Questions with Graphs + General Context: ${results.questionsWithGraphsAndGeneralContext}`);
  console.log(`Smart Quiz Eligible Questions: ${results.smartQuizEligibleQuestions}`);
  console.log(`Smart Quiz Eligible with Graphs: ${results.smartQuizEligibleWithGraphs}`);
  
  console.log('\n🔍 ISSUES DETECTED:');
  results.issues.forEach(issue => console.log(issue));
  
  console.log('\n📝 SAMPLE QUESTIONS WITH GRAPHS:');
  results.sampleQuestions.withGraphs.forEach((q, i) => {
    console.log(`${i + 1}. ${q.id} | ${q.subcategory} | ${q.usageContext || 'undefined'} | Graph URL: ${q.hasGraphUrl} | Graph Desc: ${q.hasGraphDescription}`);
  });
  
  console.log('\n📝 SAMPLE SMART QUIZ ELIGIBLE WITH GRAPHS:');
  results.sampleQuestions.eligibleWithGraphs.forEach((q, i) => {
    console.log(`${i + 1}. ${q.id} | ${q.subcategory} | ${q.usageContext || 'undefined'} | Graph URL: ${q.hasGraphUrl} | Graph Desc: ${q.hasGraphDescription}`);
  });
  
  return results;
}; 