import { Button } from '@/components/ui/button';

const LearningScreenChapterToggleWrapper = ({
  hasPreviousVideo,
  hasFollowingVideo,
  getNextTranscript,
  children,
}) => (
  <div className='flex-1 max-w-xl'>
    {hasPreviousVideo && (
      <Button
        className='m-auto flex p-2.5'
        variant='ghost'
        onClick={() => {
          getNextTranscript();
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
        }}
      >
        ⏬⏬⏬⏬⏬
      </Button>
    )}
  </div>
);

export default LearningScreenChapterToggleWrapper;
