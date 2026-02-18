import { renderHook, act } from '@testing-library/react';
import { useBonusPoints } from '../useBonusPoints';

describe('useBonusPoints', () => {
  test('sets and gets bonus points for rounds', () => {
    const { result } = renderHook(() => useBonusPoints());

    act(() => {
      result.current.setBonusPointsForRound(1, { 1: 5, 2: 3 });
    });

    expect(result.current.getBonusPointsForRound(1)).toEqual({ 1: 5, 2: 3 });
  });

  test('calculates applied bonus points only for exact bids', () => {
    const { result } = renderHook(() => useBonusPoints());
    const roundResults = [
      { playerId: 1, bid: 3, tricks: 3 }, // exact
      { playerId: 2, bid: 2, tricks: 1 }  // missed
    ];

    act(() => {
      result.current.setBonusPointsForRound(1, { 1: 5, 2: 5 });
    });

    // Player 1 gets bonus (exact bid)
    expect(result.current.calculateAppliedBonusPoints(1, 1, roundResults)).toBe(5);
    
    // Player 2 doesn't get bonus (missed bid)
    expect(result.current.calculateAppliedBonusPoints(1, 2, roundResults)).toBe(0);
  });

  test('calculates total bonus points across rounds', () => {
    const { result } = renderHook(() => useBonusPoints());
    const allRoundResults = {
      1: [{ playerId: 1, bid: 3, tricks: 3 }],
      2: [{ playerId: 1, bid: 2, tricks: 2 }]
    };

    act(() => {
      result.current.setBonusPointsForRound(1, { 1: 5 });
      result.current.setBonusPointsForRound(2, { 1: 3 });
    });

    expect(result.current.getTotalBonusPointsForPlayer(1, allRoundResults)).toBe(8);
  });

  test('clears all bonus points', () => {
    const { result } = renderHook(() => useBonusPoints());

    act(() => {
      result.current.setBonusPointsForRound(1, { 1: 5, 2: 3 });
    });

    expect(result.current.getBonusPointsForRound(1)).toEqual({ 1: 5, 2: 3 });

    act(() => {
      result.current.clearBonusPoints();
    });

    expect(result.current.getBonusPointsForRound(1)).toEqual({});
  });
});