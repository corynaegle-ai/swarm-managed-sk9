/**
 * Input validation utilities for Spades card game
 * Validates player names, bids, tricks, and bonus points
 */

class InputValidator {
  constructor() {
    this.errors = [];
  }

  /**
   * Clear previous validation errors
   */
  clearErrors() {
    this.errors = [];
  }

  /**
   * Get all validation errors
   */
  getErrors() {
    return this.errors;
  }

  /**
   * Check if there are any validation errors
   */
  hasErrors() {
    return this.errors.length > 0;
  }

  /**
   * Validate player name
   * @param {string} name - Player name to validate
   * @param {string} fieldName - Name of the field for error messages
   * @returns {boolean} - True if valid
   */
  validatePlayerName(name, fieldName = 'Player name') {
    if (!name || typeof name !== 'string') {
      this.errors.push(`${fieldName} is required`);
      return false;
    }

    const trimmedName = name.trim();
    if (trimmedName.length === 0) {
      this.errors.push(`${fieldName} cannot be empty`);
      return false;
    }

    if (trimmedName.length > 50) {
      this.errors.push(`${fieldName} cannot exceed 50 characters`);
      return false;
    }

    // Check for valid characters (letters, numbers, spaces, hyphens, underscores)
    const validNamePattern = /^[a-zA-Z0-9\s\-_]+$/;
    if (!validNamePattern.test(trimmedName)) {
      this.errors.push(`${fieldName} can only contain letters, numbers, spaces, hyphens, and underscores`);
      return false;
    }

    return true;
  }

  /**
   * Validate bid amount
   * @param {number|string} bid - Bid to validate
   * @param {number} handsAvailable - Number of hands available in the round
   * @param {string} fieldName - Name of the field for error messages
   * @returns {boolean} - True if valid
   */
  validateBid(bid, handsAvailable, fieldName = 'Bid') {
    // Convert to number if string
    const numericBid = typeof bid === 'string' ? parseFloat(bid) : bid;

    // Check if it's a valid number
    if (isNaN(numericBid) || !isFinite(numericBid)) {
      this.errors.push(`${fieldName} must be a valid number`);
      return false;
    }

    // Check if it's an integer
    if (!Number.isInteger(numericBid)) {
      this.errors.push(`${fieldName} must be a whole number`);
      return false;
    }

    // Validate range: 0 <= bid <= hands available
    if (numericBid < 0) {
      this.errors.push(`${fieldName} cannot be negative`);
      return false;
    }

    if (numericBid > handsAvailable) {
      this.errors.push(`${fieldName} cannot exceed ${handsAvailable} (hands available)`);
      return false;
    }

    return true;
  }

  /**
   * Validate tricks taken
   * @param {number|string} tricks - Tricks taken to validate
   * @param {number} handsAvailable - Number of hands available in the round
   * @param {string} fieldName - Name of the field for error messages
   * @returns {boolean} - True if valid
   */
  validateTricksTaken(tricks, handsAvailable, fieldName = 'Tricks taken') {
    // Convert to number if string
    const numericTricks = typeof tricks === 'string' ? parseFloat(tricks) : tricks;

    // Check if it's a valid number
    if (isNaN(numericTricks) || !isFinite(numericTricks)) {
      this.errors.push(`${fieldName} must be a valid number`);
      return false;
    }

    // Check if it's an integer
    if (!Number.isInteger(numericTricks)) {
      this.errors.push(`${fieldName} must be a whole number`);
      return false;
    }

    // Validate range: 0 <= tricks <= hands available
    if (numericTricks < 0) {
      this.errors.push(`${fieldName} cannot be negative`);
      return false;
    }

    if (numericTricks > handsAvailable) {
      this.errors.push(`${fieldName} cannot exceed ${handsAvailable} (hands available)`);
      return false;
    }

    return true;
  }

  /**
   * Validate bonus points
   * @param {number|string} bonusPoints - Bonus points to validate
   * @param {string} fieldName - Name of the field for error messages
   * @returns {boolean} - True if valid
   */
  validateBonusPoints(bonusPoints, fieldName = 'Bonus points') {
    // Convert to number if string
    const numericBonus = typeof bonusPoints === 'string' ? parseFloat(bonusPoints) : bonusPoints;

    // Check if it's a valid number
    if (isNaN(numericBonus) || !isFinite(numericBonus)) {
      this.errors.push(`${fieldName} must be a valid number`);
      return false;
    }

    // Validate non-negative
    if (numericBonus < 0) {
      this.errors.push(`${fieldName} cannot be negative`);
      return false;
    }

    // Allow decimal points for bonus scoring flexibility
    return true;
  }

  /**
   * Validate form data for game round
   * @param {Object} formData - Form data to validate
   * @param {number} handsAvailable - Number of hands available
   * @returns {boolean} - True if all data is valid
   */
  validateRoundData(formData, handsAvailable) {
    this.clearErrors();
    let isValid = true;

    // Validate player names if provided
    if (formData.playerNames && Array.isArray(formData.playerNames)) {
      formData.playerNames.forEach((name, index) => {
        if (!this.validatePlayerName(name, `Player ${index + 1} name`)) {
          isValid = false;
        }
      });
    }

    // Validate bids
    if (formData.bids && Array.isArray(formData.bids)) {
      formData.bids.forEach((bid, index) => {
        if (!this.validateBid(bid, handsAvailable, `Player ${index + 1} bid`)) {
          isValid = false;
        }
      });
    }

    // Validate tricks taken
    if (formData.tricksTaken && Array.isArray(formData.tricksTaken)) {
      formData.tricksTaken.forEach((tricks, index) => {
        if (!this.validateTricksTaken(tricks, handsAvailable, `Player ${index + 1} tricks`)) {
          isValid = false;
        }
      });
    }

    // Validate bonus points
    if (formData.bonusPoints && Array.isArray(formData.bonusPoints)) {
      formData.bonusPoints.forEach((bonus, index) => {
        if (bonus !== undefined && bonus !== null && bonus !== '') {
          if (!this.validateBonusPoints(bonus, `Player ${index + 1} bonus points`)) {
            isValid = false;
          }
        }
      });
    }

    return isValid;
  }
}

// Export for both CommonJS and ES6 modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = InputValidator;
} else if (typeof window !== 'undefined') {
  window.InputValidator = InputValidator;
}

export default InputValidator;