import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { collection, getDocs, doc, getDoc, updateDoc, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase/config';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import AdminTokenUsageStats from '../components/AdminTokenUsageStats';
import { logAdminAction } from '../utils/analyticsService';
import { normalizeSubcategoryName } from '../utils/subcategoryUtils';
import '../styles/AdminAiContent.css';

// Configure marked to prevent deprecation warnings
marked.use({
  headerIds: false,
  mangle: false
});

/**
 * Admin page for validating AI-generated content
 * This page allows staff to review, edit, and approve AI-generated lessons and skill quizzes
 */
const AdminAiContent = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  // State management
  const [activeTab, setActiveTab] = useState('content');
  const [lessons, setLessons] = useState([]);
  const [skillQuizzes, setSkillQuizzes] = useState([]);
  const [selectedContent, setSelectedContent] = useState(null);
  const [selectedContentType, setSelectedContentType] = useState(null);
  const [editedContent, setEditedContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Check if user is admin
    const checkAdmin = async () => {
      if (!currentUser) {
        navigate('/login');
        return;
      }
      
      try {
        // Check admin status from the users collection (same as AdminDashboard)
        const userRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists() && userDoc.data().isAdmin) {
          // User is an admin, load content
          loadUnvalidatedContent();
        } else {
          // User is not an admin, redirect to home
          navigate('/');
          return;
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setError('Error checking permissions. Please try again later.');
        setLoading(false);
      }
    };
    
    checkAdmin();
  }, [currentUser, navigate]);
  
  // Load unvalidated lessons and quizzes
  const loadUnvalidatedContent = async () => {
    try {
      setLoading(true);
      
      // Get unvalidated lessons
      const lessonsQuery = query(
        collection(db, 'lessons'),
        where('validated', '==', false),
        orderBy('generatedAt', 'desc')
      );
      
      const lessonsSnapshot = await getDocs(lessonsQuery);
      const lessonsList = lessonsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        generatedAt: doc.data().generatedAt?.toDate() || new Date()
      }));
      
      // Get unvalidated skill quizzes
      const quizzesQuery = query(
        collection(db, 'skillQuizzes'),
        where('validated', '==', false),
        orderBy('generatedAt', 'desc')
      );
      
      const quizzesSnapshot = await getDocs(quizzesQuery);
      const quizzesList = quizzesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        generatedAt: doc.data().generatedAt?.toDate() || new Date()
      }));
      
      setLessons(lessonsList);
      setSkillQuizzes(quizzesList);
      setLoading(false);
      
      if (lessonsList.length === 0 && quizzesList.length === 0) {
        setError('No content found needing validation.');
      }
    } catch (error) {
      console.error('Error loading unvalidated content:', error);
      setError('Error loading content. Please try again later.');
      setLoading(false);
    }
  };
  
  // Select an item for review
  const handleSelectContent = (item, type) => {
    setSelectedContent(item);
    setSelectedContentType(type);
    setEditedContent(type === 'lesson' ? item.html : JSON.stringify(item.questions, null, 2));
  };
  
  // Reset changes
  const handleResetChanges = () => {
    if (selectedContent && selectedContentType) {
      setEditedContent(selectedContentType === 'lesson' 
        ? selectedContent.html 
        : JSON.stringify(selectedContent.questions, null, 2));
    }
  };
  
  // Handle edited content changes
  const handleContentChange = (e) => {
    setEditedContent(e.target.value);
  };
  
  // Approve content
  const handleApproveContent = async (approved) => {
    try {
      setSaving(true);
      
      // Get content details for analytics
      const contentDetails = {
        skillTag: selectedContent.skillTag || '',
        subcategory: selectedContent.subcategory || '',
        normalizedSubcategory: selectedContent.subcategory ? 
          normalizeSubcategoryName(selectedContent.subcategory) : '',
        wasEdited: selectedContentType === 'lesson' ? 
          selectedContent.html !== editedContent : 
          JSON.stringify(selectedContent.questions) !== editedContent
      };
      
      // Track what action is being taken
      const actionType = approved ? 
        (contentDetails.wasEdited ? 'approve_with_edits' : 'approve') : 
        'reject';
      
      if (selectedContentType === 'lesson') {
        const lessonRef = doc(db, 'lessons', selectedContent.id);
        await updateDoc(lessonRef, {
          validated: approved,
          html: editedContent,
          validatedAt: new Date(),
          validatedBy: currentUser.uid
        });
        
        // Log analytics for this admin action
        await logAdminAction(
          currentUser.uid,
          actionType,
          'lesson',
          selectedContent.id,
          contentDetails
        );
      } else {
        const quizRef = doc(db, 'skillQuizzes', selectedContent.id);
        
        // Parse the edited JSON for questions
        let questions = selectedContent.questions;
        try {
          if (typeof editedContent === 'string') {
            questions = JSON.parse(editedContent);
          }
        } catch (err) {
          console.error('Error parsing edited questions JSON:', err);
          alert('The questions JSON is invalid. Please fix the format before saving.');
          setSaving(false);
          return;
        }
        
        await updateDoc(quizRef, {
          validated: approved,
          questions: questions,
          validatedAt: new Date(),
          validatedBy: currentUser.uid
        });
        
        // Log analytics for this admin action
        await logAdminAction(
          currentUser.uid,
          actionType,
          'quiz',
          selectedContent.id,
          contentDetails
        );
      }
      
      // Update local state
      if (selectedContentType === 'lesson') {
        setLessons(lessons.filter(lesson => lesson.id !== selectedContent.id));
      } else {
        setSkillQuizzes(skillQuizzes.filter(quiz => quiz.id !== selectedContent.id));
      }
      
      setSelectedContent(null);
      setSelectedContentType(null);
      setEditedContent('');
      setSaving(false);
    } catch (error) {
      console.error('Error approving content:', error);
      setError('Error approving content: ' + error.message);
      setSaving(false);
    }
  };
  
  // Format date for display
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    
    return new Date(timestamp).toLocaleString();
  };
  
  return (
    <div className="admin-ai-content-container">
      <h1>AI Content Validation</h1>
      
      {/* Tabs for Content and Analytics */}
      <div className="nav nav-tabs mb-4">
        <div 
          className={`nav-link ${activeTab === 'content' ? 'active' : ''}`}
          onClick={() => setActiveTab('content')}
        >
          Content Validation
        </div>
        <div 
          className={`nav-link ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          Token Analytics
        </div>
      </div>
      
      {loading && activeTab === 'content' ? (
        <div className="loading">Loading AI content...</div>
      ) : error && activeTab === 'content' ? (
        <div className="error">{error}</div>
      ) : (
        <>
          {/* Content Validation Tab */}
          {activeTab === 'content' && (
            <div className="content-manager">
              <div className="row">
                <div className="col-md-4 content-list">
                  <h2>Lessons</h2>
                  {lessons.length === 0 ? (
                    <p>No lessons found needing validation.</p>
                  ) : (
                    lessons.map(lesson => (
                      <div 
                        key={lesson.id} 
                        className={`card content-item ${selectedContent && selectedContent.id === lesson.id && selectedContentType === 'lesson' ? 'selected' : ''}`}
                        onClick={() => handleSelectContent(lesson, 'lesson')}
                      >
                        <div className="card-body">
                          <h5 className="card-title">{lesson.title || lesson.skillTag}</h5>
                          <div className="content-meta">
                            <span>Generated: {formatDate(lesson.generatedAt)}</span>
                            <span className="badge bg-primary">{lesson.validated ? 'Validated' : 'Needs Review'}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  
                  <h2 className="mt-4">Skill Quizzes</h2>
                  {skillQuizzes.length === 0 ? (
                    <p>No skill quizzes found needing validation.</p>
                  ) : (
                    skillQuizzes.map(quiz => (
                      <div 
                        key={quiz.id} 
                        className={`card content-item ${selectedContent && selectedContent.id === quiz.id && selectedContentType === 'quiz' ? 'selected' : ''}`}
                        onClick={() => handleSelectContent(quiz, 'quiz')}
                      >
                        <div className="card-body">
                          <h5 className="card-title">{quiz.skillName || quiz.skillTag}</h5>
                          <div className="content-meta">
                            <span>Generated: {formatDate(quiz.generatedAt)}</span>
                            <span className="badge bg-primary">{quiz.validated ? 'Validated' : 'Needs Review'}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                <div className="col-md-8">
                  {selectedContent ? (
                    <div className="content-editor">
                      <h2>
                        {selectedContentType === 'lesson' ? 'Lesson' : 'Skill Quiz'}: {' '}
                        {selectedContentType === 'lesson' 
                          ? selectedContent.title || selectedContent.skillTag
                          : selectedContent.skillName || selectedContent.skillTag
                        }
                      </h2>
                      
                      {selectedContentType === 'lesson' ? (
                        <>
                          <div className="form-group">
                            <label htmlFor="htmlContent">Lesson Content</label>
                            <textarea
                              id="htmlContent"
                              className="form-control"
                              rows="12"
                              value={editedContent}
                              onChange={handleContentChange}
                            />
                          </div>
                          
                          <div className="preview-section">
                            <h3>Preview</h3>
                            <div 
                              className="content-preview"
                              dangerouslySetInnerHTML={{
                                __html: DOMPurify.sanitize(editedContent)
                              }}
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="quiz-info">
                            <p><strong>Skill:</strong> {selectedContent.skillName}</p>
                            <p><strong>Subcategory:</strong> {selectedContent.subcategory}</p>
                            <p><strong>Questions:</strong> {selectedContent.questions?.length || 0}</p>
                            <p><strong>Explanation:</strong> {selectedContent.explanation}</p>
                            <p><strong>Common Error:</strong> {selectedContent.commonError}</p>
                          </div>
                          
                          <div className="form-group">
                            <label htmlFor="quizContent">Questions JSON</label>
                            <textarea
                              id="quizContent"
                              className="form-control"
                              rows="12"
                              value={editedContent}
                              onChange={handleContentChange}
                            />
                          </div>
                          
                          <div className="preview-section">
                            <h3>Preview</h3>
                            <div className="content-preview">
                              {selectedContent.questions?.map((question, index) => (
                                <div key={index} className="question-preview">
                                  <h4>Question {index + 1}</h4>
                                  <p>{question.text}</p>
                                  <div className="options-list">
                                    {Object.entries(question.options || {}).map(([key, value]) => (
                                      <div 
                                        key={key} 
                                        className={`option ${key === question.correctAnswer ? 'correct' : ''}`}
                                      >
                                        <strong>{key}:</strong> {value}
                                      </div>
                                    ))}
                                  </div>
                                  <div className="explanation">
                                    <strong>Explanation:</strong> {question.explanation}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                      
                      <div className="action-buttons">
                        <button
                          className="btn btn-secondary"
                          onClick={handleResetChanges}
                          disabled={saving}
                        >
                          Reset Changes
                        </button>
                        <button
                          className="btn btn-success"
                          onClick={() => handleApproveContent(true)}
                          disabled={saving}
                        >
                          {saving ? 'Saving...' : 'Approve & Save'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="no-selection">
                      <p>Select content from the list to review and validate</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="analytics-container">
              <AdminTokenUsageStats />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminAiContent;
