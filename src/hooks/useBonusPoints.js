import { useState, useCallback } from 'react';

export const useBonusPoints = () => {
  const [bonusPointsHistory, setBonusPointsHistory] = useState({});

  const setBonusPointsForRound = useCallback((round, bonusPoints) => {
    setBonusPointsHistory(prev => ({
      ...prev,
      [round]: bonusPoints
    }));
  }, []);

  const getBonusPointsForRound = useCallback((round) => {
    return bonusPointsHistory[round] || {};
  }, [bonusPointsHistory]);

  const calculateAppliedBonusPoints = useCallback((round, playerId, roundResults) => {
    const bonusPoints = bonusPointsHistory[round]?.[playerId] || 0;
    if (bonusPoints === 0) return 0;

    const playerResult = roundResults.find(result => result.playerId === playerId);
    if (!playerResult) return 0;

    // Only apply bonus points if player achieved exact bid
    return playerResult.bid === playerResult.tricks ? bonusPoints : 0;
  }, [bonusPointsHistory]);

  const getTotalBonusPointsForPlayer = useCallback((playerId, allRoundResults) => {
    let total = 0;
    Object.keys(bonusPointsHistory).forEach(round => {
      const roundResults = allRoundResults[round] || [];
      total += calculateAppliedBonusPoints(parseInt(round), playerId, roundResults);
    });
    return total;
  }, [bonusPointsHistory, calculateAppliedBonusPoints]);

  const clearBonusPoints = useCallback(() => {
    setBonusPointsHistory({});
  }, []);

  return {
    setBonusPointsForRound,
    getBonusPointsForRound,
    calculateAppliedBonusPoints,
    getTotalBonusPointsForPlayer,
    clearBonusPoints,
    bonusPointsHistory
  };
};