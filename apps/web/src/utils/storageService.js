import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../firebase/config';

// Helper to determine if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';

// In-memory storage for development mode
const localStorageMap = new Map();

/**
 * Upload a file to storage (either Firebase or local depending on environment)
 * @param {File} file - The file to upload
 * @param {string} path - The storage path 
 * @returns {Promise<string>} - URL to access the file
 */
export const uploadFile = async (file, path) => {
  // Use local storage in development to avoid CORS issues
  if (isDevelopment) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result;
        localStorageMap.set(path, dataUrl);
        resolve(dataUrl);
      };
      reader.readAsDataURL(file);
    });
  }
  
  // Use Firebase Storage in production
  try {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error("Error uploading to Firebase Storage:", error);
    throw error;
  }
};

/**
 * Delete a file from storage
 * @param {string} url - URL or path of the file to delete
 */
export const deleteFile = async (url) => {
  // For local storage
  if (isDevelopment) {
    // Check if this is a data URL (local) or a path
    if (url.startsWith('data:')) {
      // Find the path that maps to this data URL
      for (const [path, dataUrl] of localStorageMap.entries()) {
        if (dataUrl === url) {
          localStorageMap.delete(path);
          break;
        }
      }
    } else {
      // It's a path
      localStorageMap.delete(url);
    }
    return;
  }
  
  // For Firebase Storage
  try {
    const fileRef = ref(storage, url);
    await deleteObject(fileRef);
  } catch (error) {
    console.error("Error deleting from Firebase Storage:", error);
    // Don't throw - file might already be deleted
  }
};

/**
 * Get a download URL for a file
 * @param {string} path - The storage path
 * @returns {Promise<string>} - URL to access the file
 */
export const getFileUrl = async (path) => {
  if (isDevelopment) {
    return localStorageMap.get(path) || null;
  }
  
  try {
    const fileRef = ref(storage, path);
    return await getDownloadURL(fileRef);
  } catch (error) {
    console.error("Error getting URL from Firebase Storage:", error);
    return null;
  }
};
