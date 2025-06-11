import { useState, useEffect } from 'react';
import { isGraphGenerationAvailable } from './apiClient';

/**
 * Custom hook to check if graph generation features are available
 * @returns {Object} - { isAvailable: boolean, isLoading: boolean }
 */
export const useGraphGenerationAvailability = () => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAvailability = async () => {
      try {
        const available = await isGraphGenerationAvailable();
        setIsAvailable(available);
      } catch (error) {
        console.error('Failed to check graph generation availability:', error);
        setIsAvailable(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAvailability();
  }, []);

  return { isAvailable, isLoading };
}; 