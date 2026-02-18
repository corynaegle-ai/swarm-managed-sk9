class BiddingManager {
    constructor() {
        this.gameState = window.gameState;
        this.currentRound = this.gameState.getCurrentRound();
        this.availableHands = this.currentRound;
        this.bids = {};
        this.isEditMode = true;
        this.init();
    }

    init() {
        this.updateRoundDisplay();
        this.generatePlayerBidInputs();
        this.attachEventListeners();
        this.initializeBids();
    }

    updateRoundDisplay() {
        document.getElementById('round-number').textContent = this.currentRound;
        document.getElementById('available-hands').textContent = this.availableHands;
    }

    generatePlayerBidInputs() {
        const playerBidsContainer = document.getElementById('player-bids');
        const players = this.gameState.getPlayers();

        playerBidsContainer.innerHTML = '';

        players.forEach((player, index) => {
            const playerBidDiv = document.createElement('div');
            playerBidDiv.className = 'player-bid';
            playerBidDiv.innerHTML = `
                <label for="bid-player-${index}">${player.name}:</label>
                <input 
                    type="number" 
                    id="bid-player-${index}" 
                    name="bid-player-${index}"
                    min="0" 
                    max="${this.availableHands}" 
                    value="0"
                    required
                    data-player-index="${index}"
                >
                <span class="error-message" id="error-player-${index}"></span>
            `;
            playerBidsContainer.appendChild(playerBidDiv);
        });
    }

    initializeBids() {
        const players = this.gameState.getPlayers();
        players.forEach((player, index) => {
            this.bids[index] = 0;
        });
    }

    attachEventListeners() {
        // Input validation on change
        document.getElementById('player-bids').addEventListener('input', (e) => {
            if (e.target.type === 'number') {
                this.handleBidInput(e.target);
            }
        });

        // Confirm bids button
        document.getElementById('confirm-bids-btn').addEventListener('click', () => {
            if (this.isEditMode) {
                this.showBidReview();
            } else {
                this.confirmBids();
            }
        });

        // Edit bids button
        document.getElementById('edit-bids-btn').addEventListener('click', () => {
            this.enableEditMode();
        });

        // Back to game button
        document.getElementById('back-to-game-btn').addEventListener('click', () => {
            this.backToGame();
        });

        // Form submission prevention
        document.getElementById('bidding-form').addEventListener('submit', (e) => {
            e.preventDefault();
        });
    }

    handleBidInput(input) {
        const playerIndex = parseInt(input.dataset.playerIndex);
        const bidValue = parseInt(input.value) || 0;
        const errorElement = document.getElementById(`error-player-${playerIndex}`);

        // Clear previous error
        errorElement.textContent = '';
        input.classList.remove('error');

        // Validate bid
        if (bidValue < 0) {
            this.showError(input, errorElement, 'Bid cannot be negative');
            return false;
        }

        if (bidValue > this.availableHands) {
            this.showError(input, errorElement, `Bid cannot exceed ${this.availableHands} hands`);
            return false;
        }

        // Store valid bid
        this.bids[playerIndex] = bidValue;
        this.updateConfirmButtonState();
        return true;
    }

    showError(input, errorElement, message) {
        input.classList.add('error');
        errorElement.textContent = message;
    }

    updateConfirmButtonState() {
        const confirmBtn = document.getElementById('confirm-bids-btn');
        const allInputsValid = this.validateAllBids();
        confirmBtn.disabled = !allInputsValid;
    }

    validateAllBids() {
        const players = this.gameState.getPlayers();
        
        for (let i = 0; i < players.length; i++) {
            const input = document.getElementById(`bid-player-${i}`);
            const bidValue = parseInt(input.value) || 0;
            
            if (bidValue < 0 || bidValue > this.availableHands) {
                return false;
            }
        }
        return true;
    }

    showBidReview() {
        if (!this.validateAllBids()) {
            alert('Please fix all bid validation errors before proceeding.');
            return;
        }

        // Update bids from form
        this.collectBidsFromForm();
        
        // Hide form, show review
        document.getElementById('bidding-form').style.display = 'none';
        document.getElementById('bid-review').style.display = 'block';
        
        // Update buttons
        document.getElementById('edit-bids-btn').style.display = 'inline-block';
        document.getElementById('confirm-bids-btn').textContent = 'Final Confirm';
        
        this.isEditMode = false;
        this.displayBidSummary();
    }

    collectBidsFromForm() {
        const players = this.gameState.getPlayers();
        players.forEach((player, index) => {
            const input = document.getElementById(`bid-player-${index}`);
            this.bids[index] = parseInt(input.value) || 0;
        });
    }

    displayBidSummary() {
        const summaryContainer = document.getElementById('bid-summary');
        const players = this.gameState.getPlayers();
        
        let summaryHTML = '<ul>';
        players.forEach((player, index) => {
            summaryHTML += `<li><strong>${player.name}:</strong> ${this.bids[index]} ${this.bids[index] === 1 ? 'hand' : 'hands'}</li>`;
        });
        summaryHTML += '</ul>';
        
        summaryContainer.innerHTML = summaryHTML;
    }

    enableEditMode() {
        // Show form, hide review
        document.getElementById('bidding-form').style.display = 'block';
        document.getElementById('bid-review').style.display = 'none';
        
        // Update buttons
        document.getElementById('edit-bids-btn').style.display = 'none';
        document.getElementById('confirm-bids-btn').textContent = 'Confirm Bids';
        
        this.isEditMode = true;
        
        // Restore form values
        const players = this.gameState.getPlayers();
        players.forEach((player, index) => {
            const input = document.getElementById(`bid-player-${index}`);
            input.value = this.bids[index];
        });
    }

    confirmBids() {
        try {
            // Store bids in gameState
            this.gameState.setCurrentRoundBids(this.bids);
            
            // Navigate back to main game
            this.backToGame();
        } catch (error) {
            console.error('Error confirming bids:', error);
            alert('Error saving bids. Please try again.');
        }
    }

    backToGame() {
        // Navigate back to main game
        window.location.href = 'index.html';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new BiddingManager();
});