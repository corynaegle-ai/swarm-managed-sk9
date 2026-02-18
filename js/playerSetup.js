class PlayerSetup {
    constructor() {
        this.players = [];
        this.minPlayers = 2;
        this.maxPlayers = 8;
        this.initializeEventListeners();
        this.updateDisplay();
    }

    initializeEventListeners() {
        const form = document.getElementById('playerForm');
        const playerNameInput = document.getElementById('playerName');

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = playerNameInput.value.trim();
            if (name) {
                const result = this.addPlayer(name);
                if (result.success) {
                    playerNameInput.value = '';
                    this.clearErrorMessage();
                } else {
                    this.showErrorMessage(result.error);
                }
            }
        });

        playerNameInput.addEventListener('input', () => {
            this.clearErrorMessage();
            playerNameInput.classList.remove('error');
        });
    }

    addPlayer(name) {
        // Validate input
        if (!name || name.trim() === '') {
            return {
                success: false,
                error: 'Player name is required and cannot be empty.'
            };
        }

        const trimmedName = name.trim();

        // Check for maximum players
        if (this.players.length >= this.maxPlayers) {
            return {
                success: false,
                error: `Maximum ${this.maxPlayers} players allowed.`
            };
        }

        // Check for duplicate names (case-insensitive)
        if (this.players.some(player => player.toLowerCase() === trimmedName.toLowerCase())) {
            return {
                success: false,
                error: 'Player name already exists. Please choose a different name.'
            };
        }

        // Add player
        this.players.push(trimmedName);
        this.updateDisplay();
        
        return {
            success: true,
            message: `Player "${trimmedName}" added successfully.`
        };
    }

    removePlayer(index) {
        if (index >= 0 && index < this.players.length) {
            const removedPlayer = this.players.splice(index, 1)[0];
            this.updateDisplay();
            return {
                success: true,
                message: `Player "${removedPlayer}" removed successfully.`
            };
        }
        return {
            success: false,
            error: 'Invalid player index.'
        };
    }

    validatePlayers() {
        const playerCount = this.players.length;
        
        if (playerCount < this.minPlayers) {
            return {
                valid: false,
                error: `At least ${this.minPlayers} players are required. Currently have ${playerCount}.`,
                type: 'insufficient'
            };
        }

        if (playerCount > this.maxPlayers) {
            return {
                valid: false,
                error: `Maximum ${this.maxPlayers} players allowed. Currently have ${playerCount}.`,
                type: 'exceeded'
            };
        }

        // Check for duplicate names (should not happen with proper add validation)
        const uniqueNames = new Set(this.players.map(name => name.toLowerCase()));
        if (uniqueNames.size !== this.players.length) {
            return {
                valid: false,
                error: 'Duplicate player names detected.',
                type: 'duplicates'
            };
        }

        // Check for empty names
        const emptyNames = this.players.filter(name => !name || name.trim() === '');
        if (emptyNames.length > 0) {
            return {
                valid: false,
                error: 'All players must have valid names.',
                type: 'empty_names'
            };
        }

        return {
            valid: true,
            message: `All ${playerCount} players are valid and ready to play!`
        };
    }

    updateDisplay() {
        this.updatePlayerList();
        this.updatePlayerCount();
        this.updateValidationMessage();
    }

    updatePlayerList() {
        const playerList = document.getElementById('playerList');
        
        if (this.players.length === 0) {
            playerList.innerHTML = '<li class="empty-state">No players added yet. Add some players to get started!</li>';
            return;
        }

        playerList.innerHTML = this.players
            .map((player, index) => `
                <li class="player-item">
                    <div style="display: flex; align-items: center;">
                        <span class="player-number">${index + 1}</span>
                        <span class="player-name">${this.escapeHtml(player)}</span>
                    </div>
                    <button class="btn btn-danger" onclick="playerSetup.removePlayer(${index})">Remove</button>
                </li>
            `)
            .join('');
    }

    updatePlayerCount() {
        const playerCountElement = document.getElementById('playerCount');
        playerCountElement.textContent = this.players.length;
    }

    updateValidationMessage() {
        const validationMessageElement = document.getElementById('validationMessage');
        const validation = this.validatePlayers();

        if (this.players.length === 0) {
            validationMessageElement.textContent = '';
            validationMessageElement.className = 'validation-message';
            return;
        }

        validationMessageElement.textContent = validation.valid ? validation.message : validation.error;
        
        if (validation.valid) {
            validationMessageElement.className = 'validation-message';
        } else {
            switch (validation.type) {
                case 'insufficient':
                    validationMessageElement.className = 'validation-message warning';
                    break;
                case 'exceeded':
                case 'duplicates':
                case 'empty_names':
                    validationMessageElement.className = 'validation-message error';
                    break;
                default:
                    validationMessageElement.className = 'validation-message error';
            }
        }
    }

    showErrorMessage(message) {
        const errorElement = document.getElementById('errorMessage');
        const playerNameInput = document.getElementById('playerName');
        
        errorElement.textContent = message;
        playerNameInput.classList.add('error');
    }

    clearErrorMessage() {
        const errorElement = document.getElementById('errorMessage');
        errorElement.textContent = '';
    }

    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // Utility methods for external access
    getPlayers() {
        return [...this.players]; // Return copy to prevent external modification
    }

    getPlayerCount() {
        return this.players.length;
    }

    isValid() {
        return this.validatePlayers().valid;
    }

    reset() {
        this.players = [];
        this.updateDisplay();
        this.clearErrorMessage();
    }
}