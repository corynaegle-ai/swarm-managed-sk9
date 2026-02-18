/**
 * Test suite for scoring.js
 */

// Import the scoring functions
const { calculateRoundScore, updatePlayerScores } = require('../js/scoring.js');

describe('calculateRoundScore', () => {
  test('correct bid returns +20 per trick', () => {
    expect(calculateRoundScore(3, 3, 7)).toBe(60);
    expect(calculateRoundScore(5, 5, 10)).toBe(100);
    expect(calculateRoundScore(1, 1, 7)).toBe(20);
  });
  
  test('incorrect bid returns -10 per trick off', () => {
    expect(calculateRoundScore(2, 4, 7)).toBe(-20);
    expect(calculateRoundScore(5, 3, 7)).toBe(-20);
    expect(calculateRoundScore(1, 4, 7)).toBe(-30);
  });
  
  test('successful zero bid returns +10 × cards dealt', () => {
    expect(calculateRoundScore(0, 0, 7)).toBe(70);
    expect(calculateRoundScore(0, 0, 10)).toBe(100);
    expect(calculateRoundScore(0, 0, 1)).toBe(10);
  });
  
  test('failed zero bid returns -10 × cards dealt', () => {
    expect(calculateRoundScore(0, 1, 7)).toBe(-70);
    expect(calculateRoundScore(0, 2, 7)).toBe(-70);
    expect(calculateRoundScore(0, 1, 10)).toBe(-100);
  });
  
  test('edge cases handled gracefully', () => {
    expect(() => calculateRoundScore(-1, 0, 7)).toThrow('All parameters must be non-negative');
    expect(() => calculateRoundScore(8, 3, 7)).toThrow('Bid and tricks taken cannot exceed cards dealt');
    expect(() => calculateRoundScore('3', 3, 7)).toThrow('All parameters must be numbers');
  });
});

describe('updatePlayerScores', () => {
  test('applies round scores to player totals', () => {
    const players = [
      { id: 1, name: 'Player 1', score: 100 },
      { id: 2, name: 'Player 2', score: 50 }
    ];
    
    const roundResults = [
      { playerId: 1, score: 60 },
      { playerId: 2, score: -20 }
    ];
    
    const updated = updatePlayerScores(players, roundResults);
    
    expect(updated[0].score).toBe(160);
    expect(updated[1].score).toBe(30);
    expect(updated[0].name).toBe('Player 1'); // Ensure other properties preserved
  });
  
  test('initializes score if missing', () => {
    const players = [
      { id: 1, name: 'Player 1' }
    ];
    
    const roundResults = [
      { playerId: 1, score: 60 }
    ];
    
    const updated = updatePlayerScores(players, roundResults);
    expect(updated[0].score).toBe(60);
  });
  
  test('handles invalid input gracefully', () => {
    expect(() => updatePlayerScores('not array', [])).toThrow('Both parameters must be arrays');
    expect(() => updatePlayerScores([], [{ score: 10 }])).toThrow('Round results must have playerId and numeric score properties');
  });
});