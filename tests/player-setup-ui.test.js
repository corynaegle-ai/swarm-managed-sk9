/**
 * @jest-environment jsdom
 */

const PlayerManager = require('../src/player-manager');
const PlayerSetupUI = require('../src/player-setup-ui');

describe('PlayerSetupUI', () => {
  let playerManager;
  let playerSetupUI;
  let container;

  beforeEach(() => {
    // Set up DOM environment
    document.body.innerHTML = '<div id="test-container"></div>';
    container = document.getElementById('test-container');
    
    playerManager = new PlayerManager();
    playerSetupUI = new PlayerSetupUI(playerManager);
    playerSetupUI.init(container);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('UI Initialization', () => {
    test('should render initial UI structure', () => {
      expect(container.querySelector('.player-setup')).toBeTruthy();
      expect(container.querySelector('#player-name-input')).toBeTruthy();
      expect(container.querySelector('#add-player-btn')).toBeTruthy();
      expect(container.querySelector('#player-list')).toBeTruthy();
      expect(container.querySelector('#start-game-btn')).toBeTruthy();
    });

    test('should have start game button disabled initially', () => {
      const startButton = container.querySelector('#start-game-btn');
      expect(startButton.disabled).toBe(true);
    });

    test('should display correct initial player count', () => {
      const countElement = container.querySelector('#player-count');
      expect(countElement.textContent).toBe('0');
    });
  });

  describe('Adding Players', () => {
    test('should add player when add button is clicked', () => {
      const input = container.querySelector('#player-name-input');
      const addButton = container.querySelector('#add-player-btn');
      
      input.value = 'Alice';
      addButton.click();
      
      expect(container.querySelector('.player-item')).toBeTruthy();
      expect(container.querySelector('.player-name').textContent).toBe('Alice');
      expect(container.querySelector('#player-count').textContent).toBe('1');
    });

    test('should add player when Enter key is pressed', () => {
      const input = container.querySelector('#player-name-input');
      
      input.value = 'Bob';
      const enterEvent = new KeyboardEvent('keypress', { key: 'Enter' });
      input.dispatchEvent(enterEvent);
      
      expect(container.querySelector('.player-name').textContent).toBe('Bob');
    });

    test('should clear input after successful add', () => {
      const input = container.querySelector('#player-name-input');
      const addButton = container.querySelector('#add-player-btn');
      
      input.value = 'Charlie';
      addButton.click();
      
      expect(input.value).toBe('');
    });

    test('should show error for empty player name', () => {
      const addButton = container.querySelector('#add-player-btn');
      
      addButton.click();
      
      const errorElement = container.querySelector('#error-message');
      expect(errorElement.style.display).not.toBe('none');
      expect(errorElement.textContent).toContain('Player name is required');
    });

    test('should show error for duplicate player name', () => {
      const input = container.querySelector('#player-name-input');
      const addButton = container.querySelector('#add-player-btn');
      
      // Add first player
      input.value = 'Alice';
      addButton.click();
      
      // Try to add duplicate
      input.value = 'Alice';
      addButton.click();
      
      const errorElement = container.querySelector('#error-message');
      expect(errorElement.textContent).toContain('Player name already exists');
    });
  });

  describe('Player List Management', () => {
    beforeEach(() => {
      // Add some players for testing
      const input = container.querySelector('#player-name-input');
      const addButton = container.querySelector('#add-player-btn');
      
      input.value = 'Alice';
      addButton.click();
      input.value = 'Bob';
      addButton.click();
    });

    test('should display all added players', () => {
      const playerItems = container.querySelectorAll('.player-item');
      expect(playerItems).toHaveLength(2);
      
      const playerNames = Array.from(container.querySelectorAll('.player-name'))
        .map(el => el.textContent);
      expect(playerNames).toContain('Alice');
      expect(playerNames).toContain('Bob');
    });

    test('should allow removing players before game starts', () => {
      const removeButtons = container.querySelectorAll('.remove-player');
      expect(removeButtons).toHaveLength(2);
      
      removeButtons[0].click();
      
      const playerItems = container.querySelectorAll('.player-item');
      expect(playerItems).toHaveLength(1);
    });

    test('should enable start game button with valid player count', () => {
      const startButton = container.querySelector('#start-game-btn');
      expect(startButton.disabled).toBe(false);
    });
  });

  describe('Game State Management', () => {
    beforeEach(() => {
      // Add players and start game
      const input = container.querySelector('#player-name-input');
      const addButton = container.querySelector('#add-player-btn');
      const startButton = container.querySelector('#start-game-btn');
      
      input.value = 'Alice';
      addButton.click();
      input.value = 'Bob';
      addButton.click();
      
      startButton.click();
    });

    test('should disable controls after game starts', () => {
      const input = container.querySelector('#player-name-input');
      const addButton = container.querySelector('#add-player-btn');
      const startButton = container.querySelector('#start-game-btn');
      
      expect(input.disabled).toBe(true);
      expect(addButton.disabled).toBe(true);
      expect(startButton.disabled).toBe(true);
      expect(startButton.textContent).toBe('Game Started');
    });

    test('should remove player controls after game starts', () => {
      const removeButtons = container.querySelectorAll('.remove-player');
      expect(removeButtons).toHaveLength(0);
    });

    test('should disable player name editing after game starts', () => {
      const editableNames = container.querySelectorAll('.player-name[contenteditable="true"]');
      expect(editableNames).toHaveLength(0);
    });
  });

  describe('Reset Functionality', () => {
    test('should reset all players when reset button is clicked', () => {
      // Add some players
      const input = container.querySelector('#player-name-input');
      const addButton = container.querySelector('#add-player-btn');
      
      input.value = 'Alice';
      addButton.click();
      input.value = 'Bob';
      addButton.click();
      
      // Mock confirm dialog
      window.confirm = jest.fn(() => true);
      
      // Click reset button
      const resetButton = container.querySelector('#reset-players-btn');
      resetButton.click();
      
      // Check that players are cleared
      const playerItems = container.querySelectorAll('.player-item');
      expect(playerItems).toHaveLength(0);
      expect(container.querySelector('#player-count').textContent).toBe('0');
    });

    test('should not reset when user cancels confirmation', () => {
      // Add a player
      const input = container.querySelector('#player-name-input');
      const addButton = container.querySelector('#add-player-btn');
      
      input.value = 'Alice';
      addButton.click();
      
      // Mock confirm dialog to return false
      window.confirm = jest.fn(() => false);
      
      // Click reset button
      const resetButton = container.querySelector('#reset-players-btn');
      resetButton.click();
      
      // Check that player is still there
      const playerItems = container.querySelectorAll('.player-item');
      expect(playerItems).toHaveLength(1);
    });
  });

  describe('Error Handling', () => {
    test('should clear error message when typing in input', () => {
      const input = container.querySelector('#player-name-input');
      const addButton = container.querySelector('#add-player-btn');
      
      // Trigger an error
      addButton.click();
      
      let errorElement = container.querySelector('#error-message');
      expect(errorElement.style.display).not.toBe('none');
      
      // Type in input
      input.value = 'A';
      const inputEvent = new Event('input');
      input.dispatchEvent(inputEvent);
      
      // Error should be cleared
      errorElement = container.querySelector('#error-message');
      expect(errorElement.style.display).toBe('none');
    });

    test('should auto-hide error message after timeout', (done) => {
      const addButton = container.querySelector('#add-player-btn');
      
      // Trigger an error
      addButton.click();
      
      const errorElement = container.querySelector('#error-message');
      expect(errorElement.style.display).not.toBe('none');
      
      // Wait for auto-hide (5 seconds + a bit extra)
      setTimeout(() => {
        expect(errorElement.style.display).toBe('none');
        done();
      }, 5100);
    }, 6000);
  });
});