import { useRef, useState } from 'react';
import FormattedSentence from '../FormattedSentence';
import useLearningScreen from '../../../app/LearningScreen/useLearningScreen';
import SentenceBreakdown from '@/components/custom/SentenceBreakdown';
import { useFetchData } from '@/app/Providers/FetchDataProvider';
import clsx from 'clsx';
import LoadingSpinner from '../LoadingSpinner';

const TranscriptItemSecondary = ({ contentItem, handleSaveWord }) => {
  const [wordPopUpState, setWordPopUpState] = useState([]);
  const [isLoadingState, setIsLoadingState] = useState(false);

  const { wordsState, handleDeleteWordDataProvider } = useFetchData();
  const { wordsForSelectedTopic, selectedContentTitleState } =
    useLearningScreen();

  const hoverTimerMasterRef = useRef<NodeJS.Timeout | null>(null);

  const hasSentenceBreakdown = contentItem?.sentenceStructure;
  const wordsFromSentence = contentItem?.wordsFromSentence;
  const baseLang = contentItem?.baseLang;
  const targetLangformatted = contentItem.targetLangformatted;

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
    } catch (error) {
    } finally {
      // setHighlightedTextState('');
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

  const dueStatus = contentItem?.dueStatus;

  return (
    <div
      data-testid='transcript-item-secondary'
      className={clsx(
        'rounded-2xl border-2 p-2 mt-2 flex flex-col gap-2 relative',
        dueStatus === 'now'
          ? 'border-red-500'
          : hasBeenReviewed
          ? 'border-amber-500'
          : 'border-blue-200',

        isLoadingState ? 'opacity-75' : '',
      )}
    >
      {isLoadingState && (
        <div className='absolute inset-0 flex items-center justify-center bg-white/70 rounded'>
          <LoadingSpinner />
        </div>
      )}
      <FormattedSentence
        targetLangformatted={targetLangformatted}
        handleMouseLeave={handleMouseLeave}
        handleMouseEnter={handleMouseEnter}
        wordsForSelectedTopic={wordsForSelectedTopic}
        handleDeleteWordDataProvider={handleDeleteWordDataProvider}
        wordPopUpState={wordPopUpState}
        setWordPopUpState={setWordPopUpState}
        wordsFromSentence={wordsFromSentence}
      />
      <p>{baseLang}</p>
      {hasSentenceBreakdown && (
        <>
          <hr className='bg-gray-500' />
          <SentenceBreakdown
            vocab={contentItem.vocab}
            meaning={contentItem.meaning}
            sentenceStructure={contentItem.sentenceStructure}
            handleSaveFunc={handleSaveFunc}
          />
        </>
      )}
    </div>
  );
};

export default TranscriptItemSecondary;
