/**
 * RoundManager class for managing round state and progression logic
 * Handles rounds 1-10 where round N allows N maximum hands
 */
class RoundManager {
    constructor() {
        this.currentRound = 1;
        this.completedHands = 0;
    }

    /**
     * Get the current round number
     * @returns {number} Current round (1-10)
     */
    getCurrentRound() {
        return this.currentRound;
    }

    /**
     * Get maximum hands allowed for current round
     * @returns {number} Max hands (equals current round number)
     */
    getMaxHands() {
        return this.currentRound;
    }

    /**
     * Get number of completed hands in current round
     * @returns {number} Completed hands count
     */
    getCompletedHands() {
        return this.completedHands;
    }

    /**
     * Check if round can advance (all hands are scored)
     * @returns {boolean} True if all hands completed and scored
     */
    canAdvanceRound() {
        return this.completedHands >= this.getMaxHands();
    }

    /**
     * Advance to next round and reset hand counter
     * @returns {boolean} True if successfully advanced, false if at max round
     */
    advanceRound() {
        if (this.currentRound >= 10) {
            return false; // Already at maximum round
        }
        
        if (!this.canAdvanceRound()) {
            throw new Error(`Cannot advance round: ${this.completedHands}/${this.getMaxHands()} hands completed`);
        }

        this.currentRound++;
        this.completedHands = 0;
        return true;
    }

    /**
     * Reset current round state
     */
    resetRound() {
        this.completedHands = 0;
    }

    /**
     * Mark a hand as completed (for scoring)
     */
    completeHand() {
        if (this.completedHands < this.getMaxHands()) {
            this.completedHands++;
        }
    }

    /**
     * Reset to round 1
     */
    resetGame() {
        this.currentRound = 1;
        this.completedHands = 0;
    }

    /**
     * Validate round bounds
     * @param {number} round - Round number to validate
     * @returns {boolean} True if valid round (1-10)
     */
    isValidRound(round) {
        return Number.isInteger(round) && round >= 1 && round <= 10;
    }
}

// Export RoundManager class
export default RoundManager;