import { useState, useCallback } from 'react';

export const useBiddingCollection = () => {
  const [currentBids, setCurrentBids] = useState({});
  const [biddingHistory, setBiddingHistory] = useState([]);
  const [isCollecting, setIsCollecting] = useState(false);

  const startBiddingCollection = useCallback((round, availableHands, players) => {
    setIsCollecting(true);
    setCurrentBids(
      players.reduce((acc, player) => ({ ...acc, [player.id]: 0 }), {})
    );
  }, []);

  const validateBids = useCallback((bids, availableHands) => {
    const errors = {};
    
    Object.entries(bids).forEach(([playerId, bid]) => {
      if (bid > availableHands) {
        errors[playerId] = `Bid cannot exceed ${availableHands} hands`;
      }
      if (bid < 0) {
        errors[playerId] = 'Bid cannot be negative';
      }
    });
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }, []);

  const completeBiddingCollection = useCallback((finalBids, round) => {
    setBiddingHistory(prev => [...prev, { round, bids: finalBids }]);
    setCurrentBids({});
    setIsCollecting(false);
    return finalBids;
  }, []);

  const getBiddingHistory = useCallback(() => {
    return biddingHistory;
  }, [biddingHistory]);

  const getTotalBidsForRound = useCallback((round) => {
    const roundHistory = biddingHistory.find(h => h.round === round);
    if (!roundHistory) return 0;
    
    return Object.values(roundHistory.bids).reduce((sum, bid) => sum + bid, 0);
  }, [biddingHistory]);

  return {
    currentBids,
    biddingHistory,
    isCollecting,
    startBiddingCollection,
    validateBids,
    completeBiddingCollection,
    getBiddingHistory,
    getTotalBidsForRound
  };
};

export default useBiddingCollection;