import clsx from 'clsx';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import useLearningScreen from './useLearningScreen';
import CountUpTimer from '@/components/custom/CountUpTimer';

const toggleRowClass = 'grid grid-cols-[1.25rem_2rem] items-center gap-2';
const emojiClass =
  'flex size-5 shrink-0 items-center justify-center text-sm leading-none';

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
    autoSentenceBreakdownEnabled,
    setAutoSentenceBreakdownEnabled,
    showPlaybackCaptionsState,
    setShowPlaybackCaptionsState,
    showWordHintsState,
    setShowWordHintsState,
  } = useLearningScreen();

  return (
    <div className='flex flex-col items-center gap-3'>
      <CountUpTimer
        elapsed={elapsed}
        isRunning={countUpTimerIsRunning}
        onTimerPress={onCountUpTimerPress}
      />
      <div className='flex flex-col gap-3'>
        <div className={toggleRowClass}>
          <Label data-testid='english-label' className={emojiClass}>
            🇬🇧
          </Label>
          <Switch
            checked={!onlyShowEngState}
            onCheckedChange={() => setOnlyShowEngState(!onlyShowEngState)}
            data-testid='english-switch'
          />
        </div>
        <div className={toggleRowClass}>
          <Label data-testid='track-current-label' className={emojiClass}>
            🔎
          </Label>
          <Switch
            checked={trackCurrentState}
            onCheckedChange={setTrackCurrentState}
            disabled={isInReviewMode}
            data-testid='track-current-switch'
          />
        </div>
        <div className={toggleRowClass}>
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
              emojiClass,
              'rounded-full',
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
        <div className={toggleRowClass}>
          <Label
            data-testid='auto-sentence-breakdown-label'
            className={emojiClass}
          >
            🧱
          </Label>
          <Switch
            checked={!isInReviewMode && autoSentenceBreakdownEnabled}
            onCheckedChange={setAutoSentenceBreakdownEnabled}
            disabled={isInReviewMode}
            data-testid='auto-sentence-breakdown-switch'
            aria-label='Auto sentence breakdown'
          />
        </div>
        <div className={toggleRowClass}>
          <Label data-testid='playback-captions-label' className={emojiClass}>
            💬
          </Label>
          <Switch
            checked={showPlaybackCaptionsState}
            onCheckedChange={setShowPlaybackCaptionsState}
            data-testid='playback-captions-switch'
            aria-label='Playback captions'
          />
        </div>
        <div className={toggleRowClass}>
          <Label data-testid='word-hints-label' className={emojiClass}>
            💡
          </Label>
          <Switch
            checked={showWordHintsState}
            onCheckedChange={setShowWordHintsState}
            data-testid='word-hints-switch'
            aria-label='Word hints'
          />
        </div>
      </div>
    </div>
  );
};

export default LearningScreenActionBarVideoControls;
