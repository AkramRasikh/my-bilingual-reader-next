import { useEffect, useRef, useState } from 'react';

const DOUBLE_CLICK_MS = 200;

export function useCountUpTimer(
  elapsed: number,
  setElapsed: React.Dispatch<React.SetStateAction<number>>,
) {
  const [isRunning, setIsRunning] = useState(false);
  const startTimeRef = useRef<number | null>(null);
  const savedElapsedRef = useRef(0);
  const clickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isRunning) {
      return;
    }
    const interval = setInterval(() => {
      if (startTimeRef.current === null) {
        return;
      }
      const now = Date.now();
      setElapsed(
        savedElapsedRef.current + (now - startTimeRef.current) / 1000,
      );
    }, 200);
    return () => clearInterval(interval);
  }, [isRunning, setElapsed]);

  const handleSingleClick = () => {
    if (isRunning) {
      savedElapsedRef.current = elapsed;
      setIsRunning(false);
    } else {
      startTimeRef.current = Date.now();
      setIsRunning(true);
    }
  };

  const handleDoubleClick = () => {
    setElapsed(0);
    savedElapsedRef.current = 0;
    setIsRunning(false);
  };

  const onTimerPress = () => {
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
      handleDoubleClick();
    } else {
      clickTimeoutRef.current = setTimeout(() => {
        handleSingleClick();
        clickTimeoutRef.current = null;
      }, DOUBLE_CLICK_MS);
    }
  };

  return { isRunning, onTimerPress };
}
