// DOM elements
const playerNameInput = document.getElementById('playerName');
const addPlayerBtn = document.getElementById('addPlayerBtn');
const playerList = document.getElementById('playerList');
const currentRoundSpan = document.getElementById('currentRound');
const newRoundBtn = document.getElementById('newRoundBtn');
const resetGameBtn = document.getElementById('resetGameBtn');
const bidInputs = document.getElementById('bidInputs');
const submitBidsBtn = document.getElementById('submitBidsBtn');
const trickInputs = document.getElementById('trickInputs');
const submitTricksBtn = document.getElementById('submitTricksBtn');
const scoreTableBody = document.getElementById('scoreTableBody');
const historyHeader = document.getElementById('historyHeader');
const historyBody = document.getElementById('historyBody');

// Game state
let gameState = {
    players: [],
    currentRound: 1,
    roundData: [],
    gameHistory: []
};

// Initialize the application
function init() {
    addEventListeners();
    updateUI();
}

// Add event listeners
function addEventListeners() {
    addPlayerBtn.addEventListener('click', addPlayer);
    playerNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addPlayer();
    });
    newRoundBtn.addEventListener('click', startNewRound);
    resetGameBtn.addEventListener('click', resetGame);
    submitBidsBtn.addEventListener('click', submitBids);
    submitTricksBtn.addEventListener('click', submitTricks);
}

// Player management functions
function addPlayer() {
    const name = playerNameInput.value.trim();
    if (!name) {
        alert('Please enter a player name');
        return;
    }
    
    if (gameState.players.find(p => p.name === name)) {
        alert('Player already exists');
        return;
    }
    
    const player = {
        name: name,
        totalScore: 0,
        roundScores: []
    };
    
    gameState.players.push(player);
    playerNameInput.value = '';
    updateUI();
}

function removePlayer(playerName) {
    const index = gameState.players.findIndex(p => p.name === playerName);
    if (index !== -1) {
        gameState.players.splice(index, 1);
        updateUI();
    }
}

// Game control functions
function startNewRound() {
    if (gameState.players.length < 2) {
        alert('Need at least 2 players to start a round');
        return;
    }
    
    gameState.currentRound++;
    gameState.roundData = [];
    updateUI();
}

function resetGame() {
    if (confirm('Are you sure you want to reset the entire game?')) {
        gameState = {
            players: [],
            currentRound: 1,
            roundData: [],
            gameHistory: []
        };
        updateUI();
    }
}

// Bid and trick submission
function submitBids() {
    const bids = {};
    let allBidsEntered = true;
    
    gameState.players.forEach(player => {
        const bidInput = document.getElementById(`bid-${player.name}`);
        const bid = parseInt(bidInput.value);
        
        if (isNaN(bid) || bid < 0) {
            allBidsEntered = false;
            return;
        }
        
        bids[player.name] = bid;
    });
    
    if (!allBidsEntered) {
        alert('Please enter valid bids for all players (0 or positive numbers)');
        return;
    }
    
    // Store bids in round data
    gameState.roundData = gameState.players.map(player => ({
        name: player.name,
        bid: bids[player.name],
        tricks: null
    }));
    
    // Enable trick inputs
    generateTrickInputs();
    submitBidsBtn.disabled = true;
    submitTricksBtn.disabled = false;
}

function submitTricks() {
    let allTricksEntered = true;
    
    gameState.roundData.forEach(playerData => {
        const trickInput = document.getElementById(`tricks-${playerData.name}`);
        const tricks = parseInt(trickInput.value);
        
        if (isNaN(tricks) || tricks < 0) {
            allTricksEntered = false;
            return;
        }
        
        playerData.tricks = tricks;
    });
    
    if (!allTricksEntered) {
        alert('Please enter valid trick counts for all players (0 or positive numbers)');
        return;
    }
    
    // Calculate scores for this round
    calculateRoundScores();
    
    // Add to game history
    gameState.gameHistory.push({
        round: gameState.currentRound,
        data: [...gameState.roundData]
    });
    
    // Reset for next round
    gameState.roundData = [];
    submitTricksBtn.disabled = true;
    updateUI();
}

// Score calculation
function calculateRoundScores() {
    gameState.roundData.forEach(playerData => {
        const player = gameState.players.find(p => p.name === playerData.name);
        let roundScore = 0;
        
        // Basic scoring: 10 points if bid equals tricks, otherwise 0
        // Plus 1 point per trick taken
        if (playerData.bid === playerData.tricks) {
            roundScore = 10 + playerData.tricks;
        } else {
            roundScore = playerData.tricks;
        }
        
        player.totalScore += roundScore;
        player.roundScores.push({
            round: gameState.currentRound,
            bid: playerData.bid,
            tricks: playerData.tricks,
            score: roundScore
        });
    });
}

// UI update functions
function updateUI() {
    updatePlayerList();
    updateCurrentRound();
    updateBidInputs();
    updateScoreTable();
    updateHistoryTable();
}

function updatePlayerList() {
    playerList.innerHTML = '';
    
    gameState.players.forEach(player => {
        const playerDiv = document.createElement('div');
        playerDiv.className = 'player-item';
        playerDiv.innerHTML = `
            <span class="player-name">${player.name}</span>
            <button class="remove-btn" onclick="removePlayer('${player.name}')">Remove</button>
        `;
        playerList.appendChild(playerDiv);
    });
}

function updateCurrentRound() {
    currentRoundSpan.textContent = gameState.currentRound;
}

function updateBidInputs() {
    bidInputs.innerHTML = '';
    
    if (gameState.players.length === 0) {
        bidInputs.innerHTML = '<p>Add players to start entering bids</p>';
        submitBidsBtn.disabled = true;
        return;
    }
    
    gameState.players.forEach(player => {
        const bidDiv = document.createElement('div');
        bidDiv.className = 'input-group';
        bidDiv.innerHTML = `
            <label for="bid-${player.name}">${player.name}'s Bid:</label>
            <input type="number" id="bid-${player.name}" min="0" max="13">
        `;
        bidInputs.appendChild(bidDiv);
    });
    
    submitBidsBtn.disabled = false;
}

function generateTrickInputs() {
    trickInputs.innerHTML = '';
    
    gameState.roundData.forEach(playerData => {
        const trickDiv = document.createElement('div');
        trickDiv.className = 'input-group';
        trickDiv.innerHTML = `
            <label for="tricks-${playerData.name}">${playerData.name}'s Tricks (Bid: ${playerData.bid}):</label>
            <input type="number" id="tricks-${playerData.name}" min="0" max="13">
        `;
        trickInputs.appendChild(trickDiv);
    });
}

function updateScoreTable() {
    scoreTableBody.innerHTML = '';
    
    gameState.players.forEach(player => {
        const row = document.createElement('tr');
        const lastRoundScore = player.roundScores.length > 0 ? 
            player.roundScores[player.roundScores.length - 1].score : 0;
        
        row.innerHTML = `
            <td class="player-name">${player.name}</td>
            <td class="total-score">${player.totalScore}</td>
            <td class="last-round">${lastRoundScore}</td>
        `;
        scoreTableBody.appendChild(row);
    });
}

function updateHistoryTable() {
    // Update header
    historyHeader.innerHTML = '';
    if (gameState.players.length > 0) {
        let headerRow = '<tr><th>Round</th>';
        gameState.players.forEach(player => {
            headerRow += `<th>${player.name}</th>`;
        });
        headerRow += '</tr>';
        historyHeader.innerHTML = headerRow;
    }
    
    // Update body
    historyBody.innerHTML = '';
    gameState.gameHistory.forEach(roundHistory => {
        const row = document.createElement('tr');
        let rowHTML = `<td>Round ${roundHistory.round}</td>`;
        
        gameState.players.forEach(player => {
            const playerData = roundHistory.data.find(pd => pd.name === player.name);
            if (playerData) {
                const playerRoundScore = player.roundScores.find(rs => rs.round === roundHistory.round);
                rowHTML += `<td>${playerData.bid}/${playerData.tricks} (${playerRoundScore ? playerRoundScore.score : 0})</td>`;
            } else {
                rowHTML += '<td>-</td>';
            }
        });
        
        row.innerHTML = rowHTML;
        historyBody.appendChild(row);
    });
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);