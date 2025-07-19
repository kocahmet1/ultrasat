import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  collection, 
  getDocs, 
  doc,
  getDoc,
  updateDoc
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { 
  checkPlotlyEnvironment,
  generateQuestionGraphPlotly
} from '../utils/apiClient';
import '../styles/GraphGeneration.css';

const GraphGenerationPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  // Admin access state
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Environment state
  const [environmentStatus, setEnvironmentStatus] = useState({
    isReady: false,
    isChecking: true,
    error: null,
    details: null
  });
  
  // Questions state
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
  
  // Filtering state
  const [filter, setFilter] = useState('needsGraph'); // 'all', 'needsGraph', 'hasGraph'
  const [searchTerm, setSearchTerm] = useState('');
  
  // Selection state
  const [selectedQuestions, setSelectedQuestions] = useState(new Set());
  
  // Generation state
  const [generatingQuestions, setGeneratingQuestions] = useState(new Set());
  const [bulkGenerating, setBulkGenerating] = useState(false);
  const [selectiveGenerating, setSelectiveGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState({ current: 0, total: 0 });
  const [generationResults, setGenerationResults] = useState([]);
  
  // Modal state
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Modal functions
  const openQuestionModal = (question) => {
    setSelectedQuestion(question);
    setIsModalOpen(true);
  };
  
  const closeQuestionModal = () => {
    setSelectedQuestion(null);
    setIsModalOpen(false);
  };

  // Check admin access
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

  // Check environment status
  useEffect(() => {
    const checkEnvironment = async () => {
      console.log('🔍 Starting environment check, isAdmin:', isAdmin);
      if (!isAdmin) {
        console.log('❌ Not admin, skipping environment check');
        // Set environment as not ready when not admin
        setEnvironmentStatus({
          isReady: false,
          isChecking: false,
          error: 'Admin access required',
          details: null
        });
        return;
      }
      
      try {
        console.log('⏳ Setting environment status to checking...');
        setEnvironmentStatus(prev => ({ ...prev, isChecking: true }));
        
        console.log('🌐 Calling checkPlotlyEnvironment API...');
        const envCheck = await checkPlotlyEnvironment();
        console.log('📋 Environment check response:', envCheck);
        
        if (envCheck.plotlyReady) {
          console.log('✅ Environment ready! Setting status to ready.');
          setEnvironmentStatus({
            isReady: true,
            isChecking: false,
            error: null,
            details: envCheck
          });
          console.log('🔄 Environment status updated - component should re-render');
        } else {
          console.log('❌ Environment not ready:', envCheck.error);
          setEnvironmentStatus({
            isReady: false,
            isChecking: false,
            error: envCheck.error || 'Plotly environment not ready',
            details: null
          });
        }
      } catch (error) {
        console.error('Environment check failed:', error);
        setEnvironmentStatus({
          isReady: false,
          isChecking: false,
          error: error.message,
          details: null
        });
      }
    };
    
    checkEnvironment();
  }, [isAdmin]);

  // Load questions
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
        
        // Sort by context first (general first, then exam), then by date within each context
        allQuestions.sort((a, b) => {
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
        
        setQuestions(allQuestions);
        setTotalQuestions(allQuestions.length);
        
      } catch (error) {
        console.error('Error loading questions:', error);
      }
    };
    
    loadQuestions();
  }, [isAdmin]);

  // Filter questions based on current filter and search
  useEffect(() => {
    let filtered = questions;
    
    // Apply main filter
    switch (filter) {
      case 'needsGraph':
        filtered = questions.filter(q => 
          q.graphDescription && 
          q.graphDescription.trim() !== '' && 
          !q.graphUrl
        );
        break;
      case 'hasGraph':
        filtered = questions.filter(q => 
          q.graphDescription && 
          q.graphDescription.trim() !== '' && 
          q.graphUrl
        );
        break;
      case 'all':
      default:
        filtered = questions.filter(q => 
          q.graphDescription && 
          q.graphDescription.trim() !== ''
        );
        break;
    }
    
    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(q => 
        q.text.toLowerCase().includes(search) || 
        q.graphDescription.toLowerCase().includes(search) ||
        (q.id && q.id.toLowerCase().includes(search))
      );
    }
    
    setFilteredQuestions(filtered);
    
    // Clear selections when filter or search changes to avoid confusion
    setSelectedQuestions(new Set());
  }, [questions, filter, searchTerm]);

  // Generate graph for individual question
  const handleGenerateGraph = async (question) => {
    if (!environmentStatus.isReady) {
      alert('Graph generation environment is not ready. Please check the environment status.');
      return;
    }
    
    if (generatingQuestions.has(question.id)) return;
    
    setGeneratingQuestions(prev => new Set([...prev, question.id]));
    
    try {
      const result = await generateQuestionGraphPlotly(
        question.id,
        question.text,
        question.graphDescription
      );
      
      if (result.success) {
        // Update local state
        setQuestions(prev => prev.map(q => 
          q.id === question.id 
            ? { ...q, graphUrl: result.graphUrl, plotlyConfig: result.plotlyConfig }
            : q
        ));
        
        alert(`Graph generated successfully for question ${question.id}`);
      } else {
        throw new Error(result.error || 'Graph generation failed');
      }
    } catch (error) {
      console.error('Graph generation error:', error);
      alert(`Failed to generate graph: ${error.message}`);
    } finally {
      setGeneratingQuestions(prev => {
        const next = new Set(prev);
        next.delete(question.id);
        return next;
      });
    }
  };

  // Bulk generate graphs
  const handleBulkGenerate = async () => {
    if (!environmentStatus.isReady) {
      alert('Graph generation environment is not ready. Please check the environment status.');
      return;
    }
    
    const questionsNeedingGraphs = questions.filter(q => 
      q.graphDescription && 
      q.graphDescription.trim() !== '' && 
      !q.graphUrl
    );
    
    if (questionsNeedingGraphs.length === 0) {
      alert('No questions need graphs generated.');
      return;
    }
    
    const confirmed = window.confirm(
      `This will generate graphs for ${questionsNeedingGraphs.length} questions. ` +
      'This may take several minutes and will use API credits. Continue?'
    );
    
    if (!confirmed) return;
    
    setBulkGenerating(true);
    setGenerationProgress({ current: 0, total: questionsNeedingGraphs.length });
    setGenerationResults([]);

    const results = [];
    
    for (let i = 0; i < questionsNeedingGraphs.length; i++) {
      const question = questionsNeedingGraphs[i];
      setGenerationProgress({ current: i + 1, total: questionsNeedingGraphs.length });
      
      try {
        const result = await handleGenerateGraph(question, false); // Don't show individual alerts
        results.push({
          questionId: question.id,
          success: true,
          result
        });
      } catch (error) {
        console.error(`Failed to generate graph for question ${question.id}:`, error);
        results.push({
          questionId: question.id,
          success: false,
          error: error.message
        });
      }
      
      // Small delay between generations to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    setGenerationResults(results);
    setBulkGenerating(false);
    
    // Show summary
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    alert(`Bulk generation complete!\nSuccessful: ${successful}\nFailed: ${failed}`);
  };

  // Handle modal graph generation
  const handleModalGenerateGraph = async (question) => {
    try {
      await handleGenerateGraph(question);
      // Update the selected question with the new graph URL
      const updatedQuestion = questions.find(q => q.id === question.id);
      if (updatedQuestion) {
        setSelectedQuestion(updatedQuestion);
      }
    } catch (error) {
      console.error('Error generating graph from modal:', error);
    }
  };

  // Selection handling functions
  const handleSelectQuestion = (questionId) => {
    setSelectedQuestions(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(questionId)) {
        newSelected.delete(questionId);
      } else {
        newSelected.add(questionId);
      }
      return newSelected;
    });
  };

  const handleSelectAll = () => {
    const selectableQuestions = filteredQuestions.filter(q => 
      q.graphDescription && q.graphDescription.trim() !== ''
    );
    
    if (selectedQuestions.size === selectableQuestions.length) {
      // Deselect all
      setSelectedQuestions(new Set());
    } else {
      // Select all
      setSelectedQuestions(new Set(selectableQuestions.map(q => q.id)));
    }
  };

  // Sequential generation for selected questions
  const handleGenerateSelectedGraphs = async () => {
    if (!environmentStatus.isReady) {
      alert('Graph generation environment is not ready. Please check the environment status.');
      return;
    }

    if (selectedQuestions.size === 0) {
      alert('Please select at least one question to generate graphs for.');
      return;
    }

    // Get the actual question objects for selected IDs, maintaining the order from filteredQuestions
    const selectedQuestionObjects = filteredQuestions.filter(q => selectedQuestions.has(q.id));

    const confirmed = window.confirm(
      `This will generate graphs for ${selectedQuestionObjects.length} selected questions sequentially. ` +
      'This may take several minutes and will use API credits. Continue?'
    );

    if (!confirmed) return;

    setSelectiveGenerating(true);
    setGenerationProgress({ current: 0, total: selectedQuestionObjects.length });
    setGenerationResults([]);

    const results = [];

    // Process questions sequentially (one by one)
    for (let i = 0; i < selectedQuestionObjects.length; i++) {
      const question = selectedQuestionObjects[i];
      setGenerationProgress({ current: i + 1, total: selectedQuestionObjects.length });

      try {
        console.log(`Generating graph for question ${i + 1}/${selectedQuestionObjects.length}: ${question.id}`);
        
        // Call the individual graph generation function
        const result = await generateQuestionGraphPlotly(
          question.id,
          question.text,
          question.graphDescription
        );

        if (result.success) {
          // Update local state
          setQuestions(prev => prev.map(q => 
            q.id === question.id 
              ? { ...q, graphUrl: result.graphUrl, plotlyConfig: result.plotlyConfig }
              : q
          ));

          results.push({
            questionId: question.id,
            success: true,
            result
          });

          console.log(`✅ Successfully generated graph for question ${question.id}`);
        } else {
          throw new Error(result.error || 'Graph generation failed');
        }
      } catch (error) {
        console.error(`❌ Failed to generate graph for question ${question.id}:`, error);
        results.push({
          questionId: question.id,
          success: false,
          error: error.message
        });
      }

      // Small delay between generations to avoid overwhelming the API
      if (i < selectedQuestionObjects.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    }

    setGenerationResults(results);
    setSelectiveGenerating(false);
    
    // Clear selection after completion
    setSelectedQuestions(new Set());

    // Show summary
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    alert(`Selective generation complete!\nSuccessful: ${successful}\nFailed: ${failed}`);
  };

  const handleBackToAdmin = () => {
    navigate('/admin');
  };

  const getFilterCounts = () => {
    const withGraphDescription = questions.filter(q => 
      q.graphDescription && q.graphDescription.trim() !== ''
    );
    const needsGraph = withGraphDescription.filter(q => !q.graphUrl);
    const hasGraph = withGraphDescription.filter(q => q.graphUrl);
    
    return {
      all: withGraphDescription.length,
      needsGraph: needsGraph.length,
      hasGraph: hasGraph.length
    };
  };

  // Loading screen
  if (isLoading) {
    return <div className="loading">Checking permissions...</div>;
  }

  // Access denied
  if (!isAdmin) {
    return (
      <div className="graph-generation-page">
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>You do not have permission to access the graph generation tool.</p>
          <button onClick={() => navigate('/')}>Return to Home</button>
        </div>
      </div>
    );
  }

  const filterCounts = getFilterCounts();

  return (
    <div className="graph-generation-page">
      <div className="page-header">
        <h1>Graph Generation</h1>
        <p>AI-powered graph generation from text descriptions using Plotly.js and Puppeteer</p>
        <button className="back-button" onClick={handleBackToAdmin}>
          ← Back to Admin Dashboard
        </button>
      </div>

      {/* Environment Status */}
      <div className="environment-status">
        <div className={`status-card ${environmentStatus.isReady ? 'ready' : 'not-ready'}`}>
          <span className="status-icon">
            {environmentStatus.isChecking ? '⏳' : environmentStatus.isReady ? '✅' : '❌'}
          </span>
          <div className="status-content">
            <h3>
              {environmentStatus.isChecking 
                ? 'Checking Environment...' 
                : environmentStatus.isReady 
                  ? 'Graph Generation Ready'
                  : 'Graph Generation Not Available'
              }
            </h3>
            {environmentStatus.error && (
              <p className="status-error">{environmentStatus.error}</p>
            )}
            {environmentStatus.details && (
              <div className="status-details">
                <p>✓ Plotly.js environment configured</p>
                <p>✓ Puppeteer available for image rendering</p>
                <p>✓ Gemini AI integration active</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="stats-section">
        <div className="stat-card">
          <h3>Total Questions</h3>
          <p className="stat-number">{totalQuestions}</p>
        </div>
        <div className="stat-card">
          <h3>With Graph Descriptions</h3>
          <p className="stat-number">{filterCounts.all}</p>
        </div>
        <div className="stat-card">
          <h3>General Context</h3>
          <p className="stat-number">
            {questions.filter(q => 
              q.graphDescription && q.graphDescription.trim() !== '' && 
              (q.usageContext || 'general') === 'general'
            ).length}
          </p>
        </div>
        <div className="stat-card">
          <h3>Exam Context</h3>
          <p className="stat-number">
            {questions.filter(q => 
              q.graphDescription && q.graphDescription.trim() !== '' && 
              q.usageContext === 'exam'
            ).length}
          </p>
        </div>
        <div className="stat-card">
          <h3>Need Graphs</h3>
          <p className="stat-number">{filterCounts.needsGraph}</p>
        </div>
        <div className="stat-card">
          <h3>Have Graphs</h3>
          <p className="stat-number">{filterCounts.hasGraph}</p>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="filter-controls">
        <h3>Filter Questions</h3>
        <div className="filter-buttons">
          <button 
            className={filter === 'needsGraph' ? 'active' : ''}
            onClick={() => setFilter('needsGraph')}
          >
            Need Graphs ({filterCounts.needsGraph})
          </button>
          <button 
            className={filter === 'hasGraph' ? 'active' : ''}
            onClick={() => setFilter('hasGraph')}
          >
            Have Graphs ({filterCounts.hasGraph})
          </button>
          <button 
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            All with Descriptions ({filterCounts.all})
          </button>
        </div>
        
        <div className="search-container">
          <input
            type="text"
            placeholder="Search questions or descriptions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Bulk Actions */}
      {environmentStatus.isReady && filterCounts.needsGraph > 0 && (
        <div className="bulk-actions">
          <div className="selection-controls">
            <label className="select-all-checkbox">
              <input
                type="checkbox"
                checked={selectedQuestions.size > 0 && selectedQuestions.size === filteredQuestions.filter(q => q.graphDescription && q.graphDescription.trim() !== '').length}
                onChange={handleSelectAll}
                disabled={bulkGenerating || selectiveGenerating}
              />
              <span className="checkbox-label">
                {selectedQuestions.size > 0 
                  ? `${selectedQuestions.size} questions selected`
                  : 'Select all questions'
                }
              </span>
            </label>
          </div>
          
          <div className="generation-buttons">
            <button 
              className="bulk-generate-btn"
              onClick={handleBulkGenerate}
              disabled={bulkGenerating || selectiveGenerating}
            >
              {bulkGenerating 
                ? `🚀 Generating All... (${generationProgress.current}/${generationProgress.total})`
                : `🚀 Generate All Missing Graphs (${filterCounts.needsGraph})`
              }
            </button>
            
            {selectedQuestions.size > 0 && (
              <button 
                className="selective-generate-btn"
                onClick={handleGenerateSelectedGraphs}
                disabled={bulkGenerating || selectiveGenerating}
              >
                {selectiveGenerating 
                  ? `🎯 Generating Selected... (${generationProgress.current}/${generationProgress.total})`
                  : `🎯 Generate Selected Graphs (${selectedQuestions.size})`
                }
              </button>
            )}
          </div>
          
          {(bulkGenerating || selectiveGenerating) && (
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ 
                  width: `${(generationProgress.current / generationProgress.total) * 100}%` 
                }}
              ></div>
            </div>
          )}
        </div>
      )}

      {/* Questions Section */}
      <div className="questions-section">
        <h3>Questions ({filteredQuestions.length})</h3>
        
        {filteredQuestions.length === 0 ? (
          <div className="no-questions">
            <p>No questions found matching the current filter.</p>
            {searchTerm && <p>Try adjusting your search terms.</p>}
          </div>
        ) : (
          <div className="questions-grid">
            {filteredQuestions.map((question) => {
              // Debug: Log environment status during render
              console.log(`📋 Rendering question ${question.id}: envReady=${environmentStatus.isReady}, hasGraph=${!!question.graphUrl}`);
              return (
              <div 
                key={question.id} 
                className="question-card"
                onClick={() => openQuestionModal(question)}
                style={{
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '';
                }}
              >
                <div className="question-header">
                  <div className="question-header-left">
                    <label className="question-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedQuestions.has(question.id)}
                        onChange={() => handleSelectQuestion(question.id)}
                        disabled={bulkGenerating || selectiveGenerating}
                        onClick={(e) => e.stopPropagation()} // Prevent modal from opening when clicking checkbox
                      />
                    </label>
                    <span className="question-id">{question.id}</span>
                  </div>
                  <div className="header-actions">
                    <span className={`graph-status ${question.graphUrl ? 'has-graph' : 'needs-graph'}`}>
                      {question.graphUrl ? '✅ Has Graph' : '⏳ Needs Graph'}
                    </span>
                    <span className={`difficulty-badge ${question.difficulty || 'medium'}`}>
                      {question.difficulty || 'medium'}
                    </span>
                    <span className={`context-badge ${question.usageContext || 'general'}`}>
                      {question.usageContext === 'exam' ? 'Exam' : 'General'}
                    </span>
                  </div>
                </div>
                
                {/* Graph Generation Actions - Moved to top for visibility */}
                <div className="question-actions" style={{
                  padding: '10px',
                  borderBottom: '1px solid #eee',
                  marginBottom: '10px',
                  backgroundColor: '#f8f9fa'
                }}>
                  {/* Test element for debugging */}
                  <div style={{
                    backgroundColor: '#e8f5e8',
                    color: '#2d5a2d',
                    padding: '8px',
                    margin: '5px 0',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    🟢 Status: envReady={environmentStatus.isReady ? 'YES' : 'NO'} | hasGraph={question.graphUrl ? 'YES' : 'NO'}
                  </div>
                  
                  {!question.graphUrl && environmentStatus.isReady && (
                    <button 
                      className="generate-graph-btn"
                      onClick={() => handleGenerateGraph(question)}
                      disabled={generatingQuestions.has(question.id) || bulkGenerating || selectiveGenerating}
                      style={{
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        marginRight: '10px'
                      }}
                    >
                      {generatingQuestions.has(question.id) 
                        ? '⏳ Generating...' 
                        : '🎨 Generate Graph'
                      }
                    </button>
                  )}
                  
                  {!question.graphUrl && !environmentStatus.isReady && (
                    <button 
                      className="generate-graph-btn" 
                      disabled
                      style={{
                        backgroundColor: '#ffc107',
                        color: '#000',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '4px',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        opacity: 0.7
                      }}
                    >
                      🔧 Environment Not Ready
                    </button>
                  )}
                  
                  {question.graphUrl && (
                    <button 
                      className="regenerate-graph-btn"
                      onClick={() => handleGenerateGraph(question)}
                      disabled={generatingQuestions.has(question.id) || bulkGenerating || selectiveGenerating}
                      style={{
                        backgroundColor: '#17a2b8',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 'bold'
                      }}
                    >
                      {generatingQuestions.has(question.id) 
                        ? '⏳ Regenerating...' 
                        : '🔄 Regenerate Graph'
                      }
                    </button>
                  )}
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
                        alt="Generated Graph" 
                        className="question-graph-preview"
                      />
                    </div>
                  )}
                </div>
              </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Generation Results */}
      {generationResults.length > 0 && (
        <div className="generation-results">
          <h3>Generation Results</h3>
          <div className="results-summary">
            <p>
              Successful: {generationResults.filter(r => r.success).length} | 
              Failed: {generationResults.filter(r => !r.success).length}
            </p>
          </div>
          
          {generationResults.filter(r => !r.success).length > 0 && (
            <div className="failed-results">
              <h4>Failed Generations:</h4>
              {generationResults.filter(r => !r.success).map(result => (
                <div key={result.questionId} className="failed-result">
                  <strong>Question {result.questionId}:</strong> {result.error}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Question Modal */}
      {isModalOpen && selectedQuestion && (
        <div className="modal-overlay" onClick={closeQuestionModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Question Details</h2>
              <button className="modal-close-btn" onClick={closeQuestionModal}>
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="question-meta">
                <div className="meta-item">
                  <span className="meta-label">Question ID:</span>
                  <span className="meta-value">{selectedQuestion.id}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Difficulty:</span>
                  <span className={`difficulty-badge ${selectedQuestion.difficulty || 'medium'}`}>
                    {selectedQuestion.difficulty || 'medium'}
                  </span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Graph Status:</span>
                  <span className={`graph-status ${selectedQuestion.graphUrl ? 'has-graph' : 'needs-graph'}`}>
                    {selectedQuestion.graphUrl ? '✅ Has Graph' : '⏳ Needs Graph'}
                  </span>
                </div>
              </div>

              <div className="modal-section">
                <h3>Question Text</h3>
                <div className="question-text-full">
                  {selectedQuestion.text}
                </div>
              </div>

              <div className="modal-section">
                <h3>Graph Description</h3>
                <div className="graph-description-full">
                  {selectedQuestion.graphDescription}
                </div>
              </div>

              {selectedQuestion.graphUrl && (
                <div className="modal-section">
                  <h3>Generated Graph</h3>
                  <div className="graph-container">
                    <img 
                      src={selectedQuestion.graphUrl} 
                      alt="Generated Graph" 
                      className="modal-graph-image"
                    />
                  </div>
                </div>
              )}
            </div>
            
            <div className="modal-footer">
              <div className="modal-actions">
                {!selectedQuestion.graphUrl && environmentStatus.isReady && (
                  <button 
                    className="btn btn-primary"
                    onClick={() => handleModalGenerateGraph(selectedQuestion)}
                    disabled={generatingQuestions.has(selectedQuestion.id) || bulkGenerating || selectiveGenerating}
                  >
                    {generatingQuestions.has(selectedQuestion.id) 
                      ? '⏳ Generating...' 
                      : '🎨 Generate Graph'
                    }
                  </button>
                )}
                
                {!selectedQuestion.graphUrl && !environmentStatus.isReady && (
                  <button className="btn btn-warning" disabled>
                    🔧 Environment Not Ready
                  </button>
                )}
                
                {selectedQuestion.graphUrl && (
                  <button 
                    className="btn btn-secondary"
                    onClick={() => handleModalGenerateGraph(selectedQuestion)}
                    disabled={generatingQuestions.has(selectedQuestion.id) || bulkGenerating || selectiveGenerating}
                  >
                    {generatingQuestions.has(selectedQuestion.id) 
                      ? '⏳ Regenerating...' 
                      : '🔄 Regenerate Graph'
                    }
                  </button>
                )}
                
                {selectedQuestion.graphUrl && (
                  <button 
                    className="btn btn-info"
                    onClick={() => window.open(selectedQuestion.graphUrl, '_blank')}
                  >
                    🔍 View Full Size
                  </button>
                )}
                
                <button className="btn btn-outline" onClick={closeQuestionModal}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GraphGenerationPage; 