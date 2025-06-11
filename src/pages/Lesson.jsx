import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Spinner, Alert } from 'react-bootstrap';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import { normalizeSubcategoryName, getHumanReadableSubcategory } from '../utils/subcategoryUtils';
import { generateLesson } from '../utils/openaiService';
import '../styles/Lesson.css';

/**
 * Standalone Lesson Page
 * Displays a lesson for a specific skill tag
 */
const Lesson = () => {
  const { skillTag } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lesson, setLesson] = useState(null);
  const [normalizedSkillTag, setNormalizedSkillTag] = useState('');
  
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    const fetchLesson = async () => {
      try {
        setLoading(true);
        
        // Normalize the skill tag for consistent lookups
        const normalized = normalizeSubcategoryName(skillTag);
        
        // Try to fetch from Firestore first
        const lessonRef = doc(db, 'lessons', normalized);
        const lessonDoc = await getDoc(lessonRef);
        
        if (lessonDoc.exists()) {
          setLesson(lessonDoc.data());
          setLoading(false);
        } else {
          // If not in Firestore, generate via direct API call
          await generateLessonWithApi(normalized);
        }
      } catch (err) {
        console.error('Error fetching lesson:', err);
        setError('Failed to load lesson content. Please try again.');
        setLoading(false);
      }
    };
    
    fetchLesson();
  }, [currentUser, skillTag, navigate, db]);
  
  // Generate a lesson using direct OpenAI API call
  const generateLessonWithApi = async (skillTagToGenerate) => {
    try {
      // Generate the lesson content
      console.log('Generating lesson via direct API for:', skillTagToGenerate);
      const lessonData = await generateLesson(skillTagToGenerate);
      console.log('Lesson generated successfully:', lessonData);
      
      // Save to Firestore for future use
      try {
        const lessonRef = doc(db, 'lessons', skillTagToGenerate);
        await setDoc(lessonRef, lessonData);
        console.log('Saved generated lesson to Firestore');
      } catch (saveErr) {
        console.warn('Could not save lesson to Firestore:', saveErr);
      }
      
      // Update state
      setLesson(lessonData);
      setLoading(false);
    } catch (error) {
      console.error('Error generating lesson:', error);
      
      // Try to get a cached lesson from Firestore as fallback
      try {
        const lessonRef = doc(db, 'lessons', skillTagToGenerate);
        const lessonDoc = await getDoc(lessonRef);
        
        if (lessonDoc.exists()) {
          console.log('Found cached lesson as fallback');
          setLesson(lessonDoc.data());
          setLoading(false);
          return;
        }
        
        // No cached lesson, we need to generate one through the API
        throw new Error('No cached lesson found and generation failed.');
        
      } catch (fallbackErr) {
        console.error('Fallback retrieval also failed:', fallbackErr);
      }
      
      // If all fails, show error
      setError(`Failed to generate lesson content. Please try again.`);
      setLoading(false);
    }
  };
  
  // Render HTML content safely
  const renderContent = (content) => {
    if (!content) return '';
    
    // Check if content is already HTML
    if (content.startsWith('<') && content.includes('</')) {
      return { __html: DOMPurify.sanitize(content) };
    }
    
    // Otherwise treat as markdown
    const html = marked(content);
    return { __html: DOMPurify.sanitize(html) };
  };
  
  // Handle starting a drill for this skill
  const handleStartDrill = () => {
    navigate(`/skill-drill/${normalizedSkillTag}`);
  };
  
  // Handle going back to previous page
  const handleGoBack = () => {
    navigate(-1);
  };
  
  // Go to dashboard
  const handleGoToDashboard = () => {
    navigate('/progress');
  };
  
  if (loading) {
    return (
      <div className="lesson-container">
        <div className="lesson-loading">
          <Spinner animation="border" role="status" variant="primary" />
          <p>Preparing your personalized lesson...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="lesson-container">
        <Alert variant="danger">
          <Alert.Heading>Error Loading Lesson</Alert.Heading>
          <p>{error}</p>
        </Alert>
        <div className="lesson-actions">
          <Button variant="secondary" onClick={handleGoBack}>
            Go Back
          </Button>
          <Button variant="primary" onClick={handleGoToDashboard}>
            Dashboard
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="lesson-page">
      <div className="lesson-header">
        <Button
          variant="outline-secondary"
          onClick={() => navigate(-1)}
          className="back-button"
        >
          &larr; Back
        </Button>
        <h1>{loading ? 'Loading Lesson...' : (lesson?.title || `Lesson on ${getHumanReadableSubcategory(skillTag)}`)}</h1>
      </div>
      
      <div className="lesson-content">
        <div dangerouslySetInnerHTML={renderContent(lesson?.html)} />
      </div>
      
      <div className="lesson-actions">
        <Button variant="primary" onClick={handleStartDrill} className="practice-button">
          Practice This Skill
        </Button>
        <Button variant="secondary" onClick={handleGoBack}>
          Go Back
        </Button>
      </div>
    </div>
  );
};

export default Lesson;
