import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTrash, faEdit, faArrowLeft, faPuzzlePiece, faSearch, faFilter, faSortAmountDown, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { ToastContainer, toast } from 'react-toastify';
import FeatureHelpModal from '../components/FeatureHelpModal';
import '../styles/BankItem.css';

const ConceptBank = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [concepts, setConcepts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editNotes, setEditNotes] = useState('');
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest', 'oldest', 'alphabetical'
  const [subcategoryFilter, setSubcategoryFilter] = useState('all');
  const [uniqueSubcategories, setUniqueSubcategories] = useState([]);
  
  // Help modal state
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Load concepts from the user's bank
  useEffect(() => {
    const loadConcepts = async () => {
      if (!currentUser) {
        navigate('/login');
        return;
      }
      
      setLoading(true);
      
      try {
        // Query for items of type 'concept'
        const q = query(
          collection(db, 'users', currentUser.uid, 'bankItems'),
          where('type', '==', 'concept')
        );
        
        const querySnapshot = await getDocs(q);
        
        // Extract concepts and their subcategories
        const conceptList = [];
        const subcategories = new Set();
        
        querySnapshot.forEach((doc) => {
          const conceptData = doc.data();
          conceptList.push({
            id: doc.id,
            term: conceptData.term,
            definition: conceptData.definition,
            notes: conceptData.notes || '',
            subcategory: conceptData.metadata?.subcategory || 'Unknown',
            createdAt: conceptData.createdAt?.toDate() || new Date(),
            lastReviewedAt: conceptData.lastReviewedAt?.toDate() || null,
            mastered: conceptData.mastered || false,
          });
          
          // Add subcategory to the unique set if present
          if (conceptData.metadata?.subcategory) {
            subcategories.add(conceptData.metadata.subcategory);
          }
        });
        
        // Set concepts and unique subcategories
        setConcepts(conceptList);
        setUniqueSubcategories(['all', ...Array.from(subcategories)]);
      } catch (error) {
        console.error('Error loading concepts:', error);
        toast.error('Failed to load concepts');
      } finally {
        setLoading(false);
      }
    };
    
    loadConcepts();
  }, [currentUser, navigate]);
  
  // Delete a concept from the bank
  const handleDeleteConcept = async (id) => {
    if (!window.confirm('Are you sure you want to delete this concept?')) return;
    
    try {
      await deleteDoc(doc(db, 'users', currentUser.uid, 'bankItems', id));
      setConcepts(concepts.filter(concept => concept.id !== id));
      toast.success('Concept deleted');
    } catch (error) {
      console.error('Error deleting concept:', error);
      toast.error('Failed to delete concept');
    }
  };
  
  // Start editing a concept
  const handleEditStart = (concept) => {
    setEditingId(concept.id);
    setEditNotes(concept.notes || '');
  };
  
  // Save concept edits
  const handleSaveEdit = async (id) => {
    try {
      await updateDoc(doc(db, 'users', currentUser.uid, 'bankItems', id), {
        notes: editNotes,
        updatedAt: new Date()
      });
      
      // Update the concept in the local state
      setConcepts(concepts.map(concept => 
        concept.id === id ? { ...concept, notes: editNotes } : concept
      ));
      
      setEditingId(null);
      toast.success('Concept updated');
    } catch (error) {
      console.error('Error updating concept:', error);
      toast.error('Failed to update concept');
    }
  };
  
  // Toggle concept mastery status
  const handleToggleMastered = async (id, currentStatus) => {
    try {
      await updateDoc(doc(db, 'users', currentUser.uid, 'bankItems', id), {
        mastered: !currentStatus,
        lastReviewedAt: new Date()
      });
      
      // Update the concept in the local state
      setConcepts(concepts.map(concept => 
        concept.id === id ? { ...concept, mastered: !currentStatus, lastReviewedAt: new Date() } : concept
      ));
      
      toast.success(currentStatus ? 'Concept marked as not mastered' : 'Concept marked as mastered');
    } catch (error) {
      console.error('Error updating concept mastery:', error);
      toast.error('Failed to update concept status');
    }
  };
  
  // Handle help modal
  const handleShowHelp = () => {
    setShowHelpModal(true);
  };

  // Filter and sort concepts based on search term, subcategory filter, and sort order
  const filteredAndSortedConcepts = concepts
    .filter(concept => {
      // Apply search filter
      const matchesSearch = concept.term.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            concept.definition.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            concept.notes.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Apply subcategory filter
      const matchesSubcategory = subcategoryFilter === 'all' || concept.subcategory === subcategoryFilter;
      
      return matchesSearch && matchesSubcategory;
    })
    .sort((a, b) => {
      // Apply sort order
      if (sortOrder === 'newest') {
        return b.createdAt - a.createdAt;
      } else if (sortOrder === 'oldest') {
        return a.createdAt - b.createdAt;
      } else if (sortOrder === 'alphabetical') {
        return a.term.localeCompare(b.term);
      }
      return 0;
    });
  
  return (
    <div className="bank-container">
      <ToastContainer position="bottom-right" autoClose={3000} />
      
      <div className="bank-header">
        <h1>
          <FontAwesomeIcon icon={faPuzzlePiece} /> Concept Bank
          <button 
            className="help-icon-button"
            onClick={handleShowHelp}
            title="Learn how to use the Concept Bank"
          >
            <FontAwesomeIcon icon={faInfoCircle} />
          </button>
        </h1>
      </div>
      
      <div className="bank-controls">
        <div className="search-box">
          <FontAwesomeIcon icon={faSearch} />
          <input
            type="text"
            placeholder="Search concepts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-controls">
          <div className="subcategory-filter">
            <FontAwesomeIcon icon={faFilter} />
            <select 
              value={subcategoryFilter} 
              onChange={(e) => setSubcategoryFilter(e.target.value)}
            >
              <option value="all">All Subcategories</option>
              {uniqueSubcategories
                .filter(subcat => subcat !== 'all')
                .sort()
                .map(subcat => (
                  <option key={subcat} value={subcat}>{subcat}</option>
                ))
              }
            </select>
          </div>
          
          <div className="sort-control">
            <FontAwesomeIcon icon={faSortAmountDown} />
            <select 
              value={sortOrder} 
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="alphabetical">A to Z</option>
            </select>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="loading-message">Loading your concept bank...</div>
      ) : filteredAndSortedConcepts.length === 0 ? (
        <div className="empty-message">
          {searchTerm || subcategoryFilter !== 'all'
            ? 'No concepts match your search or filters.'
            : 'Your concept bank is empty. Save concepts while practicing to build your collection!'}
        </div>
      ) : (
        <div className="bank-items-grid">
          {filteredAndSortedConcepts.map(concept => (
            <div 
              key={concept.id} 
              className={`bank-item ${concept.mastered ? 'mastered' : ''} clickable`}
              onClick={() => navigate(`/concept-detail/${concept.id}`)}
            >
              <div className="bank-item-header">
                <h3>{concept.term}</h3>
                <div className="bank-item-actions">
                  <button 
                    className={`mastery-toggle ${concept.mastered ? 'mastered' : ''}`}
                    onClick={() => handleToggleMastered(concept.id, concept.mastered)}
                    title={concept.mastered ? 'Mark as not mastered' : 'Mark as mastered'}
                  >
                    <FontAwesomeIcon icon={faCheck} />
                  </button>
                  <button 
                    className="delete-button"
                    onClick={() => handleDeleteConcept(concept.id)}
                    title="Delete concept"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>
              
              <div className="bank-item-subcategory">
                {concept.subcategory || 'Unknown subcategory'}
              </div>
              
              <div className="bank-item-definition">
                {concept.definition}
              </div>
              
              {editingId === concept.id ? (
                <div className="bank-item-notes-edit">
                  <textarea
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Add your notes here..."
                    rows={3}
                  />
                  <div className="edit-actions">
                    <button onClick={() => setEditingId(null)}>Cancel</button>
                    <button onClick={() => handleSaveEdit(concept.id)}>Save</button>
                  </div>
                </div>
              ) : (
                <div className="bank-item-notes">
                  {concept.notes ? (
                    <>
                      <div className="notes-content">{concept.notes}</div>
                      <button 
                        className="edit-notes-button"
                        onClick={() => handleEditStart(concept)}
                      >
                        <FontAwesomeIcon icon={faEdit} /> Edit Notes
                      </button>
                    </>
                  ) : (
                    <button 
                      className="add-notes-button"
                      onClick={() => handleEditStart(concept)}
                    >
                      <FontAwesomeIcon icon={faEdit} /> Add Notes
                    </button>
                  )}
                </div>
              )}
              
              <div className="bank-item-footer">
                <div className="bank-item-dates">
                  <div>Added: {concept.createdAt.toLocaleDateString()}</div>
                  {concept.lastReviewedAt && (
                    <div>Last reviewed: {concept.lastReviewedAt.toLocaleDateString()}</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Feature Help Modal */}
      <FeatureHelpModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
        feature="concepts"
      />
    </div>
  );
};

export default ConceptBank;
