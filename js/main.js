// Main game controller - integrates ScoreTracker with UI and game flow
class GameController {
    constructor() {
        this.scoreTracker = null;
        this.currentRound = 0;
        this.gameActive = false;
        this.players = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadPlayers();
    }

    setupEventListeners() {
        // Start game button
        const startBtn = document.getElementById('start-game');
        if (startBtn) {
            startBtn.addEventListener('click', () => this.startGame());
        }

        // End game button
        const endBtn = document.getElementById('end-game');
        if (endBtn) {
            endBtn.addEventListener('click', () => this.endGame());
        }

        // Score input listeners
        document.addEventListener('input', (e) => {
            if (e.target.classList.contains('score-input')) {
                this.handleScoreInput(e.target);
            }
        });

        // Round completion button
        const completeRoundBtn = document.getElementById('complete-round');
        if (completeRoundBtn) {
            completeRoundBtn.addEventListener('click', () => this.completeRound());
        }

        // Add player button
        const addPlayerBtn = document.getElementById('add-player');
        if (addPlayerBtn) {
            addPlayerBtn.addEventListener('click', () => this.addPlayer());
        }
    }

    loadPlayers() {
        const playerNameInputs = document.querySelectorAll('.player-name');
        this.players = Array.from(playerNameInputs).map(input => input.value || input.placeholder || `Player ${Array.from(playerNameInputs).indexOf(input) + 1}`);
    }

    startGame() {
        try {
            this.loadPlayers();
            if (this.players.length < 2) {
                this.showError('At least 2 players are required to start the game');
                return;
            }

            this.scoreTracker = new ScoreTracker(this.players);
            this.gameActive = true;
            this.currentRound = 1;
            
            this.updateGameState();
            this.updateScoreDisplay();
            this.showMessage('Game started! Enter scores for Round 1');
            
            // Enable score inputs
            this.enableScoreInputs(true);
            
        } catch (error) {
            this.showError(`Failed to start game: ${error.message}`);
        }
    }

    endGame() {
        if (!this.gameActive) return;
        
        this.gameActive = false;
        this.displayFinalRankings();
        this.enableScoreInputs(false);
        this.showMessage('Game completed! Final rankings displayed.');
    }

    addPlayer() {
        const playerNameInput = document.getElementById('new-player-name');
        if (!playerNameInput || !playerNameInput.value.trim()) {
            this.showError('Please enter a player name');
            return;
        }

        const playerName = playerNameInput.value.trim();
        if (this.players.includes(playerName)) {
            this.showError('Player name already exists');
            return;
        }

        if (this.gameActive && this.scoreTracker) {
            this.scoreTracker.addPlayer(playerName);
        }
        
        this.players.push(playerName);
        playerNameInput.value = '';
        this.updateScoreDisplay();
        this.showMessage(`Player "${playerName}" added successfully`);
    }

    handleScoreInput(input) {
        if (!this.gameActive || !this.scoreTracker) return;

        const playerId = input.dataset.playerId;
        const roundNumber = parseInt(input.dataset.round) || this.currentRound;
        const score = input.value.trim();

        // Clear previous error styling
        input.classList.remove('error');

        if (score === '') {
            return; // Allow empty input during typing
        }

        try {
            const numericScore = this.validateScore(score);
            
            // Update score in tracker
            this.scoreTracker.updateScore(playerId, roundNumber, numericScore);
            
            // Immediately refresh all displays
            this.updateScoreDisplay();
            
            // Highlight current leader
            this.highlightLeader();
            
        } catch (error) {
            input.classList.add('error');
            this.showError(`Invalid score for ${playerId}: ${error.message}`);
        }
    }

    validateScore(scoreValue) {
        const score = parseFloat(scoreValue);
        if (isNaN(score)) {
            throw new Error('Score must be a valid number');
        }
        if (score < 0) {
            throw new Error('Score cannot be negative');
        }
        if (score > 1000) {
            throw new Error('Score cannot exceed 1000');
        }
        return score;
    }

    completeRound() {
        if (!this.gameActive || !this.scoreTracker) return;

        try {
            // Validate all scores for current round are entered
            const currentRoundScores = this.getCurrentRoundScores();
            const missingScores = this.players.filter(player => 
                currentRoundScores[player] === undefined || currentRoundScores[player] === ''
            );

            if (missingScores.length > 0) {
                this.showError(`Missing scores for: ${missingScores.join(', ')}`);
                return;
            }

            this.currentRound++;
            this.updateGameState();
            this.updateScoreDisplay();
            this.highlightLeader();
            
            this.showMessage(`Round ${this.currentRound - 1} completed. Starting Round ${this.currentRound}`);
            
        } catch (error) {
            this.showError(`Failed to complete round: ${error.message}`);
        }
    }

    getCurrentRoundScores() {
        const scores = {};
        const inputs = document.querySelectorAll(`[data-round="${this.currentRound}"]`);
        
        inputs.forEach(input => {
            const playerId = input.dataset.playerId;
            scores[playerId] = input.value;
        });
        
        return scores;
    }

    updateScoreDisplay() {
        if (!this.scoreTracker) return;

        try {
            // Update total scores
            this.updateTotalScores();
            
            // Update round-by-round breakdown
            this.updateRoundBreakdown();
            
            // Update current standings
            this.updateCurrentStandings();
            
        } catch (error) {
            console.error('Error updating score display:', error);
        }
    }

    updateTotalScores() {
        const totals = this.scoreTracker.getTotalScores();
        
        Object.entries(totals).forEach(([playerId, total]) => {
            const totalElement = document.getElementById(`total-${playerId}`);
            if (totalElement) {
                totalElement.textContent = total.toFixed(1);
            }
        });
    }

    updateRoundBreakdown() {
        const breakdown = this.scoreTracker.getRoundBreakdown();
        
        // Clear existing breakdown
        const breakdownContainer = document.getElementById('round-breakdown');
        if (!breakdownContainer) return;
        
        breakdownContainer.innerHTML = '';
        
        // Create table for round breakdown
        const table = document.createElement('table');
        table.className = 'breakdown-table';
        
        // Header row
        const headerRow = document.createElement('tr');
        headerRow.innerHTML = '<th>Player</th>';
        
        const maxRounds = Math.max(...Object.values(breakdown).map(rounds => Object.keys(rounds).length));
        for (let round = 1; round <= maxRounds; round++) {
            headerRow.innerHTML += `<th>R${round}</th>`;
        }
        headerRow.innerHTML += '<th>Total</th>';
        table.appendChild(headerRow);
        
        // Data rows
        Object.entries(breakdown).forEach(([playerId, rounds]) => {
            const row = document.createElement('tr');
            row.innerHTML = `<td class="player-name">${playerId}</td>`;
            
            for (let round = 1; round <= maxRounds; round++) {
                const score = rounds[round] || '-';
                row.innerHTML += `<td class="round-score">${score}</td>`;
            }
            
            const total = this.scoreTracker.getTotalScores()[playerId] || 0;
            row.innerHTML += `<td class="total-score">${total.toFixed(1)}</td>`;
            
            table.appendChild(row);
        });
        
        breakdownContainer.appendChild(table);
    }

    updateCurrentStandings() {
        const standings = this.scoreTracker.getCurrentStandings();
        const standingsContainer = document.getElementById('current-standings');
        
        if (!standingsContainer) return;
        
        standingsContainer.innerHTML = '<h3>Current Standings</h3>';
        
        const list = document.createElement('ol');
        list.className = 'standings-list';
        
        standings.forEach((player, index) => {
            const listItem = document.createElement('li');
            listItem.className = 'standing-item';
            listItem.innerHTML = `
                <span class="rank">${index + 1}.</span>
                <span class="player">${player.playerId}</span>
                <span class="score">${player.totalScore.toFixed(1)}</span>
            `;
            
            if (index === 0) {
                listItem.classList.add('leader');
            }
            
            list.appendChild(listItem);
        });
        
        standingsContainer.appendChild(list);
    }

    highlightLeader() {
        if (!this.scoreTracker) return;
        
        const standings = this.scoreTracker.getCurrentStandings();
        if (standings.length === 0) return;
        
        const leader = standings[0];
        
        // Remove previous leader highlighting
        document.querySelectorAll('.leader-highlight').forEach(el => {
            el.classList.remove('leader-highlight');
        });
        
        // Highlight new leader
        const leaderElements = document.querySelectorAll(`[data-player-id="${leader.playerId}"]`);
        leaderElements.forEach(el => {
            el.classList.add('leader-highlight');
        });
        
        // Update leader display
        const leaderDisplay = document.getElementById('current-leader');
        if (leaderDisplay) {
            leaderDisplay.innerHTML = `
                <strong>Current Leader:</strong> ${leader.playerId} 
                <span class="leader-score">(${leader.totalScore.toFixed(1)} points)</span>
            `;
        }
    }

    displayFinalRankings() {
        if (!this.scoreTracker) return;
        
        const finalStandings = this.scoreTracker.getCurrentStandings();
        const rankingsContainer = document.getElementById('final-rankings');
        
        if (!rankingsContainer) return;
        
        rankingsContainer.innerHTML = '<h2>Final Rankings</h2>';
        
        const podium = document.createElement('div');
        podium.className = 'final-podium';
        
        finalStandings.forEach((player, index) => {
            const position = document.createElement('div');
            position.className = `position position-${index + 1}`;
            
            let medal = '';
            if (index === 0) medal = '🥇';
            else if (index === 1) medal = '🥈';
            else if (index === 2) medal = '🥉';
            
            position.innerHTML = `
                <div class="medal">${medal}</div>
                <div class="rank">#${index + 1}</div>
                <div class="player-name">${player.playerId}</div>
                <div class="final-score">${player.totalScore.toFixed(1)} points</div>
            `;
            
            podium.appendChild(position);
        });
        
        rankingsContainer.appendChild(podium);
        rankingsContainer.style.display = 'block';
    }

    updateGameState() {
        const gameStatus = document.getElementById('game-status');
        if (gameStatus) {
            if (this.gameActive) {
                gameStatus.textContent = `Round ${this.currentRound} - Game Active`;
                gameStatus.className = 'status-active';
            } else {
                gameStatus.textContent = 'Game Inactive';
                gameStatus.className = 'status-inactive';
            }
        }
        
        // Update round indicator
        const roundIndicator = document.getElementById('current-round');
        if (roundIndicator && this.gameActive) {
            roundIndicator.textContent = `Round ${this.currentRound}`;
        }
    }

    enableScoreInputs(enabled) {
        const scoreInputs = document.querySelectorAll('.score-input');
        scoreInputs.forEach(input => {
            input.disabled = !enabled;
        });
        
        const completeRoundBtn = document.getElementById('complete-round');
        if (completeRoundBtn) {
            completeRoundBtn.disabled = !enabled;
        }
    }

    showMessage(message) {
        const messageContainer = document.getElementById('game-message');
        if (messageContainer) {
            messageContainer.textContent = message;
            messageContainer.className = 'message success';
            messageContainer.style.display = 'block';
            
            // Auto-hide after 3 seconds
            setTimeout(() => {
                messageContainer.style.display = 'none';
            }, 3000);
        }
    }

    showError(error) {
        const messageContainer = document.getElementById('game-message');
        if (messageContainer) {
            messageContainer.textContent = error;
            messageContainer.className = 'message error';
            messageContainer.style.display = 'block';
        }
        
        console.error('Game Error:', error);
    }
}

// Initialize game controller when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.gameController = new GameController();
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GameController };
}