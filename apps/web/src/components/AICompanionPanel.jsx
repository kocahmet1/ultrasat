import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAICompanion } from '../contexts/AICompanionContext';
import useRealtimeVoice from '../hooks/useRealtimeVoice';
import './AICompanionPanel.css';

/**
 * AI Companion Panel
 * Floating panel for SAT Coach AI interactions
 */
const AICompanionPanel = () => {
    const navigate = useNavigate();
    const {
        greeting,
        isLoading,
        showPanel,
        isAvailable,
        togglePanel,
        dismissPanel,
        getVoiceToken,
        setIsVoiceActive
    } = useAICompanion();

    const {
        isConnected: isVoiceConnected,
        isConnecting: isVoiceConnecting,
        error: voiceError,
        isMuted,
        connect: connectVoice,
        disconnect: disconnectVoice,
        toggleMute
    } = useRealtimeVoice();

    const [showVoiceError, setShowVoiceError] = useState(false);

    // Update companion voice state
    useEffect(() => {
        setIsVoiceActive(isVoiceConnected);
    }, [isVoiceConnected, setIsVoiceActive]);

    // Handle voice button click
    const handleVoiceClick = async () => {
        if (isVoiceConnected) {
            disconnectVoice();
        } else {
            setShowVoiceError(false);
            const tokenData = await getVoiceToken();
            if (tokenData?.token) {
                const success = await connectVoice(tokenData.token);
                if (!success) {
                    setShowVoiceError(true);
                }
            } else {
                setShowVoiceError(true);
            }
        }
    };

    // Handle action button click
    const handleActionClick = () => {
        if (greeting?.suggestedAction?.route) {
            navigate(greeting.suggestedAction.route);
            dismissPanel();
        }
    };

    // Don't render if companion not available
    if (!isAvailable) {
        return null;
    }

    return (
        <>
            {/* Collapsed state - floating button */}
            {!showPanel && (
                <button
                    className="companion-toggle-btn"
                    onClick={togglePanel}
                    aria-label="Open SAT Coach"
                >
                    <span className="companion-avatar">🎓</span>
                    {greeting && !greeting.cached && (
                        <span className="companion-notification-dot" />
                    )}
                </button>
            )}

            {/* Expanded panel */}
            {showPanel && (
                <div className="companion-panel">
                    <div className="companion-header">
                        <div className="companion-title">
                            <span className="companion-avatar-sm">🎓</span>
                            <span>SAT Coach</span>
                        </div>
                        <button
                            className="companion-close-btn"
                            onClick={dismissPanel}
                            aria-label="Close panel"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="companion-content">
                        {isLoading ? (
                            <div className="companion-loading">
                                <div className="companion-typing">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                        ) : greeting ? (
                            <>
                                <p className="companion-greeting">{greeting.greeting}</p>

                                {greeting.suggestedAction && (
                                    <button
                                        className="companion-action-btn"
                                        onClick={handleActionClick}
                                    >
                                        {greeting.suggestedAction.label}
                                    </button>
                                )}
                            </>
                        ) : (
                            <p className="companion-greeting">
                                Welcome! I'm your SAT Coach. How can I help you today?
                            </p>
                        )}
                    </div>

                    {/* Voice section */}
                    <div className="companion-voice-section">
                        <button
                            className={`companion-voice-btn ${isVoiceConnected ? 'active' : ''} ${isVoiceConnecting ? 'connecting' : ''}`}
                            onClick={handleVoiceClick}
                            disabled={isVoiceConnecting}
                        >
                            {isVoiceConnecting ? (
                                <>
                                    <span className="voice-icon">🔄</span>
                                    <span>Connecting...</span>
                                </>
                            ) : isVoiceConnected ? (
                                <>
                                    <span className="voice-icon pulse">🎤</span>
                                    <span>Listening... (click to end)</span>
                                </>
                            ) : (
                                <>
                                    <span className="voice-icon">🎤</span>
                                    <span>Click to speak</span>
                                </>
                            )}
                        </button>

                        {isVoiceConnected && (
                            <button
                                className={`companion-mute-btn ${isMuted ? 'muted' : ''}`}
                                onClick={toggleMute}
                                aria-label={isMuted ? 'Unmute' : 'Mute'}
                            >
                                {isMuted ? '🔇' : '🔊'}
                            </button>
                        )}

                        {(showVoiceError || voiceError) && (
                            <p className="companion-voice-error">
                                Unable to start voice. Please check microphone permissions.
                            </p>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default AICompanionPanel;
