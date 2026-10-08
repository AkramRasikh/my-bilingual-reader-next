import clsx from 'clsx';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import useLearningScreen from './useLearningScreen';
import CountUpTimer from '@/components/custom/CountUpTimer';

const LearningScreenActionBarVideoControls = () => {
  const {
    onlyShowEngState,
    setOnlyShowEngState,
    elapsed,
    countUpTimerIsRunning,
    onCountUpTimerPress,
    trackCurrentState,
    setTrackCurrentState,
    isInReviewMode,
    isSlowAudioState,
    isHoldSlowerAudioState,
    handleToggleSlowAudio,
  } = useLearningScreen();

  return (
    <div className='flex flex-col items-center gap-3'>
      <CountUpTimer
        elapsed={elapsed}
        isRunning={countUpTimerIsRunning}
        onTimerPress={onCountUpTimerPress}
      />
      <div className='flex gap-2 my-auto'>
        <Label data-testid='english-label' className='text-xs leading-none'>
          🇬🇧
        </Label>
        <Switch
          checked={!onlyShowEngState}
          onCheckedChange={() => setOnlyShowEngState(!onlyShowEngState)}
          data-testid='english-switch'
        />
      </div>
      <div className='flex gap-2 my-auto'>
        <Label data-testid='track-current-label' className='text-xs leading-none'>
          🔎
        </Label>
        <Switch
          checked={trackCurrentState}
          onCheckedChange={setTrackCurrentState}
          disabled={isInReviewMode}
          data-testid='track-current-switch'
        />
      </div>
      <div className='flex items-center gap-2'>
        <Label
          data-testid='slow-audio-label'
          data-slow-level={
            isHoldSlowerAudioState
              ? 'very-slow'
              : isSlowAudioState
                ? 'slow'
                : 'off'
          }
          className={clsx(
            'inline-flex h-5 w-5 items-center justify-center rounded-full text-xs leading-none',
            isHoldSlowerAudioState
              ? 'bg-red-500'
              : isSlowAudioState
                ? 'bg-amber-400'
                : 'bg-transparent',
          )}
        >
          🐢
        </Label>
        <Switch
          checked={isSlowAudioState}
          onCheckedChange={handleToggleSlowAudio}
          data-testid='slow-audio-switch'
        />
      </div>
    </div>
  );
};

export default LearningScreenActionBarVideoControls;
