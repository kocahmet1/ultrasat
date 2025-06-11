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
import { FaChevronDown, FaChartBar, FaLightbulb, FaBullseye, FaBookOpen, FaTasks, FaRocket, FaBolt, FaThLarge, FaClipboardList, FaCheck, FaExclamationTriangle, FaGraduationCap, FaCalculator, FaBook, FaPuzzlePiece } from 'react-icons/fa';
import {
  getSubcategoryName,
  getSubcategoryCategory,
  getSubcategorySubject,
  getSubcategoryIdFromString,
  SUBCATEGORY_KEBAB_CASE
} from '../utils/subcategoryConstants';
import { normalizeSubcategoryName } from '../utils/subcategoryUtils';
import { getSubcategoryProgress } from '../utils/progressUtils';
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
        <h1>Performance Progress</h1>
        <p className="subtitle">Track your development and identify areas for improvement.</p>
      </div>

      <div className="pd-section-grid">
        <div className="pd-card pd-stat-card">
          <div className="stat-value">{totalQuestionsAnswered}</div>
          <div className="stat-label">Total Questions Answered</div>
        </div>
        <div className="pd-card pd-stat-card">
          <div className="stat-value">{overallAccuracy}%</div>
          <div className="stat-label">Overall Accuracy</div>
        </div>
        <div className="pd-card pd-stat-card">
          <div className="stat-value">{subcategoriesCovered} / {allSubcategories?.length || 0}</div>
          <div className="stat-label">Subcategories Covered</div>
        </div>
      </div>

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
                        <Link to={`/subcategory-progress/${sub.id}`} className="text-lg font-semibold text-gray-700 hover:text-blue-600 transition-colors duration-200">
                          {sub.name}
                        </Link>
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
                        <Link to={`/subcategory-progress/${sub.id}`} className="text-lg font-semibold text-gray-700 hover:text-blue-600 transition-colors duration-200">
                          {sub.name}
                        </Link>
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
          <button 
            className="pd-button primary"
            onClick={async () => {
              const weakestSubcategory = Object.entries(detailedProgress)
                .filter(([_, stat]) => stat.totalQuestionsAnswered > 0)
                .sort((a, b) => a[1].accuracyLast10 - b[1].accuracyLast10)[0];
              if (weakestSubcategory) {
                handleStartPractice(weakestSubcategory[0]);
              } else {
                alert("No prior attempts found. Please select a specific skill to practice first or try a custom practice.");
              }
            }}
          >
            <FaBolt /> Adaptive Quiz (Weakest Skill)
          </button>
          <button 
            className="pd-button secondary"
            onClick={() => setShowDynamicQuizGenerator(true)}
          >
            <FaThLarge /> Custom Practice
          </button>
          <button 
            className="pd-button secondary"
            onClick={() => navigate('/practice-exams')}
          >
            <FaClipboardList /> Full Practice Exam
          </button>
          <button 
            className="pd-button secondary"
            onClick={() => navigate('/word-bank')}
          >
            <FaBook /> Vocabulary Bank
          </button>
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
    </div>
  );
}

export default ProgressDashboard;
