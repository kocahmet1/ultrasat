import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { doc, getDoc, setDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { uploadFile, deleteFile } from '../utils/storageService';
import { 
  getSubcategoriesArray, 
  getSubcategoryIdFromString, 
  getSubcategoryName,
  getKebabCaseFromAnyFormat
} from '../utils/subcategoryConstants';
import QuestionPreview from '../components/QuestionPreview';
import '../styles/QuestionEditor.css';
import '../styles/GraphUpload.css';

const QuestionEditor = () => {
  const { questionId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isEditing = !!questionId;
  
  // Helper function to navigate back to the correct location
  const navigateBack = () => {
    const referrer = searchParams.get('referrer');
    navigate(referrer || '/admin');
  };
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [question, setQuestion] = useState({
    text: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: '',
    subcategoryId: 0, // Using numeric ID for subcategories
    difficulty: 'medium',
    source: 'custom',
    usageContext: 'general',
    graphUrl: null,
    graphDescription: null
  });
  
  // Get all subcategories for dropdown
  const [subcategories, setSubcategories] = useState([]);
  
  useEffect(() => {
    // Load all subcategories for the dropdown
    setSubcategories(getSubcategoriesArray());
  }, []);
  
  const [graphFile, setGraphFile] = useState(null);
  const [graphPreview, setGraphPreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchQuestion = async () => {
      if (!isEditing) {
        setLoading(false);
        return;
      }
      
      try {
        const questionRef = doc(db, 'questions', questionId);
        const questionSnap = await getDoc(questionRef);
        
        if (questionSnap.exists()) {
          const questionData = questionSnap.data();
          
          // Handle different subcategory formats by normalizing to numeric ID
          let subcategoryId = questionData.subcategoryId;
          
          // If we have legacy format (subcategory as string), convert to ID
          if (!subcategoryId && questionData.subcategory) {
            subcategoryId = getSubcategoryIdFromString(questionData.subcategory) || 0;
          }
          
          setQuestion({
            ...questionData,
            id: questionId,
            subcategoryId: subcategoryId || 0 // Ensure we have a numeric subcategoryId
          });
          
          // If there's a graph URL, set the preview
          if (questionData.graphUrl) {
            setGraphPreview(questionData.graphUrl);
          }
        } else {
          setError('Question not found');
        }
      } catch (err) {
        setError('Error loading question: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestion();
  }, [questionId, isEditing]);
  
  // Handle graph file selection and automatic upload
  const handleGraphFileChange = async (e) => {
    const file = e.target.files[0];
    console.log('DEBUG - File selected:', file);
    
    if (!file) return;
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      setUploadError('Please select a valid image file (JPG, PNG, or SVG)');
      return;
    }
    
    // Validate file size (300KB max)
    if (file.size > 300 * 1024) {
      setUploadError('Image file size should be less than 300KB');
      return;
    }
    
    setGraphFile(file);
    setUploadError('');
    setUploadSuccess(false);
    
    console.log('DEBUG - File validation passed, creating preview and uploading');
    
    // Create a preview URL first
    const reader = new FileReader();
    reader.onload = (e) => {
      console.log('DEBUG - File reader completed, setting preview');
      setGraphPreview(e.target.result);
    };
    reader.readAsDataURL(file);
    
    // Automatically upload the file
    console.log('DEBUG - Auto-uploading file after selection');
    const uploadedUrl = await uploadGraph(file);
    if (uploadedUrl) {
      console.log('DEBUG - Auto-upload successful, setting question graphUrl to:', uploadedUrl);
      setQuestion(prev => ({
        ...prev,
        graphUrl: uploadedUrl
      }));
      setGraphPreview(uploadedUrl); // Use the uploaded URL as preview
      console.log('DEBUG - Question state updated with auto-uploaded graphUrl');
    } else {
      console.log('DEBUG - Auto-upload failed');
    }
  };
  
  // Handle upload button click - separate from form submission
  const handleUploadButtonClick = async (e) => {
    e.preventDefault(); // Prevent form submission
    console.log('DEBUG - Upload button clicked');
    
    if (!graphFile) {
      setUploadError('Please select a graph file first');
      return;
    }
    
    console.log('DEBUG - About to upload graph file:', graphFile);
    
    const uploadedUrl = await uploadGraph();
    if (uploadedUrl) {
      console.log('DEBUG - Setting question graphUrl to:', uploadedUrl);
      // Store the uploaded URL in the question state and update preview
      setQuestion(prev => ({
        ...prev,
        graphUrl: uploadedUrl
      }));
      setGraphPreview(uploadedUrl);
      console.log('DEBUG - Question state updated with graphUrl');
    } else {
      console.log('DEBUG - Upload failed, no URL returned');
    }
  };
  
  // Upload the graph to Firebase Storage (or local storage in development)
  const uploadGraph = async (fileToUpload = null) => {
    const file = fileToUpload || graphFile;
    if (!file) return null;
    
    try {
      setUploadProgress(0);
      setUploadSuccess(false);
      setUploadError('');
      
      console.log('DEBUG - Starting graph upload, file:', file);
      
      // Create a unique path for the graph
      const storageId = isEditing ? questionId : `temp_${Date.now()}`;
      const graphPath = `graphs/${storageId}_${file.name.replace(/\s+/g, '_')}`;
      
      console.log('DEBUG - Upload path:', graphPath);
      
      // Upload the file using our storageService utility
      setUploadProgress(50); // Show progress to user
      const downloadUrl = await uploadFile(file, graphPath);
      setUploadProgress(100);
      
      console.log('DEBUG - Upload completed, downloadUrl:', downloadUrl);
      
      // Show success message
      setUploadSuccess(true);
      
      return downloadUrl;
    } catch (err) {
      console.error('DEBUG - Upload error:', err);
      setUploadError(`Error uploading graph: ${err.message}`);
      setUploadSuccess(false);
      return null;
    }
  };
  
  // Remove the graph
  const removeGraph = async () => {
    // Clear the state
    setGraphFile(null);
    setGraphPreview(null);
    setUploadProgress(0);
    setUploadSuccess(false);
    setUploadError('');
    
    // If we have a stored graph URL and we're editing, delete it from storage
    if (question.graphUrl && isEditing) {
      try {
        // Delete using our storageService utility
        await deleteFile(question.graphUrl);
      } catch (err) {
        console.error('Error removing graph from storage:', err);
      }
    }
    
    // Update the question state
    setQuestion(prev => ({
      ...prev,
      graphUrl: null
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setQuestion(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...question.options];
    newOptions[index] = value;
    setQuestion(prev => ({
      ...prev,
      options: newOptions
    }));
  };

  const handleCorrectAnswerChange = (index) => {
    setQuestion(prev => ({
      ...prev,
      correctAnswer: index
    }));
  };

  const addOption = () => {
    setQuestion(prev => ({
      ...prev,
      options: [...prev.options, '']
    }));
  };

  const removeOption = (index) => {
    if (question.options.length <= 2) {
      setError('Questions must have at least 2 options');
      return;
    }

    const newOptions = [...question.options];
    newOptions.splice(index, 1);
    
    // Adjust correctAnswer if it was the removed option or after it
    let newCorrectAnswer = question.correctAnswer;
    if (index === question.correctAnswer) {
      newCorrectAnswer = 0;
    } else if (index < question.correctAnswer) {
      newCorrectAnswer = question.correctAnswer - 1;
    }

    setQuestion(prev => ({
      ...prev,
      options: newOptions,
      correctAnswer: newCorrectAnswer
    }));
  };

  const handleSave = async () => {
    try {
      // NOTE: We no longer handle graph upload here - it's done separately via the upload button
      // Use the graphUrl that's already in the question state
      
      // Debug: Check what's in the question state
      console.log('DEBUG - Question state before save:', question);
      console.log('DEBUG - GraphUrl in question state:', question.graphUrl);
      console.log('DEBUG - GraphPreview state:', graphPreview);
      
      // Create question object - use the graphUrl from the question state
      const questionToSave = {
        ...question
      };
      
      // Remove id if present (it will be in the document reference)
      delete questionToSave.id;
      
      // CRITICAL FIX: Ensure both subcategoryId (numeric) and subcategory (kebab-case) are set
      // This ensures compatibility with both legacy systems and the new smart quiz system
      const numericSubcategoryId = parseInt(questionToSave.subcategoryId, 10);
      questionToSave.subcategoryId = numericSubcategoryId;
      
      // Add the canonical kebab-case subcategory format for smart quiz compatibility
      const kebabSubcategory = getKebabCaseFromAnyFormat(numericSubcategoryId);
      if (kebabSubcategory) {
        questionToSave.subcategory = kebabSubcategory;
      } else {
        // Fallback to human-readable format if kebab conversion fails
        questionToSave.subcategory = getSubcategoryName(numericSubcategoryId);
      }
      
      console.log(`QuestionEditor: Saving question with subcategoryId=${numericSubcategoryId}, subcategory=${questionToSave.subcategory}`);
      console.log('DEBUG - Final questionToSave object:', questionToSave);
      
      // Add timestamps
      if (isEditing) {
        // For edited questions, just update the updatedAt timestamp
        questionToSave.updatedAt = serverTimestamp();
      } else {
        // For new questions, set both createdAt and updatedAt
        questionToSave.createdAt = serverTimestamp();
        questionToSave.updatedAt = serverTimestamp();
      }

      let questionRef;
      if (isEditing) {
        questionRef = doc(db, 'questions', questionId);
      } else {
        // For new questions, generate a new document with auto-ID
        questionRef = doc(collection(db, 'questions'));
      }

      await setDoc(questionRef, questionToSave);
      console.log('DEBUG - Question saved successfully to Firestore');
      navigateBack(); // Go back to the referrer page after saving
    } catch (err) {
      setError('Error saving question: ' + err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!question.text.trim()) {
      setError('Question text is required');
      return;
    }

    if (question.options.some(option => !option.trim())) {
      setError('All options must have content');
      return;
    }

    if (!question.subcategoryId) {
      setError('Subcategory is required');
      return;
    }

    if (!question.usageContext) {
      setError('Usage context must be selected');
      return;
    }

    await handleSave();
  };

  if (loading) {
    return <div className="question-editor-container">Loading...</div>;
  }

  return (
    <div className="question-editor-container">
      <h1>{isEditing ? 'Edit Question' : 'Create New Question'}</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      {/* Question Preview Modal */}
      {showPreview && (
        <QuestionPreview 
          question={question}
          graphUrl={question.graphUrl || graphPreview}
          onClose={() => setShowPreview(false)}
        />
      )}
      
      <form onSubmit={handleSubmit} className="question-editor-form">
        <div className="form-group">
          <label htmlFor="text">Question Text:</label>
          <textarea
            id="text"
            name="text"
            value={question.text}
            onChange={handleInputChange}
            rows={4}
            required
          />
        </div>

        <div className="form-group">
          <label>Options:</label>
          {question.options.map((option, index) => (
            <div key={index} className="option-container">
              <input
                type="radio"
                id={`correct-${index}`}
                name="correctAnswer"
                checked={question.correctAnswer === index}
                onChange={() => handleCorrectAnswerChange(index)}
              />
              <textarea
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                placeholder={`Option ${index + 1}`}
                required
              />
              <button 
                type="button" 
                className="remove-option-btn"
                onClick={() => removeOption(index)}
              >
                ✕
              </button>
            </div>
          ))}
          <button type="button" className="add-option-btn" onClick={addOption}>
            Add Option
          </button>
        </div>

        <div className="form-group">
          <label htmlFor="explanation">Explanation:</label>
          <textarea
            id="explanation"
            name="explanation"
            value={question.explanation}
            onChange={handleInputChange}
            rows={3}
          />
        </div>

        <div className="form-group">
          <label htmlFor="subcategoryId">Subcategory:</label>
          <select
            id="subcategoryId"
            name="subcategoryId"
            value={question.subcategoryId}
            onChange={handleInputChange}
            required
          >
            <option value="">Select a subcategory</option>
            
            {/* Reading & Writing Section */}
            <optgroup label="Reading & Writing - Information & Ideas">
              {subcategories
                .filter(s => s.category.startsWith('reading-writing.information-ideas'))
                .map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))
              }
            </optgroup>
            
            <optgroup label="Reading & Writing - Craft & Structure">
              {subcategories
                .filter(s => s.category.startsWith('reading-writing.craft-structure'))
                .map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))
              }
            </optgroup>
            
            <optgroup label="Reading & Writing - Expression of Ideas">
              {subcategories
                .filter(s => s.category.startsWith('reading-writing.expression-of-ideas'))
                .map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))
              }
            </optgroup>
            
            <optgroup label="Reading & Writing - Standard English Conventions">
              {subcategories
                .filter(s => s.category.startsWith('reading-writing.standard-english-conventions'))
                .map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))
              }
            </optgroup>
            
            {/* Math Section */}
            <optgroup label="Math - Algebra">
              {subcategories
                .filter(s => s.category.startsWith('math.algebra'))
                .map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))
              }
            </optgroup>
            
            <optgroup label="Math - Advanced Math">
              {subcategories
                .filter(s => s.category.startsWith('math.advanced-math'))
                .map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))
              }
            </optgroup>
            
            <optgroup label="Math - Problem Solving & Data Analysis">
              {subcategories
                .filter(s => s.category.startsWith('math.problem-solving-data-analysis'))
                .map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))
              }
            </optgroup>
            
            <optgroup label="Math - Geometry & Trigonometry">
              {subcategories
                .filter(s => s.category.startsWith('math.geometry-trigonometry'))
                .map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))
              }
            </optgroup>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="difficulty">Difficulty:</label>
          <select
            id="difficulty"
            name="difficulty"
            value={question.difficulty}
            onChange={handleInputChange}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="usageContext">Usage Context:</label>
          <select
            id="usageContext"
            name="usageContext"
            value={question.usageContext}
            onChange={handleInputChange}
            required
          >
            <option value="general">General Use (Skill Drills, Adaptive Quizzes, Exams)</option>
            <option value="exam">Practice Exam Only</option>
          </select>
        </div>
        
        {/* Graph Upload Section */}
        <div className="form-group">
          <label>Graph Image (for Math Questions):</label>
          <div className="graph-upload-container">
            {(graphPreview || question.graphUrl) ? (
              <div className="graph-preview">
                <img 
                  src={question.graphUrl || graphPreview} 
                  alt="Graph Preview" 
                  className="graph-preview-image" 
                />
                <div className="graph-preview-actions">
                  <button 
                    type="button" 
                    className="preview-graph-btn" 
                    onClick={() => setShowPreview(true)}
                  >
                    Preview Question
                  </button>
                  <button 
                    type="button" 
                    className="remove-graph-btn" 
                    onClick={removeGraph}
                  >
                    Remove Graph
                  </button>
                </div>
              </div>
            ) : (
              <div className="graph-upload">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleGraphFileChange}
                  accept="image/jpeg,image/png,image/svg+xml"
                  className="graph-file-input"
                />
                <div className="graph-upload-actions">
                  <button 
                    type="button" 
                    className="select-graph-btn"
                    onClick={() => fileInputRef.current.click()}
                  >
                    Select Graph Image
                  </button>
                </div>
                <p className="graph-upload-help">
                  Supported formats: JPG, PNG, SVG (max 300KB). Upload happens automatically when you select a file.
                </p>
              </div>
            )}
            {uploadError && (
              <div className="graph-upload-error">{uploadError}</div>
            )}
            {uploadSuccess && (
              <div className="graph-upload-success">
                Graph automatically uploaded and attached to question! 
                <button 
                  type="button" 
                  className="preview-btn" 
                  onClick={() => setShowPreview(true)}
                >
                  Preview Question with Graph
                </button>
              </div>
            )}
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="upload-progress">
                Uploading: {uploadProgress}%
              </div>
            )}
          </div>
        </div>

        {/* Graph Description Section */}
        <div className="form-group">
          <label htmlFor="graphDescription">Graph Description (for questions with graphs):</label>
          <textarea
            id="graphDescription"
            name="graphDescription"
            value={question.graphDescription || ''}
            onChange={handleInputChange}
            placeholder="Provide a detailed description of any graph, chart, or visual element. Include axis labels, scales, plotted points, lines, intersections, and any other visual information needed to solve the problem. Leave empty if no visual element is present."
            rows="4"
            className="form-control"
          />
          <small className="form-help">
            This description will be used by the AI to understand the visual elements when generating questions with graphs.
          </small>
        </div>

        <div className="form-actions">
          <button type="submit" className="save-btn">
            Save Question
          </button>
          <button
            type="button"
            className="preview-save-btn"
            onClick={(e) => {
              e.preventDefault();
              setShowPreview(true);
            }}
          >
            Preview Question
          </button>
          <button
            type="button"
            className="cancel-btn"
            onClick={navigateBack}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuestionEditor;
