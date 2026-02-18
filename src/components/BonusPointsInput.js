import React, { useState, useEffect } from 'react';
import './BonusPointsInput.css';

const BonusPointsInput = ({ players, currentRound, onBonusPointsChange, roundResults }) => {
  const [bonusPoints, setBonusPoints] = useState({});

  useEffect(() => {
    // Initialize bonus points for all players
    const initialBonusPoints = {};
    players.forEach(player => {
      initialBonusPoints[player.id] = 0;
    });
    setBonusPoints(initialBonusPoints);
  }, [players, currentRound]);

  const handleBonusChange = (playerId, value) => {
    const numericValue = Math.max(0, parseInt(value) || 0);
    const updatedBonus = {
      ...bonusPoints,
      [playerId]: numericValue
    };
    setBonusPoints(updatedBonus);
    onBonusPointsChange(updatedBonus);
  };

  const getPlayerResult = (playerId) => {
    return roundResults?.find(result => result.playerId === playerId);
  };

  const isExactBid = (playerId) => {
    const result = getPlayerResult(playerId);
    return result && result.bid === result.tricks;
  };

  return (
    <div className="bonus-points-container">
      <h3>Bonus Points - Round {currentRound}</h3>
      <div className="bonus-points-grid">
        {players.map(player => {
          const exactBid = isExactBid(player.id);
          const result = getPlayerResult(player.id);
          
          return (
            <div key={player.id} className={`bonus-point-item ${!exactBid ? 'disabled' : ''}`}>
              <div className="player-info">
                <span className="player-name">{player.name}</span>
                {result && (
                  <span className="bid-info">
                    Bid: {result.bid}, Tricks: {result.tricks}
                  </span>
                )}
              </div>
              
              <div className="bonus-input-container">
                <input
                  type="number"
                  min="0"
                  value={bonusPoints[player.id] || 0}
                  onChange={(e) => handleBonusChange(player.id, e.target.value)}
                  className={`bonus-input ${!exactBid ? 'ignored' : ''}`}
                  disabled={!exactBid}
                />
                {!exactBid && bonusPoints[player.id] > 0 && (
                  <div className="bonus-ignored-warning">
                    Bonus ignored - bid not exact
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BonusPointsInput;