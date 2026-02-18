import RoundManager from '../js/rounds.js';

// Test RoundManager functionality
function runTests() {
    console.log('Testing RoundManager...');
    
    // Test initialization
    const rm = new RoundManager();
    console.assert(rm.getCurrentRound() === 1, 'Initial round should be 1');
    console.assert(rm.getCompletedHands() === 0, 'Initial completed hands should be 0');
    console.assert(rm.getMaxHands() === 1, 'Round 1 should allow 1 hand');
    
    // Test round progression
    rm.completeHand();
    console.assert(rm.canAdvanceRound() === true, 'Should be able to advance after completing all hands');
    
    rm.advanceRound();
    console.assert(rm.getCurrentRound() === 2, 'Should advance to round 2');
    console.assert(rm.getMaxHands() === 2, 'Round 2 should allow 2 hands');
    console.assert(rm.getCompletedHands() === 0, 'Completed hands should reset after advancing');
    
    // Test cannot advance without completing all hands
    console.assert(rm.canAdvanceRound() === false, 'Should not advance with incomplete hands');
    
    console.log('All tests passed!');
}

runTests();