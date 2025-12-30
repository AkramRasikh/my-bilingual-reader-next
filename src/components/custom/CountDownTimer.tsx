import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

export default function CountdownTimer({ audioTimeRef }) {
  const [targetTime, setTargetTime] = useState(null);
  const [remaining, setRemaining] = useState(null);

  useEffect(() => {
    if (!targetTime) return;

    const interval = setInterval(() => {
      if (audioTimeRef.current != null) {
        const now = audioTimeRef.current.currentTime;
        const diff = Math.max(0, targetTime - now);
        setRemaining(diff);
      }
    }, 200);

    return () => clearInterval(interval);
  }, [targetTime, audioTimeRef]);

  const startTimer = () => {
    if (audioTimeRef.current != null) {
      setTargetTime(audioTimeRef.current.currentTime + 60);
    }
  };

  const resetAndStopAudio = () => {
    setTargetTime(null);
    setRemaining(60);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const isOver = targetTime && audioTimeRef?.current.currentTime > targetTime;
  const displayTime = remaining !== null ? formatTime(remaining) : '1:00';

  return (
    <Button
      onClick={startTimer}
      onDoubleClick={resetAndStopAudio}
      data-testid='countdown-timer-button'
      className={`rounded-2xl text-xl font-mono shadow-md transition
        ${
          targetTime
            ? isOver
              ? 'bg-red-600 text-white animate-pulse'
              : 'bg-amber-500 text-black'
            : 'bg-gray-300 text-black'
        }
      `}
    >
      {displayTime}
    </Button>
  );
}
