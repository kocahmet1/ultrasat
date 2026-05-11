import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBook,
  faArrowLeft,
  faLightbulb,
  faQuestion,
  faPlayCircle,
  faBrain,
  faCheckCircle,
  faSpinner,
  faClock,
  faSignal,
  faLayerGroup,
  faChevronRight,
  faListUl,
  faTimes,
  faCheck,
  faRocket,
  faExclamationTriangle,
  faGraduationCap,
  faBullseye
} from '@fortawesome/free-solid-svg-icons';
import { getConceptsBySubcategory } from '../firebase/conceptServices';
import { getLearningContent } from '../firebase/learningContentServices';
import { getDiverseSampleQuestions } from '../firebase/questionServices';
import { getSubcategoryName, getSubcategoryIdFromString, SUBCATEGORY_SUBJECTS, SUBCATEGORY_MAIN_CATEGORIES } from '../utils/subcategoryConstants';
import { processTextMarkup } from '../utils/textProcessing';
import { ToastContainer } from 'react-toastify';
import EMBEDDED_QUIZ_QUESTIONS from '../data/embeddedQuizQuestions';
import '../styles/SubcategoryLearnPage.css';

// ─── Reading Progress Bar ─────────────────────────────────────
const ReadingProgressBar = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setProgress(Math.min(100, scrollPercent));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return <div className="reading-progress-bar" style={{ width: `${progress}%` }} />;
};

// ─── Sidebar Table of Contents ────────────────────────────────
const TableOfContents = ({ sections, activeSection }) => (
  <nav className="learn-sidebar">
    <div className="learn-sidebar-sticky">
      <div className="toc-label">On this page</div>
      <ul className="toc-list">
        {sections.map((section) => (
          <li key={section.id} className="toc-item">
            <a
              href={`#${section.id}`}
              className={`toc-link ${activeSection === section.id ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              {section.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  </nav>
);

// ─── Mobile TOC ───────────────────────────────────────────────
const MobileTOC = ({ sections, activeSection, isOpen, onClose }) => (
  <>
    {isOpen && <div className="learn-mobile-toc-overlay open" onClick={onClose} />}
    <div className={`learn-mobile-toc-panel ${isOpen ? 'open' : ''}`}>
      <button className="learn-mobile-toc-close" onClick={onClose}>
        <FontAwesomeIcon icon={faTimes} />
      </button>
      <div className="toc-label">On this page</div>
      <ul className="toc-list">
        {sections.map((section) => (
          <li key={section.id} className="toc-item">
            <a
              href={`#${section.id}`}
              className={`toc-link ${activeSection === section.id ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' });
                onClose();
              }}
            >
              {section.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  </>
);

// ─── Callout Box ──────────────────────────────────────────────
const CalloutBox = ({ type = 'tip', title, children }) => {
  const icons = {
    tip: '💡',
    warning: '⚠️',
    insight: '🔑'
  };
  return (
    <div className={`learn-callout ${type}`}>
      <div className="learn-callout-header">
        <span>{icons[type]}</span>
        {title}
      </div>
      <div className="learn-callout-content">{children}</div>
    </div>
  );
};

// Lesson-top animated infographic for high-signal SAT strategy summaries.
const TextStructurePurposeInfographic = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [activeTrap, setActiveTrap] = useState(0);

  const steps = [
    {
      id: 'shift',
      icon: faLightbulb,
      label: 'Find the shift',
      command: 'Pivot scan',
      text: 'The shift is where setup turns into the author\'s real move.',
      map: ['Old idea', 'However', 'New claim'],
      callout: 'The hinge usually carries the purpose.',
      answerCue: 'Mentions the contrast, revision, or change in direction.'
    },
    {
      id: 'map',
      icon: faLayerGroup,
      label: 'Map the halves',
      command: 'Structure trace',
      text: 'Name what the first part does, then verify what the ending does.',
      map: ['Context', 'Evidence', 'Takeaway'],
      callout: 'A structure answer must match the whole route.',
      answerCue: 'Describes both the beginning and the ending accurately.'
    },
    {
      id: 'verb',
      icon: faBullseye,
      label: 'Match the verb',
      command: 'Verb filter',
      text: 'Purpose answers live or die on verbs like explain, argue, refute.',
      map: ['Tone', 'Verb', 'Purpose'],
      callout: 'If the opening verb is wrong, the answer is wrong.',
      answerCue: 'Uses a moderate verb that matches the author\'s tone.'
    }
  ];

  const traps = [
    {
      label: 'True detail',
      bait: 'Repeats a real noun or fact from one sentence.',
      fix: 'Ask whether it explains the whole paragraph, not just a detail.'
    },
    {
      label: 'Half-match',
      bait: 'Describes the opening correctly, then misreads the ending.',
      fix: 'Check the last sentence before trusting the choice.'
    },
    {
      label: 'Extreme verb',
      bait: 'Uses condemn, prove, celebrate, or another loaded verb.',
      fix: 'Prefer the calm academic verb the passage can actually support.'
    }
  ];

  const active = steps[activeStep];
  const trap = traps[activeTrap];

  return (
    <section
      className={`lesson-infographic tsp-infographic tsp-mode-${active.id}`}
      aria-labelledby="tsp-infographic-title"
    >
      <div className="tsp-infographic-header">
        <div>
          <p className="tsp-kicker">
            <span className="tsp-live-dot" />
            Strategy Lab
          </p>
          <h2 id="tsp-infographic-title">SAT Text Structure Lab</h2>
          <p className="tsp-subtitle">
            Structure, purpose, and traps become clearer when the passage is scanned
            by job, route, and answer verb.
          </p>
        </div>
        <div className="tsp-score-chip">
          <FontAwesomeIcon icon={faBrain} />
          Reading & Writing
        </div>
      </div>

      <div className="tsp-lab-grid">
        <div className="tsp-reader-panel" aria-live="polite">
          <div className="tsp-panel-toolbar">
            <span>Passage scanner</span>
            <strong>{active.command}</strong>
          </div>

          <div className="tsp-scan-window">
            <div className="tsp-scan-beam" />
            <p className={`tsp-passage-line ${active.id === 'map' ? 'is-lit' : ''}`}>
              Older studies treated urban green roofs as mostly decorative additions to buildings.
            </p>
            <p className={`tsp-passage-line has-pivot ${active.id === 'shift' ? 'is-lit' : ''}`}>
              <span>However,</span> newer evidence shows that they reduce heat, absorb stormwater,
              and change how planners measure building value.
            </p>
            <p className={`tsp-passage-line ${active.id === 'verb' ? 'is-lit' : ''}`}>
              The passage therefore explains why a design feature once seen as cosmetic is now
              evaluated as practical infrastructure.
            </p>
          </div>

          <div className="tsp-route-map" aria-label="Active strategy route">
            {active.map.map((item, index) => (
              <React.Fragment key={item}>
                <span>{item}</span>
                {index < active.map.length - 1 && (
                  <FontAwesomeIcon icon={faChevronRight} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="tsp-control-panel">
          <div className="tsp-control-label">Choose the lens</div>
          <div className="tsp-step-tabs" role="tablist" aria-label="Text structure strategy lenses">
            {steps.map((step, index) => (
              <button
                type="button"
                role="tab"
                aria-selected={activeStep === index}
                className={`tsp-step-tab ${activeStep === index ? 'active' : ''}`}
                onClick={() => setActiveStep(index)}
                key={step.id}
              >
                <span className="tsp-step-tab-icon">
                  <FontAwesomeIcon icon={step.icon} />
                </span>
                <span>
                  <small>0{index + 1}</small>
                  {step.label}
                </span>
              </button>
            ))}
          </div>

          <div className="tsp-active-readout" key={active.id}>
            <span>{active.command}</span>
            <h3>{active.label}</h3>
            <p>{active.text}</p>
            <div className="tsp-answer-cue">
              <small>Best answer should</small>
              <strong>{active.answerCue}</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="tsp-trap-console">
        <div className="tsp-trap-heading">
          <FontAwesomeIcon icon={faExclamationTriangle} />
          <div>
            <h3>Trap console</h3>
            <p>See the bait pattern and the countermove before choosing an answer.</p>
          </div>
        </div>

        <div className="tsp-trap-actions" role="tablist" aria-label="Common answer traps">
          {traps.map((trapItem, index) => (
            <button
              type="button"
              role="tab"
              aria-selected={activeTrap === index}
              className={activeTrap === index ? 'active' : ''}
              onClick={() => setActiveTrap(index)}
              key={trapItem.label}
            >
              {trapItem.label}
            </button>
          ))}
        </div>

        <div className="tsp-trap-readout" aria-live="polite">
          <div>
            <span>Bait</span>
            <strong>{trap.bait}</strong>
          </div>
          <div>
            <span>Countermove</span>
            <strong>{trap.fix}</strong>
          </div>
        </div>
      </div>
    </section>
  );
};

const WordsInContextInfographic = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [activeTrap, setActiveTrap] = useState(0);

  const steps = [
    {
      id: 'blind',
      icon: faTimes,
      label: 'Blind the options',
      command: 'Choice shield',
      text: 'Define the blank before the answer choices implant a meaning.',
      map: ['Blank', 'Own word', 'Match'],
      answerCue: 'Fits your simple prediction, not just the sentence rhythm.'
    },
    {
      id: 'perimeter',
      icon: faLayerGroup,
      label: 'Read the perimeter',
      command: 'Clue scan',
      text: 'Tone markers and transition anchors tell you the word polarity.',
      map: ['Tone', 'Anchor', 'Direction'],
      answerCue: 'Obeys contrast words like although, but, despite, and however.'
    },
    {
      id: 'match',
      icon: faBullseye,
      label: 'Guess and match',
      command: 'Fit test',
      text: 'Use a plain word first, then choose the closest SAT-level match.',
      map: ['Predict', 'Sort', 'Select'],
      answerCue: 'Matches meaning, tone, and sentence logic at the same time.'
    }
  ];

  const traps = [
    {
      label: 'Primary meaning',
      bait: 'Uses the most familiar definition of a word.',
      fix: 'Test the meaning required by this sentence, not your first association.'
    },
    {
      label: 'Smart word',
      bait: 'Sounds academic but does not fit the clue perimeter.',
      fix: 'Choose the exact logical fit over the most impressive vocabulary.'
    },
    {
      label: 'Tone mismatch',
      bait: 'Reads smoothly while flipping the sentence positive or negative.',
      fix: 'Sort the blank as positive, negative, or neutral before selecting.'
    }
  ];

  const active = steps[activeStep];
  const trap = traps[activeTrap];

  return (
    <section
      className={`lesson-infographic tsp-infographic wic-infographic wic-mode-${active.id}`}
      aria-labelledby="wic-infographic-title"
    >
      <div className="tsp-infographic-header">
        <div>
          <p className="tsp-kicker">
            <span className="tsp-live-dot" />
            Context Lab
          </p>
          <h2 id="wic-infographic-title">Words in Context Decoder</h2>
          <p className="tsp-subtitle">
            The blank has a shape. Context clues define that shape before any
            answer choice gets a vote.
          </p>
        </div>
        <div className="tsp-score-chip">
          <FontAwesomeIcon icon={faBrain} />
          Vocabulary Logic
        </div>
      </div>

      <div className="tsp-lab-grid">
        <div className="tsp-reader-panel" aria-live="polite">
          <div className="tsp-panel-toolbar">
            <span>Hollow core scanner</span>
            <strong>{active.command}</strong>
          </div>

          <div className="tsp-scan-window wic-scan-window">
            <div className="tsp-scan-beam" />
            <p className={`tsp-passage-line ${active.id === 'blind' ? 'is-lit' : ''}`}>
              Although the committee praised the proposal&apos;s ambition, several members said
              its budget estimates were
              <span className="wic-blank">_____</span>
              .
            </p>
            <p className={`tsp-passage-line has-pivot ${active.id === 'perimeter' ? 'is-lit' : ''}`}>
              <span>Although</span> flips the direction: praise appears first, but the blank
              must point toward a problem.
            </p>
            <p className={`tsp-passage-line ${active.id === 'match' ? 'is-lit' : ''}`}>
              A plain prediction like <strong>unreliable</strong> beats rereading four choices
              until one starts to sound right.
            </p>
          </div>

          <div className="tsp-route-map" aria-label="Active vocabulary route">
            {active.map.map((item, index) => (
              <React.Fragment key={item}>
                <span>{item}</span>
                {index < active.map.length - 1 && (
                  <FontAwesomeIcon icon={faChevronRight} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="tsp-control-panel">
          <div className="tsp-control-label">Choose the lens</div>
          <div className="tsp-step-tabs" role="tablist" aria-label="Words in context strategy lenses">
            {steps.map((step, index) => (
              <button
                type="button"
                role="tab"
                aria-selected={activeStep === index}
                className={`tsp-step-tab ${activeStep === index ? 'active' : ''}`}
                onClick={() => setActiveStep(index)}
                key={step.id}
              >
                <span className="tsp-step-tab-icon">
                  <FontAwesomeIcon icon={step.icon} />
                </span>
                <span>
                  <small>0{index + 1}</small>
                  {step.label}
                </span>
              </button>
            ))}
          </div>

          <div className="tsp-active-readout" key={active.id}>
            <span>{active.command}</span>
            <h3>{active.label}</h3>
            <p>{active.text}</p>
            <div className="tsp-answer-cue">
              <small>Best answer should</small>
              <strong>{active.answerCue}</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="tsp-trap-console">
        <div className="tsp-trap-heading">
          <FontAwesomeIcon icon={faExclamationTriangle} />
          <div>
            <h3>Trap console</h3>
            <p>Separate logical fit from familiar, fancy, or smooth-sounding bait.</p>
          </div>
        </div>

        <div className="tsp-trap-actions" role="tablist" aria-label="Words in context traps">
          {traps.map((trapItem, index) => (
            <button
              type="button"
              role="tab"
              aria-selected={activeTrap === index}
              className={activeTrap === index ? 'active' : ''}
              onClick={() => setActiveTrap(index)}
              key={trapItem.label}
            >
              {trapItem.label}
            </button>
          ))}
        </div>

        <div className="tsp-trap-readout" aria-live="polite">
          <div>
            <span>Bait</span>
            <strong>{trap.bait}</strong>
          </div>
          <div>
            <span>Countermove</span>
            <strong>{trap.fix}</strong>
          </div>
        </div>
      </div>
    </section>
  );
};

const TransitionsInfographic = () => {
  const [activeStep, setActiveStep] = useState(0);

  const question = {
    before:
      'A longitudinal study tracked 2,000 bilingual children over ten years and found that they consistently outperformed monolingual peers on tasks requiring cognitive flexibility.',
    after:
      'the researchers cautioned that socioeconomic factors -- which correlated with bilingualism in their sample -- could partially account for the observed differences.',
    answer: 'Nevertheless,',
    options: [
      {
        letter: 'A',
        text: 'Furthermore,',
        type: 'addition',
        symbol: '+',
        result: 'wrong',
        reason:
          'Furthermore means the second sentence adds more support in the same direction. Here, the second sentence limits the first sentence by warning that another factor may explain the result.'
      },
      {
        letter: 'B',
        text: 'Consequently,',
        type: 'cause/effect',
        symbol: '->',
        result: 'wrong',
        reason:
          'Consequently means Sentence 2 is the result of Sentence 1. The researchers did not caution because the children performed better; they cautioned because the study has a possible confounding factor.'
      },
      {
        letter: 'C',
        text: 'Nevertheless,',
        type: 'contrast',
        symbol: 'but',
        result: 'correct',
        reason:
          'Nevertheless signals a contrast or qualification. Sentence 1 reports a strong positive finding, while Sentence 2 tells us not to overstate that finding.'
      },
      {
        letter: 'D',
        text: 'In other words,',
        type: 'restatement',
        symbol: '=',
        result: 'wrong',
        reason:
          'In other words means the second sentence repeats the same idea in a simpler form. The caution about socioeconomic factors is a new limitation, not a rephrasing of the result.'
      }
    ]
  };

  const scenes = [
    {
      id: 'question',
      title: 'Start with the exam item.',
      focus: 'question',
      duration: 6500,
      label: 'Full question',
      caption:
        'At the beginning, keep the item in its normal SAT form: one passage, one question prompt, and four answer choices. The task is to find the transition that best connects the two ideas around the blank.'
    },
    {
      id: 'split',
      title: 'Mark the two ideas without moving them.',
      focus: 'split',
      duration: 6800,
      label: 'Idea split',
      caption:
        'Idea 1 reports a strong result: bilingual children outperformed monolingual peers. Idea 2 introduces a caution: socioeconomic factors may partly explain that result. The sentence stays intact; only the important regions are highlighted.'
    },
    {
      id: 'relationship',
      title: 'Name the relationship in plain English.',
      focus: 'relationship',
      duration: 6800,
      label: 'Relationship',
      caption:
        'The relationship is: strong finding, but do not overclaim it. That is a contrast or qualification. Naming the relationship before choosing protects students from answers that sound smooth but do the wrong logical job.'
    },
    {
      id: 'eliminate',
      title: 'Eliminate by logical job.',
      focus: 'sort',
      duration: 7800,
      label: 'Choice test',
      caption:
        'Furthermore adds more support, Consequently gives a result, and In other words restates. None of those match a positive finding followed by a caution. Nevertheless is the only choice that signals a turn against the first idea.'
    },
    {
      id: 'answer',
      title: 'Place the transition into the blank.',
      focus: 'move',
      duration: 6200,
      label: 'Answer move',
      caption:
        'Nevertheless moves into the blank because it means "even so" or "despite that." It tells the reader that the impressive research result is real, but the researchers still have a reason to be careful.'
    },
    {
      id: 'complete',
      title: 'Check the completed logic.',
      focus: 'complete',
      duration: 8200,
      label: 'Final check',
      caption:
        'Final check: the study found an impressive pattern; nevertheless, the researchers warned that another variable could partly explain it. The answer works because it describes the relationship between both ideas, not just the words immediately beside the blank.'
    }
  ];

  const active = scenes[activeStep];
  const isSplit = activeStep >= 1;
  const showElimination = activeStep >= 3;
  const isAnswerPlaced = activeStep >= 4;

  useEffect(() => {
    const timerId = setTimeout(() => {
      setActiveStep((currentStep) => (currentStep + 1) % scenes.length);
    }, active.duration);

    return () => clearTimeout(timerId);
  }, [active.duration, scenes.length, activeStep]);

  const replay = () => setActiveStep(0);

  return (
    <section
      className={`lesson-infographic trn-flow trn-cinema trn-cinema-${active.focus}`}
      aria-labelledby="trn-infographic-title"
    >
      <div className="trn-cinema-header">
        <div>
          <p className="trn-cinema-kicker">
            <span aria-hidden="true" />
            Animated Worked Example
          </p>
          <h2 id="trn-infographic-title">Transition Word Walkthrough</h2>
          <p>
            Watch the question turn into a logic map, then into the correct answer.
          </p>
        </div>
        <button type="button" className="trn-replay-button" onClick={replay}>
          Replay
        </button>
      </div>

      <LayoutGroup>
        <div className="trn-cinema-stage">
          <div className="trn-scene-rail" aria-hidden="true">
            {scenes.map((scene, index) => (
              <span
                className={index === activeStep ? 'active' : index < activeStep ? 'seen' : ''}
                key={scene.id}
              />
            ))}
          </div>

          <div className="trn-progress-track" aria-hidden="true">
            <motion.span
              key={active.id}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: active.duration / 1000, ease: 'linear' }}
            />
          </div>

          <div className="trn-scene-title" aria-live="polite">
            <span>Scene {activeStep + 1}</span>
            <h3>{active.title}</h3>
          </div>

          <motion.article className="trn-exam-card" layout>
            <div className="trn-exam-topline">
              <span>Question 1 of 1</span>
              <strong>Transitions</strong>
            </div>

            <div className="trn-exam-stem">
              <p>
                <motion.span
                  layout
                  className={`trn-exam-idea trn-exam-idea-one ${isSplit ? 'is-marked' : ''}`}
                >
                  {question.before}
                </motion.span>{' '}
                <span className={`trn-exam-blank ${isAnswerPlaced ? 'filled' : ''}`} aria-label="blank">
                  {isAnswerPlaced ? (
                    <motion.span
                      layoutId="transition-correct-answer"
                      className="trn-cinema-answer"
                      transition={{ type: 'spring', stiffness: 240, damping: 24 }}
                    >
                      {question.answer}
                    </motion.span>
                  ) : (
                    <span className="trn-cinema-empty-blank" />
                  )}
                </span>{' '}
                <motion.span
                  layout
                  className={`trn-exam-idea trn-exam-idea-two ${isSplit ? 'is-marked caution' : ''}`}
                >
                  {question.after}
                </motion.span>
              </p>

              <p className="trn-exam-question">
                Which choice completes the text with the most logical transition?
              </p>
            </div>

            <div className="trn-exam-options" aria-label="Answer choices">
              {question.options.map((option) => {
                const isCorrect = option.result === 'correct';
                const isDimmed = showElimination && !isCorrect;
                const isSelected = showElimination && isCorrect;
                const isMoved = isAnswerPlaced && isCorrect;

                return (
                  <motion.div
                    layout
                    className={`trn-exam-option ${isSelected ? 'selected' : ''} ${
                      isDimmed ? 'dimmed' : ''
                    } ${isMoved ? 'moved' : ''}`}
                    key={option.letter}
                    initial={false}
                    animate={{
                      opacity: isDimmed ? 0.44 : 1,
                      x: isSelected ? 4 : 0
                    }}
                    transition={{ duration: 0.35 }}
                  >
                    <span className="trn-exam-letter">{option.letter}</span>
                    {isCorrect && !isAnswerPlaced ? (
                      <motion.strong
                        layoutId="transition-correct-answer"
                        className="trn-exam-option-text"
                        transition={{ type: 'spring', stiffness: 240, damping: 24 }}
                      >
                        {option.text}
                      </motion.strong>
                    ) : (
                      <strong className="trn-exam-option-text">
                        {isMoved ? 'Nevertheless,' : option.text}
                      </strong>
                    )}
                    {showElimination && (
                      <span className="trn-exam-option-tag">{option.type}</span>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.article>

          <AnimatePresence mode="wait">
            <motion.div
              className="trn-coach-note"
              key={active.id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35 }}
              aria-live="polite"
            >
              <span>{active.label}</span>
              <strong>{active.title}</strong>
              <p>{active.caption}</p>
            </motion.div>
          </AnimatePresence>

        </div>
      </LayoutGroup>
    </section>
  );
};
// ─── Embedded Sample Quiz (non-interactive, animated reveal) ──
const LinearEquationsOneVariableInfographic = () => {
  const [activeStep, setActiveStep] = useState(0);

  const problem = {
    equation: '5(x - 3) + 2 = 3x + 11',
    answer: '12',
    options: [
      { letter: 'A', text: '8', result: 'wrong', tag: 'missed distribution' },
      { letter: 'B', text: '12', result: 'correct', tag: 'checks' },
      { letter: 'C', text: '13', result: 'wrong', tag: 'sign slip' },
      { letter: 'D', text: '14', result: 'wrong', tag: 'overcorrected' }
    ],
    solveSteps: [
      { label: 'Distribute', left: '5x - 15 + 2', right: '3x + 11', result: '5x - 13 = 3x + 11' },
      { label: 'Move x-terms', left: '5x - 3x', right: '11 + 13', result: '2x = 24' },
      { label: 'Divide', left: '2x / 2', right: '24 / 2', result: 'x = 12' }
    ]
  };

  const scenes = [
    {
      id: 'question',
      title: 'Start with the SAT-style equation.',
      focus: 'question',
      duration: 6200,
      label: 'Full question',
      caption:
        'Keep the item in test form first: one equation, one target value, and four choices. The job is to isolate x without changing the balance of the equation.'
    },
    {
      id: 'distribute',
      title: 'Distribute before moving terms.',
      focus: 'split',
      duration: 6800,
      label: 'Expand',
      caption:
        'The 5 applies to both x and -3. That turns 5(x - 3) + 2 into 5x - 15 + 2, which simplifies to 5x - 13.'
    },
    {
      id: 'isolate',
      title: 'Use inverse operations on both sides.',
      focus: 'relationship',
      duration: 6800,
      label: 'Balance',
      caption:
        'Subtract 3x from both sides, then add 13 to both sides. The equation collapses cleanly to 2x = 24.'
    },
    {
      id: 'eliminate',
      title: 'Eliminate choices that break the equation.',
      focus: 'sort',
      duration: 7400,
      label: 'Choice test',
      caption:
        'Wrong choices usually come from one arithmetic slip: missed distribution, a sign error, or overcorrecting after combining terms. Only 12 survives the check.'
    },
    {
      id: 'answer',
      title: 'Move the confirmed value into place.',
      focus: 'move',
      duration: 6200,
      label: 'Answer move',
      caption:
        'Once 2x = 24, divide both sides by 2. The answer choice 12 moves into the result slot as the value of x.'
    },
    {
      id: 'complete',
      title: 'Check by substitution.',
      focus: 'complete',
      duration: 8200,
      label: 'Final check',
      caption:
        'Substitute 12 into the original equation: 5(12 - 3) + 2 = 47 and 3(12) + 11 = 47. Both sides match, so x = 12.'
    }
  ];

  const active = scenes[activeStep];
  const showDistribute = activeStep >= 1;
  const showBalance = activeStep >= 2;
  const showElimination = activeStep >= 3;
  const isAnswerPlaced = activeStep >= 4;
  const shownSteps = problem.solveSteps.slice(
    0,
    activeStep >= 4 ? 3 : activeStep >= 2 ? 2 : activeStep >= 1 ? 1 : 0
  );
  const traceLabel =
    activeStep === 0
      ? 'Work area'
      : activeStep === 1
        ? 'Distribution trace'
        : activeStep === 2
          ? 'Cross-side moves'
          : activeStep === 3
            ? 'Choice check'
            : 'Division trace';
  const traceResult =
    activeStep === 0
      ? 'The first move will appear here.'
      : activeStep === 1
        ? '5x - 13 = 3x + 11'
        : activeStep < 4
          ? '2x = 24'
          : 'x = 12';

  useEffect(() => {
    const timerId = setTimeout(() => {
      setActiveStep((currentStep) => (currentStep + 1) % scenes.length);
    }, active.duration);

    return () => clearTimeout(timerId);
  }, [active.duration, scenes.length, activeStep]);

  const replay = () => setActiveStep(0);
  const springMove = { type: 'spring', stiffness: 220, damping: 22 };

  const renderTraceBoard = () => {
    if (activeStep === 0) {
      return (
        <div className="leq-solve-placeholder">
          <span>Work area</span>
          <p>The first move will appear here.</p>
        </div>
      );
    }

    if (activeStep === 1) {
      return (
        <div className="leq-trace-board leq-distribution-board">
          <div className="leq-token-row leq-source-row" aria-label="Original equation pieces">
            <span className="leq-term leq-term-focus">5</span>
            <span className="leq-operator">*</span>
            <span className="leq-term leq-term-group">x - 3</span>
            <span className="leq-term">+ 2</span>
            <span className="leq-equals">=</span>
            <span className="leq-term">3x + 11</span>
          </div>

          <div className="leq-distribution-lane" aria-hidden="true">
            <motion.span
              className="leq-trace-token leq-token-variable"
              initial={{ opacity: 0, x: -84, y: -10 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ ...springMove, delay: 0.1 }}
            >
              5 * x {'->'} 5x
            </motion.span>
            <motion.span
              className="leq-trace-token leq-token-constant"
              initial={{ opacity: 0, x: -118, y: 18 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ ...springMove, delay: 0.35 }}
            >
              5 * -3 {'->'} -15
            </motion.span>
          </div>

          <div className="leq-token-row leq-result-row" aria-label="Distributed equation">
            <motion.span
              className="leq-term leq-term-variable"
              initial={{ opacity: 0, y: -18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...springMove, delay: 0.55 }}
            >
              5x
            </motion.span>
            <motion.span
              className="leq-term leq-term-constant"
              initial={{ opacity: 0, y: -18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...springMove, delay: 0.75 }}
            >
              - 15
            </motion.span>
            <motion.span
              className="leq-term"
              initial={{ opacity: 0, y: -18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...springMove, delay: 0.95 }}
            >
              + 2
            </motion.span>
            <span className="leq-equals">=</span>
            <motion.span
              className="leq-term"
              initial={{ opacity: 0, y: -18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...springMove, delay: 1.05 }}
            >
              3x + 11
            </motion.span>
          </div>
        </div>
      );
    }

    if (activeStep < 4) {
      return (
        <div className="leq-trace-board leq-balance-board">
          <div className="leq-equation-balance" aria-label="Terms moving across the equals sign">
            <div className="leq-side leq-side-left">
              <span>left side</span>
              <strong>5x - 13</strong>
            </div>
            <div className="leq-equals leq-balance-equals">=</div>
            <div className="leq-side leq-side-right">
              <span>right side</span>
              <strong>3x + 11</strong>
            </div>

            <div className="leq-transfer-layer" aria-hidden="true">
              <span className="leq-moving-token leq-token-variable move-left">-3x</span>
              <span className="leq-moving-token leq-token-constant move-right">+13</span>
            </div>
          </div>

          <div className="leq-token-row leq-result-row" aria-label="Balanced equation">
            <motion.span className="leq-term leq-term-variable" layout>
              5x - 3x
            </motion.span>
            <span className="leq-equals">=</span>
            <motion.span className="leq-term leq-term-constant" layout>
              11 + 13
            </motion.span>
            <motion.strong
              className="leq-merged-result"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.85, duration: 0.35 }}
            >
              2x = 24
            </motion.strong>
          </div>
        </div>
      );
    }

    return (
      <div className="leq-trace-board leq-division-board">
        <div className="leq-division-stage" aria-label="Dividing both sides by 2">
          <div className="leq-division-side">
            <span>left side</span>
            <strong>2x</strong>
            <motion.em
              initial={{ opacity: 0, y: -18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...springMove, delay: 0.15 }}
            >
              / 2
            </motion.em>
            <p>x</p>
          </div>
          <div className="leq-equals leq-balance-equals">=</div>
          <div className="leq-division-side">
            <span>right side</span>
            <strong>24</strong>
            <motion.em
              initial={{ opacity: 0, y: -18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...springMove, delay: 0.35 }}
            >
              / 2
            </motion.em>
            <p>12</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section
      className={`lesson-infographic trn-flow trn-cinema leq-cinema trn-cinema-${active.focus}`}
      aria-labelledby="leq-infographic-title"
    >
      <div className="trn-cinema-header">
        <div>
          <p className="trn-cinema-kicker">
            <span aria-hidden="true" />
            Animated Worked Example
          </p>
          <h2 id="leq-infographic-title">One-Variable Equation Walkthrough</h2>
          <p>
            Watch the equation expand, balance, and reduce to the correct answer.
          </p>
        </div>
        <button type="button" className="trn-replay-button" onClick={replay}>
          Replay
        </button>
      </div>

      <LayoutGroup>
        <div className="trn-cinema-stage">
          <div className="trn-scene-rail" aria-hidden="true">
            {scenes.map((scene, index) => (
              <span
                className={index === activeStep ? 'active' : index < activeStep ? 'seen' : ''}
                key={scene.id}
              />
            ))}
          </div>

          <div className="trn-progress-track" aria-hidden="true">
            <motion.span
              key={active.id}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: active.duration / 1000, ease: 'linear' }}
            />
          </div>

          <div className="trn-scene-title" aria-live="polite">
            <span>Scene {activeStep + 1}</span>
            <h3>{active.title}</h3>
          </div>

          <motion.article className="trn-exam-card leq-exam-card" layout>
            <div className="trn-exam-topline">
              <span>Question 1 of 1</span>
              <strong>Linear Equations</strong>
            </div>

            <div className="trn-exam-stem leq-exam-stem">
              <p>
                If{' '}
                <motion.span
                  layout
                  className={`leq-equation-chip ${showDistribute ? 'is-marked' : ''}`}
                >
                  {problem.equation}
                </motion.span>
                , what is the value of x?
              </p>

              <div className={`leq-answer-slot ${isAnswerPlaced ? 'filled' : ''}`} aria-label="answer slot">
                <span>x =</span>
                {isAnswerPlaced ? (
                  <motion.strong
                    layoutId="linear-equation-correct-answer"
                    className="trn-cinema-answer"
                    transition={{ type: 'spring', stiffness: 240, damping: 24 }}
                  >
                    {problem.answer}
                  </motion.strong>
                ) : (
                  <span className="trn-cinema-empty-blank" />
                )}
              </div>
            </div>

            <div className="leq-solve-panel leq-trace-panel" aria-label="Equation work">
              <div className="leq-trace-header">
                <span>{traceLabel}</span>
                <strong>{traceResult}</strong>
              </div>

              <motion.div
                key={`trace-${active.id}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {renderTraceBoard()}
              </motion.div>

              {shownSteps.length > 0 && (
                <div className="leq-solve-summary" aria-label="Recorded steps">
                  {shownSteps.map((step) => (
                    <div className="leq-solve-step" key={step.label}>
                      <span>{step.label}</span>
                      <p>{step.result}</p>
                    </div>
                  ))}
                </div>
              )}

              {showBalance && (
                <div className="leq-balance-beam" aria-hidden="true">
                  <span />
                  <strong>same operation on both sides</strong>
                  <span />
                </div>
              )}
            </div>

            <div className="trn-exam-options" aria-label="Answer choices">
              {problem.options.map((option) => {
                const isCorrect = option.result === 'correct';
                const isDimmed = showElimination && !isCorrect;
                const isSelected = showElimination && isCorrect;
                const isMoved = isAnswerPlaced && isCorrect;

                return (
                  <motion.div
                    layout
                    className={`trn-exam-option ${isSelected ? 'selected' : ''} ${
                      isDimmed ? 'dimmed' : ''
                    } ${isMoved ? 'moved' : ''}`}
                    key={option.letter}
                    initial={false}
                    animate={{
                      opacity: isDimmed ? 0.44 : 1,
                      x: isSelected ? 4 : 0
                    }}
                    transition={{ duration: 0.35 }}
                  >
                    <span className="trn-exam-letter">{option.letter}</span>
                    {isCorrect && !isAnswerPlaced ? (
                      <motion.strong
                        layoutId="linear-equation-correct-answer"
                        className="trn-exam-option-text"
                        transition={{ type: 'spring', stiffness: 240, damping: 24 }}
                      >
                        {option.text}
                      </motion.strong>
                    ) : (
                      <strong className="trn-exam-option-text">
                        {isMoved ? problem.answer : option.text}
                      </strong>
                    )}
                    {showElimination && (
                      <span className="trn-exam-option-tag">{option.tag}</span>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.article>

          <motion.div
            className="trn-coach-note"
            key={`leq-note-${active.id}`}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            aria-live="polite"
          >
            <span>{active.label}</span>
            <strong>{active.title}</strong>
            <p>{active.caption}</p>
          </motion.div>
        </div>
      </LayoutGroup>
    </section>
  );
};

const ProbabilityInfographic = () => {
  const [activeStep, setActiveStep] = useState(0);

  const problem = {
    stem:
      'A class has 12 boys and 18 girls. Two students are selected at random without replacement to serve as class representatives.',
    question: 'What is the probability that both selected students are girls?',
    answer: '51/145',
    options: [
      { letter: 'A', text: '9/29', result: 'wrong', tag: 'used only totals' },
      { letter: 'B', text: '17/58', result: 'wrong', tag: 'halved second draw' },
      { letter: 'C', text: '9/25', result: 'wrong', tag: 'with replacement' },
      { letter: 'D', text: '51/145', result: 'correct', tag: 'checks' }
    ],
    solveSteps: [
      { label: 'First draw', result: 'P(girl) = 18/30 = 3/5' },
      { label: 'Update pool', result: 'without replacement: 17 girls left out of 29' },
      { label: 'Multiply', result: '(18/30)(17/29) = 51/145' }
    ]
  };

  const scenes = [
    {
      id: 'question',
      title: 'Start by naming the event.',
      focus: 'question',
      duration: 6200,
      label: 'Full question',
      caption:
        'The target is not just one girl. The target is girl, then girl again, so the probability has two linked parts.'
    },
    {
      id: 'denominator',
      title: 'Build the first denominator.',
      focus: 'split',
      duration: 6600,
      label: 'Initial pool',
      caption:
        'Before anyone is selected, there are 30 students total. The favorable first draw is one of the 18 girls.'
    },
    {
      id: 'first-draw',
      title: 'Record the first probability.',
      focus: 'relationship',
      duration: 6600,
      label: 'First draw',
      caption:
        'The first fraction is 18/30. Reducing it is fine, but keep the unreduced form visible so the pool change stays clear.'
    },
    {
      id: 'second-draw',
      title: 'Apply without replacement.',
      focus: 'sort',
      duration: 7200,
      label: 'Conditional update',
      caption:
        'One girl has already been selected, so the second draw uses 17 girls out of 29 remaining students.'
    },
    {
      id: 'multiply',
      title: 'Multiply the linked probabilities.',
      focus: 'move',
      duration: 6800,
      label: 'Combine',
      caption:
        'For both events to happen, multiply the first draw by the updated second draw: (18/30)(17/29).'
    },
    {
      id: 'complete',
      title: 'Move the confirmed fraction into place.',
      focus: 'complete',
      duration: 8200,
      label: 'Final check',
      caption:
        'The product reduces to 51/145. That answer is smaller than either single-draw probability, which is exactly what an AND probability should do.'
    }
  ];

  const active = scenes[activeStep];
  const showFirstFraction = activeStep >= 2;
  const showSecondFraction = activeStep >= 3;
  const showProduct = activeStep >= 4;
  const showElimination = activeStep >= 4;
  const isAnswerPlaced = activeStep >= 5;
  const shownSteps = problem.solveSteps.slice(
    0,
    activeStep >= 5 ? 3 : activeStep >= 4 ? 3 : activeStep >= 3 ? 2 : activeStep >= 2 ? 1 : 0
  );
  const traceLabel =
    activeStep === 0
      ? 'Event setup'
      : activeStep === 1
        ? 'First denominator'
        : activeStep === 2
          ? 'First fraction'
          : activeStep === 3
            ? 'Second denominator'
            : 'Product trace';
  const traceResult =
    activeStep === 0
      ? 'Name the event before calculating.'
      : activeStep === 1
        ? '18 favorable out of 30 total'
        : activeStep === 2
          ? '18/30'
          : activeStep === 3
            ? '17/29'
            : '51/145';

  useEffect(() => {
    const timerId = setTimeout(() => {
      setActiveStep((currentStep) => (currentStep + 1) % scenes.length);
    }, active.duration);

    return () => clearTimeout(timerId);
  }, [active.duration, scenes.length, activeStep]);

  const replay = () => setActiveStep(0);
  const springMove = { type: 'spring', stiffness: 220, damping: 22 };

  const renderTraceBoard = () => {
    if (activeStep === 0) {
      return (
        <div className="prob-solve-placeholder">
          <span>Event setup</span>
          <p>Target event: first student is a girl and second student is a girl.</p>
        </div>
      );
    }

    if (activeStep === 1) {
      return (
        <div className="prob-trace-board prob-pool-board" aria-label="Initial probability pool">
          <motion.div
            className="prob-pool-card total"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springMove, delay: 0.05 }}
          >
            <span>Total pool</span>
            <strong>30</strong>
            <p>all students</p>
          </motion.div>
          <motion.div
            className="prob-pool-card target"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springMove, delay: 0.2 }}
          >
            <span>Favorable</span>
            <strong>18</strong>
            <p>girls</p>
          </motion.div>
          <motion.div
            className="prob-pool-card contrast"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springMove, delay: 0.35 }}
          >
            <span>Not target</span>
            <strong>12</strong>
            <p>boys</p>
          </motion.div>
        </div>
      );
    }

    if (activeStep === 2) {
      return (
        <div className="prob-trace-board prob-fraction-board" aria-label="First probability fraction">
          <div className="prob-draw-card active">
            <span>Draw 1</span>
            <strong>girl</strong>
            <p>18 possible girls</p>
          </div>
          <div className="prob-fraction-large">
            <motion.span
              initial={{ opacity: 0, y: -14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...springMove, delay: 0.1 }}
            >
              18
            </motion.span>
            <em />
            <motion.span
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...springMove, delay: 0.25 }}
            >
              30
            </motion.span>
          </div>
          <div className="prob-draw-card">
            <span>Meaning</span>
            <strong>18/30</strong>
            <p>favorable / total</p>
          </div>
        </div>
      );
    }

    if (activeStep === 3) {
      return (
        <div className="prob-trace-board prob-replacement-board" aria-label="Probability after first draw">
          <div className="prob-pool-card target">
            <span>Girls left</span>
            <strong>17</strong>
            <p>18 - 1</p>
          </div>
          <div className="prob-without-replacement">
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ ...springMove, delay: 0.1 }}
            >
              without replacement
            </motion.span>
            <div className="prob-pool-shrink" aria-hidden="true">
              <span />
              <strong>30 {'->'} 29</strong>
              <span />
            </div>
          </div>
          <div className="prob-pool-card total">
            <span>Total left</span>
            <strong>29</strong>
            <p>30 - 1</p>
          </div>
        </div>
      );
    }

    return (
      <div className="prob-trace-board prob-product-board" aria-label="Multiplying probability fractions">
        <div className="prob-product-row">
          <div className="prob-mini-fraction">
            <span>18</span>
            <em />
            <span>30</span>
          </div>
          <strong className="prob-product-symbol">x</strong>
          <div className="prob-mini-fraction">
            <span>17</span>
            <em />
            <span>29</span>
          </div>
          <strong className="prob-product-symbol">=</strong>
          <motion.div
            className="prob-product-answer"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.35 }}
          >
            51/145
          </motion.div>
        </div>
        <div className="prob-product-note">
          <FontAwesomeIcon icon={faCheckCircle} />
          <span>Both selected students are girls, so the fractions multiply.</span>
        </div>
      </div>
    );
  };

  return (
    <section
      className={`lesson-infographic trn-flow trn-cinema prob-cinema trn-cinema-${active.focus}`}
      aria-labelledby="prob-infographic-title"
    >
      <div className="trn-cinema-header">
        <div>
          <p className="trn-cinema-kicker">
            <span aria-hidden="true" />
            Animated Worked Example
          </p>
          <h2 id="prob-infographic-title">Probability Walkthrough</h2>
          <p>
            Watch the denominator change when a second student is selected without replacement.
          </p>
        </div>
        <button type="button" className="trn-replay-button" onClick={replay}>
          Replay
        </button>
      </div>

      <LayoutGroup>
        <div className="trn-cinema-stage">
          <div className="trn-scene-rail" aria-hidden="true">
            {scenes.map((scene, index) => (
              <span
                className={index === activeStep ? 'active' : index < activeStep ? 'seen' : ''}
                key={scene.id}
              />
            ))}
          </div>

          <div className="trn-progress-track" aria-hidden="true">
            <motion.span
              key={active.id}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: active.duration / 1000, ease: 'linear' }}
            />
          </div>

          <div className="trn-scene-title" aria-live="polite">
            <span>Scene {activeStep + 1}</span>
            <h3>{active.title}</h3>
          </div>

          <motion.article className="trn-exam-card prob-exam-card" layout>
            <div className="trn-exam-topline">
              <span>Question 1 of 1</span>
              <strong>Probability</strong>
            </div>

            <div className="trn-exam-stem prob-exam-stem">
              <p>
                {problem.stem}{' '}
                <motion.span
                  layout
                  className={`prob-condition-chip ${showSecondFraction ? 'is-marked' : ''}`}
                >
                  without replacement
                </motion.span>
              </p>
              <p className="trn-exam-question">
                {problem.question}
              </p>

              <div className={`prob-answer-slot ${isAnswerPlaced ? 'filled' : ''}`} aria-label="answer slot">
                <span>P(both girls) =</span>
                {isAnswerPlaced ? (
                  <motion.strong
                    layoutId="probability-correct-answer"
                    className="trn-cinema-answer"
                    transition={{ type: 'spring', stiffness: 240, damping: 24 }}
                  >
                    {problem.answer}
                  </motion.strong>
                ) : (
                  <span className="trn-cinema-empty-blank" />
                )}
              </div>
            </div>

            <div className="prob-solve-panel prob-trace-panel" aria-label="Probability work">
              <div className="prob-trace-header">
                <span>{traceLabel}</span>
                <strong>{traceResult}</strong>
              </div>

              <motion.div
                key={`prob-trace-${active.id}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {renderTraceBoard()}
              </motion.div>

              <div className="prob-fraction-strip" aria-label="Recorded probability chain">
                <div className={`prob-chain-step ${showFirstFraction ? 'active' : ''}`}>
                  <span>1st draw</span>
                  <strong>{showFirstFraction ? '18/30' : '--/--'}</strong>
                </div>
                <div className={`prob-chain-connector ${showSecondFraction ? 'active' : ''}`}>x</div>
                <div className={`prob-chain-step ${showSecondFraction ? 'active' : ''}`}>
                  <span>2nd draw</span>
                  <strong>{showSecondFraction ? '17/29' : '--/--'}</strong>
                </div>
                <div className={`prob-chain-connector ${showProduct ? 'active' : ''}`}>=</div>
                <div className={`prob-chain-step answer ${showProduct ? 'active' : ''}`}>
                  <span>result</span>
                  <strong>{showProduct ? '51/145' : '--'}</strong>
                </div>
              </div>

              {shownSteps.length > 0 && (
                <div className="prob-solve-summary" aria-label="Recorded steps">
                  {shownSteps.map((step) => (
                    <div className="prob-solve-step" key={step.label}>
                      <span>{step.label}</span>
                      <p>{step.result}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="trn-exam-options" aria-label="Answer choices">
              {problem.options.map((option) => {
                const isCorrect = option.result === 'correct';
                const isDimmed = showElimination && !isCorrect;
                const isSelected = showElimination && isCorrect;
                const isMoved = isAnswerPlaced && isCorrect;

                return (
                  <motion.div
                    layout
                    className={`trn-exam-option ${isSelected ? 'selected' : ''} ${
                      isDimmed ? 'dimmed' : ''
                    } ${isMoved ? 'moved' : ''}`}
                    key={option.letter}
                    initial={false}
                    animate={{
                      opacity: isDimmed ? 0.44 : 1,
                      x: isSelected ? 4 : 0
                    }}
                    transition={{ duration: 0.35 }}
                  >
                    <span className="trn-exam-letter">{option.letter}</span>
                    {isCorrect && !isAnswerPlaced ? (
                      <motion.strong
                        layoutId="probability-correct-answer"
                        className="trn-exam-option-text"
                        transition={{ type: 'spring', stiffness: 240, damping: 24 }}
                      >
                        {option.text}
                      </motion.strong>
                    ) : (
                      <strong className="trn-exam-option-text">
                        {isMoved ? problem.answer : option.text}
                      </strong>
                    )}
                    {showElimination && (
                      <span className="trn-exam-option-tag">{option.tag}</span>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.article>

          <motion.div
            className="trn-coach-note"
            key={`prob-note-${active.id}`}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            aria-live="polite"
          >
            <span>{active.label}</span>
            <strong>{active.title}</strong>
            <p>{active.caption}</p>
          </motion.div>
        </div>
      </LayoutGroup>
    </section>
  );
};

const CirclesInfographic = () => {
  const [activeStep, setActiveStep] = useState(0);

  const problem = {
    stem: 'A circle in the xy-plane has equation',
    equation: '(x - 2)^2 + (y + 1)^2 = 36',
    detail: 'A minor sector of the circle has a central angle of 120 degrees.',
    question: 'What is the area of the sector?',
    answer: '12\u03c0',
    options: [
      { letter: 'A', text: '6\u03c0', result: 'wrong', tag: 'used radius only' },
      { letter: 'B', text: '12\u03c0', result: 'correct', tag: 'checks' },
      { letter: 'C', text: '24\u03c0', result: 'wrong', tag: 'used half circle' },
      { letter: 'D', text: '36\u03c0', result: 'wrong', tag: 'full area' }
    ],
    solveSteps: [
      { label: 'Center', result: '(h, k) = (2, -1)' },
      { label: 'Radius', result: 'r^2 = 36 -> r = 6' },
      { label: 'Fraction', result: '120/360 = 1/3' },
      { label: 'Area', result: '(1/3)\u03c0(6)^2 = 12\u03c0' }
    ]
  };

  const scenes = [
    {
      id: 'question',
      title: 'Separate the equation from the ask.',
      focus: 'question',
      duration: 6200,
      label: 'Full question',
      caption:
        'The equation gives the circle. The angle tells you which fraction of the circle the sector uses.'
    },
    {
      id: 'center',
      title: 'Read the center with sign flips.',
      focus: 'split',
      duration: 6600,
      label: 'Center',
      caption:
        'In (x - h)^2 + (y - k)^2 = r^2, the center is (h, k). The y term is y + 1, so k is -1.'
    },
    {
      id: 'radius',
      title: 'Take the square root for the radius.',
      focus: 'relationship',
      duration: 6600,
      label: 'Radius',
      caption:
        'The 36 is r squared, not r. The actual radius is 6, which controls both area and circumference.'
    },
    {
      id: 'sector',
      title: 'Shade the fraction of the circle.',
      focus: 'sort',
      duration: 7000,
      label: 'Sector',
      caption:
        'A 120 degree sector is 120/360 of the whole circle, so it is one third of the total area.'
    },
    {
      id: 'formula',
      title: 'Apply the sector area formula.',
      focus: 'move',
      duration: 6800,
      label: 'Formula',
      caption:
        'Use sector area = angle fraction times full area: (120/360) x \u03c0 x 6 squared.'
    },
    {
      id: 'complete',
      title: 'Move the confirmed area into place.',
      focus: 'complete',
      duration: 8200,
      label: 'Final check',
      caption:
        'The whole circle has area 36\u03c0. One third of that is 12\u03c0, so the sector area is 12\u03c0.'
    }
  ];

  const active = scenes[activeStep];
  const showCenter = activeStep >= 1;
  const showRadius = activeStep >= 2;
  const showSector = activeStep >= 3;
  const showFormula = activeStep >= 4;
  const showElimination = activeStep >= 4;
  const isAnswerPlaced = activeStep >= 5;
  const shownSteps = problem.solveSteps.slice(
    0,
    activeStep >= 5 ? 4 : activeStep >= 4 ? 4 : activeStep >= 3 ? 3 : activeStep >= 2 ? 2 : activeStep >= 1 ? 1 : 0
  );
  const traceLabel =
    activeStep === 0
      ? 'Target setup'
      : activeStep === 1
        ? 'Center trace'
        : activeStep === 2
          ? 'Radius trace'
          : activeStep === 3
            ? 'Sector fraction'
            : 'Area product';
  const traceResult =
    activeStep === 0
      ? 'Find sector area, not arc length.'
      : activeStep === 1
        ? '(2, -1)'
        : activeStep === 2
          ? 'r^2 = 36 -> r = 6'
          : activeStep === 3
            ? '120/360 = 1/3'
            : '12\u03c0';

  useEffect(() => {
    const timerId = setTimeout(() => {
      setActiveStep((currentStep) => (currentStep + 1) % scenes.length);
    }, active.duration);

    return () => clearTimeout(timerId);
  }, [active.duration, scenes.length, activeStep]);

  const replay = () => setActiveStep(0);
  const springMove = { type: 'spring', stiffness: 220, damping: 22 };

  const renderCircleDiagram = () => {
    const gridLines = [34, 62, 90, 118, 146, 174, 202, 230];

    return (
      <div className="circle-diagram-shell" aria-label="Circle diagram with center, radius, and sector">
        <svg className="circle-diagram-svg" viewBox="0 0 260 210" role="img" aria-label="Circle geometry diagram">
          <defs>
            <radialGradient id="circle-sector-fill" cx="50%" cy="50%" r="70%">
              <stop offset="0%" stopColor="#fde68a" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0.44" />
            </radialGradient>
          </defs>

          <g className="circle-grid-lines" aria-hidden="true">
            {gridLines.map((line) => (
              <React.Fragment key={line}>
                <line x1={line} y1="16" x2={line} y2="194" />
                <line x1="20" y1={line - 10} x2="240" y2={line - 10} />
              </React.Fragment>
            ))}
          </g>

          <line className="circle-axis" x1="20" y1="102" x2="240" y2="102" />
          <line className="circle-axis" x1="130" y1="16" x2="130" y2="194" />

          {showSector && (
            <motion.path
              className="circle-sector-fill"
              d="M 130 102 L 130 34 A 68 68 0 0 1 188.9 136 L 130 102 Z"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ ...springMove, delay: 0.05 }}
              style={{ transformOrigin: '130px 102px' }}
            />
          )}

          <circle className="circle-outline" cx="130" cy="102" r="68" />

          {showRadius && (
            <motion.line
              className="circle-radius-line"
              x1="130"
              y1="102"
              x2="130"
              y2="34"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.55, ease: 'easeOut' }}
            />
          )}

          {showSector && (
            <>
              <motion.line
                className="circle-radius-line secondary"
                x1="130"
                y1="102"
                x2="188.9"
                y2="136"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.55, delay: 0.1, ease: 'easeOut' }}
              />
              <motion.path
                className="circle-sector-arc"
                d="M 130 34 A 68 68 0 0 1 188.9 136"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
              />
            </>
          )}

          {showCenter && (
            <motion.circle
              className="circle-center-dot"
              cx="130"
              cy="102"
              r="5"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ ...springMove, delay: 0.1 }}
            />
          )}

          {showCenter && (
            <motion.text
              className="circle-diagram-label center"
              x="144"
              y="98"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              (2, -1)
            </motion.text>
          )}

          {showRadius && (
            <motion.text
              className="circle-diagram-label radius"
              x="104"
              y="66"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              r = 6
            </motion.text>
          )}

          {showSector && (
            <motion.text
              className="circle-diagram-label angle"
              x="143"
              y="82"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.28 }}
            >
              120 deg
            </motion.text>
          )}
        </svg>
      </div>
    );
  };

  const renderReadout = () => {
    if (activeStep === 0) {
      return (
        <motion.div className="circle-readout-card" key="circle-target" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <span>Target</span>
          <strong>sector area</strong>
          <p>Use the equation to get the radius, then use the angle to take a fraction of the full area.</p>
        </motion.div>
      );
    }

    if (activeStep === 1) {
      return (
        <motion.div className="circle-readout-card center" key="circle-center" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <span>Center</span>
          <strong>(2, -1)</strong>
          <p>The signs inside the parentheses flip when you name the center.</p>
        </motion.div>
      );
    }

    if (activeStep === 2) {
      return (
        <motion.div className="circle-readout-card radius" key="circle-radius" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <span>Radius</span>
          <strong>r = 6</strong>
          <p>The equation gives r squared. Take the square root before using area or circumference.</p>
        </motion.div>
      );
    }

    if (activeStep === 3) {
      return (
        <motion.div className="circle-readout-card sector" key="circle-sector" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <span>Sector</span>
          <strong>120/360 = 1/3</strong>
          <p>The highlighted slice is one third of the complete circle.</p>
        </motion.div>
      );
    }

    return (
      <motion.div className="circle-readout-card formula" key="circle-formula" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <span>Formula</span>
        <div className="circle-formula-stack">
          <div>
            <small>sector area</small>
            <strong>(120/360) x &pi; x 6^2</strong>
          </div>
          <div className="circle-answer-badge">
            12&pi;
          </div>
        </div>
      </motion.div>
    );
  };

  const renderTraceBoard = () => (
    <div className="prob-trace-board circle-geometry-board" aria-label="Circle geometry work">
      {renderCircleDiagram()}
      <div className="circle-readout-stack">
        {renderReadout()}
      </div>
    </div>
  );

  return (
    <section
      className={`lesson-infographic trn-flow trn-cinema circle-cinema trn-cinema-${active.focus}`}
      aria-labelledby="circle-infographic-title"
    >
      <div className="trn-cinema-header">
        <div>
          <p className="trn-cinema-kicker">
            <span aria-hidden="true" />
            Animated Worked Example
          </p>
          <h2 id="circle-infographic-title">Circle Geometry Walkthrough</h2>
          <p>
            Watch the circle equation become a center, radius, sector fraction, and final area.
          </p>
        </div>
        <button type="button" className="trn-replay-button" onClick={replay}>
          Replay
        </button>
      </div>

      <LayoutGroup>
        <div className="trn-cinema-stage">
          <div className="trn-scene-rail" aria-hidden="true">
            {scenes.map((scene, index) => (
              <span
                className={index === activeStep ? 'active' : index < activeStep ? 'seen' : ''}
                key={scene.id}
              />
            ))}
          </div>

          <div className="trn-progress-track" aria-hidden="true">
            <motion.span
              key={active.id}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: active.duration / 1000, ease: 'linear' }}
            />
          </div>

          <div className="trn-scene-title" aria-live="polite">
            <span>Scene {activeStep + 1}</span>
            <h3>{active.title}</h3>
          </div>

          <motion.article className="trn-exam-card circle-exam-card" layout>
            <div className="trn-exam-topline">
              <span>Question 1 of 1</span>
              <strong>Circles</strong>
            </div>

            <div className="trn-exam-stem circle-exam-stem">
              <p>
                {problem.stem}{' '}
                <motion.span
                  layout
                  className={`circle-equation-chip ${showCenter ? 'is-marked' : ''}`}
                >
                  {problem.equation}
                </motion.span>
                . {problem.detail}{' '}
                <motion.span
                  layout
                  className={`circle-angle-chip ${showSector ? 'is-marked' : ''}`}
                >
                  120 degrees
                </motion.span>
              </p>
              <p className="trn-exam-question">
                {problem.question}
              </p>

              <div className={`prob-answer-slot circle-answer-slot ${isAnswerPlaced ? 'filled' : ''}`} aria-label="answer slot">
                <span>Sector area =</span>
                {isAnswerPlaced ? (
                  <motion.strong
                    layoutId="circles-correct-answer"
                    className="trn-cinema-answer"
                    transition={{ type: 'spring', stiffness: 240, damping: 24 }}
                  >
                    {problem.answer}
                  </motion.strong>
                ) : (
                  <span className="trn-cinema-empty-blank" />
                )}
              </div>
            </div>

            <div className="prob-solve-panel prob-trace-panel circle-trace-panel" aria-label="Circle work">
              <div className="prob-trace-header">
                <span>{traceLabel}</span>
                <strong>{traceResult}</strong>
              </div>

              <motion.div
                key={`circle-trace-${active.id}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {renderTraceBoard()}
              </motion.div>

              <div className="circle-work-strip" aria-label="Recorded circle chain">
                <div className={`circle-work-step ${showCenter ? 'active' : ''}`}>
                  <span>center</span>
                  <strong>{showCenter ? '(2, -1)' : '--'}</strong>
                </div>
                <div className={`circle-work-connector ${showRadius ? 'active' : ''}`}>-&gt;</div>
                <div className={`circle-work-step ${showRadius ? 'active' : ''}`}>
                  <span>radius</span>
                  <strong>{showRadius ? '6' : '--'}</strong>
                </div>
                <div className={`circle-work-connector ${showSector ? 'active' : ''}`}>x</div>
                <div className={`circle-work-step ${showSector ? 'active' : ''}`}>
                  <span>fraction</span>
                  <strong>{showSector ? '1/3' : '--'}</strong>
                </div>
                <div className={`circle-work-connector ${showFormula ? 'active' : ''}`}>=</div>
                <div className={`circle-work-step answer ${showFormula ? 'active' : ''}`}>
                  <span>area</span>
                  <strong>{showFormula ? problem.answer : '--'}</strong>
                </div>
              </div>

              {shownSteps.length > 0 && (
                <div className="prob-solve-summary" aria-label="Recorded steps">
                  {shownSteps.map((step) => (
                    <div className="prob-solve-step" key={step.label}>
                      <span>{step.label}</span>
                      <p>{step.result}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="trn-exam-options" aria-label="Answer choices">
              {problem.options.map((option) => {
                const isCorrect = option.result === 'correct';
                const isDimmed = showElimination && !isCorrect;
                const isSelected = showElimination && isCorrect;
                const isMoved = isAnswerPlaced && isCorrect;

                return (
                  <motion.div
                    layout
                    className={`trn-exam-option ${isSelected ? 'selected' : ''} ${
                      isDimmed ? 'dimmed' : ''
                    } ${isMoved ? 'moved' : ''}`}
                    key={option.letter}
                    initial={false}
                    animate={{
                      opacity: isDimmed ? 0.44 : 1,
                      x: isSelected ? 4 : 0
                    }}
                    transition={{ duration: 0.35 }}
                  >
                    <span className="trn-exam-letter">{option.letter}</span>
                    {isCorrect && !isAnswerPlaced ? (
                      <motion.strong
                        layoutId="circles-correct-answer"
                        className="trn-exam-option-text"
                        transition={{ type: 'spring', stiffness: 240, damping: 24 }}
                      >
                        {option.text}
                      </motion.strong>
                    ) : (
                      <strong className="trn-exam-option-text">
                        {isMoved ? problem.answer : option.text}
                      </strong>
                    )}
                    {showElimination && (
                      <span className="trn-exam-option-tag">{option.tag}</span>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.article>

          <motion.div
            className="trn-coach-note"
            key={`circle-note-${active.id}`}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            aria-live="polite"
          >
            <span>{active.label}</span>
            <strong>{active.title}</strong>
            <p>{active.caption}</p>
          </motion.div>
        </div>
      </LayoutGroup>
    </section>
  );
};

const EmbeddedSampleQuiz = ({ question }) => {
  // revealedIndices: set of option indices whose result is shown
  const [revealedIndices, setRevealedIndices] = useState(new Set());
  const [correctRevealed, setCorrectRevealed] = useState(false);
  const timerIds = useRef([]);

  useEffect(() => {
    if (!question) return;

    // Clear any previous timers (e.g. on hot-reload)
    timerIds.current.forEach(clearTimeout);
    timerIds.current = [];
    setRevealedIndices(new Set());
    setCorrectRevealed(false);

    const correctIndex = question.options.findIndex(
      (opt) => opt === question.correctAnswer
    );

    // Build the reveal order: wrong answers first, correct last
    const wrongIndices = question.options
      .map((_, i) => i)
      .filter((i) => i !== correctIndex);

    // Start revealing after 5 seconds
    let delay = 5000;
    wrongIndices.forEach((wrongIdx) => {
      const tid = setTimeout(() => {
        setRevealedIndices((prev) => new Set([...prev, wrongIdx]));
      }, delay);
      timerIds.current.push(tid);
      delay += 1000; // 1 second apart
    });

    // Reveal the correct answer last
    const correctTid = setTimeout(() => {
      setCorrectRevealed(true);
    }, delay);
    timerIds.current.push(correctTid);

    return () => timerIds.current.forEach(clearTimeout);
  }, [question]);

  if (!question) return null;

  const correctIndex = question.options.findIndex(
    (opt) => opt === question.correctAnswer
  );

  return (
    <div className="embedded-quiz-wrapper">
      <div className="embedded-quiz-header">
        <span className="embedded-quiz-icon">✦</span>
        <span className="embedded-quiz-title">Sample Question Preview</span>
        <span className="embedded-quiz-badge">Auto-Reveal</span>
      </div>

      <div className="embedded-quiz-card">
        {/* Question stem */}
        <div
          className="embedded-quiz-stem"
          dangerouslySetInnerHTML={{ __html: processTextMarkup(question.text) }}
        />

        {/* Answer choices */}
        <div className="embedded-quiz-options">
          {question.options.map((option, index) => {
            const isCorrect = index === correctIndex;
            const isWrongRevealed = revealedIndices.has(index);
            let stateClass = '';
            if (isCorrect && correctRevealed) stateClass = 'eq-correct';
            else if (!isCorrect && isWrongRevealed) stateClass = 'eq-wrong';

            return (
              <div key={index} className={`embedded-quiz-option ${stateClass}`}>
                <span className="eq-option-letter">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="eq-option-text">{option}</span>
                {isCorrect && correctRevealed && (
                  <FontAwesomeIcon icon={faCheckCircle} className="eq-correct-icon" />
                )}
              </div>
            );
          })}
        </div>

        {/* Explanation (appears when correct is revealed) */}
        {correctRevealed && question.explanation && (
          <div className="embedded-quiz-explanation">
            <strong>💡 Explanation:</strong>{' '}
            <span dangerouslySetInnerHTML={{ __html: processTextMarkup(question.explanation) }} />
          </div>
        )}

        {/* Footer hint */}
        {!correctRevealed && (
          <p className="embedded-quiz-hint">
            Watch as the answer reveals itself…
          </p>
        )}
      </div>
    </div>
  );
};

// ─── Sample Questions Component ───────────────────────────────
const SAMPLE_PLACEHOLDER_QUESTIONS = [
  {
    id: 'demo-1',
    text: 'The following text is adapted from a 2019 article about urban planning. Which choice best describes the main purpose of the passage?',
    options: [
      'To analyze the economic benefits of green infrastructure in cities',
      'To compare traditional urban planning with modern sustainable approaches',
      'To argue for increased funding for environmental urban projects',
      'To explain how cities can integrate nature-based solutions into development'
    ],
    correctAnswer: 'To explain how cities can integrate nature-based solutions into development',
    explanation: 'The passage focuses on describing methods and benefits of incorporating natural elements into urban planning, making option D the best summary of the main purpose.',
    difficulty: 2
  },
  {
    id: 'demo-2',
    text: 'Based on the research mentioned in the passage, what can be concluded about green roofs in urban environments?',
    options: [
      'They are too expensive for most cities to implement effectively',
      'They provide multiple environmental and economic benefits',
      'They work better in smaller cities than in major metropolitan areas',
      'They require more maintenance than traditional roofing systems'
    ],
    correctAnswer: 'They provide multiple environmental and economic benefits',
    explanation: 'The passage cites research showing green roofs reduce energy costs, manage stormwater, and improve air quality, supporting the conclusion about multiple benefits.',
    difficulty: 3
  }
];

const SampleQuestionsSection = ({ questions, onPracticeClick }) => {
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

  const displayQuestions = questions.length > 0 ? questions : SAMPLE_PLACEHOLDER_QUESTIONS;

  if (displayQuestions.length === 0) {
    return (
      <div className="learn-questions-empty">
        <FontAwesomeIcon icon={faQuestion} />
        <p>Sample questions will be available soon for this subcategory.</p>
      </div>
    );
  }

  const currentQuestion = displayQuestions[selectedQuestionIndex];

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    setShowAnswer(true);
  };

  const resetQuestion = () => {
    setShowAnswer(false);
    setSelectedOption(null);
  };

  const nextQuestion = () => {
    setSelectedQuestionIndex(Math.min(displayQuestions.length - 1, selectedQuestionIndex + 1));
    resetQuestion();
  };

  const prevQuestion = () => {
    setSelectedQuestionIndex(Math.max(0, selectedQuestionIndex - 1));
    resetQuestion();
  };

  return (
    <div className="learn-questions-area">
      <div className="learn-question-card">
        {/* Navigator */}
        <div className="learn-question-nav">
          <span className="learn-question-counter">
            Question {selectedQuestionIndex + 1} of {displayQuestions.length}
            {questions.length === 0 && <span className="learn-demo-badge">DEMO</span>}
          </span>
          <div className="learn-question-nav-btns">
            <button onClick={prevQuestion} disabled={selectedQuestionIndex === 0}>
              Previous
            </button>
            <button onClick={nextQuestion} disabled={selectedQuestionIndex === displayQuestions.length - 1}>
              Next
            </button>
          </div>
        </div>

        {/* Question text */}
        <div
          className="learn-question-stem"
          dangerouslySetInnerHTML={{ __html: processTextMarkup(currentQuestion.text) }}
        />

        {/* Options */}
        <div className="learn-options-list">
          {currentQuestion.options?.map((option, index) => {
            const isCorrect = option === currentQuestion.correctAnswer;
            const isSelected = option === selectedOption;
            let optionClass = 'learn-option';
            if (showAnswer) {
              if (isCorrect) optionClass += ' correct';
              else if (isSelected && !isCorrect) optionClass += ' incorrect';
            }
            if (!showAnswer) optionClass += ' clickable';

            return (
              <div
                key={index}
                className={optionClass}
                onClick={() => !showAnswer && handleOptionSelect(option)}
              >
                <span className="learn-option-letter">{String.fromCharCode(65 + index)}</span>
                <span className="learn-option-text">{option}</span>
                {showAnswer && isCorrect && (
                  <FontAwesomeIcon icon={faCheckCircle} className="learn-option-check" />
                )}
              </div>
            );
          })}
        </div>

        {/* Answer / Instruction */}
        {!showAnswer ? (
          <p className="learn-question-instruction">Click on an answer choice to see the explanation</p>
        ) : (
          <div className="learn-answer-reveal">
            <p><strong>Correct Answer:</strong> {currentQuestion.correctAnswer}</p>
            {currentQuestion.explanation && (
              <p>
                <strong>Explanation:</strong>{' '}
                <span dangerouslySetInnerHTML={{ __html: processTextMarkup(currentQuestion.explanation) }} />
              </p>
            )}
            <button className="learn-try-again-btn" onClick={resetQuestion}>
              Try Again
            </button>
          </div>
        )}
      </div>

      <div className="learn-practice-cta">
        <button className="learn-practice-btn" onClick={onPracticeClick}>
          <FontAwesomeIcon icon={faPlayCircle} />
          Practice More Questions Like This
        </button>
      </div>
    </div>
  );
};

// ─── Concept Card ─────────────────────────────────────────────
const ConceptCard = ({ concept, onStudyConcept }) => (
  <div className="learn-concept-card">
    <h4 className="learn-concept-name">{concept.name}</h4>
    <div
      className="learn-concept-explanation"
      dangerouslySetInnerHTML={{ __html: concept.explanationHTML }}
    />
    <button className="learn-concept-btn" onClick={() => onStudyConcept(concept.id)}>
      <FontAwesomeIcon icon={faBrain} />
      Practice This Concept
    </button>
  </div>
);

// ─── Main Component ───────────────────────────────────────────
export default function SubcategoryLearnPage() {
  const { subcategoryId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [concepts, setConcepts] = useState([]);
  const [sampleQuestions, setSampleQuestions] = useState([]);
  const [learningContent, setLearningContent] = useState(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [mobileTocOpen, setMobileTocOpen] = useState(false);

  const contentRef = useRef(null);

  const subcategoryName = getSubcategoryName(subcategoryId) || subcategoryId?.replace(/-/g, ' ');

  // Determine section and category for the badge
  const numericId = getSubcategoryIdFromString(subcategoryId);
  const subjectId = numericId ? SUBCATEGORY_SUBJECTS[numericId] : null;
  const mainCategory = numericId ? SUBCATEGORY_MAIN_CATEGORIES[numericId] : '';
  const sectionLabel = subjectId === 1 ? 'Reading & Writing' : subjectId === 2 ? 'Math' : '';
  const categoryLabel = mainCategory
    ? mainCategory.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    : '';

  // ── TOC sections definition ──
  const tocSections = [
    { id: 'overview', label: 'Overview' },
    { id: 'strategies', label: 'Strategies & Tips' },
    { id: 'concepts', label: `Key Concepts (${concepts.length})` },
    { id: 'questions', label: 'Sample Questions' },
  ];

  // ── IntersectionObserver for active section tracking ──
  useEffect(() => {
    const sectionIds = tocSections.map(s => s.id);
    const observerOptions = {
      rootMargin: '-80px 0px -60% 0px',
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, observerOptions);

    sectionIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [concepts.length, loading]);

  // ── Data Loading ──
  const loadLearningData = useCallback(async () => {
    try {
      setLoading(true);

      try {
        const conceptsData = await getConceptsBySubcategory(subcategoryId);
        setConcepts(conceptsData);
      } catch {
        setConcepts([]);
      }

      try {
        const content = await getLearningContent(subcategoryId);
        setLearningContent(content);
      } catch {
        setLearningContent(getPlaceholderContent(subcategoryName));
      }

      try {
        const questions = await getDiverseSampleQuestions(subcategoryId);
        setSampleQuestions(questions);
      } catch {
        setSampleQuestions([]);
      }
    } catch (err) {
      console.error('Error loading learning data:', err);
      setError('Failed to load learning content. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [subcategoryId, subcategoryName]);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    loadLearningData();
  }, [currentUser, loadLearningData, navigate]);

  // ── Placeholder Content ──
  const getPlaceholderContent = (categoryName) => ({
    overview: `
      <h3>Understanding ${categoryName} Questions</h3>
      <p>This comprehensive guide will help you master <strong>${categoryName}</strong> questions on the Digital SAT.</p>

      <h4>What You'll Learn</h4>
      <ul>
        <li>How to identify ${categoryName} question patterns</li>
        <li>Step-by-step solving strategies</li>
        <li>Common mistakes and how to avoid them</li>
        <li>Time-saving techniques for test day</li>
      </ul>

      <h4>On the Digital SAT</h4>
      <p>These questions typically appear 2-4 times per section and test your ability to analyze, interpret, and apply knowledge effectively. Mastering this question type can significantly boost your overall score.</p>

      <div class="highlight-box">
        <strong>💡 Pro Tip:</strong> The digital format allows you to flag questions and return to them, making strategic time management even more important.
      </div>
    `,
    keyStrategies: [
      "Read the question stem carefully before examining the passage or problem — this helps you focus on what's being asked",
      "Look for signal words and phrases that indicate the question type and required approach",
      "Use the process of elimination to narrow down answer choices systematically",
      "Double-check your work by ensuring your answer directly addresses what the question is asking",
      "Practice time management — spend no more than 60-90 seconds per question in this category"
    ],
    commonMistakes: [
      "Rushing through the question without fully understanding what's being asked",
      "Choosing answers that are factually correct but don't address the specific question",
      "Getting distracted by irrelevant details in passages or complex problem setups",
      "Second-guessing correct answers due to overthinking",
      "Not managing time effectively and spending too long on difficult questions"
    ],
    studyTips: [
      "Practice with official SAT questions daily, focusing on accuracy before speed",
      "Review both correct and incorrect answers to understand the reasoning behind each choice",
      "Create a systematic approach you can apply consistently to all questions of this type",
      "Time yourself regularly to build comfort with the pacing required on test day",
      "Study related question types to build comprehensive understanding of the broader skills being tested",
      "Use active reading strategies like annotation and summarization to improve comprehension"
    ],
    difficulty: 'Varies by specific question',
    estimatedStudyTime: '2-3 hours for initial mastery, ongoing practice recommended'
  });

  const handleStudyConcept = (conceptId) => {
    navigate(`/concept/${conceptId}`);
  };

  const handlePracticeQuestions = () => {
    navigate('/smart-quiz-generator', {
      state: {
        subcategoryId: subcategoryId,
        autoDifficultyParams: { accuracyRate: 0, totalAttempted: 0 }
      }
    });
  };

  // ── Loading State ──
  if (loading) {
    return (
      <div className="subcategory-learn-loading">
        <FontAwesomeIcon icon={faSpinner} spin className="loading-icon" />
        <div className="loading-text">Loading learning content...</div>
      </div>
    );
  }

  // ── Error State ──
  if (error) {
    return (
      <div className="subcategory-learn-error">
        <h2>Error Loading Content</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/progress')}>Back to Progress</button>
      </div>
    );
  }

  // ── Main Render ──
  return (
    <div className="subcategory-learn-container" ref={contentRef}>
      <ReadingProgressBar />
      <ToastContainer position="bottom-right" autoClose={3000} />

      <div className="learn-article-layout">
        {/* ─── Sidebar TOC (Desktop) ─── */}
        <TableOfContents sections={tocSections} activeSection={activeSection} />

        {/* ─── Main Content ─── */}
        <main className="learn-content">
          {/* ─── Hero Header ─── */}
          <header className="learn-hero">
            <div className="learn-breadcrumb">
              <button className="learn-breadcrumb-link" onClick={() => navigate('/progress')}>
                <FontAwesomeIcon icon={faArrowLeft} />
                Progress
              </button>
              <span className="learn-breadcrumb-sep">
                <FontAwesomeIcon icon={faChevronRight} />
              </span>
              <button className="learn-breadcrumb-link" onClick={() => navigate('/lectures')}>
                Lectures
              </button>
              <span className="learn-breadcrumb-sep">
                <FontAwesomeIcon icon={faChevronRight} />
              </span>
              <span className="learn-breadcrumb-current">{subcategoryName}</span>
            </div>

            {sectionLabel && (
              <div className={`learn-category-badge ${subjectId === 1 ? 'reading-writing' : 'math'}`}>
                <FontAwesomeIcon icon={faBook} />
                {sectionLabel} · {categoryLabel}
              </div>
            )}

            <h1>{subcategoryName}</h1>

            <div className="learn-meta-row">
              {learningContent?.estimatedStudyTime && (
                <span className="learn-meta-item">
                  <FontAwesomeIcon icon={faClock} />
                  {learningContent.estimatedStudyTime}
                </span>
              )}
              <div className="learn-meta-divider" />
              {learningContent?.difficulty && (
                <span className="learn-meta-item">
                  <FontAwesomeIcon icon={faSignal} />
                  Difficulty: {learningContent.difficulty}
                </span>
              )}
              <div className="learn-meta-divider" />
              <span className="learn-meta-item">
                <FontAwesomeIcon icon={faLayerGroup} />
                {concepts.length} concept{concepts.length !== 1 ? 's' : ''}
              </span>
            </div>
          </header>

          {subcategoryId === 'text-structure-purpose' && (
            <TextStructurePurposeInfographic />
          )}

          {subcategoryId === 'words-in-context' && (
            <WordsInContextInfographic />
          )}

          {subcategoryId === 'transitions' && (
            <TransitionsInfographic />
          )}

          {subcategoryId === 'linear-equations-one-variable' && (
            <LinearEquationsOneVariableInfographic />
          )}

          {subcategoryId === 'probability' && (
            <ProbabilityInfographic />
          )}

          {subcategoryId === 'circles' && (
            <CirclesInfographic />
          )}

          {/* ─── "What You'll Learn" Box ─── */}
          <div className="learn-objectives">
            <div className="learn-objectives-title">
              <FontAwesomeIcon icon={faBullseye} />
              What you&apos;ll learn
            </div>
            <ul className="learn-objectives-list">
              <li>
                <FontAwesomeIcon icon={faCheck} />
                How to identify and approach {subcategoryName} questions
              </li>
              <li>
                <FontAwesomeIcon icon={faCheck} />
                Proven strategies to solve them quickly and accurately
              </li>
              <li>
                <FontAwesomeIcon icon={faCheck} />
                Common traps and mistakes to avoid on test day
              </li>
              <li>
                <FontAwesomeIcon icon={faCheck} />
                Practice with real SAT-style sample questions
              </li>
            </ul>
          </div>

          {/* ─── Embedded Sample Quiz (animated reveal) ─── */}
          <EmbeddedSampleQuiz
            question={(() => {
              // Prefer hardest Firebase question when available
              if (sampleQuestions.length > 0) {
                const hard = sampleQuestions.find(q => q.difficulty === 3);
                return hard || sampleQuestions[sampleQuestions.length - 1];
              }
              return EMBEDDED_QUIZ_QUESTIONS[subcategoryId] || null;
            })()}
          />

          {/* ─── Section: Overview ─── */}
          <section id="overview" className="learn-section-block">
            <h2>Overview & Key Concepts</h2>
            {learningContent?.overview && (
              <div
                className="learn-prose"
                dangerouslySetInnerHTML={{ __html: learningContent.overview }}
              />
            )}
          </section>

          {/* ─── Section: Strategies & Tips ─── */}
          <section id="strategies" className="learn-section-block">
            <h2>Strategies & Tips</h2>
            {learningContent && (
              <>
                <div className="learn-strategies-grid">
                  {/* Key Strategies */}
                  {learningContent.keyStrategies?.length > 0 && (
                    <div className="learn-strategy-block key-strategies">
                      <h4>
                        <span className="strategy-icon"><FontAwesomeIcon icon={faRocket} /></span>
                        Key Strategies
                      </h4>
                      <ul className="learn-strategy-list">
                        {learningContent.keyStrategies.map((strategy, index) => (
                          <li key={index}>{strategy}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Common Mistakes */}
                  {learningContent.commonMistakes?.length > 0 && (
                    <div className="learn-strategy-block common-mistakes">
                      <h4>
                        <span className="strategy-icon"><FontAwesomeIcon icon={faExclamationTriangle} /></span>
                        Common Mistakes to Avoid
                      </h4>
                      <ul className="learn-strategy-list">
                        {learningContent.commonMistakes.map((mistake, index) => (
                          <li key={index}>{mistake}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Study Tips */}
                  {learningContent.studyTips?.length > 0 && (
                    <div className="learn-strategy-block study-tips">
                      <h4>
                        <span className="strategy-icon"><FontAwesomeIcon icon={faGraduationCap} /></span>
                        Study Tips
                      </h4>
                      <ul className="learn-strategy-list">
                        {learningContent.studyTips.map((tip, index) => (
                          <li key={index}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Study Metadata */}
                <div className="learn-study-meta">
                  <div className="learn-study-meta-item">
                    <strong>📊 Difficulty:</strong> {learningContent.difficulty}
                  </div>
                  <div className="learn-study-meta-item">
                    <strong>⏱️ Estimated Study Time:</strong> {learningContent.estimatedStudyTime}
                  </div>
                </div>
              </>
            )}
          </section>

          {/* ─── Section: Concepts ─── */}
          <section id="concepts" className="learn-section-block">
            <h2>Master These Concepts</h2>
            {concepts.length > 0 ? (
              <div className="learn-concepts-grid">
                {concepts.map(concept => (
                  <ConceptCard
                    key={concept.id}
                    concept={concept}
                    onStudyConcept={handleStudyConcept}
                  />
                ))}
              </div>
            ) : (
              <div className="learn-no-concepts">
                <FontAwesomeIcon icon={faLightbulb} />
                <h3>Concepts Coming Soon</h3>
                <p>Detailed concept breakdowns for this subcategory will be available soon. In the meantime, practice with sample questions below.</p>
              </div>
            )}
          </section>

          {/* ─── Section: Sample Questions ─── */}
          <section id="questions" className="learn-section-block">
            <h2>Sample Questions</h2>
            <SampleQuestionsSection
              questions={sampleQuestions}
              onPracticeClick={handlePracticeQuestions}
            />
          </section>

          {/* ─── Bottom CTA ─── */}
          <div className="learn-bottom-cta">
            <h3>Ready to Practice?</h3>
            <p>Put your knowledge to the test with adaptive practice questions.</p>
            <button className="learn-cta-btn" onClick={handlePracticeQuestions}>
              <FontAwesomeIcon icon={faPlayCircle} />
              Start Practicing Questions
            </button>
          </div>
        </main>
      </div>

      {/* ─── Mobile TOC Toggle ─── */}
      <button
        className="learn-mobile-toc-toggle"
        onClick={() => setMobileTocOpen(true)}
        aria-label="Open table of contents"
      >
        <FontAwesomeIcon icon={faListUl} />
      </button>

      {/* ─── Mobile TOC Panel ─── */}
      <MobileTOC
        sections={tocSections}
        activeSection={activeSection}
        isOpen={mobileTocOpen}
        onClose={() => setMobileTocOpen(false)}
      />
    </div>
  );
}
