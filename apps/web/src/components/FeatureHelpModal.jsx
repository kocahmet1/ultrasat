import React from 'react';
import Modal from './Modal';
import { FiZap, FiClock, FiBarChart2, FiEye, FiTrendingUp } from 'react-icons/fi';
import '../styles/FeatureHelpModal.css';

/**
 * FeatureHelpModal — the "How this works" explainer, V3 design language.
 *
 * Content is data (title / intro / sections / tip) rendered through one
 * layout: intro line under a mono eyebrow, icon-tiled section cards with
 * square-marker lists, optional extras (the Progress page gets the accuracy
 * tier legend), and an ink "Pro tip" footer.
 *
 * The Progress copy describes the CURRENT system: tiered bars (≥80 green,
 * 50–79 amber, <50 red — same thresholds as the last-10 chip), the last-10
 * coverage bar, honest "answered" counters, and the low-signal rules that
 * keep blank/rushed sittings out of every number here.
 */

const CONTENT = {
  flashcards: {
    title: 'How to Use Flashcard Decks',
    intro: 'Master your vocabulary with spaced repetition and active recall.',
    tip: 'Study for 15–20 minutes daily rather than long sessions — retention compounds.',
    sections: [
      {
        title: 'Getting started',
        icon: FiZap,
        content: [
          'Go to your Word Bank tab and click "Add to Flashcards" on any word',
          'Choose an existing deck or create a new one',
          'Organize words by topic, difficulty, or any system that works for you',
        ],
      },
      {
        title: 'Studying with flashcards',
        icon: FiClock,
        content: [
          'Click the "Study" button on any deck to start a study session',
          'Use spaced repetition — study cards you find difficult more often',
          'Review regularly to move words from short-term to long-term memory',
          'Track your progress with the "Last studied" indicator',
        ],
      },
      {
        title: 'Tips for success',
        icon: FiBarChart2,
        content: [
          'Create themed decks (e.g., "Science Terms", "Literary Words")',
          'Test yourself by saying the definition before flipping the card',
          'Add new words regularly to keep your vocabulary growing',
        ],
      },
    ],
  },

  quizzes: {
    title: 'How to Use Word Quizzes',
    intro: 'Test your knowledge with multiple-choice quizzes built from your flashcard decks.',
    tip: 'Take a quiz right after studying a deck — recall under light pressure is what makes it stick.',
    sections: [
      {
        title: 'Taking quizzes',
        icon: FiZap,
        content: [
          'Word Quizzes are generated from your flashcard decks',
          'Each deck needs at least 4 words to generate a quiz',
          'Answer each question by selecting the correct definition',
        ],
      },
      {
        title: 'Quiz features',
        icon: FiClock,
        content: [
          'Questions are presented in random order for better learning',
          'Multiple-choice format similar to SAT vocabulary questions',
          'Immediate feedback shows correct answers, with your score at the end',
        ],
      },
      {
        title: 'Maximizing learning',
        icon: FiBarChart2,
        content: [
          'Focus on words you get wrong — add them back into study sessions',
          'Use quizzes to find the gaps flashcards alone can hide',
        ],
      },
    ],
  },

  concepts: {
    title: 'How to Use the Concept Bank',
    intro: 'Organize and review your saved SAT concepts to track your learning progress.',
    tip: 'Review your concept bank regularly and add personal notes to the concepts you find hardest.',
    sections: [
      {
        title: 'What is the Concept Bank?',
        icon: FiZap,
        content: [
          'Your personal collection of SAT concepts and terms you\'ve saved',
          'Concepts are automatically saved when you get questions wrong',
          'Track your mastery progress with the mastery toggle',
        ],
      },
      {
        title: 'Managing your concepts',
        icon: FiClock,
        content: [
          'Click any concept for a detailed explanation',
          'Search and filter by subcategory to focus on specific topics',
          'Add personal notes to concepts for better understanding',
        ],
      },
      {
        title: 'Mastery tracking',
        icon: FiBarChart2,
        content: [
          'Mark concepts as "mastered" once you fully understand them',
          'Focus study time on the concepts you haven\'t mastered yet',
        ],
      },
    ],
  },

  progress: {
    title: 'How Progress Tracking Works',
    intro: 'Every number on this page comes from practice you actually did — skill by skill, from your real quizzes and exams.',
    tip: 'Attack the red bars first — skills under 50% are the cheapest score gains on the board. Then keep the amber ones warm so they don\'t slide back.',
    legend: true,
    sections: [
      {
        title: 'Reading a skill card',
        icon: FiBarChart2,
        content: [
          'The bar and the chip share one color language: green means your last 10 answers are at 80% or better, amber 50–79%, red below 50%',
          'The bar fills as your last 10 answers accumulate for that skill — full bar means the accuracy reading is based on a complete window',
          '"N answered" counts real attempts only, across quizzes and exams',
          'Lvl 1–3 is your working difficulty — pass a quiz at 80%+ to move up',
        ],
      },
      {
        title: 'What counts (and what doesn\'t)',
        icon: FiEye,
        content: [
          'Only real work moves these numbers: blank questions are never counted as attempts',
          'Exam modules left blank or mostly blank, modules finished in under 2 minutes, and quizzes finished in under 1 minute are logged but overlooked — they don\'t touch your stats in either direction',
          'The estimated SAT score is accuracy-weighted across both sections; confidence shows how many of the 29 skills have data behind it',
        ],
      },
      {
        title: 'Turning red into green',
        icon: FiTrendingUp,
        content: [
          'Practice on any card launches a quiz targeted at that skill, at your level',
          'Use Learn before practicing when a skill is new — then prove it with a quiz',
          'Your coach reads these same numbers and ranks what to fix first on the Coach page',
        ],
      },
    ],
  },
};

const FALLBACK = { title: 'Feature Help', intro: '', sections: [], tip: null };

/** The accuracy tier legend (Progress only) — same thresholds everywhere. */
const TierLegend = () => (
  <div className="fh-legend" aria-label="Accuracy color tiers">
    <span className="fh-legend-item">
      <i className="fh-swatch fh-swatch--strong" aria-hidden="true" />
      <b>80%+</b> solid
    </span>
    <span className="fh-legend-item">
      <i className="fh-swatch fh-swatch--moderate" aria-hidden="true" />
      <b>50–79%</b> shaky
    </span>
    <span className="fh-legend-item">
      <i className="fh-swatch fh-swatch--weak" aria-hidden="true" />
      <b>&lt;50%</b> fix first
    </span>
  </div>
);

const FeatureHelpModal = ({ isOpen, onClose, feature }) => {
  const content = CONTENT[feature] || FALLBACK;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={content.title}>
      <div className="fh">
        <p className="fh-eyebrow">Guide</p>
        {content.intro && <p className="fh-intro">{content.intro}</p>}
        {content.legend && <TierLegend />}

        <div className="fh-sections">
          {content.sections.map((section) => (
            <section key={section.title} className="fh-section">
              <div className="fh-section-head">
                <span className="fh-tile" aria-hidden="true">
                  <section.icon />
                </span>
                <h4>{section.title}</h4>
              </div>
              <ul className="fh-list">
                {section.content.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        {content.tip && (
          <div className="fh-tip">
            <span className="fh-tip-label">Pro tip</span>
            <p>{content.tip}</p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default FeatureHelpModal;
