import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { 
  getFirestore, 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { getFeatureFlags } from '../firebase/config.featureFlags';

const ReviewContext = createContext();

/**
 * Provider component for the Review Engine functionality
 * Manages the user's needs-review queue and lesson/skill drill state
 */
export function ReviewProvider({ children }) {
  const { currentUser } = useAuth();
  const db = getFirestore();
  
  const [needsReviewItems, setNeedsReviewItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  // Setting useRepairEngine to true by default for testing
  const [useRepairEngine, setUseRepairEngine] = useState(true);
  
  // For testing purposes, we're enabling the Repair Engine by default
  // Comment out or remove this effect when done testing
  /*
  useEffect(() => {
    const loadFeatureFlags = async () => {
      const flags = await getFeatureFlags();
      setUseRepairEngine(flags.useRepairEngine === true);
    };
    
    loadFeatureFlags();
  }, []);
  */
  
  // Load review items when the user changes or feature flag changes
  useEffect(() => {
    if (!currentUser || !useRepairEngine) {
      setNeedsReviewItems([]);
      setIsLoading(false);
      return;
    }
    
    const loadReviewItems = async () => {
      setIsLoading(true);
      try {
        const reviewRef = collection(db, 'userNeedsReview', currentUser.uid, 'skills');
        const reviewSnapshot = await getDocs(reviewRef);
        
        const items = [];
        reviewSnapshot.forEach(doc => {
          items.push({
            skillTag: doc.id,
            ...doc.data()
          });
        });
        
        // Sort by dueAt (oldest first)
        items.sort((a, b) => {
          const aDate = a.dueAt?.toDate() || new Date(0);
          const bDate = b.dueAt?.toDate() || new Date(0);
          return aDate - bDate;
        });
        
        setNeedsReviewItems(items);
      } catch (error) {
        console.error('Error loading review items:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadReviewItems();
  }, [currentUser, db, useRepairEngine]);
  
  /**
   * Queue a skill for review after a wrong answer
   * @param {string} skillTag - The skill tag to queue for review
   */
  const queueSkillForReview = async (skillTag) => {
    if (!currentUser || !useRepairEngine || !skillTag) return;
    
    try {
      const reviewRef = doc(db, 'userNeedsReview', currentUser.uid, 'skills', skillTag);
      const reviewDoc = await getDoc(reviewRef);
      
      if (reviewDoc.exists()) {
        // Update existing review item
        const data = reviewDoc.data();
        await setDoc(reviewRef, {
          dueAt: serverTimestamp(),
          wrongCount: (data.wrongCount || 0) + 1,
          lastSeen: serverTimestamp()
        }, { merge: true });
      } else {
        // Create new review item
        await setDoc(reviewRef, {
          dueAt: serverTimestamp(),
          wrongCount: 1,
          lastSeen: serverTimestamp()
        });
      }
      
      // Refresh the list
      const newItem = {
        skillTag,
        dueAt: new Date(),
        wrongCount: reviewDoc.exists() ? (reviewDoc.data().wrongCount || 0) + 1 : 1,
        lastSeen: new Date()
      };
      
      setNeedsReviewItems(prev => [newItem, ...prev.filter(item => item.skillTag !== skillTag)]);
    } catch (error) {
      console.error('Error queueing skill for review:', error);
    }
  };
  
  /**
   * Mark a skill as reviewed
   * @param {string} skillTag - The skill tag to mark as reviewed
   */
  const markSkillAsReviewed = async (skillTag) => {
    if (!currentUser || !useRepairEngine || !skillTag) return;
    
    try {
      // Update the due date to 2 days from now
      const reviewRef = doc(db, 'userNeedsReview', currentUser.uid, 'skills', skillTag);
      const twoDaysFromNow = new Date();
      twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);
      
      await setDoc(reviewRef, {
        dueAt: twoDaysFromNow,
        lastSeen: serverTimestamp()
      }, { merge: true });
      
      // Update the local state
      setNeedsReviewItems(prev => 
        prev.map(item => 
          item.skillTag === skillTag 
            ? { ...item, dueAt: twoDaysFromNow, lastSeen: new Date() } 
            : item
        )
      );
    } catch (error) {
      console.error('Error marking skill as reviewed:', error);
    }
  };
  
  /**
   * Remove a skill from the review queue
   * @param {string} skillTag - The skill tag to remove
   */
  const removeSkillFromReview = async (skillTag) => {
    if (!currentUser || !useRepairEngine || !skillTag) return;
    
    try {
      const reviewRef = doc(db, 'userNeedsReview', currentUser.uid, 'skills', skillTag);
      await deleteDoc(reviewRef);
      
      // Update the local state
      setNeedsReviewItems(prev => prev.filter(item => item.skillTag !== skillTag));
    } catch (error) {
      console.error('Error removing skill from review:', error);
    }
  };
  
  // Get due review items (those with dueAt <= now)
  const getDueReviewItems = () => {
    const now = new Date();
    return needsReviewItems.filter(item => {
      const dueDate = item.dueAt instanceof Date ? item.dueAt : item.dueAt?.toDate();
      return dueDate && dueDate <= now;
    });
  };
  
  const value = {
    needsReviewItems,
    isLoading,
    useRepairEngine,
    queueSkillForReview,
    markSkillAsReviewed,
    removeSkillFromReview,
    getDueReviewItems,
    dueItemsCount: getDueReviewItems().length
  };
  
  return (
    <ReviewContext.Provider value={value}>
      {children}
    </ReviewContext.Provider>
  );
}

export function useReview() {
  return useContext(ReviewContext);
}
