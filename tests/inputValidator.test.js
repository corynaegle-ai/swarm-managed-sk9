/**
 * Test suite for InputValidator class
 */

import InputValidator from '../src/validation/inputValidator.js';

describe('InputValidator', () => {
  let validator;

  beforeEach(() => {
    validator = new InputValidator();
  });

  describe('Player Name Validation', () => {
    test('should validate correct player names', () => {
      expect(validator.validatePlayerName('John Doe')).toBe(true);
      expect(validator.validatePlayerName('Player_1')).toBe(true);
      expect(validator.validatePlayerName('Player-123')).toBe(true);
      expect(validator.hasErrors()).toBe(false);
    });

    test('should reject empty or invalid player names', () => {
      expect(validator.validatePlayerName('')).toBe(false);
      expect(validator.validatePlayerName('   ')).toBe(false);
      expect(validator.validatePlayerName(null)).toBe(false);
      expect(validator.validatePlayerName(undefined)).toBe(false);
      expect(validator.hasErrors()).toBe(true);
    });

    test('should reject names with invalid characters', () => {
      validator.clearErrors();
      expect(validator.validatePlayerName('Player@123')).toBe(false);
      expect(validator.validatePlayerName('Player#1')).toBe(false);
      expect(validator.getErrors()).toContain('Player name can only contain letters, numbers, spaces, hyphens, and underscores');
    });

    test('should reject names that are too long', () => {
      validator.clearErrors();
      const longName = 'A'.repeat(51);
      expect(validator.validatePlayerName(longName)).toBe(false);
      expect(validator.getErrors()).toContain('Player name cannot exceed 50 characters');
    });
  });

  describe('Bid Validation', () => {
    test('should validate correct bids within range', () => {
      expect(validator.validateBid(0, 13)).toBe(true);
      expect(validator.validateBid(5, 13)).toBe(true);
      expect(validator.validateBid(13, 13)).toBe(true);
      expect(validator.validateBid('7', 13)).toBe(true); // String input
      expect(validator.hasErrors()).toBe(false);
    });

    test('should reject bids outside valid range', () => {
      expect(validator.validateBid(-1, 13)).toBe(false);
      expect(validator.validateBid(14, 13)).toBe(false);
      expect(validator.hasErrors()).toBe(true);
    });

    test('should reject invalid bid values', () => {
      validator.clearErrors();
      expect(validator.validateBid('abc', 13)).toBe(false);
      expect(validator.validateBid(null, 13)).toBe(false);
      expect(validator.validateBid(3.5, 13)).toBe(false); // Not integer
      expect(validator.hasErrors()).toBe(true);
    });

    test('should provide clear error messages for invalid bids', () => {
      validator.clearErrors();
      validator.validateBid(-1, 13);
      expect(validator.getErrors()).toContain('Bid cannot be negative');
      
      validator.clearErrors();
      validator.validateBid(15, 13);
      expect(validator.getErrors()).toContain('Bid cannot exceed 13 (hands available)');
    });
  });

  describe('Tricks Taken Validation', () => {
    test('should validate correct tricks within range', () => {
      expect(validator.validateTricksTaken(0, 13)).toBe(true);
      expect(validator.validateTricksTaken(7, 13)).toBe(true);
      expect(validator.validateTricksTaken(13, 13)).toBe(true);
      expect(validator.validateTricksTaken('5', 13)).toBe(true); // String input
      expect(validator.hasErrors()).toBe(false);
    });

    test('should reject tricks outside valid range', () => {
      expect(validator.validateTricksTaken(-1, 13)).toBe(false);
      expect(validator.validateTricksTaken(14, 13)).toBe(false);
      expect(validator.hasErrors()).toBe(true);
    });

    test('should reject invalid tricks values', () => {
      validator.clearErrors();
      expect(validator.validateTricksTaken('xyz', 13)).toBe(false);
      expect(validator.validateTricksTaken(2.7, 13)).toBe(false); // Not integer
      expect(validator.hasErrors()).toBe(true);
    });

    test('should provide clear error messages for invalid tricks', () => {
      validator.clearErrors();
      validator.validateTricksTaken(-2, 13);
      expect(validator.getErrors()).toContain('Tricks taken cannot be negative');
      
      validator.clearErrors();
      validator.validateTricksTaken(15, 13);
      expect(validator.getErrors()).toContain('Tricks taken cannot exceed 13 (hands available)');
    });
  });

  describe('Bonus Points Validation', () => {
    test('should validate correct bonus points', () => {
      expect(validator.validateBonusPoints(0)).toBe(true);
      expect(validator.validateBonusPoints(10)).toBe(true);
      expect(validator.validateBonusPoints(3.5)).toBe(true); // Decimals allowed
      expect(validator.validateBonusPoints('15')).toBe(true); // String input
      expect(validator.hasErrors()).toBe(false);
    });

    test('should reject negative bonus points', () => {
      expect(validator.validateBonusPoints(-5)).toBe(false);
      expect(validator.validateBonusPoints('-10')).toBe(false);
      expect(validator.hasErrors()).toBe(true);
    });

    test('should reject invalid bonus point values', () => {
      validator.clearErrors();
      expect(validator.validateBonusPoints('invalid')).toBe(false);
      expect(validator.validateBonusPoints(null)).toBe(false);
      expect(validator.hasErrors()).toBe(true);
    });

    test('should provide clear error messages for invalid bonus points', () => {
      validator.clearErrors();
      validator.validateBonusPoints(-5);
      expect(validator.getErrors()).toContain('Bonus points cannot be negative');
    });
  });

  describe('Form Data Validation', () => {
    test('should validate complete form data correctly', () => {
      const validFormData = {
        playerNames: ['Alice', 'Bob', 'Charlie', 'Dave'],
        bids: [3, 4, 2, 4],
        tricksTaken: [3, 4, 2, 4],
        bonusPoints: [0, 5, 0, 10]
      };
      
      expect(validator.validateRoundData(validFormData, 13)).toBe(true);
      expect(validator.hasErrors()).toBe(false);
    });

    test('should reject form data with validation errors', () => {
      const invalidFormData = {
        playerNames: ['', 'Bob@invalid', 'Charlie'],
        bids: [-1, 15, 'invalid'],
        tricksTaken: [14, 4, -2],
        bonusPoints: [-5, 10, 'bad']
      };
      
      expect(validator.validateRoundData(invalidFormData, 13)).toBe(false);
      expect(validator.hasErrors()).toBe(true);
      expect(validator.getErrors().length).toBeGreaterThan(0);
    });

    test('should handle empty or partial form data', () => {
      const partialFormData = {
        playerNames: ['Alice'],
        bids: [5],
        tricksTaken: [],
        bonusPoints: []
      };
      
      expect(validator.validateRoundData(partialFormData, 13)).toBe(true);
    });
  });

  describe('Error Management', () => {
    test('should clear errors correctly', () => {
      validator.validatePlayerName('');
      expect(validator.hasErrors()).toBe(true);
      
      validator.clearErrors();
      expect(validator.hasErrors()).toBe(false);
      expect(validator.getErrors()).toEqual([]);
    });

    test('should accumulate multiple errors', () => {
      validator.validatePlayerName('');
      validator.validateBid(-1, 13);
      validator.validateTricksTaken(15, 13);
      
      expect(validator.getErrors().length).toBe(3);
    });
  });
});