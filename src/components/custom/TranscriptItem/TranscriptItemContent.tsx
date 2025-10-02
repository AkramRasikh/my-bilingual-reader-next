import clsx from 'clsx';
import { NewSentenceBreakdown } from '@/app/SentenceBreakdown';
import FormattedSentence from '@/app/FormattedSentence';
import useTranscriptItem from './useTranscriptItem';

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
  } = useTranscriptItem();

  const baseLang = contentItem.baseLang;
  const targetLangformatted = contentItem.targetLangformatted;

  const thisSentenceIsPlaying = contentItem.id === masterPlay;

  const thisSentencesSavedWords = contentItem.targetLangformatted.filter(
    (item) => item?.id === 'targetWord',
  );

  const hasSentenceBreakdown = contentItem?.sentenceStructure;

  return (
    <div className={clsx(thisSentenceIsPlaying && 'bg-yellow-200 h-fit')}>
      {(showSentenceBreakdownState && hasSentenceBreakdown) ||
      showThisSentenceBreakdownPreviewState ? (
        <NewSentenceBreakdown
          vocab={contentItem.vocab}
          meaning={contentItem.meaning}
          thisSentencesSavedWords={thisSentencesSavedWords}
          handleSaveFunc={handleSaveFunc}
          sentenceStructure={contentItem.sentenceStructure}
        />
      ) : (
        <>
          <p className='flex gap-2'>
            <FormattedSentence
              ref={ulRef}
              targetLangformatted={targetLangformatted}
              handleMouseLeave={handleMouseLeave}
              handleMouseEnter={handleMouseEnter}
              wordPopUpState={wordPopUpState}
              setWordPopUpState={setWordPopUpState}
              wordsForSelectedTopic={wordsForSelectedTopic}
            />
          </p>
          {!onlyShowEngState && <p>{baseLang}</p>}
        </>
      )}
    </div>
  );
};

export default TranscriptItemContent;
