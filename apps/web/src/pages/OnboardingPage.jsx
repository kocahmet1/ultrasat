import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAICompanion } from '../contexts/AICompanionContext';
import AIOnboardingSidePanel from '../components/AIOnboardingSidePanel';
import UltraSATLogo from '../components/UltraSATLogo';
import './OnboardingPage.css';

/**
 * OnboardingPage
 * Full-screen onboarding experience with AI side panel (left) + welcome content (right)
 */
function OnboardingPage() {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const { sendOnboardingMessage, completeOnboarding } = useAICompanion();

    const [isLoading, setIsLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const hasInitialized = useRef(false);

    // Steps for the right-side content visualization
    const stepContent = [
        {
            icon: '👋',
            title: 'Welcome to UltraSAT',
            subtitle: 'Your AI-powered SAT prep journey starts here',
            features: [
                { icon: '🎯', text: 'Personalized study plans' },
                { icon: '📊', text: 'Real-time progress tracking' },
                { icon: '🧠', text: 'AI-powered practice' },
                { icon: '📈', text: 'Score prediction' },
            ]
        },
        {
            icon: '📋',
            title: 'Diagnostic Assessment',
            subtitle: 'A quick test to understand your starting point',
            features: [
                { icon: '⏱️', text: '~10 minutes to complete' },
                { icon: '🔍', text: 'Identifies strengths & weaknesses' },
                { icon: '📊', text: 'Instant score estimate' },
                { icon: '🗺️', text: 'Creates your learning roadmap' },
            ]
        },
        {
            icon: '🚀',
            title: 'Your Study Plan',
            subtitle: 'AI-crafted practice schedule just for you',
            features: [
                { icon: '📚', text: '29 SAT subcategories covered' },
                { icon: '🎮', text: 'Adaptive difficulty levels' },
                { icon: '💡', text: 'Smart recommendations' },
                { icon: '🏆', text: 'Track goals & milestones' },
            ]
        }
    ];

    // Auto-trigger the first AI message on mount
    useEffect(() => {
        if (hasInitialized.current) return;
        hasInitialized.current = true;

        const initChat = async () => {
            setIsLoading(true);
            try {
                const response = await sendOnboardingMessage([]);
                if (response && window.__onboardingPanelRef) {
                    window.__onboardingPanelRef.handleAIResponse(response);
                }
            } catch (err) {
                console.error('Failed to initialize onboarding chat:', err);
                // Use fallback
                if (window.__onboardingPanelRef) {
                    window.__onboardingPanelRef.handleAIResponse({
                        message: `Welcome to UltraSAT Prep${currentUser?.displayName ? ', ' + currentUser.displayName : ''}! I'm your SAT Coach. I'm here to help you build the perfect study plan. Have you taken the SAT before?`,
                        quickReplies: ["First time preparing", "I've taken it before", "Just exploring"],
                        action: null
                    });
                }
            } finally {
                setIsLoading(false);
            }
        };

        // Small delay to let the panel mount
        setTimeout(initChat, 600);
    }, [sendOnboardingMessage, currentUser]);

    /**
     * Handle sending messages to the backend
     */
    const handleSendMessage = useCallback(async (conversationHistory) => {
        setIsLoading(true);
        try {
            const response = await sendOnboardingMessage(conversationHistory);

            // Update step visualization based on conversation progress
            const userMessages = conversationHistory.filter(m => m.role === 'user').length;
            if (userMessages >= 2) setCurrentStep(1);
            if (userMessages >= 3) setCurrentStep(2);

            return response;
        } catch (err) {
            console.error('Error sending onboarding message:', err);
            return {
                message: "I'm having a bit of trouble connecting right now. But don't worry — you can take the Predictive Test anytime to get started!",
                quickReplies: ["Take Predictive Test", "Explore on my own"],
                action: null
            };
        } finally {
            setIsLoading(false);
        }
    }, [sendOnboardingMessage]);

    /**
     * Handle action from the AI (e.g., navigate to Predictive Test)
     */
    const handleAction = useCallback(async (action) => {
        // Mark onboarding as complete
        await completeOnboarding();

        if (action?.route) {
            navigate(action.route);
        } else {
            navigate('/progress');
        }
    }, [navigate, completeOnboarding]);

    /**
     * Handle skip onboarding
     */
    const handleSkip = () => {
        // Fire-and-forget: don't block navigation if API call fails
        completeOnboarding().catch(err => console.warn('Failed to mark onboarding complete:', err));
        navigate('/progress');
    };

    return (
        <div className="onboarding-page">
            {/* Left Side — Welcome Content */}
            <div className="onboarding-content">
                {/* Skip Button */}
                <button className="onboarding-skip-btn" onClick={handleSkip}>
                    Skip for now →
                </button>

                {/* Logo */}
                <div className="onboarding-logo-area">
                    <UltraSATLogo 
                        size="medium" 
                        variant="landing" 
                        className="onboarding-logo"
                    />
                </div>

                {/* Dynamic Step Content */}
                <div className="onboarding-step-content">
                    <div className="step-icon-large">{stepContent[currentStep].icon}</div>
                    <h1 className="step-title">{stepContent[currentStep].title}</h1>
                    <p className="step-subtitle">{stepContent[currentStep].subtitle}</p>

                    <div className="step-features">
                        {stepContent[currentStep].features.map((feature, index) => (
                            <div 
                                key={index} 
                                className="step-feature-card"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <span className="feature-icon">{feature.icon}</span>
                                <span className="feature-text">{feature.text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Step Indicators */}
                <div className="onboarding-step-dots">
                    {stepContent.map((_, index) => (
                        <div 
                            key={index}
                            className={`step-dot ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
                        />
                    ))}
                </div>

                {/* Bottom Trust Indicators */}
                <div className="onboarding-trust">
                    <span>🔒 Your data is secure</span>
                    <span>✨ No credit card needed</span>
                    <span>⚡ Free diagnostic test</span>
                </div>
            </div>

            {/* Right Side — AI Chat Panel */}
            <AIOnboardingSidePanel
                onSendMessage={handleSendMessage}
                onAction={handleAction}
                isLoading={isLoading}
                userName={currentUser?.displayName}
            />
        </div>
    );
}

export default OnboardingPage;
