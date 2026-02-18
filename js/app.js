// Game state management
class GameState {
    constructor() {
        this.players = [];
        this.rounds = [];
        this.currentRound = 0;
    }

    addPlayer(name) {
        if (name && !this.players.find(p => p.name === name)) {
            this.players.push({
                id: Date.now().toString(),
                name: name
            });
            return true;
        }
        return false;
    }

    newRound() {
        const roundData = {
            roundNumber: this.rounds.length + 1,
            players: {}
        };
        
        this.players.forEach(player => {
            roundData.players[player.id] = {
                bid: 0,
                actual: 0,
                bonus: 0,
                score: 0
            };
        });
        
        this.rounds.push(roundData);
        this.currentRound = this.rounds.length - 1;
    }

    updatePlayerData(playerId, field, value) {
        if (this.rounds.length === 0) {
            this.newRound();
        }
        
        const currentRoundData = this.rounds[this.currentRound];
        if (currentRoundData && currentRoundData.players[playerId]) {
            currentRoundData.players[playerId][field] = parseInt(value) || 0;
            this.calculateScore(playerId);
        }
    }

    calculateScore(playerId) {
        const currentRoundData = this.rounds[this.currentRound];
        if (currentRoundData && currentRoundData.players[playerId]) {
            const playerData = currentRoundData.players[playerId];
            const bid = playerData.bid;
            const actual = playerData.actual;
            const bonus = playerData.bonus;
            
            // Basic scoring: 10 points if bid matches actual, plus bonus points
            let score = bonus;
            if (bid === actual) {
                score += 10 + actual;
            }
            
            playerData.score = score;
        }
    }

    getTotalScore(playerId) {
        return this.rounds.reduce((total, round) => {
            return total + (round.players[playerId]?.score || 0);
        }, 0);
    }

    reset() {
        this.players = [];
        this.rounds = [];
        this.currentRound = 0;
    }
}

// Global game state
const gameState = new GameState();

// DOM manipulation functions
function updatePlayersList() {
    const playersList = document.getElementById('players-list');
    playersList.innerHTML = '';
    
    gameState.players.forEach(player => {
        const playerTag = document.createElement('div');
        playerTag.className = 'player-tag';
        playerTag.textContent = player.name;
        playersList.appendChild(playerTag);
    });
}

function updateScorecard() {
    const playerRows = document.getElementById('player-rows');
    playerRows.innerHTML = '';
    
    if (gameState.rounds.length === 0 || gameState.players.length === 0) {
        return;
    }
    
    const currentRoundData = gameState.rounds[gameState.currentRound];
    
    gameState.players.forEach(player => {
        const playerData = currentRoundData.players[player.id] || { bid: 0, actual: 0, bonus: 0, score: 0 };
        
        const row = document.createElement('div');
        row.className = 'player-row';
        
        row.innerHTML = `
            <div class="player-name">${player.name}</div>
            <div class="bid-column">
                <input type="number" class="bid-input" 
                       data-player-id="${player.id}" 
                       value="${playerData.bid}" 
                       min="0">
            </div>
            <div class="actual-column">
                <input type="number" class="actual-input" 
                       data-player-id="${player.id}" 
                       value="${playerData.actual}" 
                       min="0">
            </div>
            <div class="bonus-column">
                <input type="number" class="bonus-input" 
                       data-player-id="${player.id}" 
                       value="${playerData.bonus}" 
                       min="0" 
                       placeholder="Bonus">
            </div>
            <div class="score-column">
                <div class="score-display">${playerData.score}</div>
            </div>
        `;
        
        playerRows.appendChild(row);
    });
    
    // Add event listeners to input fields
    addInputEventListeners();
}

function addInputEventListeners() {
    // Bid inputs
    document.querySelectorAll('.bid-input').forEach(input => {
        input.addEventListener('input', (e) => {
            const playerId = e.target.dataset.playerId;
            const value = e.target.value;
            gameState.updatePlayerData(playerId, 'bid', value);
            updateScorecard();
            updateTotalScores();
        });
    });
    
    // Actual tricks inputs
    document.querySelectorAll('.actual-input').forEach(input => {
        input.addEventListener('input', (e) => {
            const playerId = e.target.dataset.playerId;
            const value = e.target.value;
            gameState.updatePlayerData(playerId, 'actual', value);
            updateScorecard();
            updateTotalScores();
        });
    });
    
    // Bonus points inputs
    document.querySelectorAll('.bonus-input').forEach(input => {
        input.addEventListener('input', (e) => {
            const playerId = e.target.dataset.playerId;
            const value = e.target.value;
            gameState.updatePlayerData(playerId, 'bonus', value);
            updateScorecard();
            updateTotalScores();
        });
    });
}

function updateTotalScores() {
    const totalScores = document.getElementById('total-scores');
    totalScores.innerHTML = '';
    
    gameState.players.forEach(player => {
        const totalScore = gameState.getTotalScore(player.id);
        
        const scoreItem = document.createElement('div');
        scoreItem.className = 'total-score-item';
        scoreItem.innerHTML = `
            <div class="total-score-name">${player.name}</div>
            <div class="total-score-value">${totalScore}</div>
        `;
        
        totalScores.appendChild(scoreItem);
    });
}

// Event listeners for main controls
document.addEventListener('DOMContentLoaded', () => {
    // Add player functionality
    const addPlayerBtn = document.getElementById('add-player-btn');
    const playerNameInput = document.getElementById('player-name-input');
    
    addPlayerBtn.addEventListener('click', () => {
        const name = playerNameInput.value.trim();
        if (gameState.addPlayer(name)) {
            playerNameInput.value = '';
            updatePlayersList();
            updateScorecard();
            updateTotalScores();
        } else {
            alert('Player name already exists or is invalid!');
        }
    });
    
    playerNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addPlayerBtn.click();
        }
    });
    
    // New round functionality
    const newRoundBtn = document.getElementById('new-round-btn');
    newRoundBtn.addEventListener('click', () => {
        if (gameState.players.length === 0) {
            alert('Please add players first!');
            return;
        }
        
        gameState.newRound();
        updateScorecard();
        updateTotalScores();
    });
    
    // Reset game functionality
    const resetGameBtn = document.getElementById('reset-game-btn');
    resetGameBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset the entire game?')) {
            gameState.reset();
            updatePlayersList();
            updateScorecard();
            updateTotalScores();
        }
    });
    
    // Initialize the interface
    updatePlayersList();
    updateScorecard();
    updateTotalScores();
});