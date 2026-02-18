/**
 * Player Manager for Scorekeeper Game
 * Handles player setup, validation, and game state management
 */

class PlayerManager {
  constructor() {
    this.players = [];
    this.gameStarted = false;
    this.minPlayers = 2;
    this.maxPlayers = 8;
  }

  /**
   * Add a new player to the game
   * @param {string} name - Player name
   * @returns {Object} Success/error result
   */
  addPlayer(name) {
    if (this.gameStarted) {
      return {
        success: false,
        error: 'Cannot modify players after game has started'
      };
    }

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return {
        success: false,
        error: 'Player name is required'
      };
    }

    const trimmedName = name.trim();
    
    if (this.players.length >= this.maxPlayers) {
      return {
        success: false,
        error: `Maximum of ${this.maxPlayers} players allowed`
      };
    }

    if (this.isDuplicateName(trimmedName)) {
      return {
        success: false,
        error: 'Player name already exists'
      };
    }

    const player = {
      id: this.generatePlayerId(),
      name: trimmedName,
      score: 0
    };

    this.players.push(player);
    
    return {
      success: true,
      player: player
    };
  }

  /**
   * Remove a player from the game
   * @param {string} playerId - Player ID to remove
   * @returns {Object} Success/error result
   */
  removePlayer(playerId) {
    if (this.gameStarted) {
      return {
        success: false,
        error: 'Cannot modify players after game has started'
      };
    }

    const playerIndex = this.players.findIndex(p => p.id === playerId);
    
    if (playerIndex === -1) {
      return {
        success: false,
        error: 'Player not found'
      };
    }

    const removedPlayer = this.players.splice(playerIndex, 1)[0];
    
    return {
      success: true,
      removedPlayer: removedPlayer
    };
  }

  /**
   * Edit a player's name
   * @param {string} playerId - Player ID to edit
   * @param {string} newName - New player name
   * @returns {Object} Success/error result
   */
  editPlayer(playerId, newName) {
    if (this.gameStarted) {
      return {
        success: false,
        error: 'Cannot modify players after game has started'
      };
    }

    if (!newName || typeof newName !== 'string' || newName.trim() === '') {
      return {
        success: false,
        error: 'Player name is required'
      };
    }

    const trimmedName = newName.trim();
    const player = this.players.find(p => p.id === playerId);
    
    if (!player) {
      return {
        success: false,
        error: 'Player not found'
      };
    }

    // Check for duplicates, excluding the current player
    if (this.players.some(p => p.id !== playerId && p.name.toLowerCase() === trimmedName.toLowerCase())) {
      return {
        success: false,
        error: 'Player name already exists'
      };
    }

    player.name = trimmedName;
    
    return {
      success: true,
      player: player
    };
  }

  /**
   * Start the game (locks player modifications)
   * @returns {Object} Success/error result
   */
  startGame() {
    if (this.players.length < this.minPlayers) {
      return {
        success: false,
        error: `At least ${this.minPlayers} players required to start game`
      };
    }

    if (this.players.length > this.maxPlayers) {
      return {
        success: false,
        error: `Maximum of ${this.maxPlayers} players allowed`
      };
    }

    this.gameStarted = true;
    
    return {
      success: true,
      message: 'Game started successfully'
    };
  }

  /**
   * Get all players
   * @returns {Array} Array of player objects
   */
  getPlayers() {
    return [...this.players];
  }

  /**
   * Check if game has started
   * @returns {boolean} Game started status
   */
  isGameStarted() {
    return this.gameStarted;
  }

  /**
   * Validate current player setup
   * @returns {Object} Validation result
   */
  validatePlayerSetup() {
    const errors = [];
    
    if (this.players.length < this.minPlayers) {
      errors.push(`At least ${this.minPlayers} players required`);
    }
    
    if (this.players.length > this.maxPlayers) {
      errors.push(`Maximum of ${this.maxPlayers} players allowed`);
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * Reset player manager (for new game)
   */
  reset() {
    this.players = [];
    this.gameStarted = false;
  }

  /**
   * Check if a name is duplicate (case-insensitive)
   * @param {string} name - Name to check
   * @returns {boolean} True if duplicate exists
   */
  isDuplicateName(name) {
    return this.players.some(player => 
      player.name.toLowerCase() === name.toLowerCase()
    );
  }

  /**
   * Generate unique player ID
   * @returns {string} Unique player ID
   */
  generatePlayerId() {
    return `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

module.exports = PlayerManager;