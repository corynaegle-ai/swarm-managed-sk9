import React, { useState } from 'react';
import './BiddingCollection.css';

const BiddingCollection = ({ 
  currentRound, 
  availableHands, 
  players, 
  onBidsConfirmed 
}) => {
  const [bids, setBids] = useState(
    players.reduce((acc, player) => ({ ...acc, [player.id]: 0 }), {})
  );
  const [isEditing, setIsEditing] = useState(true);
  const [errors, setErrors] = useState({});

  const handleBidChange = (playerId, bid) => {
    const bidValue = parseInt(bid, 10) || 0;
    
    // Clear previous error for this player
    setErrors(prev => ({ ...prev, [playerId]: null }));
    
    // Validate bid is not greater than available hands
    if (bidValue > availableHands) {
      setErrors(prev => ({
        ...prev,
        [playerId]: `Bid cannot exceed ${availableHands} hands`
      }));
      return;
    }
    
    if (bidValue < 0) {
      setErrors(prev => ({
        ...prev,
        [playerId]: 'Bid cannot be negative'
      }));
      return;
    }
    
    setBids(prev => ({ ...prev, [playerId]: bidValue }));
  };

  const hasErrors = () => {
    return Object.values(errors).some(error => error !== null);
  };

  const handleConfirmBids = () => {
    if (hasErrors()) {
      alert('Please fix all bid errors before confirming');
      return;
    }
    
    setIsEditing(false);
  };

  const handleEditBids = () => {
    setIsEditing(true);
  };

  const handleFinalConfirm = () => {
    onBidsConfirmed(bids);
  };

  const getPlayerName = (playerId) => {
    const player = players.find(p => p.id === playerId);
    return player ? player.name : `Player ${playerId}`;
  };

  return (
    <div className="bidding-collection">
      <div className="round-info">
        <h2>Round {currentRound}</h2>
        <p>Available Hands: {availableHands}</p>
      </div>

      <div className="bidding-section">
        <h3>Player Bids</h3>
        
        {isEditing ? (
          <div className="bid-inputs">
            {players.map(player => (
              <div key={player.id} className="player-bid">
                <label htmlFor={`bid-${player.id}`}>
                  {player.name}:
                </label>
                <input
                  id={`bid-${player.id}`}
                  type="number"
                  min="0"
                  max={availableHands}
                  value={bids[player.id]}
                  onChange={(e) => handleBidChange(player.id, e.target.value)}
                  className={errors[player.id] ? 'error' : ''}
                />
                {errors[player.id] && (
                  <span className="error-message">{errors[player.id]}</span>
                )}
              </div>
            ))}
            
            <button 
              onClick={handleConfirmBids}
              disabled={hasErrors()}
              className="confirm-btn"
            >
              Confirm Bids
            </button>
          </div>
        ) : (
          <div className="bid-summary">
            <h4>Collected Bids:</h4>
            <div className="bids-display">
              {Object.entries(bids).map(([playerId, bid]) => (
                <div key={playerId} className="bid-display">
                  <span className="player-name">{getPlayerName(playerId)}:</span>
                  <span className="bid-value">{bid} hands</span>
                </div>
              ))}
            </div>
            
            <div className="action-buttons">
              <button onClick={handleEditBids} className="edit-btn">
                Edit Bids
              </button>
              <button onClick={handleFinalConfirm} className="final-confirm-btn">
                Proceed to Round
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BiddingCollection;