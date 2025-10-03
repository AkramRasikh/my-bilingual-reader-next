import { useEffect, useRef, useState } from 'react';
import FormattedSentence from '../components/custom/FormattedSentence';
import {
  getAudioURL,
  getCloudflareImageURL,
} from './media-utils/get-media-url';
import { japanese } from './languages';
import ReviewSRSToggles from './ReviewSRSToggles';
import useData from './Providers/useData';
import AudioPlayer from './SentenceAudioPlayer';
import Image from 'next/image';
import clsx from 'clsx';

const SentenceBlock = ({ sentence, sentenceIndex }) => {
  const [wordPopUpState, setWordPopUpState] = useState([]);
  const [thisSentencesWordsState, setThisSentencesWordsState] = useState([]);
  const hoverTimerMasterRef = useRef<HTMLVideoElement>(null); // Reference to the video element
  const { wordsState, handleDeleteWordDataProvider, updateAdhocSentenceData } =
    useData();

  useEffect(() => {
    const relevantWordsFromSentence = sentence.targetLangformatted.filter(
      (i) => i?.id,
    );

    if (relevantWordsFromSentence?.length > 0) {
      const wordsMapped = relevantWordsFromSentence.map((o) => o.text);
      const relevantWords = wordsState?.filter((item) => {
        if (
          wordsMapped.includes(item.baseForm) ||
          wordsMapped.includes(item.surfaceForm)
        ) {
          return true;
        }
        return false;
      });
      setThisSentencesWordsState(relevantWords);
    }
  }, [sentence, wordsState]);

  const url = getAudioURL(sentence.id, japanese);

  const handleReviewFunc = async (arg) => {
    if (arg?.isRemoveReview) {
      await updateAdhocSentenceData({
        ...arg,
        fieldToUpdate: { reviewData: {} },
      });
    } else {
      await updateAdhocSentenceData({
        ...arg,
        fieldToUpdate: { reviewData: arg.nextDue },
      });
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

  return (
    <div className='text-lg w-5/10 border rounded-2xl p-2 m-auto'>
      <p className='flex gap-2 '>
        {sentenceIndex && <span>{sentenceIndex}</span>}
        <FormattedSentence
          ref={null}
          handleMouseLeave={handleMouseLeave}
          handleMouseEnter={handleMouseEnter}
          targetLangformatted={sentence?.targetLangformatted}
          wordPopUpState={wordPopUpState}
          setWordPopUpState={setWordPopUpState}
          handleDeleteWordDataProvider={handleDeleteWordDataProvider}
          wordsState={wordsState}
        />
      </p>
      <p className='text-right opacity-30'>{sentence.baseLang}</p>
      <AudioPlayer src={url} />
      <ReviewSRSToggles
        contentItem={sentence}
        handleReviewFunc={handleReviewFunc}
      />
      {thisSentencesWordsState.length > 0 && (
        <ul>
          {thisSentencesWordsState?.map((wordItem, index) => {
            const imageUrl = wordItem?.imageUrl;
            const num = index + 1;
            return (
              <li key={index} className={'flex gap-1.5'}>
                <span
                  className={clsx(
                    'text-sm font-medium',
                    imageUrl ? 'm-auto' : '',
                  )}
                >
                  {num}) {wordItem.baseForm}, {wordItem.surfaceForm},{' '}
                  {wordItem.transliteration}, {wordItem.definition}
                </span>
                {imageUrl && (
                  <div className='relative w-4/5 h-30'>
                    <Image
                      src={getCloudflareImageURL(imageUrl, 'japanese')}
                      alt={wordItem.baseForm}
                      fill
                      className='object-contain'
                    />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default SentenceBlock;
