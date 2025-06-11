import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { addDoc, collection, getDocs } from 'firebase/firestore';
import { getQuestionsForAdaptiveQuiz } from '../firebase/subcategoryServices';
import { getUnmasteredConcepts } from '../firebase/conceptServices';
import '../styles/RecommendationsStrip.css';
import '../styles/ConceptMastery.css';

/**
 * Displays a horizontal strip of personalized recommendations
 * based on the student's performance data and unmastered concepts
 */
const RecommendationsStrip = ({ recommendations, allSubcategories }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [unmasteredConcepts, setUnmasteredConcepts] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Fetch unmastered concepts for current user
  useEffect(() => {
    const fetchUnmasteredConcepts = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        const concepts = await getUnmasteredConcepts(currentUser.uid);
        // Limit to 3 concepts for recommendation strip
        setUnmasteredConcepts(concepts.slice(0, 3));
      } catch (error) {
        console.error('Error fetching unmastered concepts:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUnmasteredConcepts();
  }, [currentUser]);
  
  // If we have no recommendations and no unmastered concepts, show nothing
  if ((!recommendations || recommendations.length === 0) && unmasteredConcepts.length === 0) {
    return null;
  }
  
  // Filter to ensure we have valid subcategories with performance data
  const validRecommendations = recommendations
    ? recommendations
        .filter(rec => rec.subcategoryId && rec.accuracyRate !== undefined)
        .slice(0, 2) // Limit to top 2 if we have concepts to show too
    : [];
  
  // If no valid recommendations and no unmastered concepts, return null
  if (validRecommendations.length === 0 && unmasteredConcepts.length === 0) {
    return null;
  }

  // Create a new adaptive quiz for the selected subcategory
  const handleStartDrill = async (rec) => {
    const subcategoryId = rec.subcategoryId;
    const level = 2; // Hardcoded medium difficulty for recommendations
    const questionCount = 5;
    const displayName = rec.displayName || getSubcategoryName(subcategoryId);

    try {
      // 1. Fetch questions first
      const fetchedQuestions = await getQuestionsForAdaptiveQuiz(subcategoryId, level, questionCount);

      // 2. Check if enough questions were found
      if (fetchedQuestions.length < questionCount) {
        console.warn(`Not enough questions found for ${displayName} (ID: ${subcategoryId}) at level ${level}. Needed ${questionCount}, found ${fetchedQuestions.length}`);
        alert(`Sorry, we couldn't find enough questions for '${displayName}' at the medium difficulty level right now. Please try again later or practice a different skill.`);
        return; // Stop execution
      }

      // 3. Create a new adaptive quiz in Firestore with the fetched questions
      const quizData = {
        subcategory: subcategoryId, // Use the ID
        level: level,
        createdAt: new Date(),
        completed: false,
        title: `${displayName} Practice Drill`, // Use display name
        description: `A ${questionCount}-question drill focusing on improving your ${displayName} skills.`,
        questionCount: questionCount,
        questions: fetchedQuestions // <-- Embed the fetched questions
      };
      
      const quizRef = await addDoc(collection(db, 'adaptiveQuizzes'), quizData);
      
      // 4. Navigate to the new quiz
      navigate(`/adaptive-quiz/${quizRef.id}`);
    } catch (error) {
      console.error("Error creating adaptive quiz:", error);
      alert("There was an error creating your practice quiz. Please try again.");
    }
  };
  
  // Get display name for a subcategory
  const getSubcategoryName = (subcategoryId) => {
    const subcategory = allSubcategories.find(s => s.id === subcategoryId);
    if (subcategory) {
      return subcategory.name;
    }
    return subcategoryId.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };
  
  // Get color class based on performance
  const getColorClass = (accuracyRate) => {
    if (accuracyRate < 60) return 'rec-poor';
    if (accuracyRate < 75) return 'rec-moderate';
    return 'rec-good';
  };

  return (
    <div className="recommendations-container">
      <h2>Recommended Practice</h2>
      <div className="rec-strip">
        {/* SUBCATEGORY RECOMMENDATIONS */}
        {validRecommendations.map(rec => {
          const displayName = rec.displayName || getSubcategoryName(rec.subcategoryId);
          const accuracyRate = Math.round(rec.accuracyRate);
          const colorClass = getColorClass(accuracyRate);
          
          return (
            <div 
              key={rec.subcategoryId} 
              className={`rec-card ${colorClass}`}
            >
              <div className="rec-card-badge subcategory-badge">Subcategory</div>
              <h3>{displayName}</h3>
              <div className="rec-stat">
                <span className="rec-label">Current accuracy:</span>
                <span className="rec-value">{accuracyRate}%</span>
              </div>
              <button 
                className="rec-drill-button" 
                onClick={() => handleStartDrill(rec)}
              >
                Start 5-Q Drill
              </button>
            </div>
          );
        })}
        
        {/* CONCEPT RECOMMENDATIONS */}
        {unmasteredConcepts.map(concept => (
          <div 
            key={concept.id} 
            className="rec-card concept-rec-card"
          >
            <div className="rec-card-badge concept-badge">Concept</div>
            <h3>{concept.name}</h3>
            <div className="rec-concept-info">
              <span className="rec-label">From: {getSubcategoryName(concept.subcategoryId)}</span>
            </div>
            <button 
              className="rec-drill-button concept-drill-button" 
              onClick={() => navigate(`/concept/${concept.id}`)}
            >
              Practice Concept
            </button>
          </div>
        ))}
        
        {loading && (
          <div className="rec-loading">
            <div className="rec-loading-spinner"></div>
            <span>Loading recommendations...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendationsStrip;
