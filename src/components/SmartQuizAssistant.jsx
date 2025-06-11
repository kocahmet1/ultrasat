// src/components/SmartQuizAssistant.jsx
import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faLightbulb, faTimes, faFileAlt } from '@fortawesome/free-solid-svg-icons';
import '../styles/SmartQuizAssistant.css';

/**
 * SmartQuiz AI Assistant component
 * Provides a chat interface for students to get help with quiz questions
 */
const SmartQuizAssistant = ({ 
  question, 
  onMessage, 
  onTip, 
  onSummarise,
  initialHistory = [], 
  loading = false,
  onClose,
  expanded = true
}) => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState(initialHistory);
  const [showAssistant, setShowAssistant] = useState(expanded);
  const chatEndRef = useRef(null);
  
  // Update history when initialHistory changes from parent
  useEffect(() => {
    console.log('initialHistory changed:', initialHistory);
    setHistory(initialHistory);
  }, [initialHistory]);
  
  // Scroll to bottom of chat whenever history changes
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    console.log('Current history in assistant:', history);
  }, [history]);
  
  // Add messages to history
  const addMessage = (content, isUser = true) => {
    const newMessage = {
      content,
      timestamp: new Date().toISOString(),
      isUser
    };
    
    setHistory(prev => [...prev, newMessage]);
    return newMessage;
  };
  
  // Handle sending a message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    
    // Add user message to history
    const userMessage = addMessage(input, true);
    setInput('');
    
    // Callback to parent component
    if (onMessage) {
      try {
        await onMessage(userMessage, history);
      } catch (error) {
        // If there's an error, add an error message to the chat
        addMessage("I'm sorry, I couldn't process your message. Please try again.", false);
      }
    }
  };
  
  // Request a tip from the assistant
  const handleRequestTip = async () => {
    if (loading) return;
    
    // Add tip request message
    const tipMessage = addMessage("Can you give me a tip for this problem?", true);
    
    // Callback to parent component
    if (onTip) {
      try {
        await onTip(tipMessage, history);
      } catch (error) {
        // If there's an error, add an error message to the chat
        addMessage("I'm sorry, I couldn't generate a tip right now. Please try again.", false);
      }
    }
  };

  // Request a text summary from the assistant
  const handleSummariseText = async () => {
    if (loading) return;
    
    // Add summarise request message
    const summariseMessage = addMessage("Can you summarise the text for me?", true);
    
    // Callback to parent component
    if (onSummarise) {
      try {
        await onSummarise(summariseMessage, history);
      } catch (error) {
        // If there's an error, add an error message to the chat
        addMessage("I'm sorry, I couldn't generate a summary right now. Please try again.", false);
      }
    }
  };
  
  // Toggle the assistant visibility
  const toggleAssistant = () => {
    setShowAssistant(prev => !prev);
  };
  
  // Handle assistant close
  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      setShowAssistant(false);
    }
  };
  
  return (
    <div className={`smart-quiz-assistant ${showAssistant ? 'expanded' : 'collapsed'}`}>
      <div className="assistant-header">
        <h3>
          <FontAwesomeIcon icon={faLightbulb} /> Study Helper
        </h3>
        <div className="assistant-header-buttons">
          <button className="toggle-button" onClick={toggleAssistant}>
            {showAssistant ? '−' : '+'}
          </button>
          <button className="close-button" onClick={handleClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
      </div>
      
      {showAssistant && (
        <>
          <div className="chat-container">
            {history.length === 0 ? (
              <div className="empty-chat">
                <FontAwesomeIcon icon={faLightbulb} size="2x" />
                <p>Ask any question about this problem or request a tip!</p>
              </div>
            ) : (
              <div className="chat-messages">
                {history.map((message, index) => (
                  <div 
                    key={index} 
                    className={`message ${message.isUser ? 'user-message' : 'assistant-message'}`}
                  >
                    <div className="message-content">{message.content}</div>
                  </div>
                ))}
                <div ref={chatEndRef} />
                {loading && (
                  <div className="message assistant-message">
                    <div className="message-content loading">
                      <span>.</span><span>.</span><span>.</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="chat-actions">
            
            <form className="chat-form" onSubmit={handleSendMessage}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question..."
                disabled={loading}
              />
              <button 
                type="submit" 
                disabled={!input.trim() || loading}
              >
                <FontAwesomeIcon icon={faPaperPlane} />
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default SmartQuizAssistant;
