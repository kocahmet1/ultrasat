import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSubcategories } from '../contexts/SubcategoryContext';
import { collection, getDocs, getDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import '../styles/StudyResources.css';

function StudyResources() {
  const navigate = useNavigate();
  const location = useLocation();
  const { allSubcategories, getCategorizedSubcategories } = useSubcategories();
  
  const [loading, setLoading] = useState(true);
  const [resources, setResources] = useState([]);
  const [selectedResource, setSelectedResource] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Extract specific resource ID from URL query params if present
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const resourceId = queryParams.get('id');
    
    if (resourceId) {
      loadSpecificResource(resourceId);
    }
  }, [location.search]);
  
  // Load all resources
  useEffect(() => {
    const loadResources = async () => {
      setLoading(true);
      try {
        const resourcesSnapshot = await getDocs(collection(db, 'studyResources'));
        const resourcesList = resourcesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setResources(resourcesList);
      } catch (error) {
        console.error('Error loading resources:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadResources();
  }, []);
  
  // Load a specific resource by ID
  const loadSpecificResource = async (resourceId) => {
    try {
      const resourceDoc = await getDoc(doc(db, 'studyResources', resourceId));
      if (resourceDoc.exists()) {
        setSelectedResource({
          id: resourceDoc.id,
          ...resourceDoc.data()
        });
      }
    } catch (error) {
      console.error('Error loading specific resource:', error);
    }
  };
  
  // Get subcategories for filtering
  const { weak } = getCategorizedSubcategories();
  
  // Filter resources based on selected filter and search term
  const getFilteredResources = () => {
    let filtered = [...resources];
    
    // Apply skill filter
    if (filter !== 'all') {
      filtered = filtered.filter(resource => 
        resource.subcategories && resource.subcategories.includes(filter)
      );
    }
    
    // Apply search term filter
    if (searchTerm) {
      const lowercaseSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(resource => 
        resource.title.toLowerCase().includes(lowercaseSearch) || 
        resource.description.toLowerCase().includes(lowercaseSearch)
      );
    }
    
    return filtered;
  };
  
  // Helper to get subcategory name from ID
  const getSubcategoryNameById = (subcategoryId) => {
    const subcategory = allSubcategories.find(s => s.id === subcategoryId);
    return subcategory ? subcategory.name : 'Unknown Subcategory';
  };
  
  // Handle back button from resource detail view
  const handleBackToList = () => {
    setSelectedResource(null);
    
    // Remove the id param from URL
    const newUrl = window.location.pathname;
    window.history.replaceState({}, '', newUrl);
  };
  
  // Loading state
  if (loading && !selectedResource) {
    return (
      <div className="resources-container">
        <div className="loading-container">
          <p>Loading study resources...</p>
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }
  
  // Detail view for a specific resource
  if (selectedResource) {
    return (
      <div className="resources-container">
        <div className="resource-detail">
          <button className="back-button" onClick={handleBackToList}>
            ← Back to All Resources
          </button>
          
          <div className="resource-header">
            <h1>{selectedResource.title}</h1>
            <div className="resource-meta">
              <span className="resource-type">{selectedResource.resourceType}</span>
              <span className="resource-difficulty">Difficulty: {selectedResource.difficulty}/5</span>
            </div>
          </div>
          
          <div className="resource-content">
            <div className="resource-description">
              <h2>Description</h2>
              <p>{selectedResource.description}</p>
            </div>
            
            <div className="resource-skills">
              <h2>Related Subcategories</h2>
              <div className="skill-tags">
                {selectedResource.subcategories && selectedResource.subcategories.map(subcategoryId => (
                  <Link 
                    key={subcategoryId} 
                    to={`/skills/${subcategoryId}`} 
                    className="skill-tag"
                  >
                    {getSubcategoryNameById(subcategoryId)}
                  </Link>
                ))}
                {/* If no subcategories, fall back to using subCategory directly */}
                {!selectedResource.subcategories && selectedResource.subCategory && (
                  <Link 
                    to={`/skills/${selectedResource.subCategory.toLowerCase().replace(/\s+/g, '-')}`}
                    className="skill-tag"
                  >
                    {selectedResource.subCategory}
                  </Link>
                )}
              </div>
            </div>
            
            <div className="resource-actions">
              <a 
                href={selectedResource.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="primary-button"
              >
                Open Resource
              </a>
              <button 
                className="secondary-button"
                onClick={() => navigate('/progress')}
              >
                Back to My Progress
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Default list view of all resources
  return (
    <div className="resources-container">
      <header className="resources-header">
        <h1>Study Resources</h1>
        <p>Browse our curated collection of study materials to help you prepare for the SAT.</p>
      </header>
      
      <div className="resources-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search resources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-dropdown">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Subcategories</option>
            {allSubcategories.map(subcategory => (
              <option key={subcategory.id} value={subcategory.id}>
                {subcategory.name}
              </option>
            ))}
          </select>
        </div>
        
        {weak.length > 0 && (
          <button 
            className="filter-button" 
            onClick={() => setFilter(weak[0].skillId)}
          >
            Show Weak Areas
          </button>
        )}
      </div>
      
      <div className="resources-grid">
        {getFilteredResources().length === 0 ? (
          <div className="no-resources-message">
            <p>No resources match your current filters.</p>
            <button 
              className="secondary-button" 
              onClick={() => {
                setFilter('all');
                setSearchTerm('');
              }}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          getFilteredResources().map(resource => (
            <div 
              key={resource.id} 
              className="resource-card"
              onClick={() => {
                setSelectedResource(resource);
                navigate(`/resources?id=${resource.id}`);
              }}
            >
              <div className="resource-icon">
                {resource.resourceType === 'video' && <span className="material-icon">video_library</span>}
                {resource.resourceType === 'article' && <span className="material-icon">article</span>}
                {resource.resourceType === 'practice' && <span className="material-icon">assignment</span>}
              </div>
              
              <h3>{resource.title}</h3>
              <p>{resource.description}</p>
              
              <div className="resource-card-footer">
                <div className="resource-type-tag">{resource.resourceType}</div>
                <div className="resource-difficulty-tag">Level: {resource.difficulty}/5</div>
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="resources-footer">
        <button 
          className="primary-button" 
          onClick={() => navigate('/dashboard')}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}

export default StudyResources;
