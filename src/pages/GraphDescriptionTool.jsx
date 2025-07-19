import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  collection, 
  getDocs, 
  doc,
  getDoc
} from 'firebase/firestore';
import { db } from '../firebase/config';
import '../styles/AdminDashboard.css';
import '../styles/GraphDescriptionTool.css';
import { FaSortAmountDownAlt, FaSortAmountUpAlt } from 'react-icons/fa';

const GraphDescriptionTool = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [questionsWithGraphs, setQuestionsWithGraphs] = useState([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [reverseOrder, setReverseOrder] = useState(false);

  // Check if user has admin access
  useEffect(() => {
    const checkAdminAccess = async () => {
      if (!currentUser) {
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }
      
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists() && userDoc.data().isAdmin) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Error checking admin access:', error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAdminAccess();
  }, [currentUser]);

  // Load questions and filter those with graph descriptions
  useEffect(() => {
    const loadQuestions = async () => {
      if (!isAdmin) return;
      
      try {
        console.log('Loading questions...');
        const questionsSnapshot = await getDocs(collection(db, 'questions'));
        const allQuestions = questionsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        console.log(`Total questions loaded: ${allQuestions.length}`);
        
        // Filter questions with non-null graphDescription
        const filtered = allQuestions.filter(
          (q) => q.graphDescription && q.graphDescription !== 'null' && q.graphDescription !== null
        );
        
        // Sort by context first (general first, then exam), then by date within each context
        filtered.sort((a, b) => {
          // Get context values, defaulting to 'general' if undefined/null
          const contextA = a.usageContext || 'general';
          const contextB = b.usageContext || 'general';
          
          // Sort by context first - general before exam
          if (contextA === 'general' && contextB === 'exam') return -1;
          if (contextA === 'exam' && contextB === 'general') return 1;
          
          // If same context, sort by date (latest first within each context)
          const dateA = a.importedAt || a.createdAt;
          const dateB = b.importedAt || b.createdAt;
          
          // Convert Firestore Timestamp or string to Date
          const getDate = (d) => {
            if (!d) return 0;
            if (typeof d === 'object' && typeof d.toDate === 'function') return d.toDate().getTime();
            if (typeof d === 'string') return new Date(d).getTime();
            if (d instanceof Date) return d.getTime();
            return d;
          };
          return getDate(dateB) - getDate(dateA);
        });
        
        // Apply reverse order if needed (this will reverse the entire sorted list)
        const sorted = reverseOrder ? [...filtered].reverse() : filtered;
        
        console.log(`Questions with graph descriptions: ${sorted.length}`);
        
        setTotalQuestions(allQuestions.length);
        setQuestions(allQuestions);
        setQuestionsWithGraphs(sorted);
        setFilteredQuestions(sorted);
        
      } catch (error) {
        console.error('Error loading questions:', error);
      }
    };
    
    loadQuestions();
  }, [isAdmin, reverseOrder]);

  // Filter questions based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredQuestions(questionsWithGraphs);
    } else {
      const filtered = questionsWithGraphs.filter(question => 
        question.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        question.graphDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (question.id && question.id.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredQuestions(filtered);
    }
  }, [searchTerm, questionsWithGraphs]);

  const handleEditQuestion = (questionId) => {
    navigate(`/admin/question-editor/${questionId}?referrer=/admin/graph-descriptions`);
  };

  const handleBackToAdmin = () => {
    navigate('/admin');
  };

  // Helper to format date
  const formatDate = (date) => {
    if (!date) return 'Unknown';
    let d = date;
    if (typeof d === 'object' && typeof d.toDate === 'function') d = d.toDate();
    else if (typeof d === 'string') d = new Date(d);
    if (!(d instanceof Date) || isNaN(d.getTime())) return 'Unknown';
    return d.toLocaleString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  // Redirect if not admin or not logged in
  if (isLoading) {
    return <div className="loading">Checking permissions...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="admin-dashboard">
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>You do not have permission to access this tool.</p>
          <button onClick={() => navigate('/')}>Return to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>Questions with Graph Descriptions</h1>
        <button className="back-button" onClick={handleBackToAdmin}>
          ← Back to Admin Dashboard
        </button>
      </header>
      
      <div className="admin-content">
        <div className="summary-stats">
          <div className="stat-card">
            <h3>Total Questions</h3>
            <p className="stat-number">{totalQuestions}</p>
          </div>
          <div className="stat-card">
            <h3>Questions with Graph Descriptions</h3>
            <p className="stat-number">{questionsWithGraphs.length}</p>
          </div>
          <div className="stat-card">
            <h3>General Context</h3>
            <p className="stat-number">
              {questionsWithGraphs.filter(q => (q.usageContext || 'general') === 'general').length}
            </p>
          </div>
          <div className="stat-card">
            <h3>Exam Context</h3>
            <p className="stat-number">
              {questionsWithGraphs.filter(q => q.usageContext === 'exam').length}
            </p>
          </div>
          <div className="stat-card">
            <h3>Percentage with Graphs</h3>
            <p className="stat-number">
              {totalQuestions > 0 ? ((questionsWithGraphs.length / totalQuestions) * 100).toFixed(1) : 0}%
            </p>
          </div>
        </div>

        <div className="filters-section">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search questions or graph descriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <button
            className="reverse-order-toggle"
            onClick={() => setReverseOrder((prev) => !prev)}
            title={reverseOrder ? 'Show latest first' : 'Show oldest first'}
            style={{ marginLeft: 12 }}
          >
            {reverseOrder ? <FaSortAmountUpAlt /> : <FaSortAmountDownAlt />} {reverseOrder ? 'Oldest First' : 'Latest First'}
          </button>
        </div>

        <div className="questions-section">
          <h3>Questions with Graph Descriptions ({filteredQuestions.length})</h3>
          
          {filteredQuestions.length === 0 ? (
            <div className="no-questions">
              <p>No questions with graph descriptions found.</p>
              {searchTerm && <p>Try adjusting your search terms.</p>}
            </div>
          ) : (
            <div className="questions-list">
              {filteredQuestions.map((question, index) => (
                <div key={question.id} className="question-card">
                  <div className="question-header">
                    <span className="question-number">#{index + 1}</span>
                    <span className="question-id">{question.id}</span>
                    <span className={`difficulty-badge ${question.difficulty || 'medium'}`}>
                      {question.difficulty || 'medium'}
                    </span>
                    <span className={`context-badge ${question.usageContext || 'general'}`}>
                      {question.usageContext === 'exam' ? 'Exam' : 'General'}
                    </span>
                  </div>
                  
                  <div className="question-content">
                    <div className="question-text">
                      <strong>Question:</strong>
                      <p>{question.text}</p>
                    </div>
                    
                    <div className="graph-description">
                      <strong>Graph Description:</strong>
                      <p className="graph-description-text">{question.graphDescription}</p>
                    </div>
                    
                    {question.graphUrl && (
                      <div className="graph-preview">
                        <strong>Generated Graph:</strong>
                        <img 
                          src={question.graphUrl} 
                          alt="Question Graph" 
                          className="question-graph-preview"
                          style={{ maxWidth: '200px', maxHeight: '150px', border: '1px solid #ddd', borderRadius: '4px' }}
                        />
                      </div>
                    )}
                    
                    <div className="question-metadata">
                      <span className="metadata-item">
                        <strong>Subcategory ID:</strong> {question.subcategoryId || 'Not set'}
                      </span>
                      {question.subcategory && (
                        <span className="metadata-item">
                          <strong>Subcategory:</strong> {question.subcategory}
                        </span>
                      )}
                      <span className="metadata-item">
                        <strong>Usage Context:</strong> {question.usageContext || 'General'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="question-date">
                    <strong>Date Imported:</strong> {formatDate(question.importedAt || question.createdAt)}
                  </div>
                  
                  <div className="question-actions">
                    <button 
                      className="edit-button"
                      onClick={() => handleEditQuestion(question.id)}
                    >
                      Edit Question
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GraphDescriptionTool; 