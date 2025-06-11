import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook, faPuzzlePiece, faLightbulb, faTimes, faSave, faCheck } from '@fortawesome/free-solid-svg-icons';
import { saveBankItem } from '../api/helperClient';
import { toast } from 'react-toastify';
import '../styles/HelperItemsPanel.css';

/**
 * Component for displaying helper items (vocabulary or concepts) for a quiz question
 */
const HelperItemsPanel = ({ 
  helperItems = [], 
  helperType = 'vocabulary', 
  loading = false,
  subcategory = '',
  onClose
}) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [savingItem, setSavingItem] = useState(false);
  const [savedItems, setSavedItems] = useState([]);
  
  // Reset selected item when helper items change
  useEffect(() => {
    setSelectedItem(null);
  }, [helperItems]);
  
  // Helper function to determine the panel title based on helper type
  const getPanelTitle = () => {
    if (helperType === 'vocabulary') {
      return 'Key Vocabulary';
    }
    return 'Key Concepts';
  };

  // Handle clicking on a helper item
  const handleItemClick = (item) => {
    setSelectedItem(item);
  };

  // Handle saving a helper item to the user's bank
  const handleSaveItem = async (item) => {
    if (savingItem) return;
    
    try {
      setSavingItem(true);
      
      await saveBankItem(
        item.term, 
        item.definition, 
        helperType === 'vocabulary' ? 'word' : 'concept',
        'quiz',
        { subcategory }
      );
      
      // Add to local saved items list
      setSavedItems(prev => [...prev, item.term]);
      
      // Show success message
      toast.success(`${helperType === 'vocabulary' ? 'Word' : 'Concept'} saved to your ${helperType === 'vocabulary' ? 'word' : 'concept'} bank!`);
      
    } catch (error) {
      console.error('Error saving item:', error);
      toast.error(`Failed to save ${helperType === 'vocabulary' ? 'word' : 'concept'}. Please try again.`);
    } finally {
      setSavingItem(false);
    }
  };

  return (
    <div className={`helper-panel ${helperType}`}>
      <div className="helper-panel-header">
        <h3>
          <FontAwesomeIcon icon={helperType === 'vocabulary' ? faBook : faPuzzlePiece} />
          {' '}{getPanelTitle()}
        </h3>
        {onClose && (
          <button onClick={onClose} className="helper-panel-close">
            <FontAwesomeIcon icon={faTimes} />
          </button>
        )}
      </div>
      
      <div className="helper-panel-content">
        {loading ? (
          <div className="helper-panel-loading">
            <p>Loading {helperType === 'vocabulary' ? 'vocabulary' : 'concepts'}...</p>
          </div>
        ) : helperItems.length === 0 ? (
          <div className="helper-panel-empty">
            <p>No {helperType === 'vocabulary' ? 'vocabulary terms' : 'concepts'} found for this question.</p>
          </div>
        ) : (
          <>
            <div className="helper-items-list">
              {helperItems.map((item, index) => (
                <div 
                  key={index} 
                  className={`helper-item ${selectedItem === item ? 'selected' : ''} ${savedItems.includes(item.term) ? 'saved' : ''}`}
                  onClick={() => handleItemClick(item)}
                >
                  <span className="helper-item-term">{item.term}</span>
                  {savedItems.includes(item.term) && (
                    <FontAwesomeIcon icon={faCheck} className="helper-item-saved-icon" />
                  )}
                </div>
              ))}
            </div>
            
            {selectedItem && (
              <div className="helper-item-details">
                <h4>{selectedItem.term}</h4>
                <p>{selectedItem.definition}</p>
                <button 
                  onClick={() => handleSaveItem(selectedItem)} 
                  disabled={savingItem || savedItems.includes(selectedItem.term)}
                  className="save-item-button"
                >
                  <FontAwesomeIcon icon={savedItems.includes(selectedItem.term) ? faCheck : faSave} />
                  {savedItems.includes(selectedItem.term) 
                    ? `Saved to My ${helperType === 'vocabulary' ? 'Words' : 'Concepts'}` 
                    : `Save to My ${helperType === 'vocabulary' ? 'Words' : 'Concepts'}`}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default HelperItemsPanel;
