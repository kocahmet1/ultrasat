import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const AICompanionContext = createContext();

/**
 * Hook to access AI Companion functionality
 */
export const useAICompanion = () => {
    const context = useContext(AICompanionContext);
    if (!context) {
        throw new Error('useAICompanion must be used within an AICompanionProvider');
    }
    return context;
};

/**
 * AI Companion Provider
 * Manages state for the SAT Coach AI companion
 */
export const AICompanionProvider = ({ children }) => {
    const { currentUser } = useAuth();

    // State
    const [greeting, setGreeting] = useState(null);
    const [nextSteps, setNextSteps] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isVoiceActive, setIsVoiceActive] = useState(false);
    const [showPanel, setShowPanel] = useState(false);
    const [error, setError] = useState(null);
    const [isAvailable, setIsAvailable] = useState(false);
    const [isFirstTimeUser, setIsFirstTimeUser] = useState(null); // null = loading, true/false = determined

    // API base URL
    const API_BASE = process.env.REACT_APP_API_URL ||
        (process.env.NODE_ENV === 'production'
            ? 'https://veritas-blue-web.onrender.com'
            : 'http://localhost:3001');

    /**
     * Check if companion features are available
     */
    const checkAvailability = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE}/api/companion/status`);
            const data = await response.json();
            setIsAvailable(data.available);
            return data.available;
        } catch (err) {
            console.warn('Failed to check companion availability:', err);
            setIsAvailable(false);
            return false;
        }
    }, [API_BASE]);

    /**
     * Fetch personalized greeting on login
     */
    const fetchGreeting = useCallback(async (allowCache = true) => {
        if (!currentUser) return null;

        setIsLoading(true);
        setError(null);

        try {
            const token = await currentUser.getIdToken();
            const response = await fetch(`${API_BASE}/api/companion/greeting`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ allowCache })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch greeting');
            }

            const data = await response.json();
            setGreeting(data);
            setShowPanel(true); // Auto-show panel with greeting
            return data;
        } catch (err) {
            console.error('Error fetching greeting:', err);
            setError(err.message);
            // Use fallback greeting
            const fallback = {
                greeting: 'Welcome back! Ready to continue your SAT prep?',
                suggestedAction: {
                    label: 'Start Practice',
                    route: '/smart-quiz-generator',
                    type: 'quiz'
                },
                fallback: true
            };
            setGreeting(fallback);
            return fallback;
        } finally {
            setIsLoading(false);
        }
    }, [currentUser, API_BASE]);

    /**
     * Fetch next step recommendations
     */
    const fetchNextSteps = useCallback(async () => {
        if (!currentUser) return null;

        setIsLoading(true);
        setError(null);

        try {
            const token = await currentUser.getIdToken();
            const response = await fetch(`${API_BASE}/api/companion/next-steps`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch recommendations');
            }

            const data = await response.json();
            setNextSteps(data);
            return data;
        } catch (err) {
            console.error('Error fetching next steps:', err);
            setError(err.message);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [currentUser, API_BASE]);

    /**
     * Get ephemeral token for voice session
     */
    const getVoiceToken = useCallback(async () => {
        if (!currentUser) return null;

        try {
            const token = await currentUser.getIdToken();
            const response = await fetch(`${API_BASE}/api/companion/voice-token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to initialize voice');
            }

            return await response.json();
        } catch (err) {
            console.error('Error getting voice token:', err);
            setError(err.message);
            return null;
        }
    }, [currentUser, API_BASE]);

    /**
     * Update user's companion profile (target score, exam date)
     */
    const updateProfile = useCallback(async (updates) => {
        if (!currentUser) return false;

        try {
            const token = await currentUser.getIdToken();
            const response = await fetch(`${API_BASE}/api/companion/update-profile`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updates)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update profile');
            }

            return true;
        } catch (err) {
            console.error('Error updating profile:', err);
            setError(err.message);
            return false;
        }
    }, [currentUser, API_BASE]);

    /**
     * Send a message in the onboarding chat
     */
    const sendOnboardingMessage = useCallback(async (messages) => {
        if (!currentUser) return null;

        try {
            const token = await currentUser.getIdToken();
            const response = await fetch(`${API_BASE}/api/companion/onboarding-chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ messages })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to send onboarding message');
            }

            return await response.json();
        } catch (err) {
            console.error('Error in onboarding chat:', err);
            return null;
        }
    }, [currentUser, API_BASE]);

    /**
     * Mark onboarding as complete
     */
    const completeOnboarding = useCallback(async () => {
        if (!currentUser) return false;

        try {
            const success = await updateProfile({ onboardingComplete: true });
            if (success) {
                setIsFirstTimeUser(false);
            }
            return success;
        } catch (err) {
            console.error('Error completing onboarding:', err);
            return false;
        }
    }, [currentUser, updateProfile]);

    /**
     * Toggle panel visibility
     */
    const togglePanel = useCallback(() => {
        setShowPanel(prev => !prev);
    }, []);

    /**
     * Dismiss the panel
     */
    const dismissPanel = useCallback(() => {
        setShowPanel(false);
    }, []);

    // Check availability on mount
    useEffect(() => {
        checkAvailability();
    }, [checkAvailability]);

    // Check if user is a first-timer on login
    useEffect(() => {
        const checkFirstTimeUser = async () => {
            if (!currentUser) {
                setIsFirstTimeUser(null);
                return;
            }

            try {
                const userDocRef = doc(db, 'users', currentUser.uid);
                const userDoc = await getDoc(userDocRef);

                if (userDoc.exists()) {
                    const data = userDoc.data();
                    setIsFirstTimeUser(!data.onboardingComplete);
                } else {
                    // New user — no document yet
                    setIsFirstTimeUser(true);
                }
            } catch (err) {
                console.error('Error checking first-time user:', err);
                setIsFirstTimeUser(false); // Default to not first-time on error
            }
        };

        checkFirstTimeUser();
    }, [currentUser]);

    // Auto-fetch greeting when user logs in (only for returning users)
    useEffect(() => {
        if (currentUser && isAvailable && isFirstTimeUser === false) {
            // Small delay to let other auth processes complete
            const timer = setTimeout(() => {
                fetchGreeting(true);
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [currentUser, isAvailable, isFirstTimeUser, fetchGreeting]);

    const value = {
        // State
        greeting,
        nextSteps,
        isLoading,
        isVoiceActive,
        showPanel,
        error,
        isAvailable,
        isFirstTimeUser,

        // Actions
        fetchGreeting,
        fetchNextSteps,
        getVoiceToken,
        updateProfile,
        togglePanel,
        dismissPanel,
        setIsVoiceActive,
        checkAvailability,
        sendOnboardingMessage,
        completeOnboarding
    };

    return (
        <AICompanionContext.Provider value={value}>
            {children}
        </AICompanionContext.Provider>
    );
};

export default AICompanionProvider;
