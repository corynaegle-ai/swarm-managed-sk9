/**
 * Scoring engine for the card game
 * Handles score calculation and player score updates
 */

/**
 * Calculate the score for a single round based on bid and tricks taken
 * @param {number} bid - The number of tricks the player bid
 * @param {number} tricksTaken - The actual number of tricks taken
 * @param {number} cardsDealt - The number of cards dealt this round
 * @returns {number} The score for this round
 */
function calculateRoundScore(bid, tricksTaken, cardsDealt) {
  // Input validation
  if (typeof bid !== 'number' || typeof tricksTaken !== 'number' || typeof cardsDealt !== 'number') {
    throw new Error('All parameters must be numbers');
  }
  
  if (bid < 0 || tricksTaken < 0 || cardsDealt < 0) {
    throw new Error('All parameters must be non-negative');
  }
  
  if (tricksTaken > cardsDealt || bid > cardsDealt) {
    throw new Error('Bid and tricks taken cannot exceed cards dealt');
  }
  
  // Special case: zero bid
  if (bid === 0) {
    if (tricksTaken === 0) {
      // Successful zero bid: +10 × cards dealt
      return 10 * cardsDealt;
    } else {
      // Failed zero bid: -10 × cards dealt
      return -10 * cardsDealt;
    }
  }
  
  // Regular bidding
  if (bid === tricksTaken) {
    // Correct bid: +20 per trick taken
    return 20 * tricksTaken;
  } else {
    // Incorrect bid: -10 per trick off
    const tricksOff = Math.abs(bid - tricksTaken);
    return -10 * tricksOff;
  }
}

/**
 * Update player scores by applying round results
 * @param {Array} players - Array of player objects with score property
 * @param {Array} roundResults - Array of round result objects with playerId and score
 * @returns {Array} Updated players array
 */
function updatePlayerScores(players, roundResults) {
  // Input validation
  if (!Array.isArray(players) || !Array.isArray(roundResults)) {
    throw new Error('Both parameters must be arrays');
  }
  
  // Create a copy of players to avoid mutating the original
  const updatedPlayers = players.map(player => ({ ...player }));
  
  // Apply each round result
  roundResults.forEach(result => {
    if (!result.hasOwnProperty('playerId') || typeof result.score !== 'number') {
      throw new Error('Round results must have playerId and numeric score properties');
    }
    
    const player = updatedPlayers.find(p => p.id === result.playerId);
    if (player) {
      // Initialize score if it doesn't exist
      if (typeof player.score !== 'number') {
        player.score = 0;
      }
      player.score += result.score;
    }
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
} else {
  // Browser environment
  window.Scoring = {
    calculateRoundScore,
    updatePlayerScores
  };
}