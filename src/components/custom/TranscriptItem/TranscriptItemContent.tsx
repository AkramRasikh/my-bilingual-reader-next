import clsx from 'clsx';
import FormattedSentence from '@/components/custom/FormattedSentence';
import useTranscriptItem from './useTranscriptItem';
import SentenceBreakdown from '../SentenceBreakdown';
import { arabic } from '@/app/languages';
import { useFetchData } from '@/app/Providers/FetchDataProvider';
import { expandWordsIntoChunks } from '@/app/LearningScreen/experimental/LearningScreenSnippetReview';
import { useMemo } from 'react';

const TranscriptItemContent = () => {
  const {
    showSentenceBreakdownState,
    showThisSentenceBreakdownPreviewState,
    wordPopUpState,
    setWordPopUpState,
    contentItem,
    handleMouseEnter,
    handleMouseLeave,
    masterPlay,
    handleSaveFunc,
    onlyShowEngState,
    wordsForSelectedTopic,
    languageSelectedState,
    targetLangRef,
  } = useTranscriptItem();

  const { handleDeleteWordDataProvider } = useFetchData(); // must be moved!!

  const baseLang = contentItem.baseLang;
  const transliteration = contentItem?.transliteration;
  const wordsFromSentence = contentItem.wordsFromSentence;
  const targetLangformatted = contentItem.targetLangformatted;

  const thisSentenceIsPlaying = contentItem.id === masterPlay;

  const thisSentencesSavedWords = contentItem.targetLangformatted.filter(
    (item) => item?.id === 'targetWord',
  );

  const isArabic = languageSelectedState === arabic;
  const hasSentenceBreakdown = contentItem?.sentenceStructure;

  const granularFormattedSentence = useMemo(
    () => expandWordsIntoChunks(targetLangformatted),
    [targetLangformatted],
  );

  const showBreakdownBool =
    (showSentenceBreakdownState && hasSentenceBreakdown) ||
    showThisSentenceBreakdownPreviewState;

  return (
    <div className={clsx(thisSentenceIsPlaying && 'bg-yellow-200 h-fit')}>
      {showBreakdownBool ? (
        <SentenceBreakdown
          vocab={contentItem.vocab}
          meaning={contentItem.meaning}
          thisSentencesSavedWords={thisSentencesSavedWords}
          handleSaveFunc={handleSaveFunc}
          sentenceStructure={contentItem.sentenceStructure}
          languageSelectedState={languageSelectedState}
        />
      ) : (
        <>
          <p
            ref={targetLangRef}
            data-testid={`transcript-target-lang-${contentItem.id}`}
            className={clsx('flex gap-2', isArabic ? 'justify-end' : '')}
          >
            <FormattedSentence
              targetLangformatted={granularFormattedSentence}
              handleMouseLeave={handleMouseLeave}
              handleMouseEnter={handleMouseEnter}
              wordPopUpState={wordPopUpState}
              setWordPopUpState={setWordPopUpState}
              wordsForSelectedTopic={wordsForSelectedTopic}
              handleDeleteWordDataProvider={handleDeleteWordDataProvider}
              wordsFromSentence={wordsFromSentence}
              languageSelectedState={languageSelectedState}
            />
          </p>
          {!onlyShowEngState && <p>{baseLang}</p>}
        </>
      )}
      {transliteration && <p className='mt-1 border-t-2'>{transliteration}</p>}
    </div>
  );
};

export default TranscriptItemContent;
