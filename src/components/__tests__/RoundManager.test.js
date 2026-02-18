import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import RoundManager from '../RoundManager';

describe('RoundManager', () => {
  const mockOnRoundChange = jest.fn();
  const mockOnGameComplete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('displays initial round 1 with 1 hand', () => {
    render(<RoundManager onRoundChange={mockOnRoundChange} />);
    
    expect(screen.getByText('Round 1 of 10')).toBeInTheDocument();
    expect(screen.getByText('Hands this round: 1')).toBeInTheDocument();
    expect(screen.getByText('Completed: 0 / 1')).toBeInTheDocument();
  });

  test('shows correct number of hands for each round', async () => {
    const { rerender } = render(<RoundManager onRoundChange={mockOnRoundChange} />);
    
    // Mock completing round 1
    rerender(
      <RoundManager 
        onRoundChange={mockOnRoundChange}
        gameData={{ handsCompleted: 1, scores: [100] }}
      />
    );
    
    await waitFor(() => {
      expect(screen.getByText('✅ Round Complete')).toBeInTheDocument();
    });
    
    // Advance to round 2
    fireEvent.click(screen.getByText('Next Round →'));
    
    expect(mockOnRoundChange).toHaveBeenCalledWith(2, 2);
  });

  test('prevents advancing without completing current round', () => {
    render(
      <RoundManager 
        onRoundChange={mockOnRoundChange}
        gameData={{ handsCompleted: 0 }}
      />
    );
    
    const nextButton = screen.getByText('Next Round →');
    expect(nextButton).toHaveClass('disabled');
    
    // Mock window.alert
    window.alert = jest.fn();
    
    fireEvent.click(nextButton);
    expect(window.alert).toHaveBeenCalledWith(
      'Cannot advance! Complete all 1 hands for Round 1'
    );
  });

  test('displays game completion after round 10', async () => {
    const { rerender } = render(
      <RoundManager 
        onRoundChange={mockOnRoundChange}
        onGameComplete={mockOnGameComplete}
      />
    );
    
    // Simulate being on round 10 and completing it
    for (let round = 1; round <= 10; round++) {
      rerender(
        <RoundManager 
          onRoundChange={mockOnRoundChange}
          onGameComplete={mockOnGameComplete}
          gameData={{ handsCompleted: round, scores: new Array(round).fill(100) }}
        />
      );
      
      if (round < 10) {
        fireEvent.click(screen.getByText('Next Round →'));
      } else {
        fireEvent.click(screen.getByText('Finish Game'));
        expect(mockOnGameComplete).toHaveBeenCalled();
      }
    }
  });

  test('displays correct progress through 10 rounds', () => {
    render(<RoundManager onRoundChange={mockOnRoundChange} />);
    
    // Check that all 10 rounds are displayed in overview
    for (let i = 1; i <= 10; i++) {
      expect(screen.getByText(i.toString())).toBeInTheDocument();
      expect(screen.getByText(`${i} hands`)).toBeInTheDocument();
    }
  });

  test('round overview shows correct states', async () => {
    const { rerender } = render(<RoundManager onRoundChange={mockOnRoundChange} />);
    
    // Round 1 should be current
    const round1Tile = screen.getByText('1').closest('.round-tile');
    expect(round1Tile).toHaveClass('current');
    
    // Complete round 1
    rerender(
      <RoundManager 
        onRoundChange={mockOnRoundChange}
        gameData={{ handsCompleted: 1, scores: [100] }}
      />
    );
    
    await waitFor(() => {
      expect(round1Tile).toHaveClass('complete');
    });
  });
});