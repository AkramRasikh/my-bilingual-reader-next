import clsx from 'clsx';
import { Loader2, SaveIcon } from 'lucide-react';
import { RefObject, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import LearningScreenLoopBtn from './LearningScreenLoopBtn';
import LearningScreenLoopUI from './LearningScreenLoopUI';
import type { OverlappingTextMemoized } from '@/app/types/video-player-types';
import { highlightSnippetTextApprox } from '@/components/custom/TranscriptItem/TranscriptItemLoopingSentence/highlight-snippet-text-approx';
import { isTrimmedLang, LanguageEnum } from '../languages';
import useSnippetLoopEvents from '@/components/custom/TranscriptItem/TranscriptItemLoopingSentence/useSnippetLoopEvents';

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
  const [startIndexKeyState, setStartIndexKeyState] = useState(0);
  const [lengthAdjustmentState, setLengthAdjustmentState] = useState(0);

  const targetLang = overlappingTextMemoized?.targetLang;
  const suggestedFocusStartIndex =
    overlappingTextMemoized?.suggestedFocusStartIndex;

  const { textMatch, matchStartKey, matchEndKey, before, after } =
    useMemo(() => {
      return highlightSnippetTextApprox(
        targetLang,
        overlappingTextMemoized?.suggestedFocusText || '',
        isLoadingSaveSnippetState,
        startIndexKeyState,
        lengthAdjustmentState,
        suggestedFocusStartIndex,
      );
    }, [
      overlappingTextMemoized,
      isLoadingSaveSnippetState,
      startIndexKeyState,
      lengthAdjustmentState,
      suggestedFocusStartIndex,
      targetLang,
    ]);

  const onContractLength = () => {
    if (!(matchEndKey > matchStartKey + 1)) return;

    if (!isTrimmedLang(languageSelectedState as LanguageEnum)) {
      let cursor = matchEndKey - 1;

      while (cursor >= matchStartKey && /\s/.test(targetLang[cursor])) {
        cursor -= 1;
      }
      while (cursor >= matchStartKey && !/\s/.test(targetLang[cursor])) {
        cursor -= 1;
      }

      const previousWordStart = Math.max(matchStartKey + 1, cursor + 1);
      const delta = previousWordStart - matchEndKey;
      setLengthAdjustmentState(lengthAdjustmentState + delta);
      return;
    }

    setLengthAdjustmentState(lengthAdjustmentState - 1);
  };

  const onExpandLength = () => {
    if (!(matchEndKey < targetLang.length)) return;

    if (!isTrimmedLang(languageSelectedState as LanguageEnum)) {
      let cursor = matchEndKey;

      while (cursor < targetLang.length && /\s/.test(targetLang[cursor])) {
        cursor += 1;
      }
      while (cursor < targetLang.length && !/\s/.test(targetLang[cursor])) {
        cursor += 1;
      }

      const delta = cursor - matchEndKey;
      setLengthAdjustmentState(lengthAdjustmentState + delta);
      return;
    }

    setLengthAdjustmentState(lengthAdjustmentState + 1);
  };

  const onMoveLeft = () => {
    if (matchStartKey <= 0) return;

    if (!isTrimmedLang(languageSelectedState as LanguageEnum)) {
      let cursor = matchStartKey - 1;

      while (cursor >= 0 && /\s/.test(targetLang[cursor])) {
        cursor -= 1;
      }
      while (cursor >= 0 && !/\s/.test(targetLang[cursor])) {
        cursor -= 1;
      }

      const previousWordStart = Math.max(0, cursor + 1);
      setStartIndexKeyState(previousWordStart - suggestedFocusStartIndex);
      return;
    }

    setStartIndexKeyState(startIndexKeyState - 1);
  };

  const onMoveRight = () => {
    if (matchEndKey >= targetLang.length) return;

    if (!isTrimmedLang(languageSelectedState as LanguageEnum)) {
      let cursor = matchStartKey + 1;

      while (cursor < targetLang.length && !/\s/.test(targetLang[cursor])) {
        cursor += 1;
      }
      while (cursor < targetLang.length && /\s/.test(targetLang[cursor])) {
        cursor += 1;
      }

      const nextWordStart = Math.min(cursor, targetLang.length - 1);
      setStartIndexKeyState(nextWordStart - suggestedFocusStartIndex);
      return;
    }

    setStartIndexKeyState(startIndexKeyState + 1);
  };

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
