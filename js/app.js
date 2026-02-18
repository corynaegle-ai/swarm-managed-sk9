// Main game application logic with round management integration
import { RoundManager } from './RoundManager.js';
import { HandManager } from './HandManager.js';
import { ScoreManager } from './ScoreManager.js';

class SkullKingGame {
    constructor() {
        this.roundManager = new RoundManager();
        this.handManager = new HandManager();
        this.scoreManager = new ScoreManager();
        this.gameEnded = false;
        
        this.initializeDOM();
        this.setupEventListeners();
        this.updateDisplay();
    }

    initializeDOM() {
        // Create main game container if it doesn't exist
        if (!document.getElementById('game-container')) {
            const container = document.createElement('div');
            container.id = 'game-container';
            container.innerHTML = `
                <div class="game-header">
                    <h1>Skull King</h1>
                    <div id="round-display">Round 1 of 10</div>
                    <div id="hands-completed">Hands: 0/1</div>
                </div>
                <div class="game-content">
                    <div id="current-hand-info"></div>
                    <div id="score-display"></div>
                    <button id="next-round-btn" disabled>Next Round</button>
                    <button id="score-hand-btn">Complete Hand</button>
                </div>
                <div id="game-end-screen" style="display: none;">
                    <h2>Game Complete!</h2>
                    <div id="final-scores"></div>
                    <button id="new-game-btn">New Game</button>
                </div>
            `;
            document.body.appendChild(container);
        }
    }

    setupEventListeners() {
        // Next round button handler
        const nextRoundBtn = document.getElementById('next-round-btn');
        if (nextRoundBtn) {
            nextRoundBtn.addEventListener('click', () => {
                this.advanceToNextRound();
            });
        }

        // Score hand button handler
        const scoreHandBtn = document.getElementById('score-hand-btn');
        if (scoreHandBtn) {
            scoreHandBtn.addEventListener('click', () => {
                this.completeCurrentHand();
            });
        }

        // New game button handler
        const newGameBtn = document.getElementById('new-game-btn');
        if (newGameBtn) {
            newGameBtn.addEventListener('click', () => {
                this.startNewGame();
            });
        }

        // Listen for round state changes
        this.roundManager.addEventListener('roundChanged', (event) => {
            this.onRoundChanged(event.detail);
        });

        this.roundManager.addEventListener('gameEnded', () => {
            this.onGameEnded();
        });
    }

    updateDisplay() {
        this.updateRoundDisplay();
        this.updateHandsDisplay();
        this.updateNextRoundButton();
    }

    updateRoundDisplay() {
        const roundDisplay = document.getElementById('round-display');
        if (roundDisplay) {
            const currentRound = this.roundManager.getCurrentRound();
            roundDisplay.textContent = `Round ${currentRound} of 10`;
        }
    }

    updateHandsDisplay() {
        const handsDisplay = document.getElementById('hands-completed');
        if (handsDisplay) {
            const currentRound = this.roundManager.getCurrentRound();
            const completedHands = this.roundManager.getCompletedHands();
            handsDisplay.textContent = `Hands: ${completedHands}/${currentRound}`;
        }
    }

    updateNextRoundButton() {
        const nextRoundBtn = document.getElementById('next-round-btn');
        if (nextRoundBtn) {
            const canAdvance = this.roundManager.canAdvanceRound();
            nextRoundBtn.disabled = !canAdvance;
            nextRoundBtn.textContent = canAdvance ? 'Next Round' : `Complete ${this.roundManager.getRemainingHands()} more hands`;
        }
    }

    completeCurrentHand() {
        try {
            // Simulate hand completion with some scoring
            const handScore = this.generateHandScore();
            
            // Update hand manager
            this.handManager.completeHand(handScore);
            
            // Increment completed hands in round manager
            this.roundManager.incrementCompletedHands();
            
            // Update display
            this.updateDisplay();
            
            console.log(`Hand completed with score: ${handScore}`);
        } catch (error) {
            console.error('Error completing hand:', error);
        }
    }

    generateHandScore() {
        // Simple scoring simulation - in real game this would come from actual gameplay
        return Math.floor(Math.random() * 20) + 1;
    }

    advanceToNextRound() {
        try {
            if (this.roundManager.canAdvanceRound()) {
                this.roundManager.advanceRound();
            } else {
                console.warn('Cannot advance round - not all hands completed');
            }
        } catch (error) {
            console.error('Error advancing round:', error);
        }
    }

    onRoundChanged(roundData) {
        console.log(`Advanced to round ${roundData.currentRound}`);
        
        // Reset hand manager for new round
        this.handManager.resetForNewRound(roundData.currentRound);
        
        // Update all displays
        this.updateDisplay();
        
        // Show round transition message
        this.showRoundTransition(roundData.currentRound);
    }

    showRoundTransition(roundNumber) {
        const currentHandInfo = document.getElementById('current-hand-info');
        if (currentHandInfo) {
            currentHandInfo.innerHTML = `<div class="round-transition">Starting Round ${roundNumber}</div>`;
            setTimeout(() => {
                currentHandInfo.innerHTML = '';
            }, 2000);
        }
    }

    onGameEnded() {
        console.log('Game ended after 10 rounds');
        this.gameEnded = true;
        this.showGameEndScreen();
    }

    showGameEndScreen() {
        const gameEndScreen = document.getElementById('game-end-screen');
        const gameContent = document.querySelector('.game-content');
        
        if (gameEndScreen && gameContent) {
            // Hide main game content
            gameContent.style.display = 'none';
            
            // Show end screen
            gameEndScreen.style.display = 'block';
            
            // Update final scores
            const finalScores = document.getElementById('final-scores');
            if (finalScores) {
                finalScores.innerHTML = this.generateFinalScoreDisplay();
            }
        }
    }

    generateFinalScoreDisplay() {
        const totalScore = this.scoreManager.getTotalScore();
        return `
            <div class="final-score">
                <h3>Final Score: ${totalScore}</h3>
                <p>Rounds Completed: 10/10</p>
                <p>Total Hands Played: ${this.getTotalHandsPlayed()}</p>
            </div>
        `;
    }

    getTotalHandsPlayed() {
        // Sum of hands from round 1 to 10 (1+2+3+...+10 = 55)
        return 55;
    }

    startNewGame() {
        // Reset all managers
        this.roundManager = new RoundManager();
        this.handManager = new HandManager();
        this.scoreManager = new ScoreManager();
        this.gameEnded = false;
        
        // Hide end screen and show game content
        const gameEndScreen = document.getElementById('game-end-screen');
        const gameContent = document.querySelector('.game-content');
        
        if (gameEndScreen && gameContent) {
            gameEndScreen.style.display = 'none';
            gameContent.style.display = 'block';
        }
        
        // Re-setup event listeners for new managers
        this.setupEventListeners();
        
        // Update display
        this.updateDisplay();
        
        console.log('New game started');
    }

    // Public API methods
    getCurrentRound() {
        return this.roundManager.getCurrentRound();
    }

    isGameEnded() {
        return this.gameEnded;
    }

    getGameState() {
        return {
            currentRound: this.roundManager.getCurrentRound(),
            completedHands: this.roundManager.getCompletedHands(),
            canAdvanceRound: this.roundManager.canAdvanceRound(),
            gameEnded: this.gameEnded,
            totalScore: this.scoreManager.getTotalScore()
        };
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.skullKingGame = new SkullKingGame();
    console.log('Skull King game initialized');
});

// Export for testing
export { SkullKingGame };