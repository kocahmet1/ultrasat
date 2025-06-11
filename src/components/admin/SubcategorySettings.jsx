import React, { useState, useEffect } from 'react';
import { collection, doc, getDoc, getDocs, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import subcategoryUtils, { normalizeSubcategoryName } from '../../utils/subcategoryUtils';
import './SubcategorySettings.css';

const SubcategorySettings = () => {
  const { currentUser } = useAuth();
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [helperSettings, setHelperSettings] = useState({});

  // Load subcategories data including helper types
  useEffect(() => {
    const fetchSubcategories = async () => {
      setLoading(true);
      console.log('[SubcategorySettings] Starting to fetch subcategories');
      try {
        // Get all subcategories from the util
        const allSubcategoriesObj = subcategoryUtils.getAllSubcategories();
        console.log('[SubcategorySettings] All subcategories from utils:', allSubcategoriesObj);
        let settings = {};
        
        // Try to load settings from global configuration
        try {
          console.log('[SubcategorySettings] Fetching global helper settings');
          const globalSettingsRef = doc(db, 'globalConfig', 'subcategoryHelperSettings');
          const globalDoc = await getDoc(globalSettingsRef);
          
          if (globalDoc.exists() && globalDoc.data().settings) {
            settings = globalDoc.data().settings;
            console.log('[SubcategorySettings] Loaded global settings:', settings);
          } else {
            console.log('[SubcategorySettings] No existing global settings found');
          }
        } catch (err) {
          console.error('[SubcategorySettings] Error loading global settings:', err);
          // Silently continue with empty settings
        }
        
        setHelperSettings(settings);
        
        // Combine data
        console.log('[SubcategorySettings] Combining and normalizing subcategories');
        const combinedSubcategories = Object.entries(allSubcategoriesObj).map(([id, subcategory]) => {
          // Ensure ID is properly normalized
          const normalizedId = normalizeSubcategoryName(id);
          console.log(`[SubcategorySettings] Normalizing ID: "${id}" → "${normalizedId}"`);
          
          // Get helper type from settings with fallback to vocabulary
          const helperType = settings[normalizedId] || 'vocabulary';
          console.log(`[SubcategorySettings] Helper type for "${normalizedId}": "${helperType}"`);
          
          return {
            id: normalizedId,
            originalId: id,
            name: subcategory.name,
            section: subcategory.section || (subcategory.fullPath?.startsWith('math') ? 'Math' : 'Reading & Writing'),
            color: subcategory.color || '#6c757d',
            helperType: helperType
          };
        });
        
        // Sort by section and then by name
        combinedSubcategories.sort((a, b) => {
          // First sort by section
          if (a.section !== b.section) {
            return a.section === 'Math' ? 1 : -1; // Reading & Writing first
          }
          // Then sort by name
          return a.name.localeCompare(b.name);
        });
        
        console.log('[SubcategorySettings] Final combined subcategories:', combinedSubcategories);
        setSubcategories(combinedSubcategories);
      } catch (error) {
        console.error('[SubcategorySettings] Error fetching subcategories:', error);
        showNotification('Failed to load subcategories.', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSubcategories();
  }, [currentUser]);
  
  // Handle change of helper type
  const handleHelperTypeChange = async (subcategoryId, newHelperType) => {
    console.log(`[SubcategorySettings] Changing helper type for "${subcategoryId}" to "${newHelperType}"`);
    
    // Store the original value for potential revert
    const originalSubcategory = subcategories.find(s => s.id === subcategoryId);
    const originalHelperType = originalSubcategory?.helperType || 'vocabulary';
    const originalSettings = { ...helperSettings };
    
    try {
      // Update locally first for immediate UI feedback
      setSubcategories(prevSubcategories => {
        const updatedSubcategories = prevSubcategories.map(subcategory => 
          subcategory.id === subcategoryId 
            ? { ...subcategory, helperType: newHelperType } 
            : subcategory
        );
        console.log('[SubcategorySettings] Updated subcategories in UI:', updatedSubcategories);
        return updatedSubcategories;
      });
      
      // Update helper settings
      const updatedSettings = { ...helperSettings, [subcategoryId]: newHelperType };
      console.log('[SubcategorySettings] Updated settings object:', updatedSettings);
      setHelperSettings(updatedSettings);
      
      // Save to global configuration in Firestore for persistence
      setSaving(true);
      console.log(`[SubcategorySettings] Saving settings to global configuration`);
      const globalSettingsRef = doc(db, 'globalConfig', 'subcategoryHelperSettings');
      await setDoc(globalSettingsRef, { 
        settings: updatedSettings,
        lastUpdated: new Date(),
        updatedBy: currentUser?.uid || 'unknown'
      });
      console.log('[SubcategorySettings] Successfully saved to global Firestore configuration');
      
      const subcategoryName = subcategories.find(s => s.id === subcategoryId)?.name || subcategoryId;
      console.log(`[SubcategorySettings] Updated "${subcategoryName}" (${subcategoryId}) to use ${newHelperType} helper`);
      showNotification(`Updated "${subcategoryName}" to use ${newHelperType} helper.`, 'success');
    } catch (error) {
      console.error('[SubcategorySettings] Error updating helper type:', error);
      showNotification('Failed to update helper type.', 'error');
      
      // Revert local state on error using the stored original value
      setSubcategories(prevSubcategories => 
        prevSubcategories.map(subcategory => 
          subcategory.id === subcategoryId 
            ? { ...subcategory, helperType: originalHelperType } // Revert to original
            : subcategory
        )
      );
      console.log('[SubcategorySettings] Reverted UI state due to error');
      
      // Revert helper settings to original state
      setHelperSettings(originalSettings);
      console.log('[SubcategorySettings] Reverted settings object due to error');
    } finally {
      setSaving(false);
    }
  };
  
  // Handle search filtering
  const filteredSubcategories = subcategories.filter(subcategory => 
    subcategory.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subcategory.id.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Group subcategories by section
  const groupedSubcategories = filteredSubcategories.reduce((acc, subcategory) => {
    const section = subcategory.section;
    if (!acc[section]) {
      acc[section] = [];
    }
    acc[section].push(subcategory);
    return acc;
  }, {});
  
  // Show notification
  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000); // Hide after 3 seconds
  };

  if (loading) {
    return <div className="loading">Loading subcategory settings...</div>;
  }

  return (
    <div className="subcategory-settings">
      <h2>Subcategory Helper Type Settings</h2>
      <p className="settings-description">
        Configure whether each subcategory should display vocabulary definitions or concept explanations to students during quizzes.
      </p>
      
      {/* Search bar */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Search subcategories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>
      
      {/* Notification */}
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}
      
      {/* Subcategory list grouped by section */}
      {Object.entries(groupedSubcategories).map(([section, sectionSubcategories]) => (
        <div key={section} className="section-group">
          <h3>{section}</h3>
          <div className="subcategory-list">
            <table>
              <thead>
                <tr>
                  <th>Subcategory Name</th>
                  <th>Helper Type</th>
                </tr>
              </thead>
              <tbody>
                {sectionSubcategories.map(subcategory => (
                  <tr key={subcategory.id} className="subcategory-item">
                    <td>
                      <div 
                        className="subcategory-color" 
                        style={{ backgroundColor: subcategory.color }}
                      />
                      <span className="subcategory-name">{subcategory.name}</span>
                      <span className="subcategory-id">({subcategory.id})</span>
                    </td>
                    <td>
                      <div className="helper-type-selector">
                        <label className={`radio-label ${subcategory.helperType === 'vocabulary' ? 'selected' : ''}`}>
                          <input
                            type="radio"
                            name={`helper-type-${subcategory.id}`}
                            value="vocabulary"
                            checked={subcategory.helperType === 'vocabulary'}
                            onChange={() => handleHelperTypeChange(subcategory.id, 'vocabulary')}
                            disabled={saving}
                          />
                          Vocabulary
                        </label>
                        <label className={`radio-label ${subcategory.helperType === 'concept' ? 'selected' : ''}`}>
                          <input
                            type="radio"
                            name={`helper-type-${subcategory.id}`}
                            value="concept"
                            checked={subcategory.helperType === 'concept'}
                            onChange={() => handleHelperTypeChange(subcategory.id, 'concept')}
                            disabled={saving}
                          />
                          Concept
                        </label>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
      
      {filteredSubcategories.length === 0 && (
        <div className="no-results">No subcategories found matching "{searchTerm}"</div>
      )}
    </div>
  );
};

export default SubcategorySettings;
