/**
 * ScoreDisplay - UI component for displaying scores and standings
 */
class ScoreDisplay {
  constructor(scoreTracker) {
    this.scoreTracker = scoreTracker;
    this.container = null;
    this.listeners = new Set();
  }

  /**
   * Initialize the display container
   * @param {HTMLElement} container - Container element for the score display
   */
  initialize(container) {
    if (!(container instanceof HTMLElement)) {
      throw new Error('Container must be a valid HTML element');
    }
    
    this.container = container;
    this.container.className = 'score-display';
    this.render();
  }

  /**
   * Render the complete score display
   */
  render() {
    if (!this.container) {
      throw new Error('Display not initialized. Call initialize() first.');
    }

    const summary = this.scoreTracker.getGameSummary();
    
    this.container.innerHTML = `
      <div class="score-header">
        <h2>Game Scores</h2>
        <div class="game-info">
          <span class="round-info">Round: ${summary.totalRounds}</span>
          ${summary.gameEnded ? '<span class="game-status final">FINAL</span>' : '<span class="game-status ongoing">IN PROGRESS</span>'}
        </div>
      </div>
      
      <div class="current-standings">
        <h3>Current Standings</h3>
        ${this._renderStandings(summary.currentStandings)}
      </div>
      
      <div class="round-breakdown">
        <h3>Round-by-Round Breakdown</h3>
        ${this._renderRoundBreakdown(summary.roundBreakdown, summary.currentStandings)}
      </div>
      
      ${summary.gameEnded ? this._renderFinalRankings() : ''}
    `;

    this._notifyUpdate();
  }

  /**
   * Render current standings table
   * @param {Array} standings - Current standings data
   * @returns {string} HTML string for standings
   */
  _renderStandings(standings) {
    if (standings.length === 0) {
      return '<p class="no-data">No scores recorded yet</p>';
    }

    const tableRows = standings.map(player => `
      <tr class="${player.isLeader ? 'leader' : ''} rank-${player.rank}">
        <td class="rank">
          ${player.isLeader ? '🏆' : ''}
          #${player.rank}
        </td>
        <td class="player-name">${this._escapeHtml(player.name)}</td>
        <td class="total-score">${player.totalScore}</td>
        <td class="rounds-played">${player.roundScores.length}</td>
        <td class="average-score">${player.roundScores.length > 0 ? (player.totalScore / player.roundScores.length).toFixed(1) : '0.0'}</td>
      </tr>
    `).join('');

    return `
      <table class="standings-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Player</th>
            <th>Total Score</th>
            <th>Rounds</th>
            <th>Average</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    `;
  }

  /**
   * Render round-by-round breakdown
   * @param {Array} rounds - Round data
   * @param {Array} standings - Current standings for player order
   * @returns {string} HTML string for round breakdown
   */
  _renderRoundBreakdown(rounds, standings) {
    if (rounds.length === 0) {
      return '<p class="no-data">No rounds completed yet</p>';
    }

    const playerNames = standings.map(p => p.name);
    
    const headerRow = `
      <tr>
        <th>Round</th>
        ${playerNames.map(name => `<th>${this._escapeHtml(name)}</th>`).join('')}
      </tr>
    `;

    const roundRows = rounds.map(round => `
      <tr class="round-row">
        <td class="round-number">R${round.roundNumber}</td>
        ${playerNames.map(name => {
          const score = round.scores[name] || 0;
          return `<td class="round-score">${score}</td>`;
        }).join('')}
      </tr>
    `).join('');

    const totalRow = `
      <tr class="totals-row">
        <td class="totals-label"><strong>Total</strong></td>
        ${playerNames.map(name => {
          const player = standings.find(p => p.name === name);
          return `<td class="total-score"><strong>${player ? player.totalScore : 0}</strong></td>`;
        }).join('')}
      </tr>
    `;

    return `
      <table class="breakdown-table">
        <thead>
          ${headerRow}
        </thead>
        <tbody>
          ${roundRows}
          ${totalRow}
        </tbody>
      </table>
    `;
  }

  /**
   * Render final rankings section
   * @returns {string} HTML string for final rankings
   */
  _renderFinalRankings() {
    const finalRankings = this.scoreTracker.getFinalRankings();
    const winners = finalRankings.filter(p => p.isFinalWinner);
    
    const winnerText = winners.length === 1 
      ? `🎉 Winner: ${winners[0].name} with ${winners[0].totalScore} points!`
      : `🎉 Tie between: ${winners.map(w => w.name).join(', ')} with ${winners[0].totalScore} points each!`;

    return `
      <div class="final-rankings">
        <h3>Final Results</h3>
        <div class="winner-announcement">
          ${winnerText}
        </div>
        <div class="final-standings">
          ${this._renderFinalStandingsTable(finalRankings)}
        </div>
      </div>
    `;
  }

  /**
   * Render final standings table
   * @param {Array} rankings - Final rankings data
   * @returns {string} HTML string for final standings table
   */
  _renderFinalStandingsTable(rankings) {
    const tableRows = rankings.map(player => `
      <tr class="${player.isFinalWinner ? 'final-winner' : ''} final-rank-${player.rank}">
        <td class="rank">
          ${player.isFinalWinner ? '🏆' : ''}
          ${this._getRankSuffix(player.rank)}
        </td>
        <td class="player-name">${this._escapeHtml(player.name)}</td>
        <td class="total-score">${player.totalScore}</td>
        <td class="score-details">${player.roundScores.join(', ')}</td>
      </tr>
    `).join('');

    return `
      <table class="final-standings-table">
        <thead>
          <tr>
            <th>Place</th>
            <th>Player</th>
            <th>Final Score</th>
            <th>Round Scores</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    `;
  }

  /**
   * Get rank suffix (1st, 2nd, 3rd, etc.)
   * @param {number} rank - Numeric rank
   * @returns {string} Rank with suffix
   */
  _getRankSuffix(rank) {
    const lastDigit = rank % 10;
    const lastTwoDigits = rank % 100;
    
    if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
      return `${rank}th`;
    }
    
    switch (lastDigit) {
      case 1: return `${rank}st`;
      case 2: return `${rank}nd`;
      case 3: return `${rank}rd`;
      default: return `${rank}th`;
    }
  }

  /**
   * Escape HTML characters for safe display
   * @param {string} str - String to escape
   * @returns {string} Escaped string
   */
  _escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /**
   * Update display after score changes
   */
  updateDisplay() {
    this.render();
  }

  /**
   * Add listener for display updates
   * @param {function} callback - Callback function to call on updates
   */
  addUpdateListener(callback) {
    if (typeof callback === 'function') {
      this.listeners.add(callback);
    }
  }

  /**
   * Remove update listener
   * @param {function} callback - Callback function to remove
   */
  removeUpdateListener(callback) {
    this.listeners.delete(callback);
  }

  /**
   * Notify all listeners of display updates
   * @private
   */
  _notifyUpdate() {
    this.listeners.forEach(callback => {
      try {
        callback(this.scoreTracker.getGameSummary());
      } catch (error) {
        console.error('Error in update listener:', error);
      }
    });
  }

  /**
   * Get current display state for testing
   * @returns {Object} Current display state
   */
  getDisplayState() {
    return {
      hasContainer: !!this.container,
      isRendered: !!(this.container && this.container.innerHTML),
      listenerCount: this.listeners.size
    };
  }
}

export default ScoreDisplay;