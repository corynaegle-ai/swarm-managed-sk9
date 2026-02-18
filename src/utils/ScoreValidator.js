/**
 * ScoreValidator - Utility for validating score-related data
 */
class ScoreValidator {
  /**
   * Validate player names array
   * @param {Array} playerNames - Array of player names
   * @returns {Object} Validation result
   */
  static validatePlayerNames(playerNames) {
    const errors = [];
    
    if (!Array.isArray(playerNames)) {
      errors.push('Player names must be an array');
      return { isValid: false, errors };
    }
    
    if (playerNames.length === 0) {
      errors.push('At least one player is required');
    }
    
    if (playerNames.length > 10) {
      errors.push('Maximum 10 players allowed');
    }
    
    const nameSet = new Set();
    playerNames.forEach((name, index) => {
      if (typeof name !== 'string') {
        errors.push(`Player name at index ${index} must be a string`);
      } else if (name.trim() === '') {
        errors.push(`Player name at index ${index} cannot be empty`);
      } else if (name.length > 50) {
        errors.push(`Player name at index ${index} too long (max 50 characters)`);
      } else if (nameSet.has(name.toLowerCase())) {
        errors.push(`Duplicate player name: ${name}`);
      } else {
        nameSet.add(name.toLowerCase());
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors,
      uniqueNames: Array.from(nameSet)
    };
  }
  
  /**
   * Validate round scores object
   * @param {Object} roundScores - Object with player scores
   * @param {Array} expectedPlayers - Array of expected player names
   * @returns {Object} Validation result
   */
  static validateRoundScores(roundScores, expectedPlayers) {
    const errors = [];
    
    if (!roundScores || typeof roundScores !== 'object') {
      errors.push('Round scores must be an object');
      return { isValid: false, errors };
    }
    
    if (Array.isArray(roundScores)) {
      errors.push('Round scores must be an object, not an array');
    }
    
    if (!Array.isArray(expectedPlayers)) {
      errors.push('Expected players must be an array');
      return { isValid: false, errors };
    }
    
    // Check for missing players
    expectedPlayers.forEach(playerName => {
      if (!(playerName in roundScores)) {
        errors.push(`Missing score for player: ${playerName}`);
      }
    });
    
    // Check for extra players
    Object.keys(roundScores).forEach(playerName => {
      if (!expectedPlayers.includes(playerName)) {
        errors.push(`Unexpected player in scores: ${playerName}`);
      }
    });
    
    // Validate individual scores
    Object.entries(roundScores).forEach(([playerName, score]) => {
      const scoreValidation = this.validateScore(score, playerName);
      if (!scoreValidation.isValid) {
        errors.push(...scoreValidation.errors);
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors,
      processedScores: this._processScores(roundScores)
    };
  }
  
  /**
   * Validate individual score
   * @param {*} score - Score value to validate
   * @param {string} playerName - Player name for error messages
   * @returns {Object} Validation result
   */
  static validateScore(score, playerName = 'unknown') {
    const errors = [];
    
    if (typeof score !== 'number') {
      errors.push(`Score for ${playerName} must be a number, got ${typeof score}`);
    } else if (isNaN(score)) {
      errors.push(`Score for ${playerName} cannot be NaN`);
    } else if (!isFinite(score)) {
      errors.push(`Score for ${playerName} must be finite`);
    } else if (score < -1000000) {
      errors.push(`Score for ${playerName} too low (minimum -1,000,000)`);
    } else if (score > 1000000) {
      errors.push(`Score for ${playerName} too high (maximum 1,000,000)`);
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      normalizedScore: isNaN(score) ? 0 : Math.round(score)
    };
  }
  
  /**
   * Process and normalize scores
   * @param {Object} roundScores - Raw scores object
   * @returns {Object} Processed scores
   * @private
   */
  static _processScores(roundScores) {
    const processed = {};
    
    Object.entries(roundScores).forEach(([playerName, score]) => {
      if (typeof score === 'number' && isFinite(score) && !isNaN(score)) {
        processed[playerName] = Math.round(score);
      } else {
        processed[playerName] = 0;
      }
    });
    
    return processed;
  }
  
  /**
   * Validate game state for operations
   * @param {boolean} gameEnded - Whether game has ended
   * @param {string} operation - Operation being attempted
   * @returns {Object} Validation result
   */
  static validateGameState(gameEnded, operation) {
    const errors = [];
    
    const restrictedOperations = ['addRoundScores', 'addScore', 'updateScores'];
    
    if (gameEnded && restrictedOperations.includes(operation)) {
      errors.push(`Cannot ${operation} after game has ended`);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Validate rank calculation data
   * @param {Array} playerData - Array of player data objects
   * @returns {Object} Validation result
   */
  static validateRankingData(playerData) {
    const errors = [];
    
    if (!Array.isArray(playerData)) {
      errors.push('Player data must be an array');
      return { isValid: false, errors };
    }
    
    playerData.forEach((player, index) => {
      if (!player || typeof player !== 'object') {
        errors.push(`Player data at index ${index} must be an object`);
      } else {
        if (typeof player.totalScore !== 'number') {
          errors.push(`Player at index ${index} must have numeric totalScore`);
        }
        if (!player.name || typeof player.name !== 'string') {
          errors.push(`Player at index ${index} must have string name`);
        }
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Sanitize player name for safe display
   * @param {string} name - Player name
   * @returns {string} Sanitized name
   */
  static sanitizePlayerName(name) {
    if (typeof name !== 'string') {
      return 'Unknown Player';
    }
    
    return name
      .trim()
      .substring(0, 50)
      .replace(/[<>"'&]/g, match => {
        const entities = {
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;',
          '&': '&amp;'
        };
        return entities[match] || match;
      });
  }
}

export default ScoreValidator;