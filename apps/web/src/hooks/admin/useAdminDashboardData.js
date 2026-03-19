import { useEffect, useState } from 'react';
import { getFeatureFlags } from '../../firebase/config.featureFlags';
import {
  checkAdminAccess,
  fetchSkillTags
} from '../../firebase/adminDashboardServices';
import { checkPlotlyEnvironment } from '../../utils/apiClient';

function useAdminDashboardData({ allSubcategories, currentUser }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isGraphGenerationAvailable, setIsGraphGenerationAvailable] = useState(false);
  const [skillTags, setSkillTags] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [, setFeatureFlags] = useState({});

  useEffect(() => {
    let isActive = true;

    const checkUserAccess = async () => {
      setIsLoading(true);

      if (!currentUser) {
        if (isActive) {
          setIsAdmin(false);
          setIsLoading(false);
        }
        return;
      }

      try {
        const hasAdminAccess = await checkAdminAccess(currentUser.uid);

        if (isActive) {
          setIsAdmin(hasAdminAccess);
        }
      } catch (error) {
        console.error('Error checking admin access:', error);

        if (isActive) {
          setIsAdmin(false);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    checkUserAccess();

    return () => {
      isActive = false;
    };
  }, [currentUser]);

  useEffect(() => {
    let isActive = true;

    const loadGraphGenerationAvailability = async () => {
      try {
        const envCheck = await checkPlotlyEnvironment();

        if (isActive) {
          setIsGraphGenerationAvailable(envCheck.plotlyReady);
        }
      } catch (error) {
        console.error('Error checking graph generation availability:', error);

        if (isActive) {
          setIsGraphGenerationAvailable(false);
        }
      }
    };

    if (!isAdmin) {
      setIsGraphGenerationAvailable(false);
      return () => {
        isActive = false;
      };
    }

    loadGraphGenerationAvailability();

    return () => {
      isActive = false;
    };
  }, [isAdmin]);

  useEffect(() => {
    let isActive = true;

    const loadFeatureFlags = async () => {
      try {
        const flags = await getFeatureFlags();

        if (isActive) {
          setFeatureFlags(flags);
        }
      } catch (error) {
        console.error('Error loading feature flags:', error);
      }
    };

    if (isAdmin) {
      loadFeatureFlags();
    }

    return () => {
      isActive = false;
    };
  }, [isAdmin]);

  useEffect(() => {
    let isActive = true;

    const loadAdminReferenceData = async () => {
      try {
        const loadedSkillTags = await fetchSkillTags();

        if (isActive) {
          setSkillTags(loadedSkillTags);
        }
      } catch (error) {
        console.error('Error loading skill tags:', error);

        if (isActive) {
          setSkillTags([]);
        }
      }

      if (!isActive) {
        return;
      }

      if (allSubcategories?.length) {
        const sortedSubcategories = [...allSubcategories].sort((leftItem, rightItem) =>
          leftItem.name.localeCompare(rightItem.name)
        );
        setSubcategories(sortedSubcategories);
      } else {
        setSubcategories([]);
      }
    };

    if (!isAdmin) {
      setSkillTags([]);
      setSubcategories([]);

      return () => {
        isActive = false;
      };
    }

    loadAdminReferenceData();

    return () => {
      isActive = false;
    };
  }, [allSubcategories, isAdmin]);

  return {
    isAdmin,
    isGraphGenerationAvailable,
    isLoading,
    setIsLoading,
    skillTags,
    subcategories
  };
}

export default useAdminDashboardData;
