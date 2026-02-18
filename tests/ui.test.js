/**
 * Tests for UI score display functionality
 */

// Mock DOM elements
function setupMockDOM() {
    document.body.innerHTML = `
        <div id="scoreTable"></div>
    `;
}

// Test updateScoreDisplay function
function testUpdateScoreDisplay() {
    setupMockDOM();
    
    const testData = {
        players: [
            {
                name: 'Test Player 1',
                baseScore: 100,
                bonusPoints: 20,
                bonusApplied: true
            },
            {
                name: 'Test Player 2',
                baseScore: 80,
                bonusPoints: 10,
                bonusApplied: false
            }
        ]
    };
    
    updateScoreDisplay(testData);
    
    const table = document.getElementById('scoreTable');
    const rows = table.querySelectorAll('tbody tr');
    
    // Test that table has correct number of rows
    console.assert(rows.length === 2, 'Should have 2 player rows');
    
    // Test bonus styling
    const appliedBonus = table.querySelector('.bonus-applied');
    const ignoredBonus = table.querySelector('.bonus-ignored');
    
    console.assert(appliedBonus !== null, 'Should have applied bonus styling');
    console.assert(ignoredBonus !== null, 'Should have ignored bonus styling');
    
    // Test total score calculation
    const totalScores = table.querySelectorAll('.total-score');
    console.assert(totalScores[0].textContent === '120', 'First player total should be 120 (100 + 20)');
    console.assert(totalScores[1].textContent === '80', 'Second player total should be 80 (bonus ignored)');
    
    console.log('All tests passed!');
}

// Run tests when DOM is ready
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', testUpdateScoreDisplay);
}