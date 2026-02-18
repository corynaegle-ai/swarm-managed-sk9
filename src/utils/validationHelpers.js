/**
 * Validation helper utilities and constants
 */

// Validation constants
export const VALIDATION_CONSTANTS = {
  MAX_PLAYER_NAME_LENGTH: 50,
  MIN_PLAYER_NAME_LENGTH: 1,
  DEFAULT_HANDS_AVAILABLE: 13,
  MIN_BID: 0,
  MIN_TRICKS: 0,
  MIN_BONUS_POINTS: 0
};

// Validation patterns
export const VALIDATION_PATTERNS = {
  PLAYER_NAME: /^[a-zA-Z0-9\s\-_]+$/,
  NUMERIC_INPUT: /^\d+(\.\d+)?$/
};

// Error message templates
export const ERROR_MESSAGES = {
  REQUIRED_FIELD: (fieldName) => `${fieldName} is required`,
  EMPTY_FIELD: (fieldName) => `${fieldName} cannot be empty`,
  INVALID_NUMBER: (fieldName) => `${fieldName} must be a valid number`,
  WHOLE_NUMBER_REQUIRED: (fieldName) => `${fieldName} must be a whole number`,
  NEGATIVE_VALUE: (fieldName) => `${fieldName} cannot be negative`,
  EXCEEDS_MAXIMUM: (fieldName, max) => `${fieldName} cannot exceed ${max}`,
  EXCEEDS_HANDS: (fieldName, hands) => `${fieldName} cannot exceed ${hands} (hands available)`,
  INVALID_CHARACTERS: (fieldName) => `${fieldName} can only contain letters, numbers, spaces, hyphens, and underscores`,
  TOO_LONG: (fieldName, maxLength) => `${fieldName} cannot exceed ${maxLength} characters`
};

/**
 * Utility function to safely convert string to number
 * @param {string|number} value - Value to convert
 * @returns {number|null} - Converted number or null if invalid
 */
export function safeParseNumber(value) {
  if (typeof value === 'number') {
    return isNaN(value) || !isFinite(value) ? null : value;
  }
  
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed === '') return null;
    
    const parsed = parseFloat(trimmed);
    return isNaN(parsed) || !isFinite(parsed) ? null : parsed;
  }
  
  return null;
}

/**
 * Utility function to safely convert string to integer
 * @param {string|number} value - Value to convert
 * @returns {number|null} - Converted integer or null if invalid
 */
export function safeParseInteger(value) {
  const num = safeParseNumber(value);
  return num !== null && Number.isInteger(num) ? num : null;
}

/**
 * Check if value is a valid positive integer within range
 * @param {any} value - Value to check
 * @param {number} min - Minimum allowed value (inclusive)
 * @param {number} max - Maximum allowed value (inclusive)
 * @returns {boolean} - True if valid
 */
export function isValidIntegerInRange(value, min = 0, max = Infinity) {
  const num = safeParseInteger(value);
  return num !== null && num >= min && num <= max;
}

/**
 * Check if value is a valid non-negative number
 * @param {any} value - Value to check
 * @returns {boolean} - True if valid
 */
export function isValidNonNegativeNumber(value) {
  const num = safeParseNumber(value);
  return num !== null && num >= 0;
}

/**
 * Sanitize player name input
 * @param {string} name - Player name to sanitize
 * @returns {string} - Sanitized name
 */
export function sanitizePlayerName(name) {
  if (typeof name !== 'string') return '';
  
  return name
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .substring(0, VALIDATION_CONSTANTS.MAX_PLAYER_NAME_LENGTH);
}

/**
 * Get hands available for current round (utility for determining max bid/tricks)
 * @param {HTMLElement} context - DOM element to search for hands-available data
 * @returns {number} - Number of hands available
 */
export function getHandsAvailable(context = document) {
  const element = context.querySelector('[data-hands-available]');
  if (element) {
    const hands = parseInt(element.getAttribute('data-hands-available'));
    if (!isNaN(hands) && hands > 0) {
      return hands;
    }
  }
  return VALIDATION_CONSTANTS.DEFAULT_HANDS_AVAILABLE;
}

/**
 * Create validation result object
 * @param {boolean} isValid - Whether validation passed
 * @param {string[]} errors - Array of error messages
 * @returns {Object} - Validation result
 */
export function createValidationResult(isValid, errors = []) {
  return {
    isValid,
    errors: [...errors],
    hasErrors: errors.length > 0
  };
}

/**
 * Debounce function for real-time validation
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
export function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func.apply(this, args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}