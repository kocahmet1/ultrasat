import React, { useState } from 'react';
import { useAICompanion } from '../contexts/AICompanionContext';
import './TargetScoreModal.css';

/**
 * Target Score Modal
 * First-time user onboarding to set SAT goals
 */
const TargetScoreModal = ({ isOpen, onClose, onComplete }) => {
    const { updateProfile } = useAICompanion();

    const [targetScore, setTargetScore] = useState('');
    const [examDate, setExamDate] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // Validate target score
        const score = parseInt(targetScore, 10);
        if (isNaN(score) || score < 400 || score > 1600) {
            setError('Please enter a valid SAT score between 400 and 1600');
            return;
        }

        setIsSubmitting(true);

        try {
            const success = await updateProfile({
                targetScore: score,
                examDate: examDate || null,
                onboardingComplete: true
            });

            if (success) {
                onComplete?.({ targetScore: score, examDate });
                onClose?.();
            } else {
                setError('Failed to save your goals. Please try again.');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSkip = async () => {
        // Mark onboarding as complete without setting goals
        await updateProfile({ onboardingComplete: true });
        onClose?.();
    };

    if (!isOpen) return null;

    return (
        <div className="target-score-overlay">
            <div className="target-score-modal">
                <div className="target-score-header">
                    <span className="target-score-icon">🎯</span>
                    <h2>Let's Set Your Goals</h2>
                    <p>Help your SAT Coach understand where you're headed</p>
                </div>

                <form onSubmit={handleSubmit} className="target-score-form">
                    <div className="form-group">
                        <label htmlFor="targetScore">What's your target SAT score?</label>
                        <input
                            type="number"
                            id="targetScore"
                            value={targetScore}
                            onChange={(e) => setTargetScore(e.target.value)}
                            placeholder="e.g., 1500"
                            min="400"
                            max="1600"
                            step="10"
                            required
                        />
                        <span className="form-hint">Enter a score between 400 and 1600</span>
                    </div>

                    <div className="form-group">
                        <label htmlFor="examDate">When is your test date? (optional)</label>
                        <input
                            type="date"
                            id="examDate"
                            value={examDate}
                            onChange={(e) => setExamDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                        />
                        <span className="form-hint">This helps your Coach plan your prep timeline</span>
                    </div>

                    {error && (
                        <div className="form-error">{error}</div>
                    )}

                    <div className="form-actions">
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Saving...' : 'Get Started'}
                        </button>
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={handleSkip}
                            disabled={isSubmitting}
                        >
                            Skip for now
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TargetScoreModal;
