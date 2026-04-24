import { useEffect, useRef, useState } from 'react';
import FormattedSentence from '../FormattedSentence';
import useLearningScreen from '../../../app/LearningScreen/useLearningScreen';
import SentenceBreakdown from '@/components/custom/SentenceBreakdown';
import { useFetchData } from '@/app/Providers/FetchDataProvider';
import { FormattedTranscriptTypes } from '@/app/types/content-types';
import { WordTypes } from '@/app/types/word-types';
import { HandleSaveWordCallTypes } from '@/app/Providers/FetchDataProvider';
import clsx from 'clsx';
import TranscriptItemSecondaryLoadingIndicators from './TranscriptItemSecondaryLoadingIndicators';
import HighlightedText from '../HighlightedText';

interface TranscriptItemSecondaryProps {
  contentItem: FormattedTranscriptTypes;
  handleSaveWord: (params: HandleSaveWordCallTypes) => Promise<unknown>;
  handleDeleteWordDataProvider: (params: { wordId: string }) => Promise<unknown>;
  isBreakdownSentenceLoadingState: boolean;
  languageSelectedState: string;
}

const TranscriptItemSecondary = ({
  contentItem,
  handleSaveWord,
  handleDeleteWordDataProvider,
  isBreakdownSentenceLoadingState,
  languageSelectedState,
}: TranscriptItemSecondaryProps) => {
  const [wordPopUpState, setWordPopUpState] = useState<WordTypes[]>([]);
  const [isLoadingState, setIsLoadingState] = useState(false);
  const [highlightedTextState, setHighlightedTextState] = useState('');

  const { wordsState } = useFetchData();
  const { selectedContentTitleState } = useLearningScreen();

  const transcriptItemContainerRef = useRef<HTMLElement | null>(null);
  const outsideClickContainerRef = useRef<HTMLDivElement | null>(null);

  const hoverTimerMasterRef = useRef<NodeJS.Timeout | null>(null);

  const hasSentenceBreakdown = contentItem?.sentenceStructure;
  const wordsFromSentence = contentItem?.wordsFromSentence;
  const baseLang = contentItem?.baseLang;
  const targetLangformatted = contentItem.targetLangformatted;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        highlightedTextState &&
        outsideClickContainerRef.current &&
        !outsideClickContainerRef.current.contains(event.target as Node)
      ) {
        setHighlightedTextState(''); // or whatever action you need
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [outsideClickContainerRef, highlightedTextState]);

  useEffect(() => {
    const handleMouseUp = () => {
      const selection = window.getSelection();
      const selectedText = selection?.toString().trim();

      const anchorNode = selection?.anchorNode;
      if (
        !anchorNode ||
        !transcriptItemContainerRef.current?.contains(anchorNode)
      )
        return;

      setHighlightedTextState(selectedText || '');
    };

    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const handleSaveHighlightedWordFunc = async (isGoogle: boolean) => {
    if (!highlightedTextState) {
      return null;
    }
    try {
      setIsLoadingState(true);
      await handleSaveWord({
        highlightedWord: highlightedTextState,
        highlightedWordSentenceId: contentItem.id,
        contextSentence: contentItem.targetLang,
        isGoogle,
        originalContext: selectedContentTitleState,
        time: contentItem?.time,
      });
    } finally {
      setHighlightedTextState('');
      setWordPopUpState([]);
      setIsLoadingState(false);
    }
  };

  const handleSaveFunc = async (
    isGoogle: boolean,
    thisWord: string,
    thisWordMeaning?: string,
  ) => {
    if (!thisWord) {
      return;
    }
    try {
      setIsLoadingState(true);
      await handleSaveWord({
        highlightedWord: thisWord,
        highlightedWordSentenceId: contentItem.id,
        contextSentence: contentItem.targetLang,
        meaning: thisWordMeaning,
        isGoogle,
        originalContext: selectedContentTitleState,
        time: contentItem?.time,
      });
    } finally {
      setWordPopUpState([]);
      setIsLoadingState(false);
    }
  };

  const handleMouseEnter = (text: string) => {
    hoverTimerMasterRef.current = setTimeout(() => {
      const wordsAmongstHighlightedText = wordsState?.filter((item) => {
        if (item.baseForm === text || item.surfaceForm === text) {
          return true;
        }
        return false;
      });

      setWordPopUpState(wordsAmongstHighlightedText);
    }, 300);
  };

  const handleMouseLeave = () => {
    if (hoverTimerMasterRef.current) {
      clearTimeout(hoverTimerMasterRef.current); // Cancel if left early
      hoverTimerMasterRef.current = null;
    }
  };

  const hasBeenReviewed = contentItem?.reviewData?.due;

  const isDue = contentItem?.isDue;

  return (
    <div
      ref={outsideClickContainerRef}
      className={clsx(
        'flex flex-row gap-2 rounded-2xl border-2 p-2 mt-2',
        isDue
          ? 'border-red-500'
          : hasBeenReviewed
            ? 'border-amber-500'
            : 'border-blue-200',
        isLoadingState ? 'opacity-75' : '',
      )}
    >
      <TranscriptItemSecondaryLoadingIndicators
        isBreakdownSentenceLoadingState={isBreakdownSentenceLoadingState}
        isLoadingState={isLoadingState}
        contentItemId={contentItem.id}
      />
      <div data-testid='transcript-item-secondary' className='relative mr-7'>
        <FormattedSentence
          ref={transcriptItemContainerRef}
          targetLangformatted={targetLangformatted}
          handleMouseLeave={handleMouseLeave}
          handleMouseEnter={handleMouseEnter}
          handleDeleteWordDataProvider={handleDeleteWordDataProvider}
          wordPopUpState={wordPopUpState}
          setWordPopUpState={setWordPopUpState}
          wordsFromSentence={wordsFromSentence}
          languageSelectedState={languageSelectedState}
          matchStartKey={undefined}
          matchEndKey={undefined}
        />
        <p className='mb-2'>{baseLang}</p>
        {hasSentenceBreakdown && (
          <>
            <hr className='bg-gray-500' />
            <SentenceBreakdown
              vocab={contentItem.vocab}
              meaning={contentItem.meaning}
              handleSaveFunc={handleSaveFunc}
              thisSentencesSavedWords={wordsFromSentence}
              languageSelectedState={languageSelectedState}
              handleBreakdownSentence={async () => {}}
            />
          </>
        )}
        {highlightedTextState && (
          <HighlightedText
            isLoadingState={isLoadingState}
            handleSaveFunc={handleSaveHighlightedWordFunc}
            highlightedTextState={highlightedTextState}
          />
        )}
      </div>
    </div>
  );
};

export default TranscriptItemSecondary;
