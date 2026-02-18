/**
 * UI management functions for score display
 */

/**
 * Updates the score display table with current scores and bonus points
 * @param {Object} scoreData - Score data object containing player scores and bonuses
 */
function updateScoreDisplay(scoreData) {
    const scoreTable = document.getElementById('scoreTable');
    if (!scoreTable) {
        console.error('Score table element not found');
        return;
    }

    // Clear existing table content
    scoreTable.innerHTML = '';

    // Create table header
    const header = document.createElement('thead');
    header.innerHTML = `
        <tr>
            <th>Player</th>
            <th>Base Score</th>
            <th>Bonus Points</th>
            <th>Total Score</th>
        </tr>
    `;
    scoreTable.appendChild(header);

    // Create table body
    const tbody = document.createElement('tbody');
    
    if (!scoreData || !scoreData.players) {
        console.warn('No score data provided');
        return;
    }

    // Iterate through players and create rows
    scoreData.players.forEach(player => {
        const row = document.createElement('tr');
        
        const baseScore = player.baseScore || 0;
        const bonusPoints = player.bonusPoints || 0;
        const bonusApplied = player.bonusApplied || false;
        
        // Calculate total score
        const totalScore = bonusApplied ? baseScore + bonusPoints : baseScore;
        
        // Format bonus display
        let bonusDisplay = '';
        let bonusClass = '';
        
        if (bonusPoints > 0) {
            if (bonusApplied) {
                bonusDisplay = `+${bonusPoints}`;
                bonusClass = 'bonus-applied';
            } else {
                bonusDisplay = `(+${bonusPoints})`;
                bonusClass = 'bonus-ignored';
            }
        } else {
            bonusDisplay = '-';
            bonusClass = 'no-bonus';
        }
        
        row.innerHTML = `
            <td>${player.name || 'Unknown Player'}</td>
            <td>${baseScore}</td>
            <td class="${bonusClass}">${bonusDisplay}</td>
            <td class="total-score">${totalScore}</td>
        `;
        
        tbody.appendChild(row);
    });
    
    scoreTable.appendChild(tbody);
    
    // Add legend if it doesn't exist
    createBonusLegend();
}

/**
 * Creates or updates the bonus points legend
 */
function createBonusLegend() {
    let legend = document.getElementById('bonusLegend');
    
    if (!legend) {
        legend = document.createElement('div');
        legend.id = 'bonusLegend';
        legend.className = 'bonus-legend';
        
        const scoreTable = document.getElementById('scoreTable');
        if (scoreTable && scoreTable.parentNode) {
            scoreTable.parentNode.insertBefore(legend, scoreTable.nextSibling);
        }
    }
    
    legend.innerHTML = `
        <h4>Bonus Points Legend:</h4>
        <ul>
            <li><span class="bonus-applied">+5</span> - Applied bonus points (added to total)</li>
            <li><span class="bonus-ignored">(+5)</span> - Ignored bonus points (not added to total)</li>
        </ul>
    `;
}

/**
 * Initialize the score display when the DOM is ready
 */
document.addEventListener('DOMContentLoaded', function() {
    // Example usage - this would typically be called with real data
    const exampleData = {
        players: [
            {
                name: 'Player 1',
                baseScore: 150,
                bonusPoints: 25,
                bonusApplied: true
            },
            {
                name: 'Player 2',
                baseScore: 120,
                bonusPoints: 15,
                bonusApplied: false
            },
            {
                name: 'Player 3',
                baseScore: 180,
                bonusPoints: 0,
                bonusApplied: false
            }
        ]
    };
    
    // Uncomment to test with example data
    // updateScoreDisplay(exampleData);
});