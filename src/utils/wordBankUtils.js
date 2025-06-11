import { db } from '../firebase/config';
import { collection, doc, setDoc, getDoc, getDocs, query, where, deleteDoc } from 'firebase/firestore';

/**
 * Saves a word to the user's word bank
 * 
 * @param {string} userId - The user's ID
 * @param {Object} wordData - The word data to save
 * @param {string} wordData.word - The word text
 * @param {string} wordData.definition - The word definition
 * @param {string} wordData.quizId - The quiz ID where the word was encountered (optional)
 * @param {string} wordData.questionId - The question ID where the word was encountered (optional)
 * @returns {Promise<Object>} The saved word data with ID
 */
export async function saveWordToBank(userId, wordData) {
  try {
    // Create a document reference with a unique ID for this word entry
    const wordBankRef = collection(db, `users/${userId}/wordBank`);
    const wordDocRef = doc(wordBankRef);
    
    // Add timestamp and ID to the word data
    const wordToSave = {
      ...wordData,
      id: wordDocRef.id,
      savedAt: new Date().toISOString(),
    };
    
    // Save the word to Firestore
    await setDoc(wordDocRef, wordToSave);
    
    console.log(`Word "${wordData.word}" saved to word bank for user ${userId}`);
    return wordToSave;
  } catch (error) {
    console.error('Error saving word to bank:', error);
    throw new Error('Failed to save word to your word bank');
  }
}

/**
 * Checks if a word is already in the user's word bank
 * 
 * @param {string} userId - The user's ID
 * @param {string} word - The word text to check
 * @returns {Promise<boolean>} True if the word exists in the user's word bank
 */
export async function checkWordInBank(userId, word) {
  try {
    const wordBankRef = collection(db, `users/${userId}/wordBank`);
    const q = query(wordBankRef, where("word", "==", word));
    const querySnapshot = await getDocs(q);
    
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking word in bank:', error);
    return false;
  }
}

/**
 * Efficiently checks multiple words at once against the user's word bank
 * 
 * @param {string} userId - The user's ID
 * @param {string[]} words - Array of word texts to check
 * @returns {Promise<string[]>} Array of words that exist in the user's word bank
 */
export async function checkMultipleWordsInBank(userId, words) {
  try {
    if (!words || words.length === 0) {
      return [];
    }
    
    // Get all words from the user's word bank in a single query
    const wordBankRef = collection(db, `users/${userId}/wordBank`);
    const querySnapshot = await getDocs(wordBankRef);
    
    // Create a Set of saved words for fast lookup
    const savedWordsSet = new Set();
    querySnapshot.forEach(doc => {
      const wordData = doc.data();
      if (wordData.word) {
        savedWordsSet.add(wordData.word.toLowerCase()); // Case-insensitive comparison
      }
    });
    
    // Filter the input words against the saved words
    return words.filter(word => savedWordsSet.has(word.toLowerCase()));
  } catch (error) {
    console.error('Error checking multiple words in bank:', error);
    return []; // Return empty array on error to gracefully handle the situation
  }
}

/**
 * Gets all words from the user's word bank
 * 
 * @param {string} userId - The user's ID
 * @returns {Promise<Array>} Array of word objects
 */
export async function getWordBank(userId) {
  try {
    const wordBankRef = collection(db, `users/${userId}/wordBank`);
    const querySnapshot = await getDocs(wordBankRef);
    
    const words = [];
    querySnapshot.forEach(doc => {
      words.push(doc.data());
    });
    
    // Sort words alphabetically
    return words.sort((a, b) => a.word.localeCompare(b.word));
  } catch (error) {
    console.error('Error getting word bank:', error);
    throw new Error('Failed to retrieve your word bank');
  }
}

/**
 * Removes a word from the user's word bank
 * 
 * @param {string} userId - The user's ID
 * @param {string} wordId - The word ID to remove
 * @returns {Promise<void>}
 */
export async function removeWordFromBank(userId, wordId) {
  try {
    const wordDocRef = doc(db, `users/${userId}/wordBank/${wordId}`);
    await deleteDoc(wordDocRef);
    
    console.log(`Word with ID ${wordId} removed from word bank for user ${userId}`);
  } catch (error) {
    console.error('Error removing word from bank:', error);
    throw new Error('Failed to remove word from your word bank');
  }
}

/**
 * Efficiently checks multiple terms at once against the user's bank items (both words and concepts)
 * 
 * @param {string} userId - The user's ID
 * @param {string[]} terms - Array of term texts to check
 * @param {string} type - Type to check ('word', 'concept', or 'all')
 * @returns {Promise<string[]>} Array of terms that exist in the user's bank
 */
export async function checkMultipleBankItems(userId, terms, type = 'all') {
  try {
    console.log(`[WordBankUtils] checkMultipleBankItems called with:`, { userId, terms, type });
    
    if (!terms || terms.length === 0) {
      console.log(`[WordBankUtils] No terms to check, returning empty array`);
      return [];
    }
    
    // Get all bank items from the user's collection in a single query
    const bankItemsRef = collection(db, `users/${userId}/bankItems`);
    let query_obj = bankItemsRef;
    
    // Apply type filter if specified
    if (type !== 'all') {
      query_obj = query(bankItemsRef, where("type", "==", type));
      console.log(`[WordBankUtils] Filtering by type: ${type}`);
    }
    
    console.log(`[WordBankUtils] Executing Firestore query...`);
    const querySnapshot = await getDocs(query_obj);
    console.log(`[WordBankUtils] Query returned ${querySnapshot.size} documents`);
    
    // Create a Set of saved terms for fast lookup
    const savedTermsSet = new Set();
    querySnapshot.forEach(doc => {
      const itemData = doc.data();
      console.log(`[WordBankUtils] Found saved item:`, itemData);
      if (itemData.term) {
        savedTermsSet.add(itemData.term.toLowerCase()); // Case-insensitive comparison
      }
    });
    
    console.log(`[WordBankUtils] Saved terms set:`, Array.from(savedTermsSet));
    
    // Filter the input terms against the saved terms
    const matchedTerms = terms.filter(term => savedTermsSet.has(term.toLowerCase()));
    console.log(`[WordBankUtils] Matched terms:`, matchedTerms);
    
    return matchedTerms;
  } catch (error) {
    console.error('Error checking multiple bank items:', error);
    return []; // Return empty array on error to gracefully handle the situation
  }
}
