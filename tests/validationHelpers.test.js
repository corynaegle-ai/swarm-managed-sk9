/**
 * Test suite for validation helper utilities
 */

import {
  safeParseNumber,
  safeParseInteger,
  isValidIntegerInRange,
  isValidNonNegativeNumber,
  sanitizePlayerName,
  getHandsAvailable,
  createValidationResult,
  debounce,
  VALIDATION_CONSTANTS,
  VALIDATION_PATTERNS,
  ERROR_MESSAGES
} from '../src/utils/validationHelpers.js';

describe('Validation Helpers', () => {
  describe('safeParseNumber', () => {
    test('should parse valid numbers correctly', () => {
      expect(safeParseNumber('123')).toBe(123);
      expect(safeParseNumber('123.45')).toBe(123.45);
      expect(safeParseNumber(456)).toBe(456);
      expect(safeParseNumber('0')).toBe(0);
      expect(safeParseNumber('-5')).toBe(-5);
    });

    test('should return null for invalid inputs', () => {
      expect(safeParseNumber('abc')).toBeNull();
      expect(safeParseNumber('')).toBeNull();
      expect(safeParseNumber('  ')).toBeNull();
      expect(safeParseNumber(null)).toBeNull();
      expect(safeParseNumber(undefined)).toBeNull();
      expect(safeParseNumber(NaN)).toBeNull();
      expect(safeParseNumber(Infinity)).toBeNull();
    });
  });

  describe('safeParseInteger', () => {
    test('should parse valid integers correctly', () => {
      expect(safeParseInteger('123')).toBe(123);
      expect(safeParseInteger(456)).toBe(456);
      expect(safeParseInteger('0')).toBe(0);
      expect(safeParseInteger('-5')).toBe(-5);
    });

    test('should return null for non-integers', () => {
      expect(safeParseInteger('123.45')).toBeNull();
      expect(safeParseInteger(123.45)).toBeNull();
      expect(safeParseInteger('abc')).toBeNull();
      expect(safeParseInteger('')).toBeNull();
    });
  });

  describe('isValidIntegerInRange', () => {
    test('should validate integers within range', () => {
      expect(isValidIntegerInRange(5, 0, 10)).toBe(true);
      expect(isValidIntegerInRange('7', 0, 10)).toBe(true);
      expect(isValidIntegerInRange(0, 0, 10)).toBe(true);
      expect(isValidIntegerInRange(10, 0, 10)).toBe(true);
    });

    test('should reject integers outside range', () => {
      expect(isValidIntegerInRange(-1, 0, 10)).toBe(false);
      expect(isValidIntegerInRange(11, 0, 10)).toBe(false);
      expect(isValidIntegerInRange('15', 0, 10)).toBe(false);
    });

    test('should reject non-integers', () => {
      expect(isValidIntegerInRange(5.5, 0, 10)).toBe(false);
      expect(isValidIntegerInRange('abc', 0, 10)).toBe(false);
      expect(isValidIntegerInRange(null, 0, 10)).toBe(false);
    });
  });

  describe('isValidNonNegativeNumber', () => {
    test('should validate non-negative numbers', () => {
      expect(isValidNonNegativeNumber(0)).toBe(true);
      expect(isValidNonNegativeNumber(5)).toBe(true);
      expect(isValidNonNegativeNumber(3.14)).toBe(true);
      expect(isValidNonNegativeNumber('10')).toBe(true);
      expect(isValidNonNegativeNumber('7.5')).toBe(true);
    });

    test('should reject negative numbers', () => {
      expect(isValidNonNegativeNumber(-1)).toBe(false);
      expect(isValidNonNegativeNumber(-5.5)).toBe(false);
      expect(isValidNonNegativeNumber('-3')).toBe(false);
    });

    test('should reject invalid inputs', () => {
      expect(isValidNonNegativeNumber('abc')).toBe(false);
      expect(isValidNonNegativeNumber(null)).toBe(false);
      expect(isValidNonNegativeNumber(undefined)).toBe(false);
    });
  });

  describe('sanitizePlayerName', () => {
    test('should sanitize player names correctly', () => {
      expect(sanitizePlayerName('  John Doe  ')).toBe('John Doe');
      expect(sanitizePlayerName('Player   With   Spaces')).toBe('Player With Spaces');
      expect(sanitizePlayerName('Valid_Name-123')).toBe('Valid_Name-123');
    });

    test('should truncate long names', () => {
      const longName = 'A'.repeat(60);
      const sanitized = sanitizePlayerName(longName);
      expect(sanitized.length).toBe(VALIDATION_CONSTANTS.MAX_PLAYER_NAME_LENGTH);
    });

    test('should handle invalid inputs', () => {
      expect(sanitizePlayerName(null)).toBe('');
      expect(sanitizePlayerName(undefined)).toBe('');
      expect(sanitizePlayerName(123)).toBe('');
    });
  });

  describe('getHandsAvailable', () => {
    test('should return default when no context provided', () => {
      const mockContext = {
        querySelector: jest.fn().mockReturnValue(null)
      };
      
      expect(getHandsAvailable(mockContext)).toBe(VALIDATION_CONSTANTS.DEFAULT_HANDS_AVAILABLE);
    });

    test('should parse hands from context element', () => {
      const mockElement = {
        getAttribute: jest.fn().mockReturnValue('10')
      };
      const mockContext = {
        querySelector: jest.fn().mockReturnValue(mockElement)
      };
      
      expect(getHandsAvailable(mockContext)).toBe(10);
    });

    test('should return default for invalid hands value', () => {
      const mockElement = {
        getAttribute: jest.fn().mockReturnValue('invalid')
      };
      const mockContext = {
        querySelector: jest.fn().mockReturnValue(mockElement)
      };
      
      expect(getHandsAvailable(mockContext)).toBe(VALIDATION_CONSTANTS.DEFAULT_HANDS_AVAILABLE);
    });
  });

  describe('createValidationResult', () => {
    test('should create validation result correctly', () => {
      const result = createValidationResult(true, ['error1', 'error2']);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual(['error1', 'error2']);
      expect(result.hasErrors).toBe(true);
    });

    test('should create result with no errors', () => {
      const result = createValidationResult(false);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual([]);
      expect(result.hasErrors).toBe(false);
    });
  });

  describe('debounce', () => {
    jest.useFakeTimers();

    test('should debounce function calls', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);
      
      debouncedFn();
      debouncedFn();
      debouncedFn();
      
      expect(mockFn).not.toHaveBeenCalled();
      
      jest.advanceTimersByTime(100);
      
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    test('should reset timeout on multiple calls', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);
      
      debouncedFn();
      jest.advanceTimersByTime(50);
      debouncedFn();
      jest.advanceTimersByTime(50);
      
      expect(mockFn).not.toHaveBeenCalled();
      
      jest.advanceTimersByTime(50);
      
      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('Constants and Patterns', () => {
    test('should have correct validation constants', () => {
      expect(VALIDATION_CONSTANTS.MAX_PLAYER_NAME_LENGTH).toBe(50);
      expect(VALIDATION_CONSTANTS.MIN_PLAYER_NAME_LENGTH).toBe(1);
      expect(VALIDATION_CONSTANTS.DEFAULT_HANDS_AVAILABLE).toBe(13);
      expect(VALIDATION_CONSTANTS.MIN_BID).toBe(0);
      expect(VALIDATION_CONSTANTS.MIN_TRICKS).toBe(0);
      expect(VALIDATION_CONSTANTS.MIN_BONUS_POINTS).toBe(0);
    });

    test('should have correct validation patterns', () => {
      expect(VALIDATION_PATTERNS.PLAYER_NAME.test('Valid_Name-123')).toBe(true);
      expect(VALIDATION_PATTERNS.PLAYER_NAME.test('Invalid@Name')).toBe(false);
      
      expect(VALIDATION_PATTERNS.NUMERIC_INPUT.test('123')).toBe(true);
      expect(VALIDATION_PATTERNS.NUMERIC_INPUT.test('123.45')).toBe(true);
      expect(VALIDATION_PATTERNS.NUMERIC_INPUT.test('abc')).toBe(false);
    });

    test('should have error message functions', () => {
      expect(ERROR_MESSAGES.REQUIRED_FIELD('Test Field')).toBe('Test Field is required');
      expect(ERROR_MESSAGES.EXCEEDS_MAXIMUM('Bid', 13)).toBe('Bid cannot exceed 13');
      expect(ERROR_MESSAGES.NEGATIVE_VALUE('Points')).toBe('Points cannot be negative');
    });
  });
});