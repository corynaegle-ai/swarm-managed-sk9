// Tests for main.js GameController integration
const { GameController } = require('../js/main.js');

// Mock DOM elements
class MockElement {
    constructor(tagName = 'div') {
        this.tagName = tagName;
        this.textContent = '';
        this.innerHTML = '';
        this.className = '';
        this.style = { display: 'block' };
        this.dataset = {};
        this.classList = {
            add: (className) => {
                this.className += ` ${className}`;
            },
            remove: (className) => {
                this.className = this.className.replace(className, '').trim();
            },
            contains: (className) => {
                return this.className.includes(className);
            }
        };
        this.eventListeners = {};
    }
    
    addEventListener(event, handler) {
        if (!this.eventListeners[event]) {
            this.eventListeners[event] = [];
        }
        this.eventListeners[event].push(handler);
    }
    
    dispatchEvent(event) {
        const eventType = event.type || event;
        if (this.eventListeners[eventType]) {
            this.eventListeners[eventType].forEach(handler => handler(event));
        }
    }
    
    appendChild(child) {
        // Mock implementation
    }
    
    querySelector(selector) {
        return new MockElement();
    }
    
    querySelectorAll(selector) {
        return [new MockElement(), new MockElement()];
    }
}

// Mock global objects
global.document = {
    getElementById: (id) => new MockElement(),
    querySelectorAll: (selector) => [new MockElement(), new MockElement()],
    createElement: (tagName) => new MockElement(tagName),
    addEventListener: (event, handler) => {}
};

global.window = {};
global.console = { error: jest.fn(), log: jest.fn() };
global.setTimeout = (fn, delay) => fn();

// Mock ScoreTracker
class MockScoreTracker {
    constructor(players) {
        this.players = players;
        this.scores = {};
        players.forEach(player => {
            this.scores[player] = {};
        });
    }
    
    addPlayer(playerId) {
        this.scores[playerId] = {};
    }
    
    updateScore(playerId, round, score) {
        if (!this.scores[playerId]) {
            this.scores[playerId] = {};
        }
        this.scores[playerId][round] = score;
    }
    
    getTotalScores() {
        const totals = {};
        Object.keys(this.scores).forEach(player => {
            totals[player] = Object.values(this.scores[player]).reduce((sum, score) => sum + score, 0);
        });
        return totals;
    }
    
    getCurrentStandings() {
        const totals = this.getTotalScores();
        return Object.entries(totals)
            .map(([playerId, totalScore]) => ({ playerId, totalScore }))
            .sort((a, b) => b.totalScore - a.totalScore);
    }
    
    getRoundBreakdown() {
        return this.scores;
    }
}

global.ScoreTracker = MockScoreTracker;

describe('GameController', () => {
    let gameController;
    
    beforeEach(() => {
        gameController = new GameController();
    });
    
    describe('Initialization', () => {
        test('should initialize with default values', () => {
            expect(gameController.scoreTracker).toBeNull();
            expect(gameController.currentRound).toBe(0);
            expect(gameController.gameActive).toBe(false);
            expect(Array.isArray(gameController.players)).toBe(true);
        });
    });
    
    describe('Score Validation', () => {
        test('should validate numeric scores', () => {
            expect(gameController.validateScore('10')).toBe(10);
            expect(gameController.validateScore('15.5')).toBe(15.5);
        });
        
        test('should reject invalid scores', () => {
            expect(() => gameController.validateScore('abc')).toThrow('Score must be a valid number');
            expect(() => gameController.validateScore('-5')).toThrow('Score cannot be negative');
            expect(() => gameController.validateScore('1001')).toThrow('Score cannot exceed 1000');
        });
    });
    
    describe('Game Flow', () => {
        beforeEach(() => {
            gameController.players = ['Alice', 'Bob'];
        });
        
        test('should start game with valid players', () => {
            gameController.startGame();
            
            expect(gameController.gameActive).toBe(true);
            expect(gameController.currentRound).toBe(1);
            expect(gameController.scoreTracker).toBeInstanceOf(MockScoreTracker);
        });
        
        test('should not start game with insufficient players', () => {
            gameController.players = ['Alice'];
            
            gameController.startGame();
            
            expect(gameController.gameActive).toBe(false);
            expect(gameController.scoreTracker).toBeNull();
        });
        
        test('should end game and display final rankings', () => {
            gameController.startGame();
            gameController.endGame();
            
            expect(gameController.gameActive).toBe(false);
        });
    });
    
    describe('Score Updates', () => {
        beforeEach(() => {
            gameController.players = ['Alice', 'Bob'];
            gameController.startGame();
        });
        
        test('should update scores through input handler', () => {
            const mockInput = {
                dataset: { playerId: 'Alice', round: '1' },
                value: '15',
                classList: { add: jest.fn(), remove: jest.fn() }
            };
            
            gameController.handleScoreInput(mockInput);
            
            const totalScores = gameController.scoreTracker.getTotalScores();
            expect(totalScores['Alice']).toBe(15);
        });
        
        test('should handle invalid score input', () => {
            const mockInput = {
                dataset: { playerId: 'Alice', round: '1' },
                value: 'invalid',
                classList: { add: jest.fn(), remove: jest.fn() }
            };
            
            gameController.handleScoreInput(mockInput);
            
            expect(mockInput.classList.add).toHaveBeenCalledWith('error');
        });
    });
    
    describe('Display Updates', () => {
        beforeEach(() => {
            gameController.players = ['Alice', 'Bob'];
            gameController.startGame();
        });
        
        test('should update score display without errors', () => {
            expect(() => gameController.updateScoreDisplay()).not.toThrow();
        });
        
        test('should highlight leader', () => {
            // Add some scores
            gameController.scoreTracker.updateScore('Alice', 1, 20);
            gameController.scoreTracker.updateScore('Bob', 1, 15);
            
            expect(() => gameController.highlightLeader()).not.toThrow();
        });
        
        test('should display final rankings', () => {
            gameController.scoreTracker.updateScore('Alice', 1, 20);
            gameController.scoreTracker.updateScore('Bob', 1, 15);
            
            expect(() => gameController.displayFinalRankings()).not.toThrow();
        });
    });
    
    describe('Player Management', () => {
        test('should add new player', () => {
            global.document.getElementById = (id) => {
                if (id === 'new-player-name') {
                    return { value: 'Charlie' };
                }
                return new MockElement();
            };
            
            const initialPlayerCount = gameController.players.length;
            gameController.addPlayer();
            
            expect(gameController.players.length).toBe(initialPlayerCount + 1);
            expect(gameController.players).toContain('Charlie');
        });
    });
});

describe('Integration Tests', () => {
    test('should complete full game flow', () => {
        const gameController = new GameController();
        gameController.players = ['Alice', 'Bob', 'Charlie'];
        
        // Start game
        gameController.startGame();
        expect(gameController.gameActive).toBe(true);
        
        // Add scores for round 1
        gameController.scoreTracker.updateScore('Alice', 1, 20);
        gameController.scoreTracker.updateScore('Bob', 1, 15);
        gameController.scoreTracker.updateScore('Charlie', 1, 18);
        
        // Check standings
        const standings = gameController.scoreTracker.getCurrentStandings();
        expect(standings[0].playerId).toBe('Alice');
        expect(standings[0].totalScore).toBe(20);
        
        // Complete round
        gameController.completeRound();
        expect(gameController.currentRound).toBe(2);
        
        // End game
        gameController.endGame();
        expect(gameController.gameActive).toBe(false);
    });
});