import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { 
  getUserSubcategoryStats,
  getLatestSubcategoryRecommendations,
  generateSubcategoryRecommendations
} from '../firebase/subcategoryServices';
import { 
  SUBCATEGORY_IDS,
  SUBCATEGORY_NAMES,
  SUBCATEGORY_KEBAB_CASE,
  SUBCATEGORY_CATEGORIES,
  SUBCATEGORY_COLORS,
  getSubcategoryIdFromString,
  getSubcategoryName
} from '../utils/subcategoryConstants';

const SubcategoryContext = createContext();

export function useSubcategories() {
  return useContext(SubcategoryContext);
}

export function SubcategoryProvider({ children }) {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [subcategoryStats, setSubcategoryStats] = useState([]);
  const [recommendations, setRecommendations] = useState(null);
  const [allSubcategories, setAllSubcategories] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    const loadSubcategoryData = async () => {
      // setLoading(true); // Moved down, setAllSubcategories can be done synchronously
      try {
        // Load all available subcategories using the correct function
        // This part is synchronous and can be done outside async if subcategoryConstants are static
        const numericIdSubsArray = getAllSubcategoriesWithNumericIds(); // Renamed for clarity
        const kebabCaseSubsArray = numericIdSubsArray.map(sub => ({
          ...sub,
          id: SUBCATEGORY_KEBAB_CASE[sub.id] || sub.id.toString() // Convert to kebab-case, fallback to stringified number
        }));
        setAllSubcategories(kebabCaseSubsArray);
        // console.log('SubcategoryContext: Initialized allSubcategories:', JSON.stringify(kebabCaseSubsArray));

        if (!currentUser) {
          setLoading(false);
          return;
        }
        setLoading(true); // Set loading true only when async operations for current user start

        // Load user subcategory stats
        const statsData = await getUserSubcategoryStats(currentUser.uid);
        setSubcategoryStats(statsData);
        console.log('Loaded subcategory stats:', statsData.length);

        // Load recommendations
        let recommendationsData = await getLatestSubcategoryRecommendations(currentUser.uid);
        
        // If no recommendations exist or they're older than 24 hours, generate new ones
        if (!recommendationsData || 
            (recommendationsData.generatedAt && 
             Date.now() - recommendationsData.generatedAt.toDate() > 24 * 60 * 60 * 1000)) {
          console.log('Generating new subcategory recommendations...');
          recommendationsData = await getLatestSubcategoryRecommendations(currentUser.uid);
        }
        
        setRecommendations(recommendationsData);
        setLastUpdated(new Date());
      } catch (error) {
        console.error("Error loading subcategory data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSubcategoryData();
  }, [currentUser]);

  // Function to refresh user data (call after completing a quiz or exam)
  const refreshUserData = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      console.log('Refreshing user subcategory data and recommendations...');
      
      // Reload subcategory stats
      const statsData = await getUserSubcategoryStats(currentUser.uid);
      setSubcategoryStats(statsData);
      console.log('Reloaded subcategory stats:', statsData.length);
      
      // Generate fresh recommendations
      const recommendationsData = await getLatestSubcategoryRecommendations(currentUser.uid);
      setRecommendations(recommendationsData);
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error refreshing user subcategory data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get subcategory stats categorized as weak/moderate/strong
  const getCategorizedSubcategories = () => {
    if (!subcategoryStats.length) return { weak: [], moderate: [], strong: [] };
    
    return {
      weak: subcategoryStats.filter(stat => stat.accuracyRate < 70),
      moderate: subcategoryStats.filter(stat => stat.accuracyRate >= 70 && stat.accuracyRate <= 85),
      strong: subcategoryStats.filter(stat => stat.accuracyRate > 85)
    };
  };

  // Memoized function to get subcategory name from numeric ID, with fallbacks
  const getSubcategoryNameById = useCallback((subcategoryId) => {
    console.log(`getSubcategoryNameById: Received ID = ${subcategoryId} (Type: ${typeof subcategoryId})`); // Log input

    // First, check if it's directly a valid numeric ID in the primary map
    if (typeof subcategoryId === 'number' && SUBCATEGORY_NAMES[subcategoryId]) {
      console.log(`getSubcategoryNameById: Found name directly for numeric ID ${subcategoryId}`); // Log success path 1
      return SUBCATEGORY_NAMES[subcategoryId];
    }
    
    // Handle potential string input (legacy or incorrect typing)
    if (typeof subcategoryId === 'string') {
      const parsedId = parseInt(subcategoryId, 10);
      if (!isNaN(parsedId) && SUBCATEGORY_NAMES[parsedId]) {
        console.log(`getSubcategoryNameById: Parsed string '${subcategoryId}' to numeric ${parsedId}, found name.`); // Log success path 2
        return SUBCATEGORY_NAMES[parsedId];
      }
      // If parsing fails or name not found, try the legacy string-to-ID conversion
      const numericIdFromString = getSubcategoryIdFromString(subcategoryId);
      if (numericIdFromString && SUBCATEGORY_NAMES[numericIdFromString]) {
         console.log(`getSubcategoryNameById: Converted legacy string '${subcategoryId}' to ${numericIdFromString}, found name.`); // Log success path 3
        return SUBCATEGORY_NAMES[numericIdFromString];
      }
    }
    
    // If it's a number but not in the map, or failed conversions
    console.warn(`getSubcategoryNameById: Name NOT FOUND for ID: ${subcategoryId}`); // Log failure path
    return `Unknown Subcategory (${subcategoryId})`;

  }, [getSubcategoryIdFromString]);

  // Get kebab-case format of subcategory (the canonical identifier)
  const getKebabCaseSubcategory = (subcategory) => {
    if (!subcategory) return null;
    
    // If it's already a kebab-case string, return as is (normalized to lowercase)
    if (typeof subcategory === 'string' && subcategory.includes('-')) {
      return subcategory.toLowerCase();
    }
    
    // If it's a number, convert using the mapping
    if (!isNaN(parseInt(subcategory, 10))) {
      const numericId = parseInt(subcategory, 10);
      return SUBCATEGORY_KEBAB_CASE[numericId] || null;
    }
    
    // If it's a string but not kebab case, try to normalize it
    if (typeof subcategory === 'string') {
      // Try to get numeric ID first for accurate conversion
      const numericId = getSubcategoryIdFromString(subcategory);
      if (numericId && SUBCATEGORY_KEBAB_CASE[numericId]) {
        return SUBCATEGORY_KEBAB_CASE[numericId];
      }
      // Fallback to simple string conversion
      return subcategory.toLowerCase().replace(/\s+/g, '-');
    }
    
    return null;
  };
  
  // Convert any subcategory format to numeric ID (for legacy compatibility)
  const getNumericSubcategoryId = (subcategory) => {
    if (!subcategory) return null;
    
    // If it's already a number, return as is
    if (!isNaN(parseInt(subcategory, 10))) {
      return parseInt(subcategory, 10);
    }
    
    // Otherwise try to convert string to ID
    return getSubcategoryIdFromString(subcategory);
  };
  
  // Get color for a subcategory (works with any subcategory format)
  const getSubcategoryColor = (subcategory) => {
    // First try by kebab-case (preferred)
    const kebabCase = getKebabCaseSubcategory(subcategory);
    
    // Fallback to numeric ID for metadata lookup
    const numericId = getNumericSubcategoryId(subcategory);
    return numericId ? SUBCATEGORY_COLORS[numericId] : '#808080'; // Default gray
  };
  
  // Get category (e.g., 'math.algebra') for a subcategory (works with any subcategory format)
  const getSubcategoryCategory = (subcategory) => {
    // First try by kebab-case (preferred)
    const kebabCase = getKebabCaseSubcategory(subcategory);
    
    // Fallback to numeric ID for metadata lookup
    const numericId = getNumericSubcategoryId(subcategory);
    return numericId ? SUBCATEGORY_CATEGORIES[numericId] : '';
  };
  
  // Get all subcategories as array of objects with numeric IDs
  const getAllSubcategoriesWithNumericIds = () => {
    return Object.entries(SUBCATEGORY_NAMES).map(([idStr, name]) => {
      const id = parseInt(idStr, 10);
      const fullCategoryPath = SUBCATEGORY_CATEGORIES[idStr]; // SUBCATEGORY_CATEGORIES uses string keys for IDs
      let section = '';
      let mainCategory = '';

      if (typeof fullCategoryPath === 'string' && fullCategoryPath.includes('.')) {
        const parts = fullCategoryPath.split('.');
        section = parts[0]; // e.g., "reading-writing"
        mainCategory = parts.slice(1).join('.'); // e.g., "information-ideas" or if there are multiple parts like "geometry.trigonometry"
      } else {
        // console.warn(`SubcategoryContext: Malformed or missing fullCategoryPath for subcategory ID ${idStr}: ${fullCategoryPath}. Assigning to unknown.`);
        section = 'unknown'; // Default section if parsing fails
        mainCategory = 'unknown'; // Default mainCategory if parsing fails
      }

      return {
        id,
        name,
        section,          // New: "reading-writing" or "math"
        mainCategory,     // New: "information-ideas", "algebra", etc.
        fullCategoryPath, // Keep original for reference or other uses
        color: SUBCATEGORY_COLORS[idStr] // SUBCATEGORY_COLORS uses string keys for IDs
      };
    });
  };

  const value = {
    loading,
    subcategoryStats,
    recommendations,
    allSubcategories,
    lastUpdated,
    refreshUserData,
    getCategorizedSubcategories,
    getSubcategoryNameById,
    getKebabCaseSubcategory, // Add the new function to use kebab-case as canonical ID
    getNumericSubcategoryId, // Keep for legacy compatibility
    getSubcategoryColor,
    getSubcategoryCategory,
    getAllSubcategoriesWithNumericIds
  };

  return (
    <SubcategoryContext.Provider value={value}>
      {children}
    </SubcategoryContext.Provider>
  );
}

export default SubcategoryProvider;
