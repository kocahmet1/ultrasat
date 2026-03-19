import React from 'react';
import Modal from './Modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLayerGroup, faQuestionCircle, faLightbulb, faClock, faChartBar, faPuzzlePiece, faUser, faBullseye } from '@fortawesome/free-solid-svg-icons';
import '../styles/FeatureHelpModal.css';

const FeatureHelpModal = ({ isOpen, onClose, feature }) => {
  const getFeatureContent = () => {
    switch (feature) {
      case 'flashcards':
        return {
          title: 'How to Use Flashcard Decks',
          icon: faLayerGroup,
          sections: [
            {
              title: 'Getting Started',
              icon: faLightbulb,
              content: [
                'Go to your Word Bank tab and click "Add to Flashcards" on any word',
                'Choose an existing deck or create a new one',
                'Organize words by topic, difficulty, or any system that works for you'
              ]
            },
            {
              title: 'Studying with Flashcards',
              icon: faClock,
              content: [
                'Click the "Study" button on any deck to start a study session',
                'Use spaced repetition - study cards you find difficult more often',
                'Review regularly to move words from short-term to long-term memory',
                'Track your progress with the "Last studied" indicator'
              ]
            },
            {
              title: 'Tips for Success',
              icon: faChartBar,
              content: [
                'Create themed decks (e.g., "Science Terms", "Literary Words")',
                'Study in short, frequent sessions rather than long cramming',
                'Test yourself by saying the definition before flipping the card',
                'Add new words regularly to keep your vocabulary growing'
              ]
            }
          ]
        };
      
      case 'quizzes':
        return {
          title: 'How to Use Word Quizzes',
          icon: faQuestionCircle,
          sections: [
            {
              title: 'Taking Quizzes',
              icon: faLightbulb,
              content: [
                'Word Quizzes are generated from your flashcard decks',
                'Each deck needs at least 4 words to generate a quiz',
                'Click "Start Quiz" to begin a multiple-choice test',
                'Answer each question by selecting the correct definition'
              ]
            },
            {
              title: 'Quiz Features',
              icon: faClock,
              content: [
                'Questions are presented in random order for better learning',
                'Multiple-choice format similar to SAT vocabulary questions',
                'Immediate feedback shows correct answers',
                'Your score is calculated and displayed at the end'
              ]
            },
            {
              title: 'Maximizing Learning',
              icon: faChartBar,
              content: [
                'Take quizzes regularly to test your knowledge retention',
                'Focus on words you get wrong - add them to study sessions',
                'Use quizzes to identify gaps in your vocabulary knowledge',
                'Combine with flashcard study for comprehensive learning'
              ]
            }
          ]
        };
      
      case 'concepts':
        return {
          title: 'How to Use the Concept Bank',
          icon: faPuzzlePiece,
          sections: [
            {
              title: 'What is the Concept Bank?',
              icon: faLightbulb,
              content: [
                'Your personal collection of SAT concepts and terms you\'ve saved',
                'Concepts are automatically saved when you get questions wrong',
                'Review and organize your saved concepts by category',
                'Track your mastery progress with the mastery toggle'
              ]
            },
            {
              title: 'Managing Your Concepts',
              icon: faClock,
              content: [
                'Click on any concept to view detailed explanations',
                'Use the search bar to find specific concepts quickly',
                'Filter by subcategory to focus on specific topics',
                'Add personal notes to concepts for better understanding'
              ]
            },
            {
              title: 'Mastery Tracking',
              icon: faChartBar,
              content: [
                'Mark concepts as "mastered" once you fully understand them',
                'Review non-mastered concepts regularly',
                'Use the sort options to organize by date or alphabetically',
                'Focus study time on concepts you haven\'t mastered yet'
              ]
            }
          ]
        };
      
      case 'progress':
        return {
          title: 'How to Use Performance Progress',
          icon: faChartBar,
          sections: [
            {
              title: 'Understanding Your Progress',
              icon: faChartBar,
              content: [
                'Track your performance across all SAT subcategories in Reading & Writing and Math',
                'See your estimated SAT score based on your practice question accuracy',
                'Monitor your level progression (Level 1, 2, 3) for each subcategory',
                'View detailed accuracy statistics for your last 10 questions per topic'
              ]
            },
            {
              title: 'Using Smart Quizzes for Improvement',
              icon: faBullseye,
              content: [
                'Click "Practice" on any subcategory to take targeted quizzes',
                'Dynamic quizzes adapt to your performance and focus on weak areas',
                'Answer 10+ questions per subcategory to unlock higher levels',
                'Use the "Learn" button to access detailed explanations before practicing'
              ]
            },
            {
              title: 'Maximizing Your SAT Prep',
              icon: faUser,
              content: [
                'Focus on subcategories with low accuracy (below 70%) for maximum improvement',
                'Balance practice between Reading & Writing and Math sections',
                'Regularly review your estimated SAT score to track overall progress',
                'Use concept mastery tracking to identify specific areas needing attention'
              ]
            }
          ]
        };
      
      default:
        return {
          title: 'Feature Help',
          icon: faQuestionCircle,
          sections: []
        };
    }
  };

  const content = getFeatureContent();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={content.title}>
      <div className="feature-help-content">
        <div className="help-header">
          <FontAwesomeIcon icon={content.icon} className="help-main-icon" />
          <p className="help-description">
            {feature === 'flashcards' 
              ? 'Master your vocabulary with spaced repetition and active recall.'
              : feature === 'quizzes'
              ? 'Test your knowledge with multiple-choice quizzes based on your flashcard decks.'
              : feature === 'concepts'
              ? 'Organize and review your saved SAT concepts to track your learning progress.'
              : 'Track your performance across all SAT topics and use smart quizzes to improve your score.'
            }
          </p>
        </div>
        
        <div className="help-sections">
          {content.sections.map((section, index) => (
            <div key={index} className="help-section">
              <div className="section-header">
                <FontAwesomeIcon icon={section.icon} className="section-icon" />
                <h4>{section.title}</h4>
              </div>
              <ul className="help-list">
                {section.content.map((item, itemIndex) => (
                  <li key={itemIndex}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="help-footer">
          <div className="help-tip">
            <strong>💡 Pro Tip:</strong> {feature === 'flashcards' 
              ? 'Study for 15-20 minutes daily rather than long sessions for better retention!'
              : feature === 'quizzes'
              ? 'Take quizzes after studying flashcards to reinforce your learning!'
              : feature === 'concepts'
              ? 'Review your concept bank regularly and add personal notes to concepts you find challenging!'
              : 'Focus on subcategories with accuracy below 70% and practice them daily to see the biggest SAT score improvements!'
            }
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default FeatureHelpModal; 