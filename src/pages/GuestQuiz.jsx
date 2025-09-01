import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Quiz from '../components/Quiz';
import { guestDecks } from '../data/guestDecks';

export default function GuestQuiz() {
  const navigate = useNavigate();
  const { deckKey } = useParams();
  const decks = guestDecks;

  const deckEntries = useMemo(() => Object.entries(decks), [decks]);
  const currentDeck = deckKey ? decks[deckKey] : null;

  //

  if (!deckEntries.length) {
    return (
      <div style={{ padding: '2rem' }}>
        <h2>Guest Quiz</h2>
        <p>No guest decks are available right now.</p>
        <button onClick={() => navigate('/')}>Back to Home</button>
      </div>
    );
  }

  if (!currentDeck) {
    return (
      <div style={{ padding: '2rem', maxWidth: 800, margin: '0 auto' }}>
        <h2 style={{ marginBottom: '1rem' }}>Try a Guest Quiz</h2>
        <p style={{ marginBottom: '1.5rem', color: '#555' }}>
          Choose a deck below to start a quick 10-question practice quiz. No login required.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {deckEntries.map(([key, deck]) => (
            <div key={key} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '1rem', background: '#fff' }}>
              <h3 style={{ margin: 0 }}>{deck.name}</h3>
              <p style={{ margin: '0.5rem 0', color: '#666' }}>{deck.words?.length || 0} terms</p>
              <button onClick={() => navigate(`/guest-quiz/${key}`)} style={{ padding: '0.5rem 0.75rem' }}>
                Start Quiz
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <Quiz
      deckId={null}
      deckName={currentDeck.name}
      providedWords={currentDeck.words}
      onClose={() => navigate('/guest-quiz')}
    />
  );
}
