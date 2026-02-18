/**
 * Tests for scoring system
 */

const { calculateRoundScore, calculateGameScore, formatScoreDisplay } = require('../js/scoring.js');

describe('Scoring System', () => {
    describe('calculateRoundScore', () => {
        test('applies bonus when bid equals actual', () => {
            const player = { bid: 3, actual: 3, bonus: 10 };
            const result = calculateRoundScore(player);
            
            expect(result.bonusApplied).toBe(10);
            expect(result.bonusStatus).toBe('applied');
            expect(result.totalScore).toBe(13); // 3 base + 10 bonus
            expect(result.bidMatched).toBe(true);
        });

        test('ignores bonus when bid does not equal actual', () => {
            const player = { bid: 3, actual: 2, bonus: 10 };
            const result = calculateRoundScore(player);
            
            expect(result.bonusApplied).toBe(0);
            expect(result.bonusStatus).toBe('ignored');
            expect(result.totalScore).toBe(2); // 2 base + 0 bonus
            expect(result.bidMatched).toBe(false);
        });

        test('handles zero bonus correctly', () => {
            const player = { bid: 2, actual: 2, bonus: 0 };
            const result = calculateRoundScore(player);
            
            expect(result.bonusApplied).toBe(0);
            expect(result.bonusStatus).toBe('applied');
            expect(result.totalScore).toBe(2);
        });

        test('throws error for invalid input', () => {
            expect(() => calculateRoundScore({})).toThrow();
            expect(() => calculateRoundScore(null)).toThrow();
        });
    });

    describe('formatScoreDisplay', () => {
        test('formats applied bonus correctly', () => {
            const scoreResult = {
                baseScore: 3,
                bonusPoints: 10,
                bonusApplied: 10,
                bonusStatus: 'applied',
                totalScore: 13
            };
            
            const display = formatScoreDisplay(scoreResult);
            expect(display.bonusStatusText).toBe('+10 bonus');
            expect(display.bonusStatusClass).toBe('bonus-applied');
            expect(display.showBonusIndicator).toBe(true);
        });

        test('formats ignored bonus correctly', () => {
            const scoreResult = {
                baseScore: 2,
                bonusPoints: 10,
                bonusApplied: 0,
                bonusStatus: 'ignored',
                totalScore: 2
            };
            
            const display = formatScoreDisplay(scoreResult);
            expect(display.bonusStatusText).toBe('10 bonus ignored');
            expect(display.bonusStatusClass).toBe('bonus-ignored');
            expect(display.showBonusIndicator).toBe(true);
        });
    });
});