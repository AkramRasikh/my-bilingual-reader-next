import clsx from 'clsx';
import { romanizeArabic } from 'romanize-string';
import FormattedSentence from '@/components/custom/FormattedSentence';
import useTranscriptItem from './useTranscriptItem';
import useData from '@/app/Providers/useData';
import SentenceBreakdown from '../SentenceBreakdown';
import { arabic } from '@/app/languages';
import { useMemo } from 'react';

const TranscriptItemContent = () => {
  const {
    showSentenceBreakdownState,
    showThisSentenceBreakdownPreviewState,
    wordPopUpState,
    setWordPopUpState,
    ulRef,
    contentItem,
    handleMouseEnter,
    handleMouseLeave,
    masterPlay,
    handleSaveFunc,
    onlyShowEngState,
    wordsForSelectedTopic,
    languageSelectedState,
  } = useTranscriptItem();

  const { handleDeleteWordDataProvider } = useData();

  const baseLang = contentItem.baseLang;
  const transliteration = contentItem?.transliteration;
  const wordsFromSentence = contentItem.wordsFromSentence;
  const targetLangformatted = contentItem.targetLangformatted;

  const thisSentenceIsPlaying = contentItem.id === masterPlay;

  const thisSentencesSavedWords = contentItem.targetLangformatted.filter(
    (item) => item?.id === 'targetWord',
  );

  const hasSentenceBreakdown = contentItem?.sentenceStructure;

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
          <p className='flex gap-2 justify-end'>
            <FormattedSentence
              ref={ulRef}
              targetLangformatted={targetLangformatted}
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
