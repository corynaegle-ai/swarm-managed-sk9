import { renderHook, act } from '@testing-library/react';
import useRoundManager from '../useRoundManager';

describe('useRoundManager', () => {
  test('initializes with correct default values', () => {
    const { result } = renderHook(() => useRoundManager());
    
    expect(result.current.currentRound).toBe(1);
    expect(result.current.handsRequired).toBe(1);
    expect(result.current.handsCompleted).toBe(0);
    expect(result.current.gameComplete).toBe(false);
    expect(result.current.canAdvance).toBe(false);
    expect(result.current.canGoBack).toBe(false);
  });

  test('updates hand completion correctly', () => {
    const { result } = renderHook(() => useRoundManager());
    
    act(() => {
      result.current.updateHandCompletion(1, [100]);
    });
    
    expect(result.current.handsCompleted).toBe(1);
    expect(result.current.canAdvance).toBe(true);
    expect(result.current.isCurrentRoundComplete).toBe(true);
  });

  test('prevents advancing incomplete round', () => {
    const { result } = renderHook(() => useRoundManager());
    
    expect(() => {
      act(() => {
        result.current.advanceRound();
      });
    }).toThrow('Cannot advance from round 1. Complete all 1 hands first.');
  });

  test('advances round when complete', () => {
    const { result } = renderHook(() => useRoundManager());
    
    // Complete round 1
    act(() => {
      result.current.updateHandCompletion(1, [100]);
    });
    
    // Advance to round 2
    act(() => {
      result.current.advanceRound();
    });
    
    expect(result.current.currentRound).toBe(2);
    expect(result.current.handsRequired).toBe(2);
    expect(result.current.handsCompleted).toBe(0);
  });

  test('validates round progression through all 10 rounds', () => {
    const { result } = renderHook(() => useRoundManager());
    
    // Progress through all rounds
    for (let round = 1; round <= 10; round++) {
      expect(result.current.currentRound).toBe(round);
      expect(result.current.handsRequired).toBe(round);
      
      // Complete the round
      act(() => {
        result.current.updateHandCompletion(round, new Array(round).fill(100));
      });
      
      if (round < 10) {
        act(() => {
          result.current.advanceRound();
        });
      } else {
        // Complete the game
        act(() => {
          result.current.advanceRound();
        });
        expect(result.current.gameComplete).toBe(true);
      }
    }
  });

  test('calculates progress correctly', () => {
    const { result } = renderHook(() => useRoundManager());
    
    // Complete first 3 rounds
    for (let round = 1; round <= 3; round++) {
      act(() => {
        result.current.updateHandCompletion(round, new Array(round).fill(100));
      });
      
      if (round < 3) {
        act(() => {
          result.current.advanceRound();
        });
      }
    }
    
    const progress = result.current.getRoundProgress();
    expect(progress.completedRounds).toBe(3);
    expect(progress.totalRounds).toBe(10);
    expect(progress.completedHands).toBe(6); // 1+2+3
    expect(progress.totalHands).toBe(55); // 1+2+...+10
  });

  test('prevents skipping rounds', () => {
    const { result } = renderHook(() => useRoundManager());
    
    expect(() => {
      act(() => {
        result.current.goToRound(5);
      });
    }).toThrow('Cannot skip to round 5. Complete current round 1 first.');
  });

  test('allows going back to previous rounds', () => {
    const { result } = renderHook(() => useRoundManager());
    
    // Complete round 1 and advance
    act(() => {
      result.current.updateHandCompletion(1, [100]);
    });
    act(() => {
      result.current.advanceRound();
    });
    
    expect(result.current.currentRound).toBe(2);
    expect(result.current.canGoBack).toBe(true);
    
    // Go back to round 1
    act(() => {
      result.current.goToRound(1);
    });
    
    expect(result.current.currentRound).toBe(1);
  });
});