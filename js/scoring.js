/**
 * Scoring Engine for Card Game
 * Handles bid scoring and player score updates
 */

/**
 * Calculate the score for a single round based on bid and tricks taken
 * @param {number} bid - The player's bid (number of tricks they expect to take)
 * @param {number} tricksTaken - The actual number of tricks the player took
 * @param {number} cardsDealt - The number of cards dealt this round
 * @returns {number} The score for this round
 */
function calculateRoundScore(bid, tricksTaken, cardsDealt) {
  // Input validation
  if (typeof bid !== 'number' || typeof tricksTaken !== 'number' || typeof cardsDealt !== 'number') {
    throw new Error('All parameters must be numbers');
  }
  
  if (bid < 0 || tricksTaken < 0 || cardsDealt < 0) {
    throw new Error('Parameters cannot be negative');
  }
  
  if (tricksTaken > cardsDealt) {
    throw new Error('Tricks taken cannot exceed cards dealt');
  }
  
  // Handle zero bid special rules
  if (bid === 0) {
    if (tricksTaken === 0) {
      // Successful zero bid: +10 × cards dealt
      return 10 * cardsDealt;
    } else {
      // Failed zero bid: -10 × cards dealt
      return -10 * cardsDealt;
    }
  }
  
  // Regular bidding logic
  if (bid === tricksTaken) {
    // Correct bid: +20 per trick
    return 20 * tricksTaken;
  } else {
    // Incorrect bid: -10 per trick off
    const tricksOff = Math.abs(bid - tricksTaken);
    return -10 * tricksOff;
  }
}

/**
 * Update player scores with round results
 * @param {Array} players - Array of player objects with score property
 * @param {Array} roundResults - Array of round result objects with playerId and score
 * @returns {Array} Updated players array
 */
function updatePlayerScores(players, roundResults) {
  // Input validation
  if (!Array.isArray(players)) {
    throw new Error('Players must be an array');
  }
  
  if (!Array.isArray(roundResults)) {
    throw new Error('Round results must be an array');
  }
  
  // Create a copy of players to avoid mutation
  const updatedPlayers = players.map(player => ({ ...player }));
  
  // Apply score changes
  roundResults.forEach(result => {
    if (!result.hasOwnProperty('playerId') || !result.hasOwnProperty('score')) {
      throw new Error('Round result must have playerId and score properties');
    }
    
    const player = updatedPlayers.find(p => p.id === result.playerId);
    if (!player) {
      throw new Error(`Player with ID ${result.playerId} not found`);
    }
    
    // Initialize score if it doesn't exist
    if (typeof player.score !== 'number') {
      player.score = 0;
    }
    
    // Apply the round score
    player.score += result.score;
  });
  
  return updatedPlayers;
}

// Export functions for use by other modules
if (typeof module !== 'undefined' && module.exports) {
  // Node.js environment
  module.exports = {
    calculateRoundScore,
    updatePlayerScores
  };
} else if (typeof window !== 'undefined') {
  // Browser environment
  window.Scoring = {
    calculateRoundScore,
    updatePlayerScores
  };
}