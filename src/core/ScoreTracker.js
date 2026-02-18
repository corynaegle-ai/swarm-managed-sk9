/**
 * ScoreTracker - Manages player scores, rankings, and score history
 */
class ScoreTracker {
  constructor() {
    this.players = new Map();
    this.rounds = [];
    this.currentRound = 0;
    this.gameEnded = false;
  }

  /**
   * Initialize players for the game
   * @param {Array<string>} playerNames - Array of player names
   */
  initializePlayers(playerNames) {
    if (!Array.isArray(playerNames) || playerNames.length === 0) {
      throw new Error('Player names must be a non-empty array');
    }

    this.players.clear();
    this.rounds = [];
    this.currentRound = 0;
    this.gameEnded = false;

    playerNames.forEach(name => {
      if (typeof name !== 'string' || name.trim() === '') {
        throw new Error('All player names must be non-empty strings');
      }
      
      this.players.set(name, {
        totalScore: 0,
        roundScores: [],
        rank: 1
      });
    });
  }

  /**
   * Add scores for a round
   * @param {Object} roundScores - Object with player names as keys and scores as values
   */
  addRoundScores(roundScores) {
    if (!roundScores || typeof roundScores !== 'object') {
      throw new Error('Round scores must be an object');
    }

    if (this.gameEnded) {
      throw new Error('Cannot add scores after game has ended');
    }

    // Validate all players have scores
    for (const playerName of this.players.keys()) {
      if (!(playerName in roundScores)) {
        throw new Error(`Score missing for player: ${playerName}`);
      }
      
      const score = roundScores[playerName];
      if (typeof score !== 'number' || isNaN(score)) {
        throw new Error(`Invalid score for player ${playerName}: ${score}`);
      }
    }

    // Update player scores and history
    const roundData = {
      roundNumber: this.currentRound + 1,
      scores: { ...roundScores },
      timestamp: new Date().toISOString()
    };

    this.rounds.push(roundData);

    for (const [playerName, score] of Object.entries(roundScores)) {
      const player = this.players.get(playerName);
      player.roundScores.push(score);
      player.totalScore += score;
    }

    this.currentRound++;
    this._updateRankings();
  }

  /**
   * Update player rankings based on total scores
   * @private
   */
  _updateRankings() {
    const sortedPlayers = Array.from(this.players.entries())
      .sort((a, b) => b[1].totalScore - a[1].totalScore);

    let currentRank = 1;
    let previousScore = null;
    let playersAtRank = 0;

    sortedPlayers.forEach(([playerName, playerData]) => {
      if (previousScore !== null && playerData.totalScore < previousScore) {
        currentRank += playersAtRank;
        playersAtRank = 1;
      } else {
        playersAtRank++;
      }

      playerData.rank = currentRank;
      previousScore = playerData.totalScore;
    });
  }

  /**
   * Get current standings
   * @returns {Array} Array of player standings sorted by rank
   */
  getCurrentStandings() {
    return Array.from(this.players.entries())
      .map(([name, data]) => ({
        name,
        totalScore: data.totalScore,
        rank: data.rank,
        roundScores: [...data.roundScores],
        isLeader: data.rank === 1
      }))
      .sort((a, b) => a.rank - b.rank);
  }

  /**
   * Get the current leader(s)
   * @returns {Array} Array of players tied for first place
   */
  getCurrentLeaders() {
    const standings = this.getCurrentStandings();
    return standings.filter(player => player.rank === 1);
  }

  /**
   * Get round-by-round breakdown
   * @returns {Array} Array of round data with scores
   */
  getRoundBreakdown() {
    return this.rounds.map(round => ({
      ...round,
      scores: { ...round.scores }
    }));
  }

  /**
   * End the game and get final rankings
   * @returns {Array} Final rankings with all player data
   */
  endGame() {
    this.gameEnded = true;
    return this.getFinalRankings();
  }

  /**
   * Get final rankings
   * @returns {Array} Final rankings sorted by rank
   */
  getFinalRankings() {
    const standings = this.getCurrentStandings();
    return standings.map(player => ({
      ...player,
      isFinalWinner: player.rank === 1
    }));
  }

  /**
   * Get complete game summary
   * @returns {Object} Complete game data
   */
  getGameSummary() {
    return {
      totalRounds: this.rounds.length,
      gameEnded: this.gameEnded,
      currentStandings: this.getCurrentStandings(),
      roundBreakdown: this.getRoundBreakdown(),
      leaders: this.getCurrentLeaders()
    };
  }

  /**
   * Get player's individual score history
   * @param {string} playerName - Name of the player
   * @returns {Object} Player's score data
   */
  getPlayerHistory(playerName) {
    const player = this.players.get(playerName);
    if (!player) {
      throw new Error(`Player not found: ${playerName}`);
    }

    return {
      name: playerName,
      totalScore: player.totalScore,
      roundScores: [...player.roundScores],
      rank: player.rank,
      averageScore: player.roundScores.length > 0 
        ? player.totalScore / player.roundScores.length 
        : 0
    };
  }
}

export default ScoreTracker;