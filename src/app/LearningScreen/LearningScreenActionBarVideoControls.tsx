import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import CountdownTimer from '../../components/custom/CountDownTimer';
import useLearningScreen from './useLearningScreen';
import CountUpTimer from '@/components/custom/CountUpTimer';

const LearningScreenActionBarVideoControls = () => {
  const {
    onlyShowEngState,
    setOnlyShowEngState,
    ref,
    elapsed,
    setElapsed,
    trackCurrentState,
    setTrackCurrentState,
    isInReviewMode,
  } = useLearningScreen();

  return (
    <div className='flex pb-2 justify-center gap-4'>
      <div className='flex gap-2 my-auto'>
        <Label data-testid='english-label'>🇬🇧</Label>
        <Switch
          checked={!onlyShowEngState}
          onCheckedChange={() => setOnlyShowEngState(!onlyShowEngState)}
          data-testid='english-switch'
        />
      </div>
      <div className='w-px h-5 my-auto bg-gray-300' />
      <div className='flex gap-2 my-auto'>
        <Label data-testid='track-current-label'>Track</Label>
        <Switch
          checked={trackCurrentState}
          onCheckedChange={setTrackCurrentState}
          disabled={isInReviewMode}
          data-testid='track-current-switch'
        />
      </div>
      <div className='w-px h-5 my-auto bg-gray-300' />
      <CountdownTimer audioTimeRef={ref} />
      <div className='w-px h-5 my-auto bg-gray-300' />
      <CountUpTimer elapsed={elapsed} setElapsed={setElapsed} />
    </div>
  );
};

export default LearningScreenActionBarVideoControls;
