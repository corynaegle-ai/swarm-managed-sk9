/**
 * Main application controller that integrates player setup with game flow
 * Manages game state transitions between setup and playing phases
 */
class GameApp {
    constructor() {
        this.gameStarted = false; // Boolean flag to track game state
        this.playerSetup = null;
        this.finalPlayerList = []; // Store final player list for game
        
        this.init();
    }
    
    /**
     * Initialize the application
     */
    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupApp());
        } else {
            this.setupApp();
        }
    }
    
    /**
     * Setup the application after DOM is ready
     */
    setupApp() {
        // Initialize player setup
        this.playerSetup = new PlayerSetup();
        
        // Setup event listeners
        this.setupEventListeners();
        
        console.log('Game application initialized');
    }
    
    /**
     * Setup event listeners for the application
     */
    setupEventListeners() {
        const startGameBtn = document.getElementById('start-game-btn');
        
        if (startGameBtn) {
            startGameBtn.addEventListener('click', () => this.handleStartGame());
        }
    }
    
    /**
     * Handle Start Game button click
     * Validates players and transitions to game mode
     */
    handleStartGame() {
        try {
            // Validate player count before proceeding
            if (!this.validatePlayerCount()) {
                return;
            }
            
            // Get final player list from PlayerSetup
            this.finalPlayerList = this.playerSetup.getPlayers();
            
            // Transition to game mode
            this.startGame();
            
        } catch (error) {
            console.error('Error starting game:', error);
            this.showError('An error occurred while starting the game. Please try again.');
        }
    }
    
    /**
     * Validate that there are enough players to start the game
     * @returns {boolean} True if validation passes
     */
    validatePlayerCount() {
        const players = this.playerSetup.getPlayers();
        
        // Clear any existing error messages
        this.hideError();
        
        // Check minimum player count (at least 2 players required)
        if (players.length < 2) {
            this.showError('At least 2 players are required to start the game.');
            return false;
        }
        
        // Check maximum player count (reasonable limit)
        if (players.length > 8) {
            this.showError('Maximum of 8 players allowed.');
            return false;
        }
        
        return true;
    }
    
    /**
     * Start the game - transition from setup to playing phase
     */
    startGame() {
        // Update game state
        this.gameStarted = true;
        
        // Hide player setup form
        this.hidePlayerSetup();
        
        // Show game area
        this.showGameArea();
        
        // Display final player list in game area
        this.displayGamePlayers();
        
        // Prevent further player modifications
        this.lockPlayerModifications();
        
        console.log('Game started with players:', this.finalPlayerList);
    }
    
    /**
     * Hide the player setup section
     */
    hidePlayerSetup() {
        const setupSection = document.getElementById('player-setup-section');
        if (setupSection) {
            setupSection.classList.add('hidden');
        }
    }
    
    /**
     * Show the game area
     */
    showGameArea() {
        const gameArea = document.getElementById('game-area');
        if (gameArea) {
            gameArea.classList.remove('hidden');
        }
    }
    
    /**
     * Display the final player list in the game area
     */
    displayGamePlayers() {
        const gamePlayersList = document.getElementById('game-players-list');
        if (gamePlayersList) {
            gamePlayersList.innerHTML = '';
            
            this.finalPlayerList.forEach((player, index) => {
                const playerDiv = document.createElement('div');
                playerDiv.className = 'player-item';
                playerDiv.textContent = `${index + 1}. ${player.name}`;
                gamePlayersList.appendChild(playerDiv);
            });
        }
    }
    
    /**
     * Lock player modifications by disabling PlayerSetup functionality
     */
    lockPlayerModifications() {
        if (this.playerSetup) {
            // Disable the PlayerSetup instance to prevent modifications
            this.playerSetup.disable();
        }
    }
    
    /**
     * Show error message to user
     * @param {string} message - Error message to display
     */
    showError(message) {
        const errorDiv = document.getElementById('error-message');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.classList.remove('hidden');
        }
    }
    
    /**
     * Hide error message
     */
    hideError() {
        const errorDiv = document.getElementById('error-message');
        if (errorDiv) {
            errorDiv.classList.add('hidden');
        }
    }
    
    /**
     * Get the current game state
     * @returns {boolean} True if game has started, false if in setup mode
     */
    isGameStarted() {
        return this.gameStarted;
    }
    
    /**
     * Get the final player list (available after game starts)
     * @returns {Array} Array of player objects
     */
    getFinalPlayerList() {
        return [...this.finalPlayerList]; // Return copy to prevent external modifications
    }
    
    /**
     * Get reference to PlayerSetup instance
     * @returns {PlayerSetup|null} PlayerSetup instance or null if not initialized
     */
    getPlayerSetup() {
        return this.playerSetup;
    }
}

// Initialize the application
const gameApp = new GameApp();