import { Button } from '@/components/ui/button';
import { useEffect, useRef, useState } from 'react';

export default function CountUpTimer() {
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const startTimeRef = useRef(null); // Stores when the timer was started
  const savedElapsedRef = useRef(0); // Stores elapsed when paused
  const clickTimeoutRef = useRef(null); // For distinguishing single vs double click

  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        const now = Date.now();
        setElapsed(
          savedElapsedRef.current + (now - startTimeRef.current) / 1000,
        );
      }, 200);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const handleClick = () => {
    // Handle single vs double click with timeout
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
      handleDoubleClick();
    } else {
      clickTimeoutRef.current = setTimeout(() => {
        handleSingleClick();
        clickTimeoutRef.current = null;
      }, 200);
    }
  };

  const handleSingleClick = () => {
    if (isRunning) {
      // Pause
      savedElapsedRef.current = elapsed;
      setIsRunning(false);
    } else {
      // Start
      startTimeRef.current = Date.now();
      setIsRunning(true);
    }
  };

  const handleDoubleClick = () => {
    // Reset but don’t auto-start
    setElapsed(0);
    savedElapsedRef.current = 0;
    setIsRunning(false);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <Button
      onClick={handleClick}
      className={`rounded-2xl text-xl font-mono shadow-md transition
        ${
          isRunning
            ? 'bg-green-500 text-white'
            : elapsed > 0
            ? 'bg-amber-400 text-black'
            : 'bg-gray-200 text-black'
        }
      `}
    >
      {formatTime(elapsed)}
    </Button>
  );
}
