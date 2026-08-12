import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLock, FiZap, FiCheck, FiX } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import './ProUpgradeModal.css';

// THE Pro pitch, shared by every upgrade surface (UX overhaul P0-A).
// Keep these claims in sync with MembershipUpgrade.jsx and the landing page.
export const PRO_BENEFITS = [
  'Lessons for all 29 SAT skills',
  'Unlimited practice exams',
  '60 AI coach chats every day',
  'Full flashcard & word bank tools',
];

export const PRO_PRICE_LINE = '$9.99/mo or $99.99/yr';

// Prices are temporarily hidden while the site is free for current students
// (manual upgrades from the admin panel). Set to true to show prices again —
// PRO_PRICE_LINE above is untouched.
export const SHOW_PRICES = false;
export const PRICE_TBD_LINE = 'Pricing to be determined';

/**
 * The one shared upgrade modal (UX overhaul P0-A). Replaces the old
 * UpgradeModal, ProFeatureModal, WordBankUpgradeModal and LearnUpgradeModal.
 *
 * Accepts either `open` or `isOpen` so call sites read naturally.
 * Guests get a signup pitch instead of a paywall — sending them to
 * /membership/upgrade only bounced them off the login wall.
 *
 * @param {{
 *   open?: boolean,
 *   isOpen?: boolean,
 *   onClose: () => void,
 *   featureName?: string,
 *   description?: string,
 * }} props
 */
const ProUpgradeModal = ({ open, isOpen, onClose, featureName, description }) => {
  const show = open ?? isOpen ?? false;
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!show) return undefined;
    const handleKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [show, onClose]);

  if (!show) return null;

  const isGuest = !currentUser;

  const handleUpgrade = () => {
    onClose();
    navigate(isGuest ? '/signup' : '/membership/upgrade');
  };

  const title = isGuest
    ? 'Create a free account'
    : featureName
      ? `${featureName} is a Pro feature`
      : 'Upgrade to Pro';

  const body = isGuest
    ? `${featureName || 'This feature'} is part of UltraSAT Pro. Start with a free account to save your progress — then upgrade whenever you're ready.`
    : description || 'One upgrade opens every Pro tool:';

  return (
    <div className="pro-upgrade-overlay" onClick={onClose} role="presentation">
      <div
        className="ut-card pro-upgrade-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pro-upgrade-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className="pro-upgrade-close" onClick={onClose} aria-label="Close">
          <FiX />
        </button>

        <div className="pro-upgrade-badge">
          {isGuest ? <FiZap aria-hidden="true" /> : <FiLock aria-hidden="true" />}
        </div>

        <h2 id="pro-upgrade-title" className="pro-upgrade-title">{title}</h2>
        <p className="pro-upgrade-desc">{body}</p>

        <ul className="pro-upgrade-benefits">
          {PRO_BENEFITS.map((benefit) => (
            <li key={benefit}>
              <FiCheck aria-hidden="true" />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>

        <p className="pro-upgrade-price">
          {SHOW_PRICES ? (
            <>
              {PRO_PRICE_LINE}
              <span> · cancel anytime</span>
            </>
          ) : (
            PRICE_TBD_LINE
          )}
        </p>

        <div className="pro-upgrade-actions">
          <button type="button" className="ut-btn ut-btn--primary ut-btn--lg" onClick={handleUpgrade}>
            {isGuest ? 'Sign up free' : 'Upgrade to Pro'}
          </button>
          <button type="button" className="ut-btn ut-btn--ghost" onClick={onClose}>
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProUpgradeModal;
