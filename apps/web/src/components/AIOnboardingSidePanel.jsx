import React, { useState, useEffect, useRef, useCallback } from 'react';
import './AIOnboardingSidePanel.css';

/**
 * AI Onboarding Side Panel
 * A chat-like left side panel for first-time user onboarding
 */
const AIOnboardingSidePanel = ({ onSendMessage, onAction, isLoading, userName }) => {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const chatEndRef = useRef(null);
    const inputRef = useRef(null);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    // Show typing indicator when loading
    useEffect(() => {
        setIsTyping(isLoading);
    }, [isLoading]);

    /**
     * Add a message to the chat
     */
    const addMessage = useCallback((role, content, extras = {}) => {
        setMessages(prev => [...prev, { 
            id: Date.now() + Math.random(), 
            role, 
            content,
            timestamp: new Date(),
            ...extras
        }]);
    }, []);

    /**
     * Handle AI response — called by parent
     */
    const handleAIResponse = useCallback((response) => {
        addMessage('assistant', response.message, {
            quickReplies: response.quickReplies || [],
            action: response.action || null
        });
    }, [addMessage]);

    // Expose handleAIResponse to parent
    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.__onboardingPanelRef = { handleAIResponse, addMessage };
        }
        return () => {
            if (typeof window !== 'undefined') delete window.__onboardingPanelRef;
        };
    }, [addMessage, handleAIResponse]);

    /**
     * Handle user sending a message (via text input or quick reply)
     */
    const handleSend = async (text) => {
        if (!text || !text.trim()) return;

        const userMessage = text.trim();
        addMessage('user', userMessage);
        setInputValue('');

        // Build conversation history for the API
        const conversationHistory = [
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: userMessage }
        ];

        if (onSendMessage) {
            const response = await onSendMessage(conversationHistory);
            if (response) {
                handleAIResponse(response);
            }
        }
    };

    /**
     * Handle quick reply button click
     */
    const handleQuickReply = (reply) => {
        handleSend(reply);
    };

    /**
     * Handle action button click (e.g., navigate to Predictive Test)
     */
    const handleActionClick = (action) => {
        if (onAction) {
            onAction(action);
        }
    };

    /**
     * Handle key press in input
     */
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend(inputValue);
        }
    };

    // Get the latest quick replies (from the last assistant message)
    const latestAssistantMessage = [...messages].reverse().find(m => m.role === 'assistant');
    const showQuickReplies = latestAssistantMessage?.quickReplies?.length > 0 && !isTyping;
    const showAction = latestAssistantMessage?.action && !isTyping;

    return (
        <div className="onboarding-side-panel">
            {/* Panel Header with Avatar */}
            <div className="osp-header">
                <div className="osp-avatar-area">
                    <div className="osp-avatar">
                        <div className="osp-avatar-ring">
                            <div className="osp-avatar-inner">
                                <span className="osp-avatar-emoji">🎓</span>
                            </div>
                        </div>
                        <div className="osp-status-dot" />
                    </div>
                    <div className="osp-identity">
                        <h3 className="osp-name">SAT Coach</h3>
                        <span className="osp-status-text">
                            {isTyping ? 'Typing...' : 'Online'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Chat Messages Area */}
            <div className="osp-chat-area">
                {messages.length === 0 && !isTyping && (
                    <div className="osp-welcome-hint">
                        <div className="osp-welcome-icon">✨</div>
                        <p>Your personal SAT Coach is ready to help you get started!</p>
                    </div>
                )}

                {messages.map((msg) => (
                    <div 
                        key={msg.id} 
                        className={`osp-message osp-message-${msg.role}`}
                    >
                        {msg.role === 'assistant' && (
                            <div className="osp-message-avatar">🎓</div>
                        )}
                        <div className="osp-message-bubble">
                            <p>{msg.content}</p>
                        </div>
                    </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                    <div className="osp-message osp-message-assistant">
                        <div className="osp-message-avatar">🎓</div>
                        <div className="osp-message-bubble osp-typing-bubble">
                            <div className="osp-typing-indicator">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Action Button */}
                {showAction && (
                    <div className="osp-action-container">
                        <button 
                            className="osp-action-btn"
                            onClick={() => handleActionClick(latestAssistantMessage.action)}
                        >
                            <span className="osp-action-icon">🚀</span>
                            {latestAssistantMessage.action.label || 'Take Predictive Test'}
                        </button>
                    </div>
                )}

                {/* Quick Reply Buttons */}
                {showQuickReplies && (
                    <div className="osp-quick-replies">
                        {latestAssistantMessage.quickReplies.map((reply, index) => (
                            <button 
                                key={index}
                                className="osp-quick-reply-btn"
                                onClick={() => handleQuickReply(reply)}
                                disabled={isLoading}
                            >
                                {reply}
                            </button>
                        ))}
                    </div>
                )}

                <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className="osp-input-area">
                <div className="osp-input-container">
                    <input
                        ref={inputRef}
                        type="text"
                        className="osp-input"
                        placeholder="Type your message..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isLoading}
                    />
                    <button 
                        className="osp-send-btn"
                        onClick={() => handleSend(inputValue)}
                        disabled={isLoading || !inputValue.trim()}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="22" y1="2" x2="11" y2="13"></line>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AIOnboardingSidePanel;
