/**
 * Test suite for scoring engine
 */

// Import functions based on environment
let calculateRoundScore, updatePlayerScores;

if (typeof require !== 'undefined') {
  // Node.js environment
  const scoring = require('../js/scoring.js');
  calculateRoundScore = scoring.calculateRoundScore;
  updatePlayerScores = scoring.updatePlayerScores;
} else {
  // Browser environment
  calculateRoundScore = window.Scoring.calculateRoundScore;
  updatePlayerScores = window.Scoring.updatePlayerScores;
}

// Test helper function
function assert(condition, message) {
  if (!condition) {
    throw new Error(`Test failed: ${message}`);
  }
}

// Test calculateRoundScore function
function testCalculateRoundScore() {
  console.log('Testing calculateRoundScore...');
  
  // AC1: calculateRoundScore(3, 3, 7) returns +60 for correct bid
  assert(calculateRoundScore(3, 3, 7) === 60, 'AC1: Correct bid should return +60');
  
  // AC2: calculateRoundScore(2, 4, 7) returns -20 for 2 tricks off
  assert(calculateRoundScore(2, 4, 7) === -20, 'AC2: 2 tricks off should return -20');
  
  // AC3: calculateRoundScore(0, 0, 7) returns +70 for successful zero bid
  assert(calculateRoundScore(0, 0, 7) === 70, 'AC3: Successful zero bid should return +70');
  
  // AC4: calculateRoundScore(0, 1, 7) returns -70 for failed zero bid
  assert(calculateRoundScore(0, 1, 7) === -70, 'AC4: Failed zero bid should return -70');
  
  console.log('calculateRoundScore tests passed!');
}

// Test updatePlayerScores function
function testUpdatePlayerScores() {
  console.log('Testing updatePlayerScores...');
  
  const players = [
    { id: 'player1', name: 'Alice', score: 100 },
    { id: 'player2', name: 'Bob', score: 50 }
  ];
  
  const roundResults = [
    { playerId: 'player1', score: 60 },
    { playerId: 'player2', score: -20 }
  ];
  
  const updatedPlayers = updatePlayerScores(players, roundResults);
  
  // AC5: updatePlayerScores() correctly applies round scores to player totals
  assert(updatedPlayers[0].score === 160, 'AC5: Player 1 score should be updated correctly');
  assert(updatedPlayers[1].score === 30, 'AC5: Player 2 score should be updated correctly');
  
  // Ensure original players array is not mutated
  assert(players[0].score === 100, 'Original players array should not be mutated');
  
  console.log('updatePlayerScores tests passed!');
}

// Run tests
if (typeof window === 'undefined') {
  // Node.js environment - run tests immediately
  testCalculateRoundScore();
  testUpdatePlayerScores();
  console.log('All tests passed!');
} else {
  // Browser environment - expose test functions
  window.runScoringTests = function() {
    testCalculateRoundScore();
    testUpdatePlayerScores();
    console.log('All tests passed!');
  };
}