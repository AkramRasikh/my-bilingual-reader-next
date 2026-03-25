import clsx from 'clsx';
import { Loader2, SaveIcon } from 'lucide-react';
import { RefObject } from 'react';
import { Button } from '@/components/ui/button';
import LearningScreenLoopBtn from './LearningScreenLoopBtn';
import LearningScreenLoopUI from './LearningScreenLoopUI';
import type { OverlappingTextMemoized } from '@/app/types/video-player-types';

interface LearningScreenThreeSecondLoopElProps {
  overlappingTextMemoized: OverlappingTextMemoized | null;
  masterTextRef: RefObject<HTMLParagraphElement | null>;
  showSaveSnippetButton: boolean;
  isLoadingSaveSnippetState: boolean;
  highlightedTextFocusLoopState: string;
  onSaveSnippetClick: () => void;
}

const LearningScreenThreeSecondLoopEl = ({
  overlappingTextMemoized,
  masterTextRef,
  showSaveSnippetButton,
  isLoadingSaveSnippetState,
  highlightedTextFocusLoopState,
  onSaveSnippetClick,
}: LearningScreenThreeSecondLoopElProps) => {

  return (
    <>
      <LearningScreenLoopUI />
      <div className='flex w-full justify-between gap-2'>
        {overlappingTextMemoized ? (
          <p
            ref={masterTextRef}
            data-testid='video-player-snippet-text'
            className={
              'text-center font-bold text-lg backdrop-brightness-90 p-1 m-1 rounded-lg text-white m-auto'}
          >
            {overlappingTextMemoized?.targetLang}
          </p>
        ) : null}

        <LearningScreenLoopBtn />

        {showSaveSnippetButton  && (
          <Button
            data-testid='save-snippet-button'
            size='icon'
            className={clsx(
              'rounded-full h-8 w-8 my-auto',
              isLoadingSaveSnippetState ? 'animate-pulse bg-amber-600' : '',
              highlightedTextFocusLoopState ? 'animate-in bg-green-600' : '',
            )}
            onClick={onSaveSnippetClick}
            disabled={!highlightedTextFocusLoopState || isLoadingSaveSnippetState}
          >
            {isLoadingSaveSnippetState ? <Loader2 /> : <SaveIcon />}
          </Button>
        )}
      </div>
    </>
  );
};

export default LearningScreenThreeSecondLoopEl;

