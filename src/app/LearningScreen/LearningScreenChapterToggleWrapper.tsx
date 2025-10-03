import { Button } from '@/components/ui/button';

const LearningScreenChapterToggleWrapper = ({
  hasPreviousVideo,
  hasFollowingVideo,
  getNextTranscript,
  setSecondsState,
  children,
}) => (
  <div className='flex-1 max-w-xl'>
    {hasPreviousVideo && (
      <Button
        className='m-auto flex p-2.5'
        variant='ghost'
        onClick={() => {
          getNextTranscript();
          setSecondsState([]);
        }}
      >
        ⏫⏫⏫⏫⏫
      </Button>
    )}
    {children}
    {hasFollowingVideo && (
      <Button
        className='m-auto flex p-2.5'
        variant='ghost'
        onClick={() => {
          getNextTranscript(true);
          setSecondsState([]);
        }}
      >
        ⏬⏬⏬⏬⏬
      </Button>
    )}
  </div>
);

export default LearningScreenChapterToggleWrapper;
