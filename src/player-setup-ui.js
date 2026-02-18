/**
 * Player Setup UI Component
 * Provides user interface for managing players before game starts
 */

class PlayerSetupUI {
  constructor(playerManager) {
    this.playerManager = playerManager;
    this.container = null;
    this.playerListElement = null;
    this.addPlayerInput = null;
    this.startGameButton = null;
  }

  /**
   * Initialize the UI component
   * @param {HTMLElement} container - Container element for the UI
   */
  init(container) {
    this.container = container;
    this.render();
    this.attachEventListeners();
    this.updateUI();
  }

  /**
   * Render the initial UI structure
   */
  render() {
    this.container.innerHTML = `
      <div class="player-setup">
        <h2>Player Setup</h2>
        <div class="add-player-section">
          <input 
            type="text" 
            id="player-name-input" 
            placeholder="Enter player name" 
            maxlength="50"
            class="player-input"
          />
          <button id="add-player-btn" class="btn btn-primary">Add Player</button>
        </div>
        <div class="player-count-info">
          <span id="player-count">0</span> players (2-8 required)
        </div>
        <ul id="player-list" class="player-list"></ul>
        <div class="game-controls">
          <button id="start-game-btn" class="btn btn-success" disabled>Start Game</button>
          <button id="reset-players-btn" class="btn btn-secondary">Reset All</button>
        </div>
        <div id="error-message" class="error-message" style="display: none;"></div>
      </div>
    `;

    this.playerListElement = this.container.querySelector('#player-list');
    this.addPlayerInput = this.container.querySelector('#player-name-input');
    this.startGameButton = this.container.querySelector('#start-game-btn');
  }

  /**
   * Attach event listeners to UI elements
   */
  attachEventListeners() {
    const addButton = this.container.querySelector('#add-player-btn');
    const resetButton = this.container.querySelector('#reset-players-btn');
    
    addButton.addEventListener('click', () => this.handleAddPlayer());
    resetButton.addEventListener('click', () => this.handleReset());
    this.startGameButton.addEventListener('click', () => this.handleStartGame());
    
    this.addPlayerInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.handleAddPlayer();
      }
    });

    this.addPlayerInput.addEventListener('input', () => {
      this.clearError();
    });
  }

  /**
   * Handle adding a new player
   */
  handleAddPlayer() {
    const name = this.addPlayerInput.value.trim();
    const result = this.playerManager.addPlayer(name);
    
    if (result.success) {
      this.addPlayerInput.value = '';
      this.updateUI();
      this.clearError();
    } else {
      this.showError(result.error);
    }
  }

  /**
   * Handle removing a player
   * @param {string} playerId - ID of player to remove
   */
  handleRemovePlayer(playerId) {
    const result = this.playerManager.removePlayer(playerId);
    
    if (result.success) {
      this.updateUI();
      this.clearError();
    } else {
      this.showError(result.error);
    }
  }

  /**
   * Handle editing a player name
   * @param {string} playerId - ID of player to edit
   * @param {string} newName - New player name
   */
  handleEditPlayer(playerId, newName) {
    const result = this.playerManager.editPlayer(playerId, newName);
    
    if (result.success) {
      this.updateUI();
      this.clearError();
    } else {
      this.showError(result.error);
    }
  }

  /**
   * Handle starting the game
   */
  handleStartGame() {
    const result = this.playerManager.startGame();
    
    if (result.success) {
      this.updateUI();
      this.clearError();
      this.onGameStarted();
    } else {
      this.showError(result.error);
    }
  }

  /**
   * Handle resetting all players
   */
  handleReset() {
    if (this.playerManager.isGameStarted()) {
      this.showError('Cannot reset players after game has started');
      return;
    }
    
    if (confirm('Are you sure you want to remove all players?')) {
      this.playerManager.reset();
      this.updateUI();
      this.clearError();
    }
  }

  /**
   * Update the entire UI based on current state
   */
  updateUI() {
    this.updatePlayerList();
    this.updatePlayerCount();
    this.updateGameControls();
  }

  /**
   * Update the player list display
   */
  updatePlayerList() {
    const players = this.playerManager.getPlayers();
    const gameStarted = this.playerManager.isGameStarted();
    
    this.playerListElement.innerHTML = players.map(player => `
      <li class="player-item" data-player-id="${player.id}">
        <span class="player-name" ${gameStarted ? '' : 'contenteditable="true"'}>${player.name}</span>
        ${gameStarted ? '' : `<button class="btn btn-danger btn-sm remove-player" data-player-id="${player.id}">Remove</button>`}
      </li>
    `).join('');

    // Attach event listeners for player interactions
    if (!gameStarted) {
      this.attachPlayerEventListeners();
    }
  }

  /**
   * Attach event listeners for player list interactions
   */
  attachPlayerEventListeners() {
    // Remove player buttons
    this.playerListElement.querySelectorAll('.remove-player').forEach(button => {
      button.addEventListener('click', (e) => {
        const playerId = e.target.getAttribute('data-player-id');
        this.handleRemovePlayer(playerId);
      });
    });

    // Editable player names
    this.playerListElement.querySelectorAll('.player-name[contenteditable]').forEach(nameElement => {
      nameElement.addEventListener('blur', (e) => {
        const playerId = e.target.closest('.player-item').getAttribute('data-player-id');
        const newName = e.target.textContent.trim();
        this.handleEditPlayer(playerId, newName);
      });

      nameElement.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          e.target.blur();
        }
      });
    });
  }

  /**
   * Update the player count display
   */
  updatePlayerCount() {
    const countElement = this.container.querySelector('#player-count');
    const players = this.playerManager.getPlayers();
    countElement.textContent = players.length;
  }

  /**
   * Update game control buttons based on current state
   */
  updateGameControls() {
    const validation = this.playerManager.validatePlayerSetup();
    const gameStarted = this.playerManager.isGameStarted();
    
    this.startGameButton.disabled = !validation.isValid || gameStarted;
    
    if (gameStarted) {
      this.startGameButton.textContent = 'Game Started';
      this.addPlayerInput.disabled = true;
      this.container.querySelector('#add-player-btn').disabled = true;
    }
  }

  /**
   * Show error message
   * @param {string} message - Error message to display
   */
  showError(message) {
    const errorElement = this.container.querySelector('#error-message');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    
    // Auto-hide error after 5 seconds
    setTimeout(() => {
      this.clearError();
    }, 5000);
  }

  /**
   * Clear error message
   */
  clearError() {
    const errorElement = this.container.querySelector('#error-message');
    errorElement.style.display = 'none';
    errorElement.textContent = '';
  }

  /**
   * Callback for when game starts (to be overridden)
   */
  onGameStarted() {
    console.log('Game started with players:', this.playerManager.getPlayers());
    // Override this method to handle game start in your application
  }
}

module.exports = PlayerSetupUI;