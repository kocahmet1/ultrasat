import React from 'react';
import './WordBankUpgradeModal.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faLock, faRocket } from '@fortawesome/free-solid-svg-icons';

const WordBankUpgradeModal = ({ isOpen, onClose, featureName }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="word-bank-upgrade-modal-overlay">
      <div className="word-bank-upgrade-modal-content">
        <button onClick={onClose} className="word-bank-upgrade-modal-close-btn">
          <FontAwesomeIcon icon={faTimes} />
        </button>
        <div className="word-bank-upgrade-modal-header">
          <FontAwesomeIcon icon={faLock} className="word-bank-upgrade-modal-icon" />
          <h2>Unlock {featureName}</h2>
        </div>
        <div className="word-bank-upgrade-modal-body">
          <p>Upgrade to our Pro plan to get access to this and other exclusive features.</p>
          <ul>
            <li>Flashcard Decks</li>
            <li>Word Quizzes</li>
            <li>Advanced Analytics</li>
            <li>And much more!</li>
          </ul>
        </div>
        <div className="word-bank-upgrade-modal-footer">
          <button className="word-bank-upgrade-modal-upgrade-btn" onClick={() => window.location.href = '/membership/upgrade'}>
            <FontAwesomeIcon icon={faRocket} />
            Upgrade to Pro
          </button>
        </div>
      </div>
    </div>
  );
};

export default WordBankUpgradeModal;
