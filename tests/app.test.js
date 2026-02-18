/**
 * Tests for GameApp class
 */
describe('GameApp', () => {
    let gameApp;
    let mockPlayerSetup;
    
    beforeEach(() => {
        // Mock DOM elements
        document.body.innerHTML = `
            <div id="player-setup-section"></div>
            <div id="game-area" class="hidden"></div>
            <div id="error-message" class="hidden"></div>
            <div id="game-players-list"></div>
            <button id="start-game-btn">Start Game</button>
        `;
        
        // Mock PlayerSetup class
        mockPlayerSetup = {
            getPlayers: jest.fn(),
            disable: jest.fn()
        };
        
        global.PlayerSetup = jest.fn(() => mockPlayerSetup);
        
        gameApp = new GameApp();
        gameApp.setupApp();
    });
    
    afterEach(() => {
        jest.clearAllMocks();
    });
    
    describe('Player validation', () => {
        test('should reject less than 2 players', () => {
            mockPlayerSetup.getPlayers.mockReturnValue([{ name: 'Player1' }]);
            
            const result = gameApp.validatePlayerCount();
            
            expect(result).toBe(false);
            expect(document.getElementById('error-message').textContent).toContain('At least 2 players');
        });
        
        test('should accept 2-8 players', () => {
            mockPlayerSetup.getPlayers.mockReturnValue([
                { name: 'Player1' },
                { name: 'Player2' }
            ]);
            
            const result = gameApp.validatePlayerCount();
            
            expect(result).toBe(true);
        });
        
        test('should reject more than 8 players', () => {
            const players = Array.from({ length: 9 }, (_, i) => ({ name: `Player${i + 1}` }));
            mockPlayerSetup.getPlayers.mockReturnValue(players);
            
            const result = gameApp.validatePlayerCount();
            
            expect(result).toBe(false);
            expect(document.getElementById('error-message').textContent).toContain('Maximum of 8 players');
        });
    });
    
    describe('Game state management', () => {
        test('should start in setup mode', () => {
            expect(gameApp.isGameStarted()).toBe(false);
        });
        
        test('should transition to playing mode after start', () => {
            mockPlayerSetup.getPlayers.mockReturnValue([
                { name: 'Player1' },
                { name: 'Player2' }
            ]);
            
            gameApp.handleStartGame();
            
            expect(gameApp.isGameStarted()).toBe(true);
        });
    });
    
    describe('UI transitions', () => {
        test('should hide player setup form when game starts', () => {
            mockPlayerSetup.getPlayers.mockReturnValue([
                { name: 'Player1' },
                { name: 'Player2' }
            ]);
            
            gameApp.handleStartGame();
            
            const setupSection = document.getElementById('player-setup-section');
            expect(setupSection.classList.contains('hidden')).toBe(true);
        });
        
        test('should show game area when game starts', () => {
            mockPlayerSetup.getPlayers.mockReturnValue([
                { name: 'Player1' },
                { name: 'Player2' }
            ]);
            
            gameApp.handleStartGame();
            
            const gameArea = document.getElementById('game-area');
            expect(gameArea.classList.contains('hidden')).toBe(false);
        });
    });
    
    describe('Player modifications lock', () => {
        test('should disable PlayerSetup after game starts', () => {
            mockPlayerSetup.getPlayers.mockReturnValue([
                { name: 'Player1' },
                { name: 'Player2' }
            ]);
            
            gameApp.handleStartGame();
            
            expect(mockPlayerSetup.disable).toHaveBeenCalled();
        });
    });
    
    describe('Final player list storage', () => {
        test('should store final player list after game starts', () => {
            const players = [
                { name: 'Player1' },
                { name: 'Player2' }
            ];
            mockPlayerSetup.getPlayers.mockReturnValue(players);
            
            gameApp.handleStartGame();
            
            const finalList = gameApp.getFinalPlayerList();
            expect(finalList).toEqual(players);
        });
        
        test('should return copy of player list to prevent external modifications', () => {
            const players = [
                { name: 'Player1' },
                { name: 'Player2' }
            ];
            mockPlayerSetup.getPlayers.mockReturnValue(players);
            
            gameApp.handleStartGame();
            
            const finalList = gameApp.getFinalPlayerList();
            finalList.push({ name: 'Hacker' });
            
            expect(gameApp.getFinalPlayerList()).toHaveLength(2);
        });
    });
});