import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import BiddingCollection from '../BiddingCollection';

const mockPlayers = [
  { id: '1', name: 'Alice' },
  { id: '2', name: 'Bob' },
  { id: '3', name: 'Charlie' }
];

const defaultProps = {
  currentRound: 3,
  availableHands: 5,
  players: mockPlayers,
  onBidsConfirmed: jest.fn()
};

describe('BiddingCollection Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('displays current round and available hands', () => {
    render(<BiddingCollection {...defaultProps} />);
    
    expect(screen.getByText('Round 3')).toBeInTheDocument();
    expect(screen.getByText('Available Hands: 5')).toBeInTheDocument();
  });

  test('renders bid inputs for each player', () => {
    render(<BiddingCollection {...defaultProps} />);
    
    expect(screen.getByLabelText('Alice:')).toBeInTheDocument();
    expect(screen.getByLabelText('Bob:')).toBeInTheDocument();
    expect(screen.getByLabelText('Charlie:')).toBeInTheDocument();
  });

  test('validates bid is not greater than available hands', async () => {
    render(<BiddingCollection {...defaultProps} />);
    
    const aliceInput = screen.getByLabelText('Alice:');
    fireEvent.change(aliceInput, { target: { value: '6' } });
    
    await waitFor(() => {
      expect(screen.getByText('Bid cannot exceed 5 hands')).toBeInTheDocument();
    });
  });

  test('validates bid is not negative', async () => {
    render(<BiddingCollection {...defaultProps} />);
    
    const bobInput = screen.getByLabelText('Bob:');
    fireEvent.change(bobInput, { target: { value: '-1' } });
    
    await waitFor(() => {
      expect(screen.getByText('Bid cannot be negative')).toBeInTheDocument();
    });
  });

  test('allows valid bids within range', () => {
    render(<BiddingCollection {...defaultProps} />);
    
    const aliceInput = screen.getByLabelText('Alice:');
    fireEvent.change(aliceInput, { target: { value: '3' } });
    
    expect(aliceInput.value).toBe('3');
    expect(screen.queryByText('Bid cannot exceed 5 hands')).not.toBeInTheDocument();
  });

  test('disables confirm button when there are errors', async () => {
    render(<BiddingCollection {...defaultProps} />);
    
    const aliceInput = screen.getByLabelText('Alice:');
    fireEvent.change(aliceInput, { target: { value: '6' } });
    
    const confirmBtn = screen.getByText('Confirm Bids');
    
    await waitFor(() => {
      expect(confirmBtn).toBeDisabled();
    });
  });

  test('shows bid summary after confirmation', async () => {
    render(<BiddingCollection {...defaultProps} />);
    
    // Set valid bids
    fireEvent.change(screen.getByLabelText('Alice:'), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText('Bob:'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Charlie:'), { target: { value: '3' } });
    
    // Confirm bids
    fireEvent.click(screen.getByText('Confirm Bids'));
    
    await waitFor(() => {
      expect(screen.getByText('Collected Bids:')).toBeInTheDocument();
      expect(screen.getByText('Alice:')).toBeInTheDocument();
      expect(screen.getByText('2 hands')).toBeInTheDocument();
      expect(screen.getByText('Bob:')).toBeInTheDocument();
      expect(screen.getByText('1 hands')).toBeInTheDocument();
      expect(screen.getByText('Charlie:')).toBeInTheDocument();
      expect(screen.getByText('3 hands')).toBeInTheDocument();
    });
  });

  test('allows editing bids after confirmation', async () => {
    render(<BiddingCollection {...defaultProps} />);
    
    // Set and confirm bids
    fireEvent.change(screen.getByLabelText('Alice:'), { target: { value: '2' } });
    fireEvent.click(screen.getByText('Confirm Bids'));
    
    // Click edit
    await waitFor(() => {
      fireEvent.click(screen.getByText('Edit Bids'));
    });
    
    // Should show inputs again
    await waitFor(() => {
      expect(screen.getByLabelText('Alice:')).toBeInTheDocument();
      expect(screen.getByText('Confirm Bids')).toBeInTheDocument();
    });
  });

  test('calls onBidsConfirmed with correct data', async () => {
    const mockOnBidsConfirmed = jest.fn();
    render(<BiddingCollection {...defaultProps} onBidsConfirmed={mockOnBidsConfirmed} />);
    
    // Set bids
    fireEvent.change(screen.getByLabelText('Alice:'), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText('Bob:'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Charlie:'), { target: { value: '0' } });
    
    // Confirm bids
    fireEvent.click(screen.getByText('Confirm Bids'));
    
    // Final confirm
    await waitFor(() => {
      fireEvent.click(screen.getByText('Proceed to Round'));
    });
    
    expect(mockOnBidsConfirmed).toHaveBeenCalledWith({
      '1': 2,
      '2': 1,
      '3': 0
    });
  });
});