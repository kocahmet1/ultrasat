import React, { useState } from 'react';
import '../styles/HelpPage.css';

function HelpPage() {
  const [open, setOpen] = useState({});
  const [search, setSearch] = useState('');

  const helpData = [
    {
      section: "Getting Started",
      faqs: [
        {
          question: "I'm a new user, what's the first thing I should do?",
          answer: "Welcome! The first thing you should do is take a practice test. This will calculate your estimated SAT score, which you can see on the Progress page. This helps you track your improvement over time."
        },
        {
          question: "How do I add words to the Word Bank?",
          answer: "Words are added to your Word Bank automatically. When you are taking a Smart Quiz, you will see a list of 'Key Words'. Simply save any of those words, and they will be added to your personal Word Bank for future study."
        }
      ]
    },
    {
      section: "Quizzes",
      faqs: [
        {
          question: "What is a 'Smart Quiz'?",
          answer: "A 'Smart Quiz' is an adaptive quiz that focuses on your weakest areas. The quiz system adjusts to your skill level, meaning the questions will get easier or harder depending on your performance. This is designed to help you improve your skills in a targeted and efficient way. When you are taking a Smart Quiz, you will also see a list of 'Key Words' that you can save to your personal Word Bank for future study."
        }
      ]
    },
    {
      section: "Flashcards",
      faqs: [
        {
          question: "How do I add words to a flashcard deck from the Word Bank?",
          answer: "On the Word Bank page, each word has an 'Add to Flashcards' button. Clicking this button will open a modal where you can choose which deck to add the word to."
        },
        {
          question: "How do I create a new flashcard deck?",
          answer: "On the Word Bank page, there is a 'Flashcard Decks' tab. Within this tab, there is a 'New Deck' button that allows you to create a new flashcard deck."
        },
        {
          question: "Can I edit or delete a flashcard deck I've created?",
          answer: "Yes, you can both edit and delete your flashcard decks. On the 'My Flashcards' page, each deck has an 'Edit' button that allows you to change its details and a 'Delete' button to remove it. There appears to be a default, un-deletable deck named 'Deck 1'."
        },
        {
          question: "How do I study my flashcards?",
          answer: "You can study a deck by clicking the 'Study' button on its card on the 'My Flashcards' page. This will open the flashcard study interface for that specific deck. Decks with no words in them cannot be studied."
        },
        {
          question: "What are 'Word Quizzes' and how do they work?",
          answer: "'Word Quizzes' are multiple-choice quizzes generated from the words in your flashcard decks. To generate a quiz from a deck, the deck must contain at least four words. The quiz will test your knowledge of the vocabulary in that deck."
        },
        {
          question: "Can I make a quiz using only the words from a specific flashcard deck?",
          answer: "Yes, the 'Word Quizzes' feature is designed to create a quiz from a single, specific flashcard deck. Each of your decks with at least four words will have a corresponding 'Start Quiz' button to launch a quiz containing only the words from that deck."
        }
      ]
    },
    {
      section: "Concept Bank",
      faqs: [
        {
          question: "What is the 'Concept Bank' and how is it organized?",
          answer: "The 'Concept Bank' is a personalized collection of concepts that you save while practicing. It's organized as a grid or list of items, where each item represents a concept. You can search for specific concepts, and you can filter them by their subcategory (e.g., 'Algebra,' 'Grammar'). You can also sort the concepts by when they were added (newest or oldest) or alphabetically."
        },
        {
          question: "Can I see detailed explanations for concepts?",
          answer: "Yes, you can. When you click on a concept in your 'Concept Bank,' you are taken to a 'Concept Detail' page. This page displays a quick definition and a more detailed explanation of the concept. It also shows related practice questions."
        }
      ]
    },
    {
      section: "Exams & Results",
      faqs: [
        {
          question: "How do I start a full-length practice exam?",
          answer: "You can start a full-length practice exam by going to the 'Available Practice Exams' page. This page lists all the available practice exams. To start one, you simply click on it. Some exams might be marked as 'Pro,' which means they require a paid membership."
        },
        {
          question: "How do I see my results from past exams?",
          answer: "You can see your results from past exams on the 'All Exam Results' page. This page displays a list of all the practice exams you have completed, ordered from most recent to oldest. For each exam, it shows the title, the date you completed it, and your overall score. You can click on any exam in the list to view more detailed results for that specific exam."
        }
      ]
    },
    {
      section: "Progress Dashboard",
      faqs: [
        {
          question: "How do I use the Progress Dashboard?",
          answer: "The Progress Dashboard is the central place to track your performance and identify areas for improvement in both 'Reading & Writing' and 'Math.' At the top of the page, you'll see an estimated Digital SAT score. The dashboard is split into two main sections: 'Reading & Writing' and 'Math.' Each section lists various subcategories (e.g., 'Words in Context,' 'Linear Equations'). For each subcategory, you can see your current proficiency level, a progress bar, and your accuracy on the last 10 questions. You have two main actions: 'Practice' to start a 'Dynamic Quiz' focused on that specific subcategory, and 'Learn' to access lessons and materials related to that subcategory."
        },
        {
          question: "What does it mean to 'master' a subcategory?",
          answer: "Mastering a subcategory means you have demonstrated a high and consistent level of proficiency in that specific topic. The system tracks this through a leveling system. Each subcategory has three proficiency levels: Level 1, Level 2, and Level 3. You start at Level 1. To 'level up,' you need to answer practice questions for that subcategory, which you can do by taking a 'Dynamic Quiz.' The system tracks your accuracy on the last 10 questions you've answered. To advance to the next level, you must answer a certain number of questions (it appears to be 10 per level) while maintaining a high accuracy rate. Reaching Level 3 signifies that you have 'mastered' the subcategory. Within each subcategory, the system also tracks your mastery of individual 'concepts.' Mastering all the concepts within a subcategory is a key part of achieving overall mastery of that subcategory."
        }
      ]
    }
  ];

  const toggle = (sectionIdx, faqIdx) => {
    const key = `${sectionIdx}-${faqIdx}`;
    setOpen((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const filteredData = helpData.map(section => {
    const filteredFaqs = section.faqs.filter(faq =>
      faq.question.toLowerCase().includes(search.toLowerCase()) ||
      faq.answer.toLowerCase().includes(search.toLowerCase())
    );
    return { ...section, faqs: filteredFaqs };
  }).filter(section => section.faqs.length > 0);

  return (
    <div className="help-page">
      <h1>Help & FAQ</h1>
      <input
        className="help-search-bar"
        type="text"
        placeholder="Search questions or answers..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{marginBottom: 32, padding: '10px 16px', fontSize: '1rem', borderRadius: 8, border: '1px solid #ddd', width: '100%'}}
      />
      {filteredData.length > 0 ? (
        filteredData.map((section, sectionIdx) => (
          <div key={section.section} className="help-section">
            <h2>{section.section}</h2>
            <div className="faq-list">
              {section.faqs.map((faq, faqIdx) => {
                // Find original index to maintain correct toggle state
                const originalFaqIndex = helpData.find(s => s.section === section.section).faqs.findIndex(f => f.question === faq.question);
                const key = `${helpData.findIndex(s => s.section === section.section)}-${originalFaqIndex}`;
                return (
                  <div key={faq.question} className="faq-item">
                    <button className="faq-question" onClick={() => toggle(helpData.findIndex(s => s.section === section.section), originalFaqIndex)}>
                      {faq.question}
                    </button>
                    {open[key] && (
                      <div className="faq-answer">{faq.answer}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))
      ) : (
        <div style={{textAlign: 'center', color: '#888', marginTop: 40}}>No results found.</div>
      )}
    </div>
  );
}

export default HelpPage;