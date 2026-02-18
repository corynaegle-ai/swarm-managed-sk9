/**
 * Scoring system for trick-taking card game
 * Handles score calculations including bonus points logic
 */

/**
 * Calculate the score for a single round for a player
 * @param {Object} player - Player object with bid, actual, and bonus properties
 * @param {number} player.bid - Number of tricks the player bid
 * @param {number} player.actual - Number of tricks the player actually took
 * @param {number} player.bonus - Bonus points available for exact bids
 * @returns {Object} Score calculation result
 */
function calculateRoundScore(player) {
    if (!player || typeof player.bid === 'undefined' || typeof player.actual === 'undefined') {
        throw new Error('Invalid player object: must have bid and actual properties');
    }

    const bid = parseInt(player.bid);
    const actual = parseInt(player.actual);
    const bonus = parseInt(player.bonus) || 0;

    // Validate inputs
    if (isNaN(bid) || isNaN(actual) || bid < 0 || actual < 0) {
        throw new Error('Bid and actual must be non-negative numbers');
    }

    let baseScore = 0;
    let bonusApplied = 0;
    let bonusStatus = 'ignored';

    // Base scoring: points for tricks taken
    baseScore = actual;

    // Bonus points logic: only applied if bid equals actual
    if (bid === actual) {
        bonusApplied = bonus;
        bonusStatus = 'applied';
    }

    const totalScore = baseScore + bonusApplied;

    return {
        baseScore: baseScore,
        bonusPoints: bonus,
        bonusApplied: bonusApplied,
        bonusStatus: bonusStatus, // 'applied' or 'ignored'
        totalScore: totalScore,
        bidMatched: bid === actual
    };
}

/**
 * Calculate total game score for a player across multiple rounds
 * @param {Array} rounds - Array of round results
 * @returns {Object} Total score breakdown
 */
function calculateGameScore(rounds) {
    if (!Array.isArray(rounds)) {
        throw new Error('Rounds must be an array');
    }

    let totalBase = 0;
    let totalBonusApplied = 0;
    let roundsWithBonus = 0;

    rounds.forEach(round => {
        totalBase += round.baseScore || 0;
        totalBonusApplied += round.bonusApplied || 0;
        if (round.bonusStatus === 'applied') {
            roundsWithBonus++;
        }
    });

    return {
        totalBaseScore: totalBase,
        totalBonusApplied: totalBonusApplied,
        totalScore: totalBase + totalBonusApplied,
        roundsWithBonus: roundsWithBonus,
        totalRounds: rounds.length
    };
}

/**
 * Format score display with bonus status for UI
 * @param {Object} scoreResult - Result from calculateRoundScore
 * @returns {Object} Formatted display data
 */
function formatScoreDisplay(scoreResult) {
    const bonusText = scoreResult.bonusStatus === 'applied' 
        ? `+${scoreResult.bonusApplied} bonus` 
        : `${scoreResult.bonusPoints} bonus ignored`;
    
    const bonusClass = scoreResult.bonusStatus === 'applied' 
        ? 'bonus-applied' 
        : 'bonus-ignored';

    return {
        scoreText: `${scoreResult.totalScore} (${scoreResult.baseScore} base${scoreResult.bonusPoints > 0 ? ', ' + bonusText : ''})`,
        bonusStatusText: bonusText,
        bonusStatusClass: bonusClass,
        showBonusIndicator: scoreResult.bonusPoints > 0
    };
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        calculateRoundScore,
        calculateGameScore,
        formatScoreDisplay
    };
}