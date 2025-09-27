import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import CountdownTimer from '../CountDownTimer';
import useLearningScreen from './useLearningScreen';
import { Button } from '@/components/ui/button';

const LearningScreenActionBar = () => {
  const {
    isInReviewMode,
    setIsInReviewMode,
    onlyShowEngState,
    setOnlyShowEngState,
    showOnVideoTranscriptState,
    setShowOnVideoTranscriptState,
    ref,
    setLatestDueIdState,
  } = useLearningScreen();

  const scrollToLastReviewed = () =>
    setLatestDueIdState((prev) => ({ ...prev, triggerScroll: true }));

  return (
    <div className='flex flex-col items-start gap-2 my-2 p-2'>
      <div className='flex gap-2 mx-auto flex-wrap'>
        <div className='flex gap-2 m-auto'>
          <Label>Review Mode</Label>
          <Switch
            checked={isInReviewMode}
            onCheckedChange={setIsInReviewMode}
          />
        </div>
        <div className='flex gap-2 m-auto'>
          <Label>🇬🇧</Label>
          <Switch
            checked={!onlyShowEngState}
            onCheckedChange={() => setOnlyShowEngState(!onlyShowEngState)}
          />
        </div>
        <div className='flex gap-2 m-auto'>
          <Label>Subtitles</Label>
          <Switch
            checked={showOnVideoTranscriptState}
            onCheckedChange={setShowOnVideoTranscriptState}
          />
        </div>
        <CountdownTimer audioTimeRef={ref} />
        <Button variant={'link'} onClick={scrollToLastReviewed}>
          Last reviewed
        </Button>
      </div>
    </div>
  );
};

export default LearningScreenActionBar;
