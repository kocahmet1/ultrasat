import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getFeatureFlags } from '../firebase/config.featureFlags';
import { useSubcategories } from '../contexts/SubcategoryContext';
import { useReview } from '../contexts/ReviewContext';
import { getUserSubcategoryAttemptHistory } from '../firebase/subcategoryServices';
import { getConceptsBySubcategory } from '../firebase/conceptServices';
import { db } from '../firebase/config';
import { addDoc, collection, getDocs, doc, getDoc } from 'firebase/firestore';
import DynamicQuizGenerator from '../components/DynamicQuizGenerator';
import { FaChevronDown, FaChartBar, FaLightbulb, FaBullseye, FaBookOpen, FaTasks, FaRocket, FaBolt, FaThLarge, FaClipboardList, FaCheck, FaExclamationTriangle, FaGraduationCap, FaCalculator, FaBook, FaPuzzlePiece, FaInfoCircle } from 'react-icons/fa';
import {
  getSubcategoryName,
  getSubcategoryCategory,
  getSubcategorySubject,
  getSubcategoryIdFromString,
  SUBCATEGORY_KEBAB_CASE
} from '../utils/subcategoryConstants';
import { normalizeSubcategoryName } from '../utils/subcategoryUtils';
import { getSubcategoryProgress, calculateEstimatedSATScore } from '../utils/progressUtils';
import FeatureHelpModal from '../components/FeatureHelpModal';
import '../styles/ProgressDashboard.new.css';
import '../styles/ConceptMastery.css';
import '../styles/LevelIndicator.css';

function ProgressDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const { 
    loading: subcategoriesLoading, 
    allSubcategories, 
    getSubcategoryNameById,
    mainCategories, 
  } = useSubcategories();
  
  const [loading, setLoading] = useState(true);
  const [conceptsBySubcategory, setConceptsBySubcategory] = useState({});
  const [userConceptMastery, setUserConceptMastery] = useState({});
  const [showDynamicQuizGenerator, setShowDynamicQuizGenerator] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [expandedCategories, setExpandedCategories] = useState({});
  const [expandedSubcategories, setExpandedSubcategories] = useState({});
  const [unmasteredCount, setUnmasteredCount] = useState(0);
  const [featureFlags, setFeatureFlags] = useState(null);
  const [detailedProgress, setDetailedProgress] = useState({});
  const [satScoreEstimate, setSatScoreEstimate] = useState(null);
  const [isSatCardExpanded, setIsSatCardExpanded] = useState(false);
  const [satCardHoverTimeout, setSatCardHoverTimeout] = useState(null);
  
  // Help modal state
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [noticeClosed, setNoticeClosed] = useState(false);

  const handleSatCardMouseEnter = () => {
    if (satCardHoverTimeout) {
      clearTimeout(satCardHoverTimeout);
    }
    const timeoutId = setTimeout(() => {
      setIsSatCardExpanded(true);
    }, 1000); // 1-second delay
    setSatCardHoverTimeout(timeoutId);
  };

  const handleSatCardMouseLeave = () => {
    if (satCardHoverTimeout) {
      clearTimeout(satCardHoverTimeout);
    }
    setIsSatCardExpanded(false);
  };

  const handleShowHelp = () => {
    setShowHelpModal(true);
  };

  const toggleCategory = (categoryKey) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryKey]: !prev[categoryKey]
    }));
  };
  
  const toggleSubcategory = (subcategoryId) => {
    setExpandedSubcategories(prev => ({
      ...prev,
      [subcategoryId]: !prev[subcategoryId]
    }));
  };

  // Fallback SAT calculation using detailed progress data
  const calculateSATScoreFromDetailedProgress = (detailedProgressData) => {
    console.log('Calculating SAT score from detailed progress data:', Object.keys(detailedProgressData).length, 'subcategories');
    
    // Show first subcategory's data structure
    const firstKey = Object.keys(detailedProgressData)[0];
    if (firstKey) {
      console.log('=== DETAILED PROGRESS FIRST SUBCATEGORY ===');
      console.log('Subcategory:', firstKey);
      console.log('Data structure:', detailedProgressData[firstKey]);
      console.log('Fields:', Object.keys(detailedProgressData[firstKey]));
      console.log('=== END DETAILED PROGRESS DATA ===');
    }
    
    // SAT score weights by subcategory (same as in progressUtils.js)
    const subcategoryWeights = {
      // Reading & Writing (400-800 points) - 10 subcategories
      1: 4.0, 2: 4.0, 3: 4.0, 4: 4.0, 5: 4.0, 6: 4.0, 7: 4.0, 8: 4.0, 9: 4.0, 10: 4.0,
      // Math (400-800 points) - 19 subcategories  
      11: 2.1, 12: 2.1, 13: 2.1, 14: 2.1, 15: 2.1, 16: 2.1, 17: 2.1, 18: 2.1, 19: 2.1,
      20: 2.1, 21: 2.1, 22: 2.1, 23: 2.1, 24: 2.1, 25: 2.1, 26: 2.1, 27: 2.1, 28: 2.1, 29: 2.1
    };

    const subjectMapping = {
      1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1, 7: 1, 8: 1, 9: 1, 10: 1, // R&W
      11: 2, 12: 2, 13: 2, 14: 2, 15: 2, 16: 2, 17: 2, 18: 2, 19: 2, 20: 2, // Math
      21: 2, 22: 2, 23: 2, 24: 2, 25: 2, 26: 2, 27: 2, 28: 2, 29: 2
    };

    let totalWeightedScore = 0;
    let totalWeight = 0;
    let readingWritingScore = 0;
    let mathScore = 0;
    let readingWritingWeight = 0;
    let mathWeight = 0;
    let subcategoriesWithData = 0;
    
    const breakdown = {
      readingWriting: { score: 0, subcategories: 0 },
      math: { score: 0, subcategories: 0 }
    };

    Object.entries(detailedProgressData).forEach(([subcategoryName, data]) => {
      console.log('Processing detailed progress for:', subcategoryName, {
        totalQuestionsAnswered: data.totalQuestionsAnswered,
        accuracyLast10: data.accuracyLast10,
        last10QuestionResultsCount: data.last10QuestionResultsCount
      });
      
      // Only include subcategories with attempted questions
      if (data.totalQuestionsAnswered > 0 || data.last10QuestionResultsCount > 0) {
        const subcategoryId = getSubcategoryIdFromString(subcategoryName);
        console.log('Subcategory ID for', subcategoryName, ':', subcategoryId);
        
        if (subcategoryId && subcategoryWeights[subcategoryId]) {
          const accuracy = data.accuracyLast10 || 0;
          const weight = subcategoryWeights[subcategoryId];
          const subject = subjectMapping[subcategoryId];
          
          console.log('Including in fallback calculation:', { subcategoryName, subcategoryId, accuracy, weight, subject });
          
          const scoreContribution = (accuracy / 100) * weight;
          
          totalWeightedScore += scoreContribution;
          totalWeight += weight;
          subcategoriesWithData++;
          
          if (subject === 1) { // Reading & Writing
            readingWritingScore += scoreContribution;
            readingWritingWeight += weight;
            breakdown.readingWriting.subcategories++;
          } else if (subject === 2) { // Math
            mathScore += scoreContribution;
            mathWeight += weight;
            breakdown.math.subcategories++;
          }
        }
      }
    });

    if (totalWeight === 0) {
      return { estimatedScore: 0, confidence: 0, breakdown, subcategoriesWithData: 0 };
    }

    // Calculate section scores (200-800 each, based on weighted accuracy)
    const readingWritingEstimate = readingWritingWeight > 0 
      ? Math.round(200 + (readingWritingScore / readingWritingWeight) * 600)
      : 200;
    const mathEstimate = mathWeight > 0 
      ? Math.round(200 + (mathScore / mathWeight) * 600)
      : 200;
    
    // Total SAT score (400-1600)
    const estimatedScore = readingWritingEstimate + mathEstimate;
    
    // Calculate confidence
    const totalSubcategories = 29;
    const dataCoverage = subcategoriesWithData / totalSubcategories;
    const sectionBalance = Math.min(breakdown.readingWriting.subcategories, breakdown.math.subcategories) / 
                          Math.max(breakdown.readingWriting.subcategories, breakdown.math.subcategories || 1);
    
    const confidence = Math.min(100, Math.round(
      (dataCoverage * 70) + (sectionBalance * 30)
    ));
    
    breakdown.readingWriting.score = readingWritingEstimate;
    breakdown.math.score = mathEstimate;
    
    console.log('Fallback calculation result:', {
      estimatedScore: Math.max(400, Math.min(1600, estimatedScore)),
      confidence,
      subcategoriesWithData
    });
    
    return {
      estimatedScore: Math.max(400, Math.min(1600, estimatedScore)),
      confidence,
      breakdown,
      subcategoriesWithData
    };
  };

  // Load feature flags when component mounts
  useEffect(() => {
    const loadFeatureFlags = async () => {
      try {
        const flags = await getFeatureFlags();
        setFeatureFlags(flags);
        console.log('Feature flags loaded:', flags);
      } catch (error) {
        console.error('Error loading feature flags:', error);
      }
    };
    
    loadFeatureFlags();
  }, []);

  const handleStartPractice = async (subcategoryId) => {
    if (!featureFlags) {
      setToastMessage("Configuration loading, please try again in a moment.");
      setShowToast(true);
      console.warn("ProgressDashboard: handleStartPractice called before feature flags loaded.");
      return;
    }

    if (!subcategoryId) {
      console.error("ProgressDashboard: Subcategory ID is missing for Start Practice.");
      // Potentially show a user-facing error
      return;
    }

    const subIdStr = subcategoryId.toString(); // Ensure subcategoryId is a string for object key access
    const progress = detailedProgress[subIdStr]; // Use detailedProgress

    // Use accuracyLast10 for accuracyRate and totalQuestionsAnswered for totalAttempted
    // detailedProgress[subIdStr] might be undefined if data hasn't loaded yet for that subcategory
    const accuracyRate = progress ? (progress.accuracyLast10 || 0) : 0;
    const totalAttempted = progress ? (progress.totalQuestionsAnswered || 0) : 0;

    if (featureFlags.smartQuizEnabled) {
      console.log(`Navigating to /smart-quiz-generator for ${subIdStr} with accuracyRate: ${accuracyRate}`);
      navigate('/smart-quiz-generator', {
        state: {
          subcategoryId: subIdStr,
          accuracyRate: accuracyRate, // This will be accuracy of last 10
        }
      });
    } else {
      console.log(`Navigating to /adaptive-quiz-generator for ${subIdStr} with stats:`, { accuracyRate, totalAttempted });
      navigate('/adaptive-quiz-generator', {
        state: {
          subcategoryId: subIdStr,
          autoDifficultyParams: {
            accuracyRate: accuracyRate, // This will be accuracy of last 10
            totalAttempted: totalAttempted
          }
        }
      });
    }
  };

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const justFinished = queryParams.get('justFinished');
    if (justFinished) {
      setToastMessage('Recommendations updated!');
      setShowToast(true);
      const timer = setTimeout(() => setShowToast(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [location]);
  
  useEffect(() => {
    const fetchConceptMastery = async () => {
      if (!currentUser || subcategoriesLoading || !allSubcategories.length) return;
      
      try {
        // Fetch user's progress for each subcategory
        const progressCollection = collection(db, 'users', currentUser.uid, 'progress');
        const progressSnapshot = await getDocs(progressCollection);
        
        const masteryData = {};
        let totalUnmastered = 0;
        
        progressSnapshot.forEach(doc => {
          const subcategoryId = doc.id;
          const progressData = doc.data();
          
          if (progressData.conceptMastery) {
            masteryData[subcategoryId] = progressData.conceptMastery;
            
            // Count unmastered concepts
            Object.values(progressData.conceptMastery).forEach(mastered => {
              if (!mastered) totalUnmastered++;
            });
          }
        });
        
        setUserConceptMastery(masteryData);
        setUnmasteredCount(totalUnmastered);
        

        
        // Fetch concepts for all subcategories
        const conceptsData = {};
        
        for (const subcategory of allSubcategories) {
          const concepts = await getConceptsBySubcategory(subcategory.id);
          if (concepts.length > 0) {
            conceptsData[subcategory.id] = concepts;
          }
        }
        
        setConceptsBySubcategory(conceptsData);
        
      } catch (error) {
        console.error("Error fetching concept mastery:", error);
      }
    };
    
    fetchConceptMastery();
  }, [currentUser, subcategoriesLoading, allSubcategories]);

  useEffect(() => {
    const fetchDetailedProgressForAllSubcategories = async () => {
      if (!currentUser || subcategoriesLoading || !allSubcategories || allSubcategories.length === 0) {
        console.log(`ProgressDashboard: Skipping detailed progress fetch. Conditions: currentUser: ${!!currentUser}, subcategoriesLoading: ${subcategoriesLoading}, allSubcategories: ${allSubcategories ? allSubcategories.length : 'undefined'}`);
        // If critical dependencies like user or subcategory context are not ready, dashboard remains in its current loading state.
        // If there are no subcategories to process, but other dependencies are ready, consider loading complete.
        if (currentUser && !subcategoriesLoading && (allSubcategories && allSubcategories.length === 0)) {
          console.log('ProgressDashboard: No subcategories defined, but other dependencies ready. Setting loading to false.');
          setLoading(false);
        }
        return;
      }

      console.log('ProgressDashboard: Starting fetch for detailed subcategory progress. Setting loading to true.');
      setLoading(true); // Indicate that this effect is now taking over the loading process.

      try {
        const progressPromises = allSubcategories.map(sub => 
          getSubcategoryProgress(currentUser.uid, sub.id)
        );
        const results = await Promise.all(progressPromises);
        
        const newDetailedProgress = {};
        results.forEach((prog, index) => {
          const subId = allSubcategories[index].id;
          if (prog && prog.exists) {
            newDetailedProgress[subId] = prog;
          } else {
            newDetailedProgress[subId] = {
              exists: false,
              level: 1,
              mastered: false, 
              askedQuestions: [],
              totalQuestionsAnswered: 0,
              accuracyLast10: 0,
              last10QuestionResultsCount: 0,
              last10QuestionResults: [],
              accuracy: 0, 
              totalQuestions: 0, 
              attempts: 0,
            };
          }
        });
        setDetailedProgress(newDetailedProgress);
        console.log("ProgressDashboard: Successfully fetched detailed subcategory progress for", Object.keys(newDetailedProgress).length, "items.");
        
        // Load SAT score estimate after detailed progress is available
        try {
          const scoreEstimate = await calculateEstimatedSATScore(currentUser.uid);
          console.log('SAT Score Estimate calculated:', scoreEstimate);
          
          // Fallback: If no data found, try calculating from detailedProgress directly
          console.log('Primary SAT calculation result:', scoreEstimate);
          if (scoreEstimate.subcategoriesWithData === 0) {
            console.log('No data found in primary SAT calculation, trying fallback with detailedProgress');
            console.log('DetailedProgress data available:', Object.keys(newDetailedProgress).length, 'subcategories');
            const fallbackEstimate = calculateSATScoreFromDetailedProgress(newDetailedProgress);
            console.log('Fallback SAT Score Estimate:', fallbackEstimate);
            setSatScoreEstimate(fallbackEstimate.subcategoriesWithData > 0 ? fallbackEstimate : scoreEstimate);
          } else {
            console.log('Using primary SAT calculation result');
            setSatScoreEstimate(scoreEstimate);
          }
        } catch (error) {
          console.error('Error calculating SAT score estimate:', error);
        }
      } catch (error) {
        console.error("ProgressDashboard: Error fetching detailed subcategory progress:", error);
        // Optionally, set an error state here to display a message to the user
      } finally {
        console.log('ProgressDashboard: Finished fetching detailed subcategory progress. Setting loading to false.');
        setLoading(false);
      }
    };

    fetchDetailedProgressForAllSubcategories();
  }, [currentUser, allSubcategories, subcategoriesLoading, setLoading]);

  const categorizedSubcategories = useMemo(() => {
    if (subcategoriesLoading || !allSubcategories || Object.keys(detailedProgress).length === 0) {
      return { "reading-writing": { title: "Reading & Writing", icon: <FaBookOpen/>, categories: {} }, "math": { title: "Math", icon: <FaCalculator/>, categories: {} } };
    }

    const result = {
      "reading-writing": { title: "Reading & Writing", icon: <FaBookOpen/>, categories: {} },
      "math": { title: "Math", icon: <FaCalculator/>, categories: {} }
    };

    console.log('Available subcategories:', allSubcategories.length);
    
    const mathKeywords = [
      'circles', 'volume', 'area', 'triangles', 'geometry',
      'linear-equations', 'linear-functions', 'systems', 'equations',
      'inequalities', 'nonlinear', 'expressions', 'algebra',
      'ratios', 'rates', 'proportions', 'percentages', 'statistics',
      'probability', 'data', 'inference', 'claims'
    ];
    
    const readingWritingKeywords = [
      'central-ideas', 'details', 'command-of-evidence', 'evidence',
      'cross-text', 'connections', 'words', 'context', 'rhetoric',
      'synthesis', 'transitions', 'boundaries', 'form', 'structure',
      'sense', 'reading', 'writing', 'text', 'rhetorical', 'inferences'
    ];
    
    allSubcategories.forEach(sub => {
      let isMathSubcategory = false;
      let subId = sub.id || '';
      
      const cleanId = subId.toLowerCase().trim();
      
      const mathIdentifiers = [
        'circles', 'area', 'volume', 'linear-equations', 'linear-functions',
        'linear-inequalities', 'nonlinear', 'triangles', 'angles'
      ];
      
      if (mathIdentifiers.some(term => cleanId.includes(term))) {
        isMathSubcategory = true;
      } else {
        if (mathKeywords.some(keyword => cleanId.includes(keyword))) {
          isMathSubcategory = true;
        }
        
        const numericId = parseInt(sub.numericId || sub.id, 10);
        if (!isNaN(numericId) && numericId >= 11) {
          isMathSubcategory = true;
        }
        
        const subjectName = getSubcategorySubject(sub.id) || '';
        if (subjectName.toLowerCase().includes('math')) {
          isMathSubcategory = true;
        }
      }
      
      const sectionKey = isMathSubcategory ? 'math' : 'reading-writing';
      
      const mainCategoryName = getSubcategoryCategory(sub.id) || 'Uncategorized';

      if (!result[sectionKey].categories[mainCategoryName]) {
        result[sectionKey].categories[mainCategoryName] = {
          title: mainCategoryName,
          subcategories: []
        };
      }

      const subDetailedProg = detailedProgress[sub.id] || {
        totalQuestionsAnswered: 0,
        accuracyLast10: 0,
        last10QuestionResultsCount: 0,
        accuracy: 0, 
        totalQuestions: 0 
      };

      result[sectionKey].categories[mainCategoryName].subcategories.push({
        id: sub.id,
        name: sub.name,
        stats: {
          totalQuestionsAnswered: subDetailedProg.totalQuestionsAnswered,
          accuracyLast10: subDetailedProg.accuracyLast10,
          last10QuestionResultsCount: subDetailedProg.last10QuestionResultsCount,
        }
      });
    });

    for (const section in result) {
      const sortedCategories = {};
      Object.keys(result[section].categories).sort().forEach(catKey => {
        sortedCategories[catKey] = result[section].categories[catKey];
        sortedCategories[catKey].subcategories.sort((a, b) => a.name.localeCompare(b.name));
      });
      result[section].categories = sortedCategories;
    }
    return result;
  }, [allSubcategories, subcategoriesLoading, detailedProgress]);

  const getPerformanceCategoryForLast10 = (accuracyLast10, last10QuestionResultsCount) => {
    if (last10QuestionResultsCount === 0) return 'weak'; 
    if (accuracyLast10 >= 80) return 'strong'; 
    if (accuracyLast10 >= 50) return 'moderate'; 
    return 'weak'; 
  };

  const { totalQuestionsAnswered, overallAccuracy, subcategoriesCovered } = useMemo(() => {
    let totalQ = 0;
    let totalC = 0;
    const coveredIds = new Set();
    Object.values(detailedProgress).forEach(stat => {
      totalQ += stat.totalQuestionsAnswered;
      totalC += stat.totalQuestionsAnswered * (stat.accuracyLast10 / 100);
      if (stat.totalQuestionsAnswered > 0) {
        coveredIds.add(stat.id); 
      }
    });
    return {
      totalQuestionsAnswered: totalQ,
      overallAccuracy: totalQ > 0 ? ((totalC / totalQ) * 100).toFixed(0) : 0,
      subcategoriesCovered: coveredIds.size
    };
  }, [detailedProgress]);

  console.log('ProgressDashboard: Rendering. Component loading:', loading, 'Subcategories loading:', subcategoriesLoading);
  if (loading || subcategoriesLoading) {
    return <div className="pd-loading-placeholder">Loading your progress dashboard...</div>;
  }

  return (
    <div className="progress-dashboard-page">
      <div className="pd-header">
        <h1>
          Your Performance Progress
          <button 
            className="help-icon-button"
            onClick={handleShowHelp}
            title="Learn how to use performance tracking"
          >
            <FaInfoCircle />
          </button>
        </h1>
      </div>

      {/* SAT Score Estimate Display */}
      {console.log('Rendering SAT component check:', { satScoreEstimate, hasData: satScoreEstimate?.subcategoriesWithData > 0 })}
      {satScoreEstimate && (
        <div 
          className={`pd-card sat-score-estimate-card ${isSatCardExpanded ? 'expanded' : 'collapsed'}`}
          onMouseEnter={handleSatCardMouseEnter}
          onMouseLeave={handleSatCardMouseLeave}
        >
          <div className="sat-score-header">
            <div className="sat-score-title">
              <FaGraduationCap className="sat-icon" />
              <h2>Estimated Digital SAT Score</h2>
            </div>
            <div className="confidence-badge">
              {satScoreEstimate.confidence}% confidence
            </div>
          </div>

          <div className="sat-score-collapsed-view">
            <span className="collapsed-title">Estimated Digital SAT Score</span>
            <span className="collapsed-score">{satScoreEstimate.subcategoriesWithData > 0 ? satScoreEstimate.estimatedScore : '---'}<span className="collapsed-max">/1600</span></span>{satScoreEstimate.subcategoriesWithData > 0 && (
  <span className="collapsed-notice">(Based on {satScoreEstimate.subcategoriesWithData} subcategories with practice data)</span>
)}
            <span className="collapsed-confidence">{satScoreEstimate.confidence}% confidence</span>
          </div>
          
          {/* Sleek horizontal notice for when there's no SAT data */}
          {!satScoreEstimate.subcategoriesWithData && !noticeClosed && (
            <div className="sat-score-horizontal-notice always-visible">
              <button className="sat-notice-close-btn" onClick={() => setNoticeClosed(true)} title="Close">×</button>
              Complete an <Link to="/practice-exams" className="notice-link">SAT Practice test</Link> or a <Link to="/practice-exams" className="notice-link">Predictive Test</Link> to see your estimated digital SAT score below
            </div>
          )}
          <div className="sat-score-display">
            <div className="score-value">
              {satScoreEstimate.subcategoriesWithData > 0 ? satScoreEstimate.estimatedScore : '---'}
            </div>
            <div className="score-max">/ 1600</div>
          </div>
          
          <div className="sat-progress-bar">
            <div 
              className="sat-progress-fill" 
              style={{ 
                width: satScoreEstimate.subcategoriesWithData > 0 ? `${((satScoreEstimate.estimatedScore - 400) / 1200) * 100}%` : '0%',
                backgroundColor: satScoreEstimate.estimatedScore >= 1200 ? '#34A853' : 
                               satScoreEstimate.estimatedScore >= 1000 ? '#FBBC05' : '#EA4335'
              }}
            ></div>
          </div>
          
          <div className="sat-breakdown">
            <div className="section-score">
              <span className="section-name">Reading & Writing:</span>
              <span className="section-value">{satScoreEstimate.breakdown?.readingWriting?.score || 400}</span>
            </div>
            <div className="section-score">
              <span className="section-name">Math:</span>
              <span className="section-value">{satScoreEstimate.breakdown?.math?.score || 400}</span>
            </div>
          </div>
          
          <div className="sat-stats-integrated">
            <div className="sat-stat-item">
              <div className="sat-stat-value">{totalQuestionsAnswered}</div>
              <div className="sat-stat-label">Total Questions Answered</div>
            </div>
            <div className="sat-stat-item">
              <div className="sat-stat-value">{overallAccuracy}%</div>
              <div className="sat-stat-label">Overall Accuracy</div>
            </div>
            <div className="sat-stat-item">
              <div className="sat-stat-value">{subcategoriesCovered} / {allSubcategories?.length || 0}</div>
              <div className="sat-stat-label">Subcategories Covered</div>
            </div>
          </div>
          
          <div className="sat-footer">
            <small>
              {satScoreEstimate.subcategoriesWithData > 0 
                ? `Based on ${satScoreEstimate.subcategoriesWithData} subcategories with practice data`
                : 'Complete some practice questions to see your estimated SAT score!'}
            </small>
          </div>
          
        </div>
      )}

    <p className="pd-page-subtitle">Track your development and identify areas for improvement.</p>

    {/* Main progress sections */}
    <div className="pd-split-view">
      <div className="pd-split-column">
        <div className="pd-section-title">
          <FaBookOpen /> Reading & Writing
        </div>
        
        <div className="pd-subcategories-list">
          {Object.values(categorizedSubcategories["reading-writing"].categories || {}).flatMap(category => 
            category.subcategories || []
          ).map(sub => (
            <div key={sub.id} className="pd-subcategory-item">
              <div className="pd-subcategory-info">
                {/* Minimal view (always visible) */}
                <div className="pd-minimal-view">
                  <div className="pd-title-row">
                    <div className="pd-subcategory-header">
                      <button
  className={`subcategory-name-btn rw-subcategory-btn`}
  onClick={() => navigate(`/subcategory-progress/${sub.id}`)}
  type="button"
>
  {sub.name}
</button>
                    </div>
                    <div className="single-level-indicator">
                      <div className="current-level-box">
                        Level {detailedProgress[sub.id]?.level || 1}
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress bar (always visible) */}
                  <div className="subcategory-progress-container">
                    <div className="progress-bar-container">
                      <div className="progress-bar-background">
                        <div 
                          className={`progress-bar-fill ${ 
                            getPerformanceCategoryForLast10(sub.stats?.accuracyLast10 || 0, sub.stats?.last10QuestionResultsCount || 0)
                          }`}
                          style={{ width: `${Math.min(100, ((sub.stats && sub.stats.totalQuestionsAnswered || 0) / 10) * 100)}%` }}
                        ></div>
                      </div>
                      <div className="progress-status">
                        <span>
                          {Math.min(10, (sub.stats && sub.stats.totalQuestionsAnswered) || 0)}/10
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Expanded view (visible on hover) */}
                <div className="pd-expanded-view">
                  {/* Level up message */}
                  <div className="level-up-message">
                    {10 - Math.min(10, (sub.stats && sub.stats.totalQuestionsAnswered) || 0)} more questions left to cover this topic. Take a <span className="emphasis">Dynamic Quiz</span> to level up and fully master the topic.
                  </div>
                  
                  {/* Complete level indicators */}
                  <div className="level-indicator-container">
                    <div className={`level-box ${detailedProgress[sub.id]?.level === 1 ? 'active' : ''}`}>Level 1</div>
                    <div className={`level-box ${detailedProgress[sub.id]?.level === 2 ? 'active' : ''}`}>Level 2</div>
                    <div className={`level-box ${detailedProgress[sub.id]?.level === 3 ? 'active' : ''}`}>Level 3</div>
                  </div>
                  
                  {/* Stats information */}
                  {sub.stats && (sub.stats.totalQuestionsAnswered > 0 || sub.stats.last10QuestionResultsCount > 0) ? (
                    <div className="pd-subcategory-stats">
                      <p className={`accuracy-display ${getPerformanceCategoryForLast10(sub.stats.accuracyLast10 || 0, sub.stats.last10QuestionResultsCount || 0)}`}>
                        <FaBullseye /> 
                        Accuracy (Last 10 questions): {sub.stats.accuracyLast10 !== undefined ? `${sub.stats.accuracyLast10.toFixed(0)}%` : 'N/A'}
                      </p>
                      <p className="total-answered-display">
                        Total # of questions answered: {sub.stats.totalQuestionsAnswered || 0}
                      </p>
                    </div>
                  ) : (
                    <p className="accuracy-display">No attempts yet</p>
                  )}
                </div>
                
                {conceptsBySubcategory[sub.id] && conceptsBySubcategory[sub.id].length > 0 && (
                  <div className="concept-mastery-container">
                    <h5>Concept Mastery</h5>
                    <div className="concept-list">
                      {conceptsBySubcategory[sub.id].map(concept => {
                        const isMastered = userConceptMastery[sub.id] && 
                          userConceptMastery[sub.id][concept.id] === true;
                        return (
                          <div key={concept.id} className="concept-item">
                            <div className="concept-name">{concept.name}</div>
                            <div className={`concept-status ${isMastered ? 'mastered' : 'not-mastered'}`}>
                              {isMastered ? 
                                <><FaCheck /> Mastered</> : 
                                <><FaExclamationTriangle /> Practice Needed</>
                              }
                            </div>
                            {!isMastered && (
                              <button 
                                className="concept-practice-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/concept/${concept.id}`);
                                }}
                              >
                                Practice This Concept
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              <div className="pd-subcategory-actions">
                {/* Only Practice button visible in minimal view */}
                <button 
                  className="action-button practice minimal-action" 
                  onClick={() => handleStartPractice(sub.id)}
                  disabled={!sub.id} 
                >
                  <FaBolt /> Practice
                </button>
                
                {/* Learn button only visible on hover/expand */}
                <button 
                  className="action-button learn expanded-action" 
                  onClick={() => navigate(`/lessons/${sub.id}`)}
                >
                  <FaBook /> Learn
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
        
        <div className="pd-split-column">
          <div className="pd-section-title">
            <FaCalculator /> Math
          </div>
          
          <div className="pd-subcategories-list">
            {Object.values(categorizedSubcategories["math"].categories || {}).flatMap(category => 
              category.subcategories || []
            ).map(sub => (
              <div key={sub.id} className="pd-subcategory-item">
                <div className="pd-subcategory-info">
                  {/* Minimal view (always visible) */}
                  <div className="pd-minimal-view">
                    <div className="pd-title-row">
                      <div className="pd-subcategory-header">
                        <button
                          className={`subcategory-name-btn math-subcategory-btn`}
                          onClick={() => navigate(`/subcategory-progress/${sub.id}`)}
                          type="button"
                        >
                          {sub.name}
                        </button>
                      </div>
                      <div className="single-level-indicator">
                        <div className="current-level-box">
                          Level {detailedProgress[sub.id]?.level || 1}
                        </div>
                      </div>
                    </div>
                    
                    {/* Progress bar (always visible) */}
                    <div className="subcategory-progress-container">
                      <div className="progress-bar-container">
                        <div className="progress-bar-background">
                          <div 
                            className={`progress-bar-fill ${ 
                              getPerformanceCategoryForLast10(sub.stats?.accuracyLast10 || 0, sub.stats?.last10QuestionResultsCount || 0)
                            }`}
                            style={{ width: `${Math.min(100, ((sub.stats && sub.stats.totalQuestionsAnswered || 0) / 10) * 100)}%` }}
                          ></div>
                        </div>
                        <div className="progress-status">
                          <span>
                            {Math.min(10, (sub.stats && sub.stats.totalQuestionsAnswered) || 0)}/10
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Expanded view (visible on hover) */}
                  <div className="pd-expanded-view">
                    {/* Level up message */}
                    <div className="level-up-message">
                      {10 - Math.min(10, (sub.stats && sub.stats.totalQuestionsAnswered) || 0)} more questions left to cover this topic. Take a <span className="emphasis">Dynamic Quiz</span> to level up and fully master the topic.
                    </div>
                    
                    {/* Complete level indicators */}
                    <div className="level-indicator-container">
                      <div className={`level-box ${detailedProgress[sub.id]?.level === 1 ? 'active' : ''}`}>Level 1</div>
                      <div className={`level-box ${detailedProgress[sub.id]?.level === 2 ? 'active' : ''}`}>Level 2</div>
                      <div className={`level-box ${detailedProgress[sub.id]?.level === 3 ? 'active' : ''}`}>Level 3</div>
                    </div>
                    
                    {/* Stats information */}
                    {sub.stats && (sub.stats.totalQuestionsAnswered > 0 || sub.stats.last10QuestionResultsCount > 0) ? (
                      <div className="pd-subcategory-stats">
                        <p className={`accuracy-display ${getPerformanceCategoryForLast10(sub.stats.accuracyLast10 || 0, sub.stats.last10QuestionResultsCount || 0)}`}>
                          <FaBullseye /> 
                          Accuracy (Last 10 questions): {sub.stats.accuracyLast10 !== undefined ? `${sub.stats.accuracyLast10.toFixed(0)}%` : 'N/A'}
                        </p>
                        <p className="total-answered-display">
                          Total # of questions answered: {sub.stats.totalQuestionsAnswered || 0}
                        </p>
                      </div>
                    ) : (
                      <p className="accuracy-display">No attempts yet</p>
                    )}
                  </div>
                  
                  {conceptsBySubcategory[sub.id] && conceptsBySubcategory[sub.id].length > 0 && (
                    <div className="concept-mastery-container">
                      <h5>Concept Mastery</h5>
                      <div className="concept-list">
                        {conceptsBySubcategory[sub.id].map(concept => {
                          const isMastered = userConceptMastery[sub.id] && 
                            userConceptMastery[sub.id][concept.id] === true;
                          return (
                            <div key={concept.id} className="concept-item">
                              <div className="concept-name">{concept.name}</div>
                              <div className={`concept-status ${isMastered ? 'mastered' : 'not-mastered'}`}>
                                {isMastered ? 
                                  <><FaCheck /> Mastered</> : 
                                  <><FaExclamationTriangle /> Practice Needed</>
                                }
                              </div>
                              {!isMastered && (
                                <button 
                                  className="concept-practice-btn"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/concept/${concept.id}`);
                                  }}
                                >
                                  Practice This Concept
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
                <div className="pd-subcategory-actions">
                  {/* Only Practice button visible in minimal view */}
                  <button 
                    className="action-button practice minimal-action" 
                    onClick={() => handleStartPractice(sub.id)}
                    disabled={!sub.id} 
                  >
                    <FaBolt /> Practice
                  </button>
                  
                  {/* Learn button only visible on hover/expand */}
                  <button 
                    className="action-button learn expanded-action" 
                    onClick={() => navigate(`/lessons/${sub.id}`)}
                  >
                    <FaBook /> Learn
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="pd-card pd-practice-hub">
        <h3>
          <FaRocket /> Your Learning Path
          {unmasteredCount > 0 && (
            <span className="unmastered-badge" title={`${unmasteredCount} concept${unmasteredCount !== 1 ? 's' : ''} need practice`}>
              {unmasteredCount}
            </span>
          )}
        </h3>
        <div className="unified-track-info">
          <p>
            <FaGraduationCap className="info-icon" /> Our adaptive learning system identifies concepts you need to improve and
            creates a personalized learning path for you. Complete adaptive quizzes to get concept recommendations.
          </p>
        </div>
        <div className="actions">
          {/* Buttons removed per user request */}
        </div>
      </div>
      
      {showDynamicQuizGenerator && (
        <div className="modal-overlay">
          <div className="modal-content pd-modal-dynamic-quiz">
            <button 
              className="modal-close-button"
              onClick={() => setShowDynamicQuizGenerator(false)}
            >
              &times;
            </button>
            <DynamicQuizGenerator 
              onQuizGenerated={(quizId) => {
                setShowDynamicQuizGenerator(false);
                navigate(`/adaptive-quiz/${quizId}`);
              }} 
            />
          </div>
        </div>
      )}
      
      {showToast && (
        <div className={`toast-notification ${toastMessage.includes('Error') ? 'error' : 'success'}`}>
          <div className="toast-content">
            <span>{toastMessage}</span>
            <button className="toast-close" onClick={() => setShowToast(false)}>×</button>
          </div>
        </div>
      )}
      
      {/* Feature Help Modal */}
      <FeatureHelpModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
        feature="progress"
      />
    </div>
  );
}

export default ProgressDashboard;
