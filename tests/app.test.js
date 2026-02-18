import { SkullKingGame } from '../js/app.js';
import { RoundManager } from '../js/RoundManager.js';

describe('SkullKingGame Integration', () => {
    let game;
    let mockRoundManager;

    beforeEach(() => {
        document.body.innerHTML = '';
        game = new SkullKingGame();
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });

    test('should initialize with RoundManager integration', () => {
        expect(game.roundManager).toBeInstanceOf(RoundManager);
        expect(game.getCurrentRound()).toBe(1);
    });

    test('should update round display when round changes', () => {
        const roundDisplay = document.getElementById('round-display');
        expect(roundDisplay.textContent).toBe('Round 1 of 10');
        
        // Complete all hands for round 1
        game.completeCurrentHand();
        game.advanceToNextRound();
        
        expect(roundDisplay.textContent).toBe('Round 2 of 10');
    });

    test('should enable next round button only when all hands completed', () => {
        const nextRoundBtn = document.getElementById('next-round-btn');
        
        // Initially disabled (0/1 hands completed)
        expect(nextRoundBtn.disabled).toBe(true);
        
        // Complete the hand
        game.completeCurrentHand();
        
        // Should be enabled now
        expect(nextRoundBtn.disabled).toBe(false);
    });

    test('should integrate hand scoring with round progression', () => {
        const initialHands = game.roundManager.getCompletedHands();
        
        game.completeCurrentHand();
        
        expect(game.roundManager.getCompletedHands()).toBe(initialHands + 1);
    });

    test('should end game after round 10 completion', () => {
        // Simulate completing all 10 rounds
        for (let round = 1; round <= 10; round++) {
            // Complete required hands for current round
            for (let hand = 0; hand < round; hand++) {
                game.completeCurrentHand();
            }
            
            if (round < 10) {
                game.advanceToNextRound();
            }
        }
        
        // Game should end after round 10
        expect(game.isGameEnded()).toBe(true);
        
        const gameEndScreen = document.getElementById('game-end-screen');
        expect(gameEndScreen.style.display).toBe('block');
    });

    test('should update hands display correctly', () => {
        const handsDisplay = document.getElementById('hands-completed');
        expect(handsDisplay.textContent).toBe('Hands: 0/1');
        
        game.completeCurrentHand();
        expect(handsDisplay.textContent).toBe('Hands: 1/1');
    });

    test('should handle round transitions properly', () => {
        // Complete round 1
        game.completeCurrentHand();
        game.advanceToNextRound();
        
        expect(game.getCurrentRound()).toBe(2);
        expect(game.roundManager.getCompletedHands()).toBe(0); // Reset for new round
        
        const handsDisplay = document.getElementById('hands-completed');
        expect(handsDisplay.textContent).toBe('Hands: 0/2');
    });
});