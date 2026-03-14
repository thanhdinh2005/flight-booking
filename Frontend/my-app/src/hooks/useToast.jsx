// src/hooks/useToast.js
import { useState, useRef, useCallback } from 'react';

/**
 * useToast – provides a show(message) function and the current toast state.
 * Auto-dismisses after `duration` ms.
 */
export function useToast(duration = 2500) {
  const [toast, setToast] = useState({ message: '', visible: false });
  const timerRef = useRef(null);

  const show = useCallback((message) => {
    clearTimeout(timerRef.current);
    setToast({ message, visible: true });
    timerRef.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, duration);
  }, [duration]);

  return { toast, show };
}