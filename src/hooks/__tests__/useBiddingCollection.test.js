import { renderHook, act } from '@testing-library/react';
import { useBiddingCollection } from '../useBiddingCollection';

const mockPlayers = [
  { id: '1', name: 'Alice' },
  { id: '2', name: 'Bob' }
];

describe('useBiddingCollection Hook', () => {
  test('initializes with default values', () => {
    const { result } = renderHook(() => useBiddingCollection());
    
    expect(result.current.currentBids).toEqual({});
    expect(result.current.biddingHistory).toEqual([]);
    expect(result.current.isCollecting).toBe(false);
  });

  test('starts bidding collection correctly', () => {
    const { result } = renderHook(() => useBiddingCollection());
    
    act(() => {
      result.current.startBiddingCollection(1, 5, mockPlayers);
    });
    
    expect(result.current.isCollecting).toBe(true);
    expect(result.current.currentBids).toEqual({
      '1': 0,
      '2': 0
    });
  });

  test('validates bids correctly', () => {
    const { result } = renderHook(() => useBiddingCollection());
    
    const validBids = { '1': 3, '2': 2 };
    const invalidBids = { '1': 6, '2': -1 };
    
    const validResult = result.current.validateBids(validBids, 5);
    expect(validResult.isValid).toBe(true);
    expect(validResult.errors).toEqual({});
    
    const invalidResult = result.current.validateBids(invalidBids, 5);
    expect(invalidResult.isValid).toBe(false);
    expect(invalidResult.errors['1']).toBe('Bid cannot exceed 5 hands');
    expect(invalidResult.errors['2']).toBe('Bid cannot be negative');
  });

  test('completes bidding collection and updates history', () => {
    const { result } = renderHook(() => useBiddingCollection());
    
    const finalBids = { '1': 3, '2': 2 };
    
    act(() => {
      result.current.completeBiddingCollection(finalBids, 1);
    });
    
    expect(result.current.isCollecting).toBe(false);
    expect(result.current.currentBids).toEqual({});
    expect(result.current.biddingHistory).toEqual([
      { round: 1, bids: finalBids }
    ]);
  });

  test('calculates total bids for round correctly', () => {
    const { result } = renderHook(() => useBiddingCollection());
    
    act(() => {
      result.current.completeBiddingCollection({ '1': 3, '2': 2 }, 1);
    });
    
    const total = result.current.getTotalBidsForRound(1);
    expect(total).toBe(5);
    
    const noRoundTotal = result.current.getTotalBidsForRound(2);
    expect(noRoundTotal).toBe(0);
  });

  test('maintains bidding history across multiple rounds', () => {
    const { result } = renderHook(() => useBiddingCollection());
    
    act(() => {
      result.current.completeBiddingCollection({ '1': 3, '2': 2 }, 1);
      result.current.completeBiddingCollection({ '1': 1, '2': 4 }, 2);
    });
    
    const history = result.current.getBiddingHistory();
    expect(history).toHaveLength(2);
    expect(history[0]).toEqual({ round: 1, bids: { '1': 3, '2': 2 } });
    expect(history[1]).toEqual({ round: 2, bids: { '1': 1, '2': 4 } });
  });
});