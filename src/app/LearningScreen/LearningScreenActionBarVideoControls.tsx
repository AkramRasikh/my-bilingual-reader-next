import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import useLearningScreen from './useLearningScreen';
import CountUpTimer from '@/components/custom/CountUpTimer';

const LearningScreenActionBarVideoControls = () => {
  const {
    onlyShowEngState,
    setOnlyShowEngState,
    elapsed,
    setElapsed,
    trackCurrentState,
    setTrackCurrentState,
    isInReviewMode,
  } = useLearningScreen();

  return (
    <div className='flex flex-col items-center pb-2 gap-3'>
      <CountUpTimer elapsed={elapsed} setElapsed={setElapsed} />
      <div className='flex gap-2 my-auto'>
        <Label data-testid='english-label'>🇬🇧</Label>
        <Switch
          checked={!onlyShowEngState}
          onCheckedChange={() => setOnlyShowEngState(!onlyShowEngState)}
          data-testid='english-switch'
        />
      </div>
      <div className='flex gap-2 my-auto'>
        <Label data-testid='track-current-label'>🔎</Label>
        <Switch
          checked={trackCurrentState}
          onCheckedChange={setTrackCurrentState}
          disabled={isInReviewMode}
          data-testid='track-current-switch'
        />
      </div>
    </div>
  );
};

export default LearningScreenActionBarVideoControls;
