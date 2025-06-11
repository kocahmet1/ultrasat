import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSubcategories } from '../contexts/SubcategoryContext';
import { db } from '../firebase/config';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc,
  doc,
  getDoc,
  serverTimestamp,
  orderBy,
  limit
} from 'firebase/firestore';
import '../styles/DynamicQuizGenerator.css';

function DynamicQuizGenerator({ onQuizGenerated }) {
  const { currentUser } = useAuth();
  const { 
    subcategoryStats, 
    getCategorizedSubcategories,
    getSubcategoryNameById,
    allSubcategories 
  } = useSubcategories();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [quizType, setQuizType] = useState('weak');
  const [selectedSubcategories, setSelectedSubcategories] = useState([]);
  const [questionCount, setQuestionCount] = useState(10);
  const [difficultyLevel, setDifficultyLevel] = useState('adaptive');
  const [generatingStatus, setGeneratingStatus] = useState('');
  
  // Get categorized subcategories (memoized to prevent re-renders)
  const { weak, moderate, strong } = useMemo(() => {
    return getCategorizedSubcategories();
  }, [subcategoryStats]);
  
  // Update selected subcategories based on quiz type
  useEffect(() => {
    if (quizType === 'weak' && weak.length > 0) {
      setSelectedSubcategories(weak.slice(0, 3).map(subcategory => subcategory.subcategory));
    } else if (quizType === 'moderate' && moderate.length > 0) {
      setSelectedSubcategories(moderate.slice(0, 3).map(subcategory => subcategory.subcategory));
    } else if (quizType === 'strong' && strong.length > 0) {
      setSelectedSubcategories(strong.slice(0, 3).map(subcategory => subcategory.subcategory));
    } else {
      setSelectedSubcategories([]);
    }
  }, [quizType, weak, moderate, strong]);
  
  // Generate a personalized quiz
  const generateQuiz = async () => {
    if (!currentUser) {
      console.error('User not logged in');
      return;
    }
    
    if (selectedSubcategories.length === 0) {
      alert('Please select at least one subcategory for your quiz');
      return;
    }
    
    setLoading(true);
    setGeneratingStatus('Finding questions for your personalized quiz...');
    
    try {
      // Step 1: Fetch questions matching the selected subcategories
      const selectedQuestions = await fetchQuestionsBySubcategories(selectedSubcategories);
      
      if (selectedQuestions.length === 0) {
        alert('No questions found for the selected subcategories. Please try different subcategories.');
        setLoading(false);
        return;
      }
      
      // Step 2: Apply adaptive difficulty if selected
      let finalQuestions;
      if (difficultyLevel === 'adaptive') {
        finalQuestions = applyAdaptiveDifficulty(selectedQuestions, selectedSubcategories);
      } else {
        // Filter by fixed difficulty level (1-3)
        const difficultyNum = parseInt(difficultyLevel);
        finalQuestions = selectedQuestions.filter(q => q.difficulty === difficultyNum);
        
        // If not enough questions, add some from adjacent difficulty levels
        if (finalQuestions.length < questionCount) {
          const additionalQuestions = selectedQuestions.filter(q => 
            q.difficulty === difficultyNum - 1 || q.difficulty === difficultyNum + 1
          );
          finalQuestions = [...finalQuestions, ...additionalQuestions];
        }
      }
      
      // Step 3: Limit to requested question count and randomize the order
      finalQuestions = shuffleArray(finalQuestions).slice(0, questionCount);
      
      if (finalQuestions.length === 0) {
        alert('Not enough questions available for the selected criteria. Please try different settings.');
        setLoading(false);
        return;
      }
      
      // Step 4: Create a new targetedQuiz document in Firestore
      setGeneratingStatus('Creating your personalized quiz...');
      
      // Determine quiz title and description
      let quizTitle, quizDescription;
      
      if (selectedSubcategories.length === 1) {
        // Single subcategory quiz
        quizTitle = `${getSubcategoryNameById(selectedSubcategories[0])} Practice`;
        quizDescription = `A personalized quiz focusing on your ${quizType} subcategory: ${getSubcategoryNameById(selectedSubcategories[0])}`;
      } else {
        // Multi-subcategory quiz
        if (quizType === 'weak') {
          quizTitle = 'Weak Areas Practice';
          quizDescription = 'A personalized quiz focusing on your weak subcategory areas';
        } else if (quizType === 'moderate') {
          quizTitle = 'Moderate Subcategories Practice';
          quizDescription = 'A personalized quiz focusing on subcategories you have moderate proficiency in';
        } else if (quizType === 'strong') {
          quizTitle = 'Mastery Challenge';
          quizDescription = 'A challenging quiz focusing on your strongest subcategories';
        } else {
          quizTitle = 'Custom Subcategories Practice';
          quizDescription = 'A personalized quiz based on your selected subcategories';
        }
      }
      
      // Calculate average difficulty
      const avgDifficulty = finalQuestions.reduce((sum, q) => sum + (q.difficulty || 3), 0) / finalQuestions.length;
      
      // Create the quiz document
      const quizData = {
        title: quizTitle,
        description: quizDescription,
        subcategories: selectedSubcategories,
        questionIds: finalQuestions.map(q => q.id),
        difficulty: Math.round(avgDifficulty),
        estimatedTime: Math.ceil(finalQuestions.length * 1.5), // Estimate ~ 1.5 min per question
        isPersonalized: true,
        userId: currentUser.uid,
        quizType,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const quizRef = await addDoc(collection(db, 'targetedQuizzes'), quizData);
      
      setGeneratingStatus('Quiz created successfully!');
      
      // Either navigate to the quiz or call the callback
      if (onQuizGenerated) {
        onQuizGenerated(quizRef.id);
      } else {
        navigate(`/adaptive-quiz/${quizRef.id}`);
      }
    } catch (error) {
      console.error('Error generating quiz:', error);
      alert('Failed to generate quiz. Please try again.');
    } finally {
      setLoading(false);
      setGeneratingStatus('');
    }
  };
  
  // Fetch questions by subcategories
  const fetchQuestionsBySubcategories = async (subcategoryIds) => {
    if (!subcategoryIds || subcategoryIds.length === 0) return [];
    
    const questions = [];
    const seenQuestionIds = new Set(); // To avoid duplicate questions
    
    // Get recently attempted questions to avoid repeating them
    const recentlyAttemptedIds = await getRecentlyAttemptedQuestionIds();
    
    // For each subcategory, get matching questions
    for (const subcategoryId of subcategoryIds) {
      try {
        const q = query(
          collection(db, 'questions'),
          where('subcategory', '==', subcategoryId)
        );
        
        const querySnapshot = await getDocs(q);
        
        // Filter out duplicates and recently attempted questions
        querySnapshot.forEach(doc => {
          if (!seenQuestionIds.has(doc.id) && !recentlyAttemptedIds.has(doc.id)) {
            seenQuestionIds.add(doc.id);
            questions.push({
              id: doc.id,
              ...doc.data()
            });
          }
        });
      } catch (error) {
        console.error(`Error fetching questions for subcategory ${subcategoryId}:`, error);
      }
    }
    
    return questions;
  };
  
  // Get IDs of recently attempted questions
  const getRecentlyAttemptedQuestionIds = async () => {
    if (!currentUser) return new Set();
    
    try {
      // Get the last 50 responses from this user to avoid repetition
      const q = query(
        collection(db, 'userProgress'),
        where('userId', '==', currentUser.uid),
        orderBy('attemptedAt', 'desc'),
        limit(50)
      );
      
      const querySnapshot = await getDocs(q);
      const questionIds = new Set();
      
      querySnapshot.forEach(doc => {
        const response = doc.data();
        if (response.questionId) {
          questionIds.add(response.questionId);
        }
      });
      
      return questionIds;
    } catch (error) {
      console.error('Error fetching recently attempted questions:', error);
      return new Set();
    }
  };
  
  // Apply adaptive difficulty based on user's subcategory proficiency
  const applyAdaptiveDifficulty = (questions, subcategoryIds) => {
    // Get user's accuracy rates for the selected subcategories
    const subcategoryAccuracies = {};
    
    subcategoryIds.forEach(subcategoryId => {
      const stat = subcategoryStats.find(s => s.subcategory === subcategoryId);
      if (stat) {
        subcategoryAccuracies[subcategoryId] = stat.accuracyRate;
      } else {
        subcategoryAccuracies[subcategoryId] = 50; // Default 50% accuracy if no data
      }
    });
    
    // Function to determine appropriate difficulty level based on accuracy
    const getDifficultyTarget = (accuracy) => {
      if (accuracy < 50) return 1; // Easier questions for very low accuracy
      if (accuracy < 80) return 2; // Medium difficulty for moderate accuracy
      return 3; // Harder questions for high accuracy
    };
    
    // Group questions by subcategory
    const questionsBySubcategory = {};
    
    questions.forEach(question => {
      const subcategory = question.subcategory;
      if (subcategoryIds.includes(subcategory)) {
        if (!questionsBySubcategory[subcategory]) {
          questionsBySubcategory[subcategory] = [];
        }
        questionsBySubcategory[subcategory].push(question);
      }
    });
    
    // Select questions based on user's proficiency in each subcategory
    let adaptiveQuestions = [];
    
    subcategoryIds.forEach(subcategoryId => {
      const subcategoryQuestions = questionsBySubcategory[subcategoryId] || [];
      const accuracy = subcategoryAccuracies[subcategoryId];
      const targetDifficulty = getDifficultyTarget(accuracy);
      
      // Find questions matching the target difficulty
      let matchingQuestions = subcategoryQuestions.filter(q => q.difficulty === targetDifficulty);
      
      // If not enough questions at target difficulty, add some from adjacent difficulties
      if (matchingQuestions.length < 3) {
        const adjacentQuestions = subcategoryQuestions.filter(q => {
          // For level 1, include level 2; for level 3, include level 2; for level 2, include levels 1 and 3
          if (targetDifficulty === 1) return q.difficulty === 2;
          if (targetDifficulty === 3) return q.difficulty === 2;
          return q.difficulty === 1 || q.difficulty === 3;
        });
        
        matchingQuestions = [...matchingQuestions, ...adjacentQuestions];
      }
      
      // Add to our collection
      adaptiveQuestions = [...adaptiveQuestions, ...matchingQuestions];
    });
    
    return adaptiveQuestions;
  };
  
  // Shuffle array (Fisher-Yates algorithm)
  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };
  
  return (
    <div className="dynamic-quiz-generator">
      <h2>Generate a Personalized Quiz</h2>
      
      <div className="quiz-type-selector">
        <h3>Quiz Type</h3>
        <div className="quiz-type-options">
          <button 
            className={`quiz-type-button ${quizType === 'weak' ? 'active' : ''}`}
            onClick={() => setQuizType('weak')}
          >
            Weak Areas
          </button>
          <button 
            className={`quiz-type-button ${quizType === 'moderate' ? 'active' : ''}`}
            onClick={() => setQuizType('moderate')}
          >
            Moderate Areas
          </button>
          <button 
            className={`quiz-type-button ${quizType === 'strong' ? 'active' : ''}`}
            onClick={() => setQuizType('strong')}
          >
            Strong Areas
          </button>
          <button 
            className={`quiz-type-button ${quizType === 'custom' ? 'active' : ''}`}
            onClick={() => setQuizType('custom')}
          >
            Custom
          </button>
        </div>
      </div>
      
      {quizType === 'custom' && (
        <div className="subcategory-selector">
          <h3>Select Subcategories</h3>
          <p>Choose the specific subcategories you want to practice.</p>
          
          {allSubcategories.map(subcategory => (
            <div 
              key={subcategory.id} 
              className={`subcategory-item ${selectedSubcategories.includes(subcategory.id) ? 'selected' : ''}`}
              onClick={() => {
                if (selectedSubcategories.includes(subcategory.id)) {
                  setSelectedSubcategories(prev => prev.filter(id => id !== subcategory.id));
                } else {
                  setSelectedSubcategories(prev => [...prev, subcategory.id]);
                }
              }}
            >
              {getSubcategoryNameById(subcategory.id)}
            </div>
          ))}
        </div>
      )}
      
      <div className="generator-section">
        <h3>Selected Subcategories</h3>
        {selectedSubcategories.length === 0 ? (
          <p>No subcategories selected yet.</p>
        ) : (
          <div className="selected-subcategories">
            {selectedSubcategories.map(subcategoryId => (
              <div key={subcategoryId} className="selected-subcategory">
                {getSubcategoryNameById(subcategoryId)}
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="generator-section">
        <h3>Quiz Settings</h3>
        <div className="quiz-settings">
          <div className="setting-item">
            <label>Number of Questions:</label>
            <select 
              value={questionCount} 
              onChange={(e) => setQuestionCount(parseInt(e.target.value))}
            >
              <option value="5">5 questions (~ 8 min)</option>
              <option value="10">10 questions (~ 15 min)</option>
              <option value="15">15 questions (~ 25 min)</option>
              <option value="20">20 questions (~ 30 min)</option>
            </select>
          </div>
          
          <div className="setting-item">
            <label>Difficulty Level:</label>
            <select 
              value={difficultyLevel} 
              onChange={(e) => setDifficultyLevel(e.target.value)}
            >
              <option value="adaptive">Adaptive (based on your performance)</option>
              <option value="1">Level 1 - Easy</option>
              <option value="2">Level 2 - Moderate</option>
              <option value="3">Level 3 - Advanced</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="generator-actions">
        {loading ? (
          <div className="generating-status">
            <div className="loading-spinner"></div>
            <p>{generatingStatus}</p>
          </div>
        ) : (
          <button 
            className="generate-button" 
            onClick={generateQuiz} 
            disabled={selectedSubcategories.length === 0}
          >
            Generate Personalized Quiz
          </button>
        )}
      </div>
    </div>
  );
}

export default DynamicQuizGenerator;
