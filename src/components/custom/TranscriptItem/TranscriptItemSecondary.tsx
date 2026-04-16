import { useEffect, useRef, useState } from 'react';
import FormattedSentence from '../FormattedSentence';
import useLearningScreen from '../../../app/LearningScreen/useLearningScreen';
import SentenceBreakdown from '@/components/custom/SentenceBreakdown';
import { useFetchData } from '@/app/Providers/FetchDataProvider';
import clsx from 'clsx';
import TranscriptItemSecondaryLoadingIndicators from './TranscriptItemSecondaryLoadingIndicators';
import HighlightedText from '../HighlightedText';

const TranscriptItemSecondary = ({
  contentItem,
  handleSaveWord,
  isBreakdownSentenceLoadingState,
  languageSelectedState,
}) => {
  const [wordPopUpState, setWordPopUpState] = useState([]);
  const [isLoadingState, setIsLoadingState] = useState(false);
  const [highlightedTextState, setHighlightedTextState] = useState('');

  const { wordsState, handleDeleteWordDataProvider } = useFetchData();
  const { wordsForSelectedTopic, selectedContentTitleState } =
    useLearningScreen();

  const transcriptItemContainerRef = useRef(null);
  const outsideClickContainerRef = useRef(null);

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
        !outsideClickContainerRef.current.contains(event.target)
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

  const handleSaveFunc = async (isGoogle, thisWord, thisWordMeaning) => {
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

  const handleMouseEnter = (text) => {
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
          wordsForSelectedTopic={wordsForSelectedTopic}
          handleDeleteWordDataProvider={handleDeleteWordDataProvider}
          wordPopUpState={wordPopUpState}
          setWordPopUpState={setWordPopUpState}
          wordsFromSentence={wordsFromSentence}
        />
        <p className='mb-2'>{baseLang}</p>
        {hasSentenceBreakdown && (
          <>
            <hr className='bg-gray-500' />
            <SentenceBreakdown
              vocab={contentItem.vocab}
              meaning={contentItem.meaning}
              sentenceStructure={contentItem.sentenceStructure}
              handleSaveFunc={handleSaveFunc}
              thisSentencesSavedWords={wordsFromSentence}
              languageSelectedState={languageSelectedState}
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
