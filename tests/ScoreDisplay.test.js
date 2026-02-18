import ScoreDisplay from '../src/ui/ScoreDisplay.js';
import ScoreTracker from '../src/core/ScoreTracker.js';

// Mock DOM environment
Object.defineProperty(global, 'document', {
  value: {
    createElement: jest.fn(() => ({
      textContent: '',
      innerHTML: '',
      className: ''
    }))
  }
});

Object.defineProperty(global, 'HTMLElement', {
  value: class HTMLElement {
    constructor() {
      this.innerHTML = '';
      this.className = '';
    }
  }
});

describe('ScoreDisplay', () => {
  let scoreTracker;
  let scoreDisplay;
  let mockContainer;

  beforeEach(() => {
    scoreTracker = new ScoreTracker();
    scoreDisplay = new ScoreDisplay(scoreTracker);
    mockContainer = new HTMLElement();
  });

  describe('Initialization', () => {
    test('should create display with score tracker', () => {
      expect(scoreDisplay.scoreTracker).toBe(scoreTracker);
      expect(scoreDisplay.container).toBeNull();
      expect(scoreDisplay.listeners.size).toBe(0);
    });

    test('should initialize with container', () => {
      scoreDisplay.initialize(mockContainer);
      expect(scoreDisplay.container).toBe(mockContainer);
      expect(mockContainer.className).toBe('score-display');
    });

    test('should throw error for invalid container', () => {
      expect(() => scoreDisplay.initialize(null)).toThrow('Container must be a valid HTML element');
      expect(() => scoreDisplay.initialize('not-an-element')).toThrow('Container must be a valid HTML element');
    });
  });

  describe('Rendering', () => {
    beforeEach(() => {
      scoreTracker.initializePlayers(['Alice', 'Bob', 'Charlie']);
      scoreDisplay.initialize(mockContainer);
    });

    test('should throw error when rendering without initialization', () => {
      const uninitializedDisplay = new ScoreDisplay(scoreTracker);
      expect(() => uninitializedDisplay.render()).toThrow('Display not initialized. Call initialize() first.');
    });

    test('should render basic structure with no scores', () => {
      scoreDisplay.render();
      expect(mockContainer.innerHTML).toContain('Game Scores');
      expect(mockContainer.innerHTML).toContain('Current Standings');
      expect(mockContainer.innerHTML).toContain('Round-by-Round Breakdown');
      expect(mockContainer.innerHTML).toContain('Round: 0');
      expect(mockContainer.innerHTML).toContain('IN PROGRESS');
    });

    test('should render standings with scores', () => {
      scoreTracker.addRoundScores({ Alice: 10, Bob: 15, Charlie: 5 });
      scoreDisplay.render();
      
      expect(mockContainer.innerHTML).toContain('Alice');
      expect(mockContainer.innerHTML).toContain('Bob');
      expect(mockContainer.innerHTML).toContain('Charlie');
      expect(mockContainer.innerHTML).toContain('🏆');
      expect(mockContainer.innerHTML).toContain('Round: 1');
    });

    test('should render round breakdown table', () => {
      scoreTracker.addRoundScores({ Alice: 10, Bob: 15, Charlie: 5 });
      scoreTracker.addRoundScores({ Alice: 5, Bob: 10, Charlie: 20 });
      scoreDisplay.render();
      
      expect(mockContainer.innerHTML).toContain('R1');
      expect(mockContainer.innerHTML).toContain('R2');
      expect(mockContainer.innerHTML).toContain('Total');
    });

    test('should render final rankings when game ends', () => {
      scoreTracker.addRoundScores({ Alice: 10, Bob: 15, Charlie: 5 });
      scoreTracker.endGame();
      scoreDisplay.render();
      
      expect(mockContainer.innerHTML).toContain('Final Results');
      expect(mockContainer.innerHTML).toContain('Winner: Bob');
      expect(mockContainer.innerHTML).toContain('FINAL');
    });
  });

  describe('Update Listeners', () => {
    let mockCallback;

    beforeEach(() => {
      mockCallback = jest.fn();
      scoreDisplay.initialize(mockContainer);
    });

    test('should add and remove update listeners', () => {
      scoreDisplay.addUpdateListener(mockCallback);
      expect(scoreDisplay.listeners.size).toBe(1);
      
      scoreDisplay.removeUpdateListener(mockCallback);
      expect(scoreDisplay.listeners.size).toBe(0);
    });

    test('should call listeners on render', () => {
      scoreDisplay.addUpdateListener(mockCallback);
      scoreDisplay.render();
      
      expect(mockCallback).toHaveBeenCalledTimes(1);
      expect(mockCallback).toHaveBeenCalledWith(scoreTracker.getGameSummary());
    });

    test('should handle listener errors gracefully', () => {
      const errorCallback = jest.fn(() => {
        throw new Error('Listener error');
      });
      
      console.error = jest.fn(); // Mock console.error
      
      scoreDisplay.addUpdateListener(errorCallback);
      scoreDisplay.render();
      
      expect(console.error).toHaveBeenCalledWith('Error in update listener:', expect.any(Error));
    });

    test('should ignore non-function listeners', () => {
      scoreDisplay.addUpdateListener('not-a-function');
      scoreDisplay.addUpdateListener(null);
      scoreDisplay.addUpdateListener(undefined);
      
      expect(scoreDisplay.listeners.size).toBe(0);
    });
  });

  describe('Display State', () => {
    test('should return correct display state', () => {
      let state = scoreDisplay.getDisplayState();
      expect(state.hasContainer).toBe(false);
      expect(state.isRendered).toBe(false);
      expect(state.listenerCount).toBe(0);
      
      scoreDisplay.initialize(mockContainer);
      state = scoreDisplay.getDisplayState();
      expect(state.hasContainer).toBe(true);
      expect(state.isRendered).toBe(true);
      expect(state.listenerCount).toBe(0);
      
      scoreDisplay.addUpdateListener(jest.fn());
      state = scoreDisplay.getDisplayState();
      expect(state.listenerCount).toBe(1);
    });
  });

  describe('Helper Methods', () => {
    beforeEach(() => {
      scoreDisplay.initialize(mockContainer);
    });

    test('should escape HTML correctly', () => {
      const escaped = scoreDisplay._escapeHtml('<script>alert("test")</script>');
      expect(escaped).toContain('&lt;script&gt;');
      expect(escaped).toContain('&lt;/script&gt;');
    });

    test('should generate rank suffixes correctly', () => {
      expect(scoreDisplay._getRankSuffix(1)).toBe('1st');
      expect(scoreDisplay._getRankSuffix(2)).toBe('2nd');
      expect(scoreDisplay._getRankSuffix(3)).toBe('3rd');
      expect(scoreDisplay._getRankSuffix(4)).toBe('4th');
      expect(scoreDisplay._getRankSuffix(11)).toBe('11th');
      expect(scoreDisplay._getRankSuffix(21)).toBe('21st');
      expect(scoreDisplay._getRankSuffix(22)).toBe('22nd');
      expect(scoreDisplay._getRankSuffix(23)).toBe('23rd');
    });
  });

  describe('Integration with ScoreTracker', () => {
    beforeEach(() => {
      scoreTracker.initializePlayers(['Player1', 'Player2']);
      scoreDisplay.initialize(mockContainer);
    });

    test('should update display when scores change', () => {
      const initialHTML = mockContainer.innerHTML;
      
      scoreTracker.addRoundScores({ Player1: 100, Player2: 50 });
      scoreDisplay.updateDisplay();
      
      expect(mockContainer.innerHTML).not.toBe(initialHTML);
      expect(mockContainer.innerHTML).toContain('100');
      expect(mockContainer.innerHTML).toContain('50');
    });

    test('should show leader indicators correctly', () => {
      scoreTracker.addRoundScores({ Player1: 100, Player2: 50 });
      scoreDisplay.render();
      
      const leaderCount = (mockContainer.innerHTML.match(/🏆/g) || []).length;
      expect(leaderCount).toBeGreaterThan(0);
    });

    test('should handle tied leaders', () => {
      scoreTracker.addRoundScores({ Player1: 50, Player2: 50 });
      scoreDisplay.render();
      
      const leaderCount = (mockContainer.innerHTML.match(/🏆/g) || []).length;
      expect(leaderCount).toBe(2); // Both players should have trophy
    });
  });
});