// Undo/Redo hook for canvas state management
// Tracks items, connections, and boundaries as snapshots
import { useState, useCallback, useRef } from 'react';

const MAX_HISTORY = 50;

export function useUndoRedo(initialState = { items: [], connections: [], boundaries: [] }) {
  const [history, setHistory] = useState([initialState]);
  const [pointer, setPointer] = useState(0);
  const skipRecord = useRef(false);

  const current = history[pointer];

  const record = useCallback((state) => {
    if (skipRecord.current) {
      skipRecord.current = false;
      return;
    }
    setHistory(prev => {
      const newHistory = prev.slice(0, pointer + 1);
      newHistory.push(state);
      if (newHistory.length > MAX_HISTORY) newHistory.shift();
      return newHistory;
    });
    setPointer(prev => Math.min(prev + 1, MAX_HISTORY - 1));
  }, [pointer]);

  const undo = useCallback(() => {
    if (pointer <= 0) return null;
    skipRecord.current = true;
    const newPointer = pointer - 1;
    setPointer(newPointer);
    return history[newPointer];
  }, [pointer, history]);

  const redo = useCallback(() => {
    if (pointer >= history.length - 1) return null;
    skipRecord.current = true;
    const newPointer = pointer + 1;
    setPointer(newPointer);
    return history[newPointer];
  }, [pointer, history]);

  const reset = useCallback((state) => {
    setHistory([state]);
    setPointer(0);
  }, []);

  return {
    record,
    undo,
    redo,
    reset,
    canUndo: pointer > 0,
    canRedo: pointer < history.length - 1,
    current,
  };
}
