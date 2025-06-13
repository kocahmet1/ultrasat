import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBook, 
  faSave, 
  faEdit, 
  faPlus, 
  faTrash,
  faEye
} from '@fortawesome/free-solid-svg-icons';
import { 
  getLearningContent, 
  saveLearningContent, 
  updateLearningContentSection 
} from '../firebase/learningContentServices';
import { SUBCATEGORY_NAMES } from '../utils/subcategoryConstants';
import { toast, ToastContainer } from 'react-toastify';
import '../styles/AdminLearningContent.css';

export default function AdminLearningContent() {
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [learningContent, setLearningContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);

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