/**
 * Test suite for GameApp integration
 */
describe('GameApp', () => {
    let gameApp;
    let mockPlayerSetup;
    
    beforeEach(() => {
        // Setup DOM
        document.body.innerHTML = `
            <div id="player-setup-section">
                <input id="player-name-input" type="text">
                <button id="add-player-btn">Add Player</button>
                <button id="start-game-btn">Start Game</button>
            </div>
            <div id="game-area" class="hidden"></div>
            <div id="error-message" class="hidden"></div>
            <div id="game-players-list"></div>
        `;
        
        // Mock PlayerSetup
        global.PlayerSetup = jest.fn().mockImplementation(() => ({
            getPlayers: jest.fn().mockReturnValue([{name: 'Player1'}, {name: 'Player2'}])
        }));
        
        gameApp = new GameApp();
    });
    
    test('validates minimum player count', () => {
        gameApp.playerSetup.getPlayers.mockReturnValue([{name: 'Player1'}]);
        expect(gameApp.validatePlayerCount()).toBe(false);
    });
    
    test('validates maximum player count', () => {
        const manyPlayers = Array(10).fill().map((_, i) => ({name: `Player${i}`}));
        gameApp.playerSetup.getPlayers.mockReturnValue(manyPlayers);
        expect(gameApp.validatePlayerCount()).toBe(false);
    });
    
    test('starts game successfully with valid players', () => {
        gameApp.handleStartGame();
        expect(gameApp.isGameStarted()).toBe(true);
        expect(gameApp.getFinalPlayerList()).toHaveLength(2);
    });
    
    test('hides player setup after game starts', () => {
        gameApp.startGame();
        const setupSection = document.getElementById('player-setup-section');
        expect(setupSection.classList.contains('hidden')).toBe(true);
    });
    
    test('locks player modifications after game starts', () => {
        gameApp.startGame();
        const nameInput = document.getElementById('player-name-input');
        const addBtn = document.getElementById('add-player-btn');
        expect(nameInput.disabled).toBe(true);
        expect(addBtn.disabled).toBe(true);
    });
});