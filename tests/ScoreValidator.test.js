import ScoreValidator from '../src/utils/ScoreValidator.js';

describe('ScoreValidator', () => {
  describe('validatePlayerNames', () => {
    test('should validate correct player names', () => {
      const result = ScoreValidator.validatePlayerNames(['Alice', 'Bob', 'Charlie']);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject non-array input', () => {
      const result = ScoreValidator.validatePlayerNames('not-an-array');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Player names must be an array');
    });

    test('should reject empty array', () => {
      const result = ScoreValidator.validatePlayerNames([]);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('At least one player is required');
    });

    test('should reject too many players', () => {
      const manyPlayers = Array.from({ length: 11 }, (_, i) => `Player${i}`);
      const result = ScoreValidator.validatePlayerNames(manyPlayers);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Maximum 10 players allowed');
    });

    test('should reject non-string names', () => {
      const result = ScoreValidator.validatePlayerNames(['Alice', 123, 'Bob']);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Player name at index 1 must be a string');
    });

    test('should reject empty string names', () => {
      const result = ScoreValidator.validatePlayerNames(['Alice', '', 'Bob']);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Player name at index 1 cannot be empty');
    });

    test('should reject duplicate names (case insensitive)', () => {
      const result = ScoreValidator.validatePlayerNames(['Alice', 'alice', 'Bob']);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Duplicate player name: alice');
    });

    test('should reject names that are too long', () => {
      const longName = 'A'.repeat(51);
      const result = ScoreValidator.validatePlayerNames(['Alice', longName]);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Player name at index 1 too long (max 50 characters)');
    });
  });

  describe('validateRoundScores', () => {
    const testPlayers = ['Alice', 'Bob', 'Charlie'];

    test('should validate correct round scores', () => {
      const scores = { Alice: 10, Bob: 15, Charlie: 5 };
      const result = ScoreValidator.validateRoundScores(scores, testPlayers);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject non-object scores', () => {
      const result = ScoreValidator.validateRoundScores('not-an-object', testPlayers);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Round scores must be an object');
    });

    test('should reject array as scores', () => {
      const result = ScoreValidator.validateRoundScores([10, 15, 5], testPlayers);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Round scores must be an object, not an array');
    });

    test('should detect missing player scores', () => {
      const scores = { Alice: 10, Bob: 15 }; // Missing Charlie
      const result = ScoreValidator.validateRoundScores(scores, testPlayers);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Missing score for player: Charlie');
    });

    test('should detect unexpected players', () => {
      const scores = { Alice: 10, Bob: 15, Charlie: 5, Dave: 20 };
      const result = ScoreValidator.validateRoundScores(scores, testPlayers);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Unexpected player in scores: Dave');
    });

    test('should validate individual scores', () => {
      const scores = { Alice: 'invalid', Bob: 15, Charlie: NaN };
      const result = ScoreValidator.validateRoundScores(scores, testPlayers);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('validateScore', () => {
    test('should validate correct numeric scores', () => {
      const result = ScoreValidator.validateScore(42, 'TestPlayer');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.normalizedScore).toBe(42);
    });

    test('should reject non-numeric scores', () => {
      const result = ScoreValidator.validateScore('not-a-number', 'TestPlayer');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Score for TestPlayer must be a number, got string');
    });

    test('should reject NaN scores', () => {
      const result = ScoreValidator.validateScore(NaN, 'TestPlayer');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Score for TestPlayer cannot be NaN');
    });

    test('should reject infinite scores', () => {
      const result = ScoreValidator.validateScore(Infinity, 'TestPlayer');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Score for TestPlayer must be finite');
    });

    test('should reject scores that are too low', () => {
      const result = ScoreValidator.validateScore(-1000001, 'TestPlayer');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Score for TestPlayer too low (minimum -1,000,000)');
    });

    test('should reject scores that are too high', () => {
      const result = ScoreValidator.validateScore(1000001, 'TestPlayer');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Score for TestPlayer too high (maximum 1,000,000)');
    });

    test('should round decimal scores', () => {
      const result = ScoreValidator.validateScore(42.7, 'TestPlayer');
      expect(result.isValid).toBe(true);
      expect(result.normalizedScore).toBe(43);
    });
  });

  describe('validateGameState', () => {
    test('should allow operations on ongoing game', () => {
      const result = ScoreValidator.validateGameState(false, 'addRoundScores');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should prevent score operations on ended game', () => {
      const result = ScoreValidator.validateGameState(true, 'addRoundScores');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Cannot addRoundScores after game has ended');
    });

    test('should allow non-restricted operations on ended game', () => {
      const result = ScoreValidator.validateGameState(true, 'getStandings');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('validateRankingData', () => {
    test('should validate correct ranking data', () => {
      const data = [
        { name: 'Alice', totalScore: 100 },
        { name: 'Bob', totalScore: 80 }
      ];
      const result = ScoreValidator.validateRankingData(data);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject non-array data', () => {
      const result = ScoreValidator.validateRankingData('not-an-array');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Player data must be an array');
    });

    test('should validate individual player objects', () => {
      const data = [
        { name: 'Alice', totalScore: 100 },
        { name: 123, totalScore: 'invalid' },
        null
      ];
      const result = ScoreValidator.validateRankingData(data);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('sanitizePlayerName', () => {
    test('should sanitize HTML characters', () => {
      const result = ScoreValidator.sanitizePlayerName('<script>alert("test")</script>');
      expect(result).toBe('&lt;script&gt;alert(&quot;test&quot;)&lt;/script&gt;');
    });

    test('should trim whitespace and limit length', () => {
      const longName = '  ' + 'A'.repeat(60) + '  ';
      const result = ScoreValidator.sanitizePlayerName(longName);
      expect(result.length).toBeLessThanOrEqual(50);
      expect(result.startsWith('A')).toBe(true);
    });

    test('should handle non-string input', () => {
      const result = ScoreValidator.sanitizePlayerName(123);
      expect(result).toBe('Unknown Player');
    });

    test('should handle null/undefined input', () => {
      expect(ScoreValidator.sanitizePlayerName(null)).toBe('Unknown Player');
      expect(ScoreValidator.sanitizePlayerName(undefined)).toBe('Unknown Player');
    });
  });
});