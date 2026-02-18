const PlayerManager = require('../src/player-manager');

describe('PlayerManager', () => {
  let playerManager;

  beforeEach(() => {
    playerManager = new PlayerManager();
  });

  describe('Player Count Validation', () => {
    test('should require at least 2 players to start game', () => {
      playerManager.addPlayer('Alice');
      const result = playerManager.startGame();
      expect(result.success).toBe(false);
      expect(result.error).toContain('At least 2 players required');
    });

    test('should allow exactly 2 players', () => {
      playerManager.addPlayer('Alice');
      playerManager.addPlayer('Bob');
      const result = playerManager.startGame();
      expect(result.success).toBe(true);
    });

    test('should allow up to 8 players', () => {
      for (let i = 1; i <= 8; i++) {
        const result = playerManager.addPlayer(`Player${i}`);
        expect(result.success).toBe(true);
      }
      const startResult = playerManager.startGame();
      expect(startResult.success).toBe(true);
    });

    test('should reject 9th player', () => {
      for (let i = 1; i <= 8; i++) {
        playerManager.addPlayer(`Player${i}`);
      }
      const result = playerManager.addPlayer('Player9');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Maximum of 8 players allowed');
    });
  });

  describe('Player Name Validation', () => {
    test('should require non-empty player names', () => {
      const result = playerManager.addPlayer('');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Player name is required');
    });

    test('should require non-null player names', () => {
      const result = playerManager.addPlayer(null);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Player name is required');
    });

    test('should trim whitespace from player names', () => {
      const result = playerManager.addPlayer('  Alice  ');
      expect(result.success).toBe(true);
      expect(result.player.name).toBe('Alice');
    });

    test('should prevent duplicate names (case-insensitive)', () => {
      playerManager.addPlayer('Alice');
      const result = playerManager.addPlayer('ALICE');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Player name already exists');
    });

    test('should allow similar but different names', () => {
      playerManager.addPlayer('Alice');
      const result = playerManager.addPlayer('Alicia');
      expect(result.success).toBe(true);
    });
  });

  describe('Player Management', () => {
    test('should successfully add valid players', () => {
      const result = playerManager.addPlayer('Alice');
      expect(result.success).toBe(true);
      expect(result.player.name).toBe('Alice');
      expect(result.player.id).toBeDefined();
      expect(result.player.score).toBe(0);
    });

    test('should successfully remove players before game starts', () => {
      const addResult = playerManager.addPlayer('Alice');
      const removeResult = playerManager.removePlayer(addResult.player.id);
      expect(removeResult.success).toBe(true);
      expect(removeResult.removedPlayer.name).toBe('Alice');
      expect(playerManager.getPlayers()).toHaveLength(0);
    });

    test('should successfully edit player names before game starts', () => {
      const addResult = playerManager.addPlayer('Alice');
      const editResult = playerManager.editPlayer(addResult.player.id, 'Alicia');
      expect(editResult.success).toBe(true);
      expect(editResult.player.name).toBe('Alicia');
    });

    test('should prevent editing to duplicate names', () => {
      playerManager.addPlayer('Alice');
      const bobResult = playerManager.addPlayer('Bob');
      const editResult = playerManager.editPlayer(bobResult.player.id, 'Alice');
      expect(editResult.success).toBe(false);
      expect(editResult.error).toBe('Player name already exists');
    });

    test('should return error when removing non-existent player', () => {
      const result = playerManager.removePlayer('invalid-id');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Player not found');
    });
  });

  describe('Game State Management', () => {
    test('should prevent player modifications after game starts', () => {
      playerManager.addPlayer('Alice');
      playerManager.addPlayer('Bob');
      playerManager.startGame();

      const addResult = playerManager.addPlayer('Charlie');
      expect(addResult.success).toBe(false);
      expect(addResult.error).toBe('Cannot modify players after game has started');
    });

    test('should prevent player removal after game starts', () => {
      const aliceResult = playerManager.addPlayer('Alice');
      playerManager.addPlayer('Bob');
      playerManager.startGame();

      const removeResult = playerManager.removePlayer(aliceResult.player.id);
      expect(removeResult.success).toBe(false);
      expect(removeResult.error).toBe('Cannot modify players after game has started');
    });

    test('should prevent player editing after game starts', () => {
      const aliceResult = playerManager.addPlayer('Alice');
      playerManager.addPlayer('Bob');
      playerManager.startGame();

      const editResult = playerManager.editPlayer(aliceResult.player.id, 'Alicia');
      expect(editResult.success).toBe(false);
      expect(editResult.error).toBe('Cannot modify players after game has started');
    });

    test('should track game started state correctly', () => {
      expect(playerManager.isGameStarted()).toBe(false);
      playerManager.addPlayer('Alice');
      playerManager.addPlayer('Bob');
      playerManager.startGame();
      expect(playerManager.isGameStarted()).toBe(true);
    });

    test('should reset game state and players', () => {
      playerManager.addPlayer('Alice');
      playerManager.addPlayer('Bob');
      playerManager.startGame();
      
      playerManager.reset();
      
      expect(playerManager.isGameStarted()).toBe(false);
      expect(playerManager.getPlayers()).toHaveLength(0);
    });
  });

  describe('Validation and Utility Methods', () => {
    test('should validate player setup correctly', () => {
      let validation = playerManager.validatePlayerSetup();
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('At least 2 players required');

      playerManager.addPlayer('Alice');
      playerManager.addPlayer('Bob');
      
      validation = playerManager.validatePlayerSetup();
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    test('should return copy of players array', () => {
      playerManager.addPlayer('Alice');
      const players1 = playerManager.getPlayers();
      const players2 = playerManager.getPlayers();
      
      expect(players1).not.toBe(players2); // Different array instances
      expect(players1).toEqual(players2); // Same content
    });

    test('should generate unique player IDs', () => {
      const id1 = playerManager.generatePlayerId();
      const id2 = playerManager.generatePlayerId();
      expect(id1).not.toBe(id2);
      expect(typeof id1).toBe('string');
      expect(typeof id2).toBe('string');
    });
  });
});