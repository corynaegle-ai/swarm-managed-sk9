const ScoreCalculator = require('../src/game/scoreCalculator');

describe('ScoreCalculator', () => {
  describe('calculateScore', () => {
    // Test AC-001: Correct trick bid: +20 points per trick taken
    it('should award +20 points per trick for correct bids', () => {
      expect(ScoreCalculator.calculateScore(3, 3, 7)).toBe(60); // 20 * 3
      expect(ScoreCalculator.calculateScore(1, 1, 5)).toBe(20); // 20 * 1
      expect(ScoreCalculator.calculateScore(5, 5, 10)).toBe(100); // 20 * 5
    });

    // Test AC-002: Incorrect trick bid: -10 points per trick difference
    it('should penalize -10 points per trick difference for incorrect bids', () => {
      expect(ScoreCalculator.calculateScore(3, 1, 7)).toBe(-20); // -10 * 2
      expect(ScoreCalculator.calculateScore(2, 5, 7)).toBe(-30); // -10 * 3
      expect(ScoreCalculator.calculateScore(4, 4, 7)).toBe(80); // correct bid: 20 * 4
    });

    // Test AC-003: Zero bid success: +10 × cards dealt
    it('should award +10 × cards dealt for successful zero bids', () => {
      expect(ScoreCalculator.calculateScore(0, 0, 7)).toBe(70); // 10 * 7
      expect(ScoreCalculator.calculateScore(0, 0, 5)).toBe(50); // 10 * 5
      expect(ScoreCalculator.calculateScore(0, 0, 10)).toBe(100); // 10 * 10
    });

    // Test AC-004: Zero bid failure: -10 × cards dealt
    it('should penalize -10 × cards dealt for failed zero bids', () => {
      expect(ScoreCalculator.calculateScore(0, 1, 7)).toBe(-70); // -10 * 7
      expect(ScoreCalculator.calculateScore(0, 3, 5)).toBe(-50); // -10 * 5
      expect(ScoreCalculator.calculateScore(0, 2, 10)).toBe(-100); // -10 * 10
    });

    // Test edge cases and validation
    it('should handle edge cases correctly', () => {
      expect(ScoreCalculator.calculateScore(0, 0, 1)).toBe(10);
      expect(ScoreCalculator.calculateScore(1, 0, 1)).toBe(-10);
    });

    it('should throw errors for invalid inputs', () => {
      expect(() => ScoreCalculator.calculateScore(-1, 0, 5)).toThrow('Bid must be a non-negative number');
      expect(() => ScoreCalculator.calculateScore(0, -1, 5)).toThrow('Actual tricks must be a non-negative number');
      expect(() => ScoreCalculator.calculateScore(0, 0, 0)).toThrow('Cards dealt must be a positive number');
      expect(() => ScoreCalculator.calculateScore('invalid', 0, 5)).toThrow('Bid must be a non-negative number');
    });
  });

  describe('calculateRoundScores', () => {
    it('should calculate scores for multiple players', () => {
      const players = [
        { name: 'Alice', bid: 2, actualTricks: 2 },
        { name: 'Bob', bid: 0, actualTricks: 0 },
        { name: 'Charlie', bid: 3, actualTricks: 1 }
      ];
      const cardsDealt = 7;
      
      const results = ScoreCalculator.calculateRoundScores(players, cardsDealt);
      
      expect(results[0].score).toBe(40); // Alice: correct bid, 20 * 2
      expect(results[1].score).toBe(70); // Bob: zero bid success, 10 * 7
      expect(results[2].score).toBe(-20); // Charlie: off by 2, -10 * 2
    });

    it('should include scoring reasons', () => {
      const players = [{ name: 'Test', bid: 2, actualTricks: 2 }];
      const results = ScoreCalculator.calculateRoundScores(players, 5);
      expect(results[0].scoringReason).toBe('Correct bid: +20 × 2 tricks = +40');
    });

    it('should throw error for invalid player data', () => {
      expect(() => ScoreCalculator.calculateRoundScores('not array', 5)).toThrow('Players must be an array');
      expect(() => ScoreCalculator.calculateRoundScores([{ name: 'Test' }], 5)).toThrow('Each player must have bid and actualTricks properties');
    });
  });

  describe('getScoringReason', () => {
    it('should provide correct explanations for all scoring scenarios', () => {
      expect(ScoreCalculator.getScoringReason(2, 2, 7)).toBe('Correct bid: +20 × 2 tricks = +40');
      expect(ScoreCalculator.getScoringReason(3, 1, 7)).toBe('Incorrect bid: -10 × 2 difference = -20');
      expect(ScoreCalculator.getScoringReason(0, 0, 7)).toBe('Zero bid success: +10 × 7 cards = +70');
      expect(ScoreCalculator.getScoringReason(0, 2, 7)).toBe('Zero bid failure: -10 × 7 cards = -70');
    });
  });
});