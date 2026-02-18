import React, { useState, useEffect } from 'react';
import './RoundManager.css';

const RoundManager = ({ onRoundChange, gameData, onGameComplete }) => {
  const [currentRound, setCurrentRound] = useState(1);
  const [roundsData, setRoundsData] = useState({});
  const [gameComplete, setGameComplete] = useState(false);

  const TOTAL_ROUNDS = 10;

  // Initialize rounds data structure
  useEffect(() => {
    const initialData = {};
    for (let round = 1; round <= TOTAL_ROUNDS; round++) {
      initialData[round] = {
        handsCount: round,
        handsCompleted: 0,
        scores: [],
        isComplete: false
      };
    }
    setRoundsData(initialData);
  }, []);

  // Check if current round is complete
  const isRoundComplete = (roundNumber) => {
    const roundData = roundsData[roundNumber];
    if (!roundData) return false;
    return roundData.handsCompleted === roundData.handsCount;
  };

  // Update round data when game data changes
  useEffect(() => {
    if (gameData && roundsData[currentRound]) {
      const updatedRoundsData = { ...roundsData };
      updatedRoundsData[currentRound] = {
        ...updatedRoundsData[currentRound],
        handsCompleted: gameData.handsCompleted || 0,
        scores: gameData.scores || [],
        isComplete: isRoundComplete(currentRound)
      };
      setRoundsData(updatedRoundsData);
    }
  }, [gameData, currentRound, roundsData]);

  // Advance to next round
  const advanceRound = () => {
    if (!isRoundComplete(currentRound)) {
      alert(`Cannot advance! Complete all ${roundsData[currentRound]?.handsCount} hands for Round ${currentRound}`);
      return;
    }

    if (currentRound < TOTAL_ROUNDS) {
      const nextRound = currentRound + 1;
      setCurrentRound(nextRound);
      if (onRoundChange) {
        onRoundChange(nextRound, roundsData[nextRound]?.handsCount || 0);
      }
    } else {
      // Game complete
      setGameComplete(true);
      if (onGameComplete) {
        onGameComplete(roundsData);
      }
    }
  };

  // Go back to previous round (if needed)
  const previousRound = () => {
    if (currentRound > 1) {
      const prevRound = currentRound - 1;
      setCurrentRound(prevRound);
      if (onRoundChange) {
        onRoundChange(prevRound, roundsData[prevRound]?.handsCount || 0);
      }
    }
  };

  if (gameComplete) {
    return (
      <div className="round-manager game-complete">
        <h2>🎉 Game Complete!</h2>
        <p>All 10 rounds finished successfully!</p>
        <div className="final-summary">
          {Object.entries(roundsData).map(([round, data]) => (
            <div key={round} className="round-summary">
              <span>Round {round}: {data.handsCount} hands completed</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const currentRoundData = roundsData[currentRound] || {};
  const progress = (currentRound - 1) / TOTAL_ROUNDS * 100;

  return (
    <div className="round-manager">
      <div className="round-header">
        <h2>Round {currentRound} of {TOTAL_ROUNDS}</h2>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      <div className="round-info">
        <div className="hands-info">
          <span className="hands-count">
            Hands this round: {currentRoundData.handsCount || 0}
          </span>
          <span className="hands-completed">
            Completed: {currentRoundData.handsCompleted || 0} / {currentRoundData.handsCount || 0}
          </span>
        </div>
        
        <div className="round-status">
          {isRoundComplete(currentRound) ? (
            <span className="status-complete">✅ Round Complete</span>
          ) : (
            <span className="status-incomplete">⏳ In Progress</span>
          )}
        </div>
      </div>

      <div className="round-navigation">
        <button 
          onClick={previousRound}
          disabled={currentRound <= 1}
          className="nav-button prev"
        >
          ← Previous Round
        </button>
        
        <button 
          onClick={advanceRound}
          disabled={!isRoundComplete(currentRound)}
          className={`nav-button next ${!isRoundComplete(currentRound) ? 'disabled' : ''}`}
        >
          {currentRound === TOTAL_ROUNDS ? 'Finish Game' : 'Next Round →'}
        </button>
      </div>

      <div className="rounds-overview">
        <h4>Game Progress</h4>
        <div className="rounds-grid">
          {Array.from({ length: TOTAL_ROUNDS }, (_, i) => i + 1).map(round => (
            <div 
              key={round}
              className={`round-tile ${
                round === currentRound ? 'current' : ''
              } ${
                isRoundComplete(round) ? 'complete' : ''
              } ${
                round < currentRound ? 'past' : ''
              }`}
            >
              <span className="round-number">{round}</span>
              <span className="hands-indicator">{round} hands</span>
              {isRoundComplete(round) && <span className="complete-check">✓</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RoundManager;