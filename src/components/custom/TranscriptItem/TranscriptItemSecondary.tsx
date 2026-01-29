import { useRef, useState } from 'react';
import FormattedSentence from '../FormattedSentence';
import useLearningScreen from '../../../app/LearningScreen/useLearningScreen';
import SentenceBreakdown from '@/components/custom/SentenceBreakdown';
import { useFetchData } from '@/app/Providers/FetchDataProvider';
import clsx from 'clsx';
import LoadingSpinner from '../LoadingSpinner';
import { LucideHammer } from 'lucide-react';

const TranscriptItemSecondary = ({ contentItem, handleSaveWord }) => {
  const isBreakdownSentenceLoadingState = true;
  const [wordPopUpState, setWordPopUpState] = useState([]);
  const [isLoadingState, setIsLoadingState] = useState(true);

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
      className={clsx(
        'flex flex-row gap-2 rounded-2xl border-2 p-2',
        isDue
          ? 'border-red-500'
          : hasBeenReviewed
            ? 'border-amber-500'
            : 'border-blue-200',
        isLoadingState ? 'opacity-75' : '',
      )}
    >
      <div className='flex flex-col gap-3 mt-2'>
        <div
          className={clsx(
            'animate-pulse inset-0 flex items-center justify-center rounded',
            !isBreakdownSentenceLoadingState && 'invisible',
          )}
          data-testid={`transcript-breakdown-loading-${contentItem.id}`}
        >
          <LucideHammer
            color='brown'
            className='animate-bounce mx-auto fill-amber-700 rounded-4xl'
            size={16}
          />
        </div>

        <div
          className={clsx(
            'inset-0 flex items-center justify-center rounded',
            !isLoadingState && 'invisible',
          )}
        >
          <LoadingSpinner />
        </div>
      </div>
      <div
        data-testid='transcript-item-secondary'
        className='flex flex-col gap-2 relative flex-1'
      >
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
              thisSentencesSavedWords={wordsFromSentence}
            />
          </>
        )}
      </div>
      <div className='flex flex-col gap-3 mt-2'>
        <div className='invisible inset-0 flex items-center justify-center rounded min-h-6'>
          <LoadingSpinner />
        </div>

        <div className='invisible animate-pulse inset-0 flex items-center justify-center rounded min-h-6'>
          <LucideHammer
            color='brown'
            className='animate-bounce mx-auto fill-amber-700 rounded-4xl'
            size={16}
          />
        </div>
      </div>
    </div>
  );
};

export default TranscriptItemSecondary;
