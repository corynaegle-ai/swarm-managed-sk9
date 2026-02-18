/**
 * Score Calculation Engine
 * Handles scoring for trick-taking game based on bids vs actual tricks
 */

class ScoreCalculator {
  /**
   * Calculate score for a player's performance in a round
   * @param {number} bid - Number of tricks the player bid
   * @param {number} actualTricks - Number of tricks the player actually took
   * @param {number} cardsDealt - Number of cards dealt in this round
   * @returns {number} The calculated score
   */
  static calculateScore(bid, actualTricks, cardsDealt) {
    // Validate inputs
    if (typeof bid !== 'number' || bid < 0) {
      throw new Error('Bid must be a non-negative number');
    }
    if (typeof actualTricks !== 'number' || actualTricks < 0) {
      throw new Error('Actual tricks must be a non-negative number');
    }
    if (typeof cardsDealt !== 'number' || cardsDealt <= 0) {
      throw new Error('Cards dealt must be a positive number');
    }

    // Handle zero bid (special rules)
    if (bid === 0) {
      if (actualTricks === 0) {
        // Zero bid success: +10 × cards dealt
        return 10 * cardsDealt;
      } else {
        // Zero bid failure: -10 × cards dealt
        return -10 * cardsDealt;
      }
    }

    // Handle regular bidding
    if (bid === actualTricks) {
      // Correct trick bid: +20 points per trick taken
      return 20 * actualTricks;
    } else {
      // Incorrect trick bid: -10 points per trick difference
      const difference = Math.abs(bid - actualTricks);
      return -10 * difference;
    }
  }

  /**
   * Calculate scores for multiple players in a round
   * @param {Array} players - Array of player objects with bid and actualTricks properties
   * @param {number} cardsDealt - Number of cards dealt in this round
   * @returns {Array} Array of score results
   */
  static calculateRoundScores(players, cardsDealt) {
    if (!Array.isArray(players)) {
      throw new Error('Players must be an array');
    }

    return players.map(player => {
      if (!player.hasOwnProperty('bid') || !player.hasOwnProperty('actualTricks')) {
        throw new Error('Each player must have bid and actualTricks properties');
      }

      const score = this.calculateScore(player.bid, player.actualTricks, cardsDealt);
      return {
        ...player,
        score: score,
        scoringReason: this.getScoringReason(player.bid, player.actualTricks, cardsDealt)
      };
    });
  }

  /**
   * Get human-readable explanation of how score was calculated
   * @param {number} bid - Number of tricks bid
   * @param {number} actualTricks - Number of tricks actually taken
   * @param {number} cardsDealt - Number of cards dealt
   * @returns {string} Explanation of scoring
   */
  static getScoringReason(bid, actualTricks, cardsDealt) {
    if (bid === 0) {
      if (actualTricks === 0) {
        return `Zero bid success: +10 × ${cardsDealt} cards = +${10 * cardsDealt}`;
      } else {
        return `Zero bid failure: -10 × ${cardsDealt} cards = -${10 * cardsDealt}`;
      }
    }

    if (bid === actualTricks) {
      return `Correct bid: +20 × ${actualTricks} tricks = +${20 * actualTricks}`;
    } else {
      const difference = Math.abs(bid - actualTricks);
      return `Incorrect bid: -10 × ${difference} difference = -${10 * difference}`;
    }
  }
}

module.exports = ScoreCalculator;