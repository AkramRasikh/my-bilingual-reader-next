import ReviewSRSToggles from '@/components/custom/ReviewSRSToggles';
import { Button } from '@/components/ui/button';
import clsx from 'clsx';
import { PauseIcon, PlayIcon, RabbitIcon } from 'lucide-react';

const LearningScreenSnippetReview = ({
  item,
  handleLoopHere,
  isVideoPlaying,
  threeSecondLoopState,
  highlightFocusedText,
  handleReviewSnippets,
}) => {
  const thisIsPlaying = isVideoPlaying && threeSecondLoopState === item.time;
  return (
    <div className='rounded border text-center py-2 px-1'>
      <div className='flex mb-2 gap-1'>
        <div className='flex flex-col gap-2'>
          <Button
            className={clsx('h-7 w-7', thisIsPlaying ? 'bg-amber-300' : '')}
            onClick={() =>
              handleLoopHere({
                time: item.time,
                isContracted: item.isContracted,
              })
            }
          >
            {thisIsPlaying ? <PauseIcon /> : <PlayIcon />}
          </Button>
          {item?.isPreSnippet && (
            <RabbitIcon className='fill-amber-300 rounded m-auto' />
          )}
        </div>
        <p>
          {highlightFocusedText(
            item?.targetLang,
            item?.focusedText || item?.suggestedFocusText,
          )}
        </p>
      </div>
      <ReviewSRSToggles
        isSnippet
        contentItem={item}
        handleReviewFunc={handleReviewSnippets}
      />
    </div>
  );
};

export default LearningScreenSnippetReview;
