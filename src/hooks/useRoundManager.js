import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for managing round progression and validation
 * @param {Object} options Configuration options
 * @returns {Object} Round management state and functions
 */
export const useRoundManager = (options = {}) => {
  const {
    totalRounds = 10,
    onRoundComplete = () => {},
    onGameComplete = () => {},
    initialRound = 1
  } = options;

  const [currentRound, setCurrentRound] = useState(initialRound);
  const [roundsData, setRoundsData] = useState({});
  const [gameComplete, setGameComplete] = useState(false);

  // Initialize rounds data
  useEffect(() => {
    const initialData = {};
    for (let round = 1; round <= totalRounds; round++) {
      initialData[round] = {
        number: round,
        handsRequired: round,
        handsCompleted: 0,
        scores: [],
        isComplete: false,
        startTime: null,
        endTime: null
      };
    }
    setRoundsData(initialData);
  }, [totalRounds]);

  // Check if a round is complete
  const isRoundComplete = useCallback((roundNumber) => {
    const roundData = roundsData[roundNumber];
    return roundData ? roundData.handsCompleted >= roundData.handsRequired : false;
  }, [roundsData]);

  // Update hand completion for current round
  const updateHandCompletion = useCallback((handsCompleted, scores = []) => {
    setRoundsData(prev => ({
      ...prev,
      [currentRound]: {
        ...prev[currentRound],
        handsCompleted,
        scores,
        isComplete: handsCompleted >= prev[currentRound]?.handsRequired,
        endTime: handsCompleted >= prev[currentRound]?.handsRequired ? new Date() : null
      }
    }));
  }, [currentRound]);

  // Advance to next round with validation
  const advanceRound = useCallback(() => {
    if (!isRoundComplete(currentRound)) {
      throw new Error(`Cannot advance from round ${currentRound}. Complete all ${roundsData[currentRound]?.handsRequired} hands first.`);
    }

    // Mark current round as complete
    if (onRoundComplete) {
      onRoundComplete(currentRound, roundsData[currentRound]);
    }

    if (currentRound < totalRounds) {
      const nextRound = currentRound + 1;
      setCurrentRound(nextRound);
      
      // Mark next round as started
      setRoundsData(prev => ({
        ...prev,
        [nextRound]: {
          ...prev[nextRound],
          startTime: new Date()
        }
      }));
    } else {
      // Game complete
      setGameComplete(true);
      if (onGameComplete) {
        onGameComplete(roundsData);
      }
    }
  }, [currentRound, isRoundComplete, onRoundComplete, onGameComplete, roundsData, totalRounds]);

  // Go to specific round (with validation)
  const goToRound = useCallback((roundNumber) => {
    if (roundNumber < 1 || roundNumber > totalRounds) {
      throw new Error(`Invalid round number: ${roundNumber}. Must be between 1 and ${totalRounds}.`);
    }

    // Can only go to current round or completed rounds
    if (roundNumber > currentRound) {
      throw new Error(`Cannot skip to round ${roundNumber}. Complete current round ${currentRound} first.`);
    }

    setCurrentRound(roundNumber);
  }, [currentRound, totalRounds]);

  // Get round progress information
  const getRoundProgress = useCallback(() => {
    const completedRounds = Object.values(roundsData).filter(round => round.isComplete).length;
    const totalHands = Object.values(roundsData).reduce((sum, round) => sum + round.handsRequired, 0);
    const completedHands = Object.values(roundsData).reduce((sum, round) => sum + round.handsCompleted, 0);
    
    return {
      completedRounds,
      totalRounds,
      completedHands,
      totalHands,
      overallProgress: totalHands > 0 ? (completedHands / totalHands) * 100 : 0,
      roundProgress: totalRounds > 0 ? (completedRounds / totalRounds) * 100 : 0
    };
  }, [roundsData, totalRounds]);

  // Can advance validation
  const canAdvance = isRoundComplete(currentRound);
  const canGoBack = currentRound > 1;

  return {
    // State
    currentRound,
    roundsData,
    gameComplete,
    
    // Current round info
    currentRoundData: roundsData[currentRound] || {},
    handsRequired: roundsData[currentRound]?.handsRequired || 0,
    handsCompleted: roundsData[currentRound]?.handsCompleted || 0,
    
    // Validation flags
    canAdvance,
    canGoBack,
    isCurrentRoundComplete: isRoundComplete(currentRound),
    
    // Actions
    advanceRound,
    goToRound,
    updateHandCompletion,
    
    // Utilities
    isRoundComplete,
    getRoundProgress,
    
    // Progress info
    progress: getRoundProgress()
  };
};

export default useRoundManager;