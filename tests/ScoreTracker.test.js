import ScoreTracker from '../src/core/ScoreTracker.js';

describe('ScoreTracker', () => {
  let scoreTracker;
  const testPlayers = ['Alice', 'Bob', 'Charlie'];

  beforeEach(() => {
    scoreTracker = new ScoreTracker();
  });

  describe('Initialization', () => {
    test('should initialize with empty state', () => {
      expect(scoreTracker.players.size).toBe(0);
      expect(scoreTracker.rounds).toEqual([]);
      expect(scoreTracker.currentRound).toBe(0);
      expect(scoreTracker.gameEnded).toBe(false);
    });

    test('should initialize players correctly', () => {
      scoreTracker.initializePlayers(testPlayers);
      
      expect(scoreTracker.players.size).toBe(3);
      testPlayers.forEach(name => {
        const player = scoreTracker.players.get(name);
        expect(player.totalScore).toBe(0);
        expect(player.roundScores).toEqual([]);
        expect(player.rank).toBe(1);
      });
    });

    test('should throw error for invalid player names', () => {
      expect(() => scoreTracker.initializePlayers([])).toThrow('Player names must be a non-empty array');
      expect(() => scoreTracker.initializePlayers(['Alice', ''])).toThrow('All player names must be non-empty strings');
      expect(() => scoreTracker.initializePlayers(null)).toThrow('Player names must be a non-empty array');
    });
  });

  describe('Score Management', () => {
    beforeEach(() => {
      scoreTracker.initializePlayers(testPlayers);
    });

    test('should add round scores correctly', () => {
      const roundScores = { Alice: 10, Bob: 15, Charlie: 5 };
      scoreTracker.addRoundScores(roundScores);

      expect(scoreTracker.currentRound).toBe(1);
      expect(scoreTracker.rounds).toHaveLength(1);
      expect(scoreTracker.rounds[0].scores).toEqual(roundScores);
      
      expect(scoreTracker.players.get('Alice').totalScore).toBe(10);
      expect(scoreTracker.players.get('Bob').totalScore).toBe(15);
      expect(scoreTracker.players.get('Charlie').totalScore).toBe(5);
    });

    test('should accumulate scores over multiple rounds', () => {
      scoreTracker.addRoundScores({ Alice: 10, Bob: 15, Charlie: 5 });
      scoreTracker.addRoundScores({ Alice: 5, Bob: 10, Charlie: 20 });

      expect(scoreTracker.players.get('Alice').totalScore).toBe(15);
      expect(scoreTracker.players.get('Bob').totalScore).toBe(25);
      expect(scoreTracker.players.get('Charlie').totalScore).toBe(25);
    });

    test('should validate round scores input', () => {
      expect(() => scoreTracker.addRoundScores(null)).toThrow('Round scores must be an object');
      expect(() => scoreTracker.addRoundScores({ Alice: 10, Bob: 15 })).toThrow('Score missing for player: Charlie');
      expect(() => scoreTracker.addRoundScores({ Alice: 'invalid', Bob: 15, Charlie: 5 })).toThrow('Invalid score for player Alice: invalid');
    });

    test('should prevent adding scores after game ends', () => {
      scoreTracker.endGame();
      expect(() => scoreTracker.addRoundScores({ Alice: 10, Bob: 15, Charlie: 5 })).toThrow('Cannot add scores after game has ended');
    });
  });

  describe('Rankings and Standings', () => {
    beforeEach(() => {
      scoreTracker.initializePlayers(testPlayers);
      scoreTracker.addRoundScores({ Alice: 10, Bob: 15, Charlie: 5 });
    });

    test('should calculate rankings correctly', () => {
      const standings = scoreTracker.getCurrentStandings();
      
      expect(standings[0].name).toBe('Bob');
      expect(standings[0].rank).toBe(1);
      expect(standings[0].isLeader).toBe(true);
      
      expect(standings[1].name).toBe('Alice');
      expect(standings[1].rank).toBe(2);
      expect(standings[1].isLeader).toBe(false);
      
      expect(standings[2].name).toBe('Charlie');
      expect(standings[2].rank).toBe(3);
      expect(standings[2].isLeader).toBe(false);
    });

    test('should handle tied scores correctly', () => {
      scoreTracker.addRoundScores({ Alice: 5, Bob: -10, Charlie: 20 }); // Alice: 15, Bob: 5, Charlie: 25
      const standings = scoreTracker.getCurrentStandings();
      
      expect(standings[0].name).toBe('Charlie');
      expect(standings[0].rank).toBe(1);
      
      expect(standings[1].name).toBe('Alice');
      expect(standings[1].rank).toBe(2);
      
      expect(standings[2].name).toBe('Bob');
      expect(standings[2].rank).toBe(3);
    });

    test('should identify current leaders', () => {
      const leaders = scoreTracker.getCurrentLeaders();
      expect(leaders).toHaveLength(1);
      expect(leaders[0].name).toBe('Bob');
      expect(leaders[0].totalScore).toBe(15);
    });

    test('should handle multiple leaders in tie', () => {
      scoreTracker.addRoundScores({ Alice: 5, Bob: 0, Charlie: 10 }); // Alice: 15, Bob: 15, Charlie: 15
      const leaders = scoreTracker.getCurrentLeaders();
      
      expect(leaders).toHaveLength(3);
      leaders.forEach(leader => {
        expect(leader.totalScore).toBe(15);
        expect(leader.rank).toBe(1);
      });
    });
  });

  describe('Round Breakdown', () => {
    beforeEach(() => {
      scoreTracker.initializePlayers(testPlayers);
    });

    test('should provide round-by-round breakdown', () => {
      scoreTracker.addRoundScores({ Alice: 10, Bob: 15, Charlie: 5 });
      scoreTracker.addRoundScores({ Alice: 5, Bob: 10, Charlie: 20 });
      
      const breakdown = scoreTracker.getRoundBreakdown();
      expect(breakdown).toHaveLength(2);
      
      expect(breakdown[0].roundNumber).toBe(1);
      expect(breakdown[0].scores).toEqual({ Alice: 10, Bob: 15, Charlie: 5 });
      
      expect(breakdown[1].roundNumber).toBe(2);
      expect(breakdown[1].scores).toEqual({ Alice: 5, Bob: 10, Charlie: 20 });
      
      breakdown.forEach(round => {
        expect(round.timestamp).toBeDefined();
      });
    });

    test('should return empty breakdown for no rounds', () => {
      const breakdown = scoreTracker.getRoundBreakdown();
      expect(breakdown).toEqual([]);
    });
  });

  describe('Game Summary and Final Rankings', () => {
    beforeEach(() => {
      scoreTracker.initializePlayers(testPlayers);
      scoreTracker.addRoundScores({ Alice: 10, Bob: 15, Charlie: 5 });
      scoreTracker.addRoundScores({ Alice: 5, Bob: 10, Charlie: 20 });
    });

    test('should provide complete game summary', () => {
      const summary = scoreTracker.getGameSummary();
      
      expect(summary.totalRounds).toBe(2);
      expect(summary.gameEnded).toBe(false);
      expect(summary.currentStandings).toHaveLength(3);
      expect(summary.roundBreakdown).toHaveLength(2);
      expect(summary.leaders).toHaveLength(2); // Bob and Charlie tied at 25
    });

    test('should end game and provide final rankings', () => {
      const finalRankings = scoreTracker.endGame();
      
      expect(scoreTracker.gameEnded).toBe(true);
      expect(finalRankings).toHaveLength(3);
      
      const winners = finalRankings.filter(p => p.isFinalWinner);
      expect(winners).toHaveLength(2); // Bob and Charlie tied
      expect(winners.every(w => w.totalScore === 25)).toBe(true);
    });

    test('should get player individual history', () => {
      const aliceHistory = scoreTracker.getPlayerHistory('Alice');
      
      expect(aliceHistory.name).toBe('Alice');
      expect(aliceHistory.totalScore).toBe(15);
      expect(aliceHistory.roundScores).toEqual([10, 5]);
      expect(aliceHistory.rank).toBe(3);
      expect(aliceHistory.averageScore).toBe(7.5);
    });

    test('should throw error for non-existent player history', () => {
      expect(() => scoreTracker.getPlayerHistory('NonExistent')).toThrow('Player not found: NonExistent');
    });
  });

  describe('Edge Cases', () => {
    test('should handle negative scores', () => {
      scoreTracker.initializePlayers(['Player1', 'Player2']);
      scoreTracker.addRoundScores({ Player1: -10, Player2: -5 });
      
      const standings = scoreTracker.getCurrentStandings();
      expect(standings[0].name).toBe('Player2');
      expect(standings[0].totalScore).toBe(-5);
      expect(standings[1].name).toBe('Player1');
      expect(standings[1].totalScore).toBe(-10);
    });

    test('should handle zero scores', () => {
      scoreTracker.initializePlayers(['Player1']);
      scoreTracker.addRoundScores({ Player1: 0 });
      
      const history = scoreTracker.getPlayerHistory('Player1');
      expect(history.totalScore).toBe(0);
      expect(history.averageScore).toBe(0);
    });

    test('should handle single player game', () => {
      scoreTracker.initializePlayers(['Solo']);
      scoreTracker.addRoundScores({ Solo: 100 });
      
      const leaders = scoreTracker.getCurrentLeaders();
      expect(leaders).toHaveLength(1);
      expect(leaders[0].name).toBe('Solo');
    });
  });
});