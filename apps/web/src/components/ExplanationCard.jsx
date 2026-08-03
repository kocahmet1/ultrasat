import React from 'react';
import { FiCheckCircle, FiXCircle, FiMinusCircle, FiInfo, FiBookmark } from 'react-icons/fi';
import MathText from './MathText';
import {
  getSubcategoryName,
  getSubcategoryIdFromString,
  SUBCATEGORY_MAIN_CATEGORIES,
} from '../utils/subcategoryConstants';
import './ExplanationCard.css';

/**
 * ExplanationCard — THE shared question-explanation renderer (UWorld-style).
 *
 * Props contract (stable — other surfaces depend on this exact shape):
 *   {
 *     question,               // full question doc; reads explanationStructured,
 *                             // explanation, options, correctAnswer, subcategory
 *     selectedOption = null,  // option index (MC) or typed string (user-input)
 *     isCorrect = null,       // true | false | null (null = not graded/unknown)
 *     omitted = false,        // true → neutral "Omitted" state
 *     compact = false         // tighter spacing for embedding inside the quiz
 *   }
 *
 * Renders, in order, whichever parts exist: status strip, rule line,
 * walkthrough steps, per-choice rebuttals (student's wrong pick first),
 * things-to-remember box, subcategory/domain tag chips. Falls back to the
 * legacy `explanation` string as prose; never renders an empty card.
 */

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

function toLetter(key) {
  if (key === null || key === undefined) return null;
  if (typeof key === 'number' && Number.isInteger(key) && key >= 0 && key < LETTERS.length) {
    return LETTERS[key];
  }
  const str = String(key).trim();
  if (/^[A-Fa-f]$/.test(str)) return str.toUpperCase();
  if (/^[0-5]$/.test(str)) return LETTERS[parseInt(str, 10)];
  return null;
}

function cleanArray(value) {
  if (typeof value === 'string' && value.trim()) return [value.trim()];
  if (!Array.isArray(value)) return [];
  return value.filter((item) => typeof item === 'string' && item.trim()).map((item) => item.trim());
}

/** Defensive client-side normalization of question.explanationStructured. */
function normalizeStructured(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const rule = typeof raw.rule === 'string' ? raw.rule.trim() : '';
  const steps = cleanArray(raw.steps !== undefined ? raw.steps : raw.walkthrough);
  const thingsToRemember = cleanArray(raw.thingsToRemember);
  const choiceRebuttals = {};
  if (raw.choiceRebuttals && typeof raw.choiceRebuttals === 'object' && !Array.isArray(raw.choiceRebuttals)) {
    Object.keys(raw.choiceRebuttals).forEach((key) => {
      const letter = toLetter(key);
      const text = raw.choiceRebuttals[key];
      if (letter && typeof text === 'string' && text.trim()) {
        choiceRebuttals[letter] = text.trim();
      }
    });
  }
  const structured = { rule, steps, choiceRebuttals, thingsToRemember };
  const hasContent = rule || steps.length > 0 || thingsToRemember.length > 0 || Object.keys(choiceRebuttals).length > 0;
  return hasContent ? structured : null;
}

/** Legacy blob (string, or stray array in old docs) → prose string. */
function legacyExplanationText(question) {
  const raw = question && question.explanation;
  if (Array.isArray(raw)) return raw.filter((p) => typeof p === 'string').join('\n').trim();
  if (typeof raw === 'string') return raw.trim();
  return '';
}

/** Resolve the correct option index for multiple-choice questions. */
function resolveCorrectIndex(question) {
  const options = Array.isArray(question.options) ? question.options : [];
  if (options.length === 0) return null;
  const { correctAnswer } = question;
  if (typeof correctAnswer === 'number' && options[correctAnswer] !== undefined) return correctAnswer;
  if (typeof correctAnswer === 'string') {
    const idx = options.indexOf(correctAnswer);
    if (idx >= 0) return idx;
    if (/^[0-9]+$/.test(correctAnswer.trim())) {
      const n = parseInt(correctAnswer.trim(), 10);
      if (options[n] !== undefined) return n;
    }
  }
  return null;
}

function prettifyDomain(domain) {
  if (!domain || typeof domain !== 'string') return null;
  return domain
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function ExplanationCard({
  question,
  selectedOption = null,
  isCorrect = null,
  omitted = false,
  compact = false,
}) {
  if (!question) return null;

  const structured = normalizeStructured(question.explanationStructured);
  const legacyText = legacyExplanationText(question);
  const options = Array.isArray(question.options) ? question.options : [];
  const isMultipleChoice = options.length > 0;

  // ---- status strip -------------------------------------------------------
  let statusKey = null; // 'correct' | 'incorrect' | 'omitted' | null
  if (omitted) statusKey = 'omitted';
  else if (isCorrect === true) statusKey = 'correct';
  else if (isCorrect === false) statusKey = 'incorrect';

  const correctIndex = resolveCorrectIndex(question);
  const correctLetter = correctIndex !== null ? toLetter(correctIndex) : null;
  const correctText = isMultipleChoice
    ? (correctIndex !== null ? options[correctIndex] : null)
    : (question.correctAnswer !== undefined && question.correctAnswer !== null
      ? String(question.correctAnswer)
      : null);

  // ---- per-choice rebuttals, student's wrong pick first -------------------
  const pickedLetter = !omitted && isMultipleChoice ? toLetter(selectedOption) : null;
  const rebuttals = structured ? structured.choiceRebuttals : {};
  const rebuttalLetters = Object.keys(rebuttals).sort();
  if (pickedLetter && isCorrect === false && rebuttalLetters.includes(pickedLetter)) {
    rebuttalLetters.splice(rebuttalLetters.indexOf(pickedLetter), 1);
    rebuttalLetters.unshift(pickedLetter);
  }

  // ---- tag chips ----------------------------------------------------------
  const subcategorySource = question.subcategory || question.subCategory || question.subcategoryId;
  const subcategoryName = subcategorySource ? getSubcategoryName(subcategorySource) : null;
  const hasSubcategoryChip = subcategoryName && subcategoryName !== 'Unknown Subcategory';
  const numericId = subcategorySource ? getSubcategoryIdFromString(subcategorySource) : null;
  const domainName = numericId ? prettifyDomain(SUBCATEGORY_MAIN_CATEGORIES[numericId]) : null;

  const hasStructuredBody = !!structured;
  const showProseFallback = !hasStructuredBody && !!legacyText;
  const showEmptyNote = !hasStructuredBody && !legacyText;

  return (
    <div className={`exp-card${compact ? ' exp-card--compact' : ''}`}>
      {/* Status strip */}
      <div className="exp-status">
        {statusKey === 'correct' && (
          <span className="exp-status-chip exp-status-chip--correct">
            <FiCheckCircle aria-hidden="true" /> Correct
          </span>
        )}
        {statusKey === 'incorrect' && (
          <span className="exp-status-chip exp-status-chip--incorrect">
            <FiXCircle aria-hidden="true" /> Incorrect
          </span>
        )}
        {statusKey === 'omitted' && (
          <span className="exp-status-chip exp-status-chip--omitted">
            <FiMinusCircle aria-hidden="true" /> Omitted
          </span>
        )}
        {correctText !== null && (
          <span className="exp-status-answer">
            Correct answer:{' '}
            <strong>
              {correctLetter ? `${correctLetter} — ` : ''}
              <MathText text={correctText} />
            </strong>
          </span>
        )}
      </div>

      {/* Rule line */}
      {structured && structured.rule && (
        <div className="exp-rule">
          <FiInfo className="exp-rule-icon" aria-hidden="true" />
          <p className="exp-rule-text">
            <MathText text={structured.rule} />
          </p>
        </div>
      )}

      {/* Walkthrough steps */}
      {structured && structured.steps.length > 0 && (
        <div className="exp-steps">
          <div className="exp-section-label">Walkthrough</div>
          {structured.steps.map((step, idx) => (
            <MathText key={idx} block className="exp-step" text={step} />
          ))}
        </div>
      )}

      {/* Per-choice rebuttals */}
      {rebuttalLetters.length > 0 && (
        <div className="exp-rebuttals">
          <div className="exp-section-label">Why the other choices fail</div>
          <ul className="exp-rebuttal-list">
            {rebuttalLetters.map((letter) => {
              const isPicked = pickedLetter === letter && isCorrect === false;
              return (
                <li
                  key={letter}
                  className={`exp-rebuttal${isPicked ? ' exp-rebuttal--picked' : ''}`}
                >
                  <span className="exp-rebuttal-letter">{letter}</span>
                  <div className="exp-rebuttal-body">
                    {isPicked && <span className="exp-rebuttal-badge">Your answer</span>}
                    <MathText block className="exp-rebuttal-text" text={rebuttals[letter]} />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Things to remember */}
      {structured && structured.thingsToRemember.length > 0 && (
        <div className="exp-remember">
          <div className="exp-remember-head">
            <FiBookmark aria-hidden="true" /> Things to remember
          </div>
          <ul className="exp-remember-list">
            {structured.thingsToRemember.map((item, idx) => (
              <li key={idx}>
                <MathText text={item} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Legacy fallback: flat explanation rendered as prose */}
      {showProseFallback && <MathText block className="exp-prose" text={legacyText} />}

      {/* Never an empty card */}
      {showEmptyNote && (
        <p className="exp-empty-note">A full explanation for this question is on its way.</p>
      )}

      {/* Tag chips */}
      {(hasSubcategoryChip || domainName) && (
        <div className="exp-tags">
          {hasSubcategoryChip && <span className="ut-chip ut-chip--accent">{subcategoryName}</span>}
          {domainName && <span className="ut-chip">{domainName}</span>}
        </div>
      )}
    </div>
  );
}
