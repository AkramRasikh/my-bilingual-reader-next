import { Button } from '@/components/ui/button';

type CountUpTimerProps = {
  elapsed: number;
  isRunning: boolean;
  onTimerPress: () => void;
};

export default function CountUpTimer({
  elapsed,
  isRunning,
  onTimerPress,
}: CountUpTimerProps) {
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <Button
      onClick={onTimerPress}
      data-testid='countup-timer-button'
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
