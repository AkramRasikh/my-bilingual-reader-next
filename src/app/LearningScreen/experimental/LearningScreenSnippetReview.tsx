import LoadingSpinner from '@/components/custom/LoadingSpinner';
import ReviewSRSToggles from '@/components/custom/ReviewSRSToggles';
import { highlightApprox } from '@/components/custom/TranscriptItem/TranscriptItemLoopingSentence';
import { Button } from '@/components/ui/button';
import clsx from 'clsx';
import {
  MoveLeftIcon,
  MoveRightIcon,
  PauseIcon,
  PlayIcon,
  RabbitIcon,
  SaveIcon,
  Undo2Icon,
} from 'lucide-react';
import { useMemo, useState } from 'react';

const LearningScreenSnippetReview = ({
  item,
  handleLoopHere,
  isVideoPlaying,
  threeSecondLoopState,
  highlightFocusedText,
  handleReviewSnippets,
}) => {
  const [startIndexKeyState, setStartIndexKeyState] = useState(0);
  const [endIndexKeyState, setEndIndexKeyState] = useState(0);
  const [isLoadingSaveSnippetState, setIsLoadingSaveSnippetState] =
    useState(false);
  const thisIsPlaying = isVideoPlaying && threeSecondLoopState === item.time;

  const isPreSnippet = item?.isPreSnippet;

  const onMoveLeft = () => {
    setStartIndexKeyState(startIndexKeyState - 1);
    setEndIndexKeyState(endIndexKeyState - 1);
  };

  const onMoveRight = () => {
    setStartIndexKeyState(startIndexKeyState + 1);
    setEndIndexKeyState(endIndexKeyState + 1);
  };

  const onReset = () => {
    setStartIndexKeyState(0);
    setEndIndexKeyState(0);
  };

  const handleUpdateSnippet = () => {
    try {
      setIsLoadingSaveSnippetState(true);
    } catch (error) {
      console.log('## handleUpdateSnippet error', error);
    } finally {
      setIsLoadingSaveSnippetState(false);
    }
  };

  const { htmlText } = useMemo(() => {
    return highlightApprox(
      item.targetLang,
      item.suggestedFocusText,
      isLoadingSaveSnippetState,
      startIndexKeyState,
      endIndexKeyState,
    );
  }, [item, isLoadingSaveSnippetState, startIndexKeyState, endIndexKeyState]);

  const indexHasChanged = endIndexKeyState !== 0 || startIndexKeyState !== 0;

  return (
    <div className='relative'>
      {isLoadingSaveSnippetState && (
        <div className='absolute right-1/2 top-3/10'>
          <LoadingSpinner />
        </div>
      )}
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
          {isPreSnippet ? (
            <p dangerouslySetInnerHTML={{ __html: htmlText }} />
          ) : (
            <p>
              {highlightFocusedText(
                item?.targetLang,
                item?.focusedText || item?.suggestedFocusText,
              )}
            </p>
          )}
        </div>
        {isPreSnippet && (
          <div className='flex flex-row px-2'>
            <div className='flex flex-row gap-2 m-auto justify-center mb-3'>
              <Button
                onClick={onMoveLeft}
                variant={'outline'}
                disabled={isLoadingSaveSnippetState}
              >
                <MoveLeftIcon />
              </Button>
              <Button
                onClick={onReset}
                variant={'destructive'}
                disabled={!indexHasChanged || isLoadingSaveSnippetState}
              >
                <Undo2Icon />
              </Button>
              <Button
                onClick={onMoveRight}
                variant={'outline'}
                disabled={isLoadingSaveSnippetState}
              >
                <MoveRightIcon />
              </Button>
            </div>
            <div>
              <Button
                variant={'outline'}
                disabled={indexHasChanged || isLoadingSaveSnippetState}
                onClick={handleUpdateSnippet}
                className={clsx(
                  indexHasChanged ? 'animate-pulse bg-amber-300' : 'opacity-25',
                )}
              >
                <SaveIcon />
              </Button>
            </div>
          </div>
        )}
        <ReviewSRSToggles
          isSnippet
          contentItem={item}
          handleReviewFunc={handleReviewSnippets}
        />
      </div>
    </div>
  );
};

export default LearningScreenSnippetReview;
