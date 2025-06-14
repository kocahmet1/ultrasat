import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBook, 
  faSave, 
  faEdit, 
  faPlus, 
  faTrash,
  faEye,
  faUpload,
  faDownload,
  faFileImport
} from '@fortawesome/free-solid-svg-icons';
import { 
  getLearningContent, 
  saveLearningContent, 
  updateLearningContentSection 
} from '../firebase/learningContentServices';
import { 
  importLearningContent, 
  importMultipleLearningContents,
  validateLearningContent 
} from '../utils/learningContentImporter';
import { SUBCATEGORY_NAMES } from '../utils/subcategoryConstants';
import { toast, ToastContainer } from 'react-toastify';
import '../styles/AdminLearningContent.css';

export default function AdminLearningContent() {
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [learningContent, setLearningContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState(null);

  // Form state for editing
  const [formData, setFormData] = useState({
    overview: '',
    keyStrategies: [''],
    commonMistakes: [''],
    studyTips: [''],
    difficulty: 'varies',
    estimatedStudyTime: '2-3 hours'
  });

  const subcategories = Object.entries(SUBCATEGORY_NAMES).map(([id, name]) => ({
    id: parseInt(id),
    name,
    kebabCase: name.toLowerCase().replace(/[^a-zA-Z0-9]+/g, '-')
  }));

  useEffect(() => {
    if (selectedSubcategory) {
      loadContent();
    }
  }, [selectedSubcategory]);

  const loadContent = async () => {
    setLoading(true);
    try {
      const content = await getLearningContent(selectedSubcategory);
      setLearningContent(content);
      setFormData({
        overview: content.overview || '',
        keyStrategies: content.keyStrategies || [''],
        commonMistakes: content.commonMistakes || [''],
        studyTips: content.studyTips || [''],
        difficulty: content.difficulty || 'varies',
        estimatedStudyTime: content.estimatedStudyTime || '2-3 hours'
      });
    } catch (error) {
      toast.error('Failed to load learning content');
      console.error(error);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!selectedSubcategory) return;
    
    setSaving(true);
    try {
      await saveLearningContent(selectedSubcategory, formData);
      setLearningContent(formData);
      setEditMode(false);
      toast.success('Learning content saved successfully!');
    } catch (error) {
      toast.error('Failed to save learning content');
      console.error(error);
    }
    setSaving(false);
  };

  const handleArrayFieldChange = (field, index, value) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData({ ...formData, [field]: newArray });
  };

  const addArrayItem = (field) => {
    setFormData({ 
      ...formData, 
      [field]: [...formData[field], ''] 
    });
  };

  const removeArrayItem = (field, index) => {
    const newArray = formData[field].filter((_, i) => i !== index);
    setFormData({ ...formData, [field]: newArray });
  };

  // Import functionality
  const handleFileImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'application/json') {
      toast.error('Please select a JSON file');
      return;
    }

    try {
      const text = await file.text();
      const jsonContent = JSON.parse(text);
      
      // Validate content
      const validation = validateLearningContent(jsonContent);
      if (!validation.isValid) {
        toast.error(`Validation failed: ${validation.errors.join(', ')}`);
        return;
      }

      setImporting(true);
      const result = await importLearningContent(jsonContent);
      
      if (result.success) {
        toast.success(`Successfully imported content for ${result.title}`);
        setImportResults({
          type: 'single',
          success: true,
          data: result
        });
        
        // If the imported content is for the currently selected subcategory, reload it
        if (result.subcategoryId === selectedSubcategory) {
          await loadContent();
        }
      } else {
        toast.error(`Import failed: ${result.error}`);
        setImportResults({
          type: 'single',
          success: false,
          data: result
        });
      }
    } catch (error) {
      toast.error('Error reading file: ' + error.message);
      console.error('Import error:', error);
    } finally {
      setImporting(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const handleBatchImport = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    const jsonFiles = files.filter(file => file.type === 'application/json');
    if (jsonFiles.length === 0) {
      toast.error('Please select JSON files');
      return;
    }

    if (jsonFiles.length !== files.length) {
      toast.warning(`Only ${jsonFiles.length} of ${files.length} files are JSON files`);
    }

    try {
      setImporting(true);
      const jsonContents = [];

      // Read all files
      for (const file of jsonFiles) {
        const text = await file.text();
        const jsonContent = JSON.parse(text);
        jsonContents.push(jsonContent);
      }

      // Import all contents
      const results = await importMultipleLearningContents(jsonContents);
      
      toast.success(`Batch import completed: ${results.successful.length} successful, ${results.failed.length} failed`);
      setImportResults({
        type: 'batch',
        success: true,
        data: results
      });

      // Reload current content if it was updated
      if (selectedSubcategory && results.successful.some(item => item.subcategoryId === selectedSubcategory)) {
        await loadContent();
      }

    } catch (error) {
      toast.error('Batch import failed: ' + error.message);
      console.error('Batch import error:', error);
    } finally {
      setImporting(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const downloadSampleJson = () => {
    const sampleJson = {
      "subcategoryId": "sample-subcategory",
      "title": "Sample Subcategory",
      "lastUpdated": new Date().toISOString().split('T')[0],
      "metadata": {
        "difficulty": "Varies by specific question",
        "estimatedStudyTime": "2-3 hours for initial mastery",
        "questionFrequency": "Approximately 3-5 questions per exam",
        "testDomain": "Reading and Writing"
      },
      "overview": {
        "title": "Overview",
        "sections": {
          "definition": {
            "title": "Definition",
            "content": "Brief explanation of what this question type assesses and what students need to do."
          },
          "digitalSatContext": {
            "title": "Digital SAT Context",
            "content": "How this question type appears on the digital SAT, including format, frequency, and interface details."
          }
        }
      },
      "questionAnalysis": {
        "title": "Question Analysis",
        "sections": {
          "commonQuestionStems": {
            "title": "Common Question Stems",
            "content": "Typical question formats and phrasing patterns students will encounter."
          },
          "answerChoicePatterns": {
            "title": "Answer Choice Patterns",
            "content": "How correct and incorrect answers are typically structured and what to look for."
          }
        }
      },
      "strategicApproaches": {
        "title": "Strategic Approaches",
        "sections": {
          "primaryStrategy": {
            "title": "Primary Strategy",
            "content": "The main approach students should use for this question type."
          },
          "timeManagement": {
            "title": "Time Management",
            "content": "How to pace yourself and allocate time effectively for these questions."
          }
        }
      },
      "commonMistakesAnalysis": {
        "title": "Common Mistakes Analysis",
        "sections": {
          "frequentStudentErrors": {
            "title": "Frequent Student Errors",
            "content": "Most common mistakes students make and why they make them."
          },
          "trapAnswers": {
            "title": "Trap Answers",
            "content": "How test makers create attractive wrong answers and how to avoid them."
          }
        }
      },
      "studyStrategies": {
        "title": "Study Strategies",
        "sections": {
          "practiceRecommendations": {
            "title": "Practice Recommendations",
            "content": "Specific ways to practice and improve on this question type."
          },
          "skillBuilding": {
            "title": "Skill Building",
            "content": "Fundamental skills to develop that support success on these questions."
          }
        }
      },
      "keyStrategies": [
        "Main strategy point 1",
        "Main strategy point 2",
        "Main strategy point 3"
      ],
      "commonMistakes": [
        "Common mistake 1",
        "Common mistake 2",
        "Common mistake 3"
      ],
      "studyTips": [
        "Study tip 1",
        "Study tip 2",
        "Study tip 3"
      ]
    };

    const blob = new Blob([JSON.stringify(sampleJson, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample-learning-content.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const ArrayFieldEditor = ({ label, field, placeholder }) => (
    <div className="array-field">
      <label className="field-label">
        {label}
        <button 
          type="button" 
          className="add-item-btn"
          onClick={() => addArrayItem(field)}
        >
          <FontAwesomeIcon icon={faPlus} /> Add Item
        </button>
      </label>
      {formData[field].map((item, index) => (
        <div key={index} className="array-item">
          <textarea
            value={item}
            onChange={(e) => handleArrayFieldChange(field, index, e.target.value)}
            placeholder={placeholder}
            rows={2}
          />
          {formData[field].length > 1 && (
            <button 
              type="button"
              className="remove-item-btn"
              onClick={() => removeArrayItem(field, index)}
            >
              <FontAwesomeIcon icon={faTrash} />
            </button>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="admin-learning-content">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="admin-header">
        <h1>
          <FontAwesomeIcon icon={faBook} /> Learning Content Manager
        </h1>
        <p>Create and manage comprehensive learning content for each subcategory</p>
      </div>

      {/* Import Section */}
      <div className="content-section">
        <h2>Import Learning Content</h2>
        <div className="import-tools">
          <div className="import-buttons">
            <button 
              className="btn btn-success"
              onClick={downloadSampleJson}
            >
              <FontAwesomeIcon icon={faDownload} /> Download Sample JSON
            </button>
            
            <label className="btn btn-primary file-input-btn">
              <FontAwesomeIcon icon={faFileImport} /> 
              {importing ? 'Importing...' : 'Import Single File'}
              <input
                type="file"
                accept=".json"
                onChange={handleFileImport}
                disabled={importing}
                style={{ display: 'none' }}
              />
            </label>
            
            <label className="btn btn-secondary file-input-btn">
              <FontAwesomeIcon icon={faUpload} /> 
              {importing ? 'Importing...' : 'Batch Import'}
              <input
                type="file"
                accept=".json"
                multiple
                onChange={handleBatchImport}
                disabled={importing}
                style={{ display: 'none' }}
              />
            </label>
          </div>
          
          <div className="import-help">
            <p><strong>How to use:</strong></p>
            <ol>
              <li>Download the sample JSON to see the expected format</li>
              <li>Create your JSON files following the sample structure</li>
              <li>Use "Import Single File" for one subcategory or "Batch Import" for multiple</li>
            </ol>
          </div>
        </div>
        
        {/* Import Results */}
        {importResults && (
          <div className={`import-results ${importResults.success ? 'success' : 'error'}`}>
            <h3>Import Results</h3>
            {importResults.type === 'single' ? (
              <div>
                {importResults.success ? (
                  <p>✅ Successfully imported: <strong>{importResults.data.title}</strong></p>
                ) : (
                  <div>
                    <p>❌ Import failed: {importResults.data.error}</p>
                    {importResults.data.details && Array.isArray(importResults.data.details) && (
                      <ul>
                        {importResults.data.details.map((detail, index) => (
                          <li key={index}>{detail}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <p>📊 Batch Import Summary:</p>
                <ul>
                  <li>✅ Successful: {importResults.data.successful.length}</li>
                  <li>❌ Failed: {importResults.data.failed.length}</li>
                  <li>📁 Total: {importResults.data.total}</li>
                </ul>
                
                {importResults.data.successful.length > 0 && (
                  <div>
                    <h4>Successfully Imported:</h4>
                    <ul>
                      {importResults.data.successful.map((item, index) => (
                        <li key={index}>{item.title} ({item.subcategoryId})</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {importResults.data.failed.length > 0 && (
                  <div>
                    <h4>Failed Imports:</h4>
                    <ul>
                      {importResults.data.failed.map((item, index) => (
                        <li key={index}>
                          {item.subcategoryId}: {item.error}
                          {item.details && Array.isArray(item.details) && (
                            <ul>
                              {item.details.map((detail, detailIndex) => (
                                <li key={detailIndex}>{detail}</li>
                              ))}
                            </ul>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            
            <button 
              className="btn btn-secondary"
              onClick={() => setImportResults(null)}
            >
              Clear Results
            </button>
          </div>
        )}
      </div>

      {/* Subcategory Selection */}
      <div className="content-section">
        <h2>Select Subcategory</h2>
        <select 
          value={selectedSubcategory}
          onChange={(e) => setSelectedSubcategory(e.target.value)}
          className="subcategory-select"
        >
          <option value="">Choose a subcategory...</option>
          {subcategories.map(sub => (
            <option key={sub.id} value={sub.kebabCase}>
              {sub.name}
            </option>
          ))}
        </select>
      </div>

      {selectedSubcategory && (
        <div className="content-section">
          <div className="section-header">
            <h2>Content for: {subcategories.find(s => s.kebabCase === selectedSubcategory)?.name}</h2>
            <div className="action-buttons">
              {!editMode && (
                <button 
                  className="btn btn-primary"
                  onClick={() => setEditMode(true)}
                >
                  <FontAwesomeIcon icon={faEdit} /> Edit Content
                </button>
              )}
              {editMode && (
                <>
                  <button 
                    className="btn btn-success"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    <FontAwesomeIcon icon={faSave} /> 
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => {
                      setEditMode(false);
                      loadContent(); // Reset form
                    }}
                  >
                    Cancel
                  </button>
                </>
              )}
              <a 
                href={`/learn/${selectedSubcategory}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-info"
              >
                <FontAwesomeIcon icon={faEye} /> Preview Page
              </a>
            </div>
          </div>

          {loading ? (
            <div className="loading">Loading content...</div>
          ) : editMode ? (
            <form className="content-form">
              {/* Overview Section */}
              <div className="form-group">
                <label className="field-label">Overview (HTML)</label>
                <textarea
                  value={formData.overview}
                  onChange={(e) => setFormData({...formData, overview: e.target.value})}
                  placeholder="Write a comprehensive overview of this subcategory..."
                  rows={8}
                  className="overview-editor"
                />
                <small className="help-text">
                  You can use HTML tags like &lt;h3&gt;, &lt;p&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;ul&gt;, &lt;li&gt;
                </small>
              </div>

              {/* Metadata */}
              <div className="form-row">
                <div className="form-group">
                  <label className="field-label">Difficulty Level</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                    <option value="varies">Varies</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="field-label">Estimated Study Time</label>
                  <input
                    type="text"
                    value={formData.estimatedStudyTime}
                    onChange={(e) => setFormData({...formData, estimatedStudyTime: e.target.value})}
                    placeholder="e.g., 2-3 hours"
                  />
                </div>
              </div>

              {/* Array Fields */}
              <ArrayFieldEditor 
                label="Key Strategies"
                field="keyStrategies"
                placeholder="Describe a key strategy for this question type..."
              />

              <ArrayFieldEditor 
                label="Common Mistakes"
                field="commonMistakes"
                placeholder="Describe a common mistake students make..."
              />

              <ArrayFieldEditor 
                label="Study Tips"
                field="studyTips"
                placeholder="Provide a helpful study tip..."
              />
            </form>
          ) : (
            <div className="content-preview">
              {learningContent ? (
                <>
                  <div className="preview-section">
                    <h3>Overview</h3>
                    <div 
                      className="overview-content"
                      dangerouslySetInnerHTML={{ __html: learningContent.overview }}
                    />
                  </div>

                  <div className="preview-section">
                    <h3>Key Strategies ({learningContent.keyStrategies?.length || 0})</h3>
                    <ul>
                      {learningContent.keyStrategies?.map((strategy, index) => (
                        <li key={index}>{strategy}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="preview-section">
                    <h3>Common Mistakes ({learningContent.commonMistakes?.length || 0})</h3>
                    <ul>
                      {learningContent.commonMistakes?.map((mistake, index) => (
                        <li key={index}>{mistake}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="preview-section">
                    <h3>Study Tips ({learningContent.studyTips?.length || 0})</h3>
                    <ul>
                      {learningContent.studyTips?.map((tip, index) => (
                        <li key={index}>{tip}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="metadata">
                    <span className="meta-item">
                      <strong>Difficulty:</strong> {learningContent.difficulty}
                    </span>
                    <span className="meta-item">
                      <strong>Study Time:</strong> {learningContent.estimatedStudyTime}
                    </span>
                  </div>
                </>
              ) : (
                <div className="no-content">
                  No content available. Click "Edit Content" to create learning materials.
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 