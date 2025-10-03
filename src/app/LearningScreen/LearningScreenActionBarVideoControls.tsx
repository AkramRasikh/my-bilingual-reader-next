import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import CountdownTimer from '../../components/custom/CountDownTimer';
import useLearningScreen from './useLearningScreen';
import CountUpTimer from '@/components/custom/CountUpTimer';

const LearningScreenActionBarVideoControls = () => {
  const {
    isInReviewMode,
    setIsInReviewMode,
    onlyShowEngState,
    setOnlyShowEngState,
    showOnVideoTranscriptState,
    setShowOnVideoTranscriptState,
    ref,
  } = useLearningScreen();

  return (
    <div className='flex pb-2 justify-center gap-4'>
      <div className='flex gap-2 my-auto'>
        <Label>Review</Label>
        <Switch checked={isInReviewMode} onCheckedChange={setIsInReviewMode} />
      </div>
      <div className='w-px h-5 my-auto bg-gray-300' />
      <div className='flex gap-2 my-auto'>
        <Label>🇬🇧</Label>
        <Switch
          checked={!onlyShowEngState}
          onCheckedChange={() => setOnlyShowEngState(!onlyShowEngState)}
        />
      </div>
      <div className='w-px h-5 my-auto bg-gray-300' />
      <div className='flex gap-2 my-auto'>
        <Label>Subs</Label>
        <Switch
          checked={showOnVideoTranscriptState}
          onCheckedChange={setShowOnVideoTranscriptState}
        />
      </div>
      <div className='w-px h-5 my-auto bg-gray-300' />
      <CountdownTimer audioTimeRef={ref} />
      <CountUpTimer />
    </div>
  );
};

export default LearningScreenActionBarVideoControls;
