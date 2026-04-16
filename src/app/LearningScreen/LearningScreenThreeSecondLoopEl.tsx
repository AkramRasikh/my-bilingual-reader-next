import clsx from 'clsx';
import { Loader2, SaveIcon } from 'lucide-react';
import { RefObject } from 'react';
import { Button } from '@/components/ui/button';
import LearningScreenLoopBtn from './LearningScreenLoopBtn';
import LearningScreenLoopUI from './LearningScreenLoopUI';
import type { OverlappingTextMemoized } from '@/app/types/video-player-types';
import { LanguageEnum } from '../languages';
import useSnippetLoopEvents from '@/components/custom/TranscriptItem/TranscriptItemLoopingSentence/useSnippetLoopEvents';
import { useSnippetHandleActionsHook } from '@/components/custom/TranscriptItem/TranscriptItemLoopingSentence/useSnippetHandleActions';

interface LearningScreenThreeSecondLoopElProps {
  overlappingTextMemoized: OverlappingTextMemoized | null;
  masterTextRef: RefObject<HTMLParagraphElement | null>;
  showSaveSnippetButton: boolean;
  isLoadingSaveSnippetState: boolean;
  highlightedTextFocusLoopState: string;
  onSaveSnippetClick: () => void;
  languageSelectedState: LanguageEnum;
}

const LearningScreenThreeSecondLoopEl = ({
  overlappingTextMemoized,
  masterTextRef,
  showSaveSnippetButton,
  isLoadingSaveSnippetState,
  highlightedTextFocusLoopState,
  onSaveSnippetClick,
  languageSelectedState,
}: LearningScreenThreeSecondLoopElProps) => {
  const targetLang = overlappingTextMemoized?.targetLang;
  const suggestedFocusStartIndex =
    overlappingTextMemoized?.suggestedFocusStartIndex;

  const {
    onContractLength,
    onExpandLength,
    onMoveLeft,
    onMoveRight,
    textMatch,
    matchStartKey,
    matchEndKey,
    before,
    after,
  } = useSnippetHandleActionsHook({
    targetLang,
    focusText: overlappingTextMemoized?.suggestedFocusText,
    isLoadingSaveSnippetState,
    suggestedTextStartIndex: suggestedFocusStartIndex,
    languageSelectedState,
  });

  useSnippetLoopEvents({
    enabled: true,
    hasSnippetText: true,
    matchEndKey,
    matchStartKey,
    targetLangLength: targetLang.length,
    onAdjustLength: (delta) =>
      delta > 0 ? onExpandLength() : onContractLength(),
    onShiftStart: (delta) => (delta > 0 ? onMoveRight() : onMoveLeft()),
    // onSaveSnippet: async () => {
    //   console.log('## 🎮 snippet-loop-save');
    //   // await onUpdateSnippet();
    // },
  });

  console.log('## textMatch', textMatch);

  return (
    <>
      <LearningScreenLoopUI />
      <div className='flex w-full justify-between gap-2'>
        {overlappingTextMemoized ? (
          <p
            ref={masterTextRef}
            data-testid='video-player-snippet-text'
            className={'text-center font-bold text-sm p-1 rounded-lg  m-auto'}
          >
            <span className='text-gray-400'> {before}</span>
            <span className='italic backdrop-brightness-90 text-white'>
              {textMatch}
            </span>
            <span className='text-gray-500'>{after}</span>
          </p>
        ) : null}

        <LearningScreenLoopBtn />

        {showSaveSnippetButton && (
          <Button
            data-testid='save-snippet-button'
            size='icon'
            className={clsx(
              'rounded-full h-8 w-8 my-auto',
              isLoadingSaveSnippetState ? 'animate-pulse bg-amber-600' : '',
              highlightedTextFocusLoopState ? 'animate-in bg-green-600' : '',
            )}
            onClick={onSaveSnippetClick}
            disabled={
              !highlightedTextFocusLoopState || isLoadingSaveSnippetState
            }
          >
            {isLoadingSaveSnippetState ? <Loader2 /> : <SaveIcon />}
          </Button>
        )}
      </div>
    </>
  );
};

export default LearningScreenThreeSecondLoopEl;
