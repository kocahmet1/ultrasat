import React, { useState, useEffect } from 'react';
import { Modal, Button, Spinner } from 'react-bootstrap';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { normalizeSubcategoryName, getHumanReadableSubcategory } from '../utils/subcategoryUtils';
import { db } from '../firebase/config';
import { generateLesson } from '../utils/openaiService';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import '../styles/LessonModal.css';

// Configure marked to prevent deprecation warnings
marked.use({
  headerIds: false,  // Disable automatic header IDs
  mangle: false      // Disable mangling
});

/**
 * A modal component that displays a lesson for a specific skill tag
 * The lesson content is either fetched from Firestore or generated via direct OpenAI API
 */
const LessonModal = ({ skillTag, show, onHide, onStartDrill }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lesson, setLesson] = useState(null);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [normalizedSkillTag, setNormalizedSkillTag] = useState('');

  useEffect(() => {
    // Reset state when skillTag changes
    if (skillTag) {
      setLoading(true);
      setError(null);
      // Normalize the skill tag to ensure consistent format
      const normalized = normalizeSubcategoryName(skillTag.toLowerCase().replace(/\s+/g, '-'));
      setNormalizedSkillTag(normalized);
      fetchLesson(normalized);
    }
  }, [skillTag]);

  // Fetch or generate a lesson for the skill tag
  const fetchLesson = async (skillTag) => {
    try {
      // First try to fetch from Firestore
      const lessonRef = doc(db, 'lessons', skillTag);
      const lessonDoc = await getDoc(lessonRef);

      if (lessonDoc.exists()) {
        const lessonData = lessonDoc.data();
        setLesson(lessonData);
        setLoading(false);
        
        // Lesson loaded from cache
      } else {
        // If not in Firestore, generate via direct OpenAI API
        await generateLessonContent(skillTag);
      }
    } catch (err) {
      console.error('Error fetching lesson:', err);
      setError('Failed to load lesson content. Please try again.');
      setLoading(false);
    }
  };

  // Generate lesson for the skill using direct OpenAI API
  const generateLessonContent = async (skillTag) => {
    if (!skillTag) return;
    setLoading(true);
    setError('');
    
    try {
      // Call the direct API to generate the lesson
      console.log(`Generating lesson for skill: ${skillTag}`);
      
      // Generate the lesson using direct OpenAI API
      const lessonData = await generateLesson(skillTag);
      console.log('Generated lesson via direct API:', lessonData);
      
      // Save lesson to Firestore
      try {
        const lessonRef = doc(db, 'lessons', skillTag);
        await setDoc(lessonRef, lessonData);
        console.log('Saved lesson to Firestore');
      } catch (saveErr) {
        console.error('Error saving lesson to Firestore:', saveErr);
      }
      
      setLesson(lessonData);
      
      // Lesson generated successfully
    } catch (error) {
      console.error('Error generating lesson:', error);
      setError('Failed to generate lesson. Please try again.');
      
      // Try to get from Firestore as a fallback
      try {
        console.log('Trying to fetch lesson from Firestore cache');
        const lessonRef = doc(db, 'lessons', skillTag);
        const lessonDoc = await getDoc(lessonRef);
        if (lessonDoc.exists()) {
          setLesson(lessonDoc.data());
          console.log('Found cached lesson:', lessonDoc.data());
          return;
        }
        
        // No cached lesson found, API generation must have failed
        throw new Error('No cached lesson found and direct API generation failed');
      } catch (cacheErr) {
        console.error('Cache fallback failed:', cacheErr);
      }
      
      setError('Failed to generate lesson content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Convert markdown to sanitized HTML if needed
  const renderContent = (content) => {
    if (!content) return '';
    
    // Check if content is already HTML
    if (content.startsWith('<') && content.includes('</')) {
      return { __html: DOMPurify.sanitize(content) };
    }
    
    // Otherwise treat as markdown
    // Use marked with options to avoid deprecation warnings
    const html = marked(content, {
      headerIds: false,  // Disable automatic header IDs
      mangle: false      // Disable mangling
    });
    return { __html: DOMPurify.sanitize(html) };
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      centered
      className="lesson-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>
          {loading ? 'Loading Lesson...' : (lesson?.title || `Lesson on ${getHumanReadableSubcategory(skillTag)}`)}
          {window.location.hostname === 'localhost' && <small className="text-muted ms-2">(Development Mode)</small>}
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        {loading ? (
          <div className="text-center p-5">
            <Spinner animation="border" role="status" variant="primary" />
            <p className="mt-3">Preparing your personalized lesson...</p>
          </div>
        ) : error ? (
          <div className="alert alert-danger">{error}</div>
        ) : (
          <div className="lesson-content" dangerouslySetInnerHTML={renderContent(lesson?.html)} />
        )}
      </Modal.Body>
      
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
        <Button 
          variant="primary" 
          onClick={() => {
            // Close the modal
            onHide();
            
            // Starting a skill drill from this lesson
            console.log(`Starting skill drill for ${normalizedSkillTag}`);
            
            // Note: Analytics tracking removed during migration to direct API
            
            // Use the normalized skill tag for consistent navigation
            if (onStartDrill) {
              onStartDrill(normalizedSkillTag);
            } else {
              // Navigate directly to the skill drill if no handler provided
              navigate(`/skill-drill/${normalizedSkillTag}`);
            }
          }} 
          disabled={loading || error || !lesson}
        >
          Start 5-Question Drill
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default LessonModal;
