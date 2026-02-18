import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import BonusPointsInput from '../BonusPointsInput';

const mockPlayers = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
  { id: 3, name: 'Charlie' }
];

const mockRoundResults = [
  { playerId: 1, bid: 3, tricks: 3 }, // exact bid
  { playerId: 2, bid: 2, tricks: 1 }, // missed bid
  { playerId: 3, bid: 1, tricks: 1 }  // exact bid
];

describe('BonusPointsInput', () => {
  const mockOnBonusPointsChange = jest.fn();

  beforeEach(() => {
    mockOnBonusPointsChange.mockClear();
  });

  test('renders bonus points input for all players', () => {
    render(
      <BonusPointsInput
        players={mockPlayers}
        currentRound={1}
        onBonusPointsChange={mockOnBonusPointsChange}
        roundResults={mockRoundResults}
      />
    );

    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Charlie')).toBeInTheDocument();
  });

  test('allows bonus points entry for players with exact bids', () => {
    render(
      <BonusPointsInput
        players={mockPlayers}
        currentRound={1}
        onBonusPointsChange={mockOnBonusPointsChange}
        roundResults={mockRoundResults}
      />
    );

    const aliceInput = screen.getAllByRole('spinbutton')[0];
    expect(aliceInput).not.toBeDisabled();
    
    fireEvent.change(aliceInput, { target: { value: '5' } });
    expect(mockOnBonusPointsChange).toHaveBeenCalled();
  });

  test('disables bonus points input for players without exact bids', () => {
    render(
      <BonusPointsInput
        players={mockPlayers}
        currentRound={1}
        onBonusPointsChange={mockOnBonusPointsChange}
        roundResults={mockRoundResults}
      />
    );

    const bobInput = screen.getAllByRole('spinbutton')[1];
    expect(bobInput).toBeDisabled();
  });

  test('shows warning when bonus points are ignored', () => {
    render(
      <BonusPointsInput
        players={mockPlayers}
        currentRound={1}
        onBonusPointsChange={mockOnBonusPointsChange}
        roundResults={mockRoundResults}
      />
    );

    // Bob has missed bid, so bonus should be ignored
    const bobContainer = screen.getByText('Bob').closest('.bonus-point-item');
    expect(bobContainer).toHaveClass('disabled');
  });

  test('only accepts positive bonus point values', () => {
    render(
      <BonusPointsInput
        players={mockPlayers}
        currentRound={1}
        onBonusPointsChange={mockOnBonusPointsChange}
        roundResults={mockRoundResults}
      />
    );

    const aliceInput = screen.getAllByRole('spinbutton')[0];
    
    fireEvent.change(aliceInput, { target: { value: '-5' } });
    expect(aliceInput.value).toBe('0');
  });
});