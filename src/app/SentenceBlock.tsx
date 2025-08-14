import { useRef, useState } from 'react';
import FormattedSentence from './FormattedSentence';
import { getAudioURL } from './get-firebase-media-url';
import { japanese } from './languages';
import PopUpWordCard from './PopUpWordCard';
import ReviewSRSToggles from './ReviewSRSToggles';
import useData from './useData';

const SentenceBlock = ({ sentence, sentenceIndex }) => {
  const [wordPopUpState, setWordPopUpState] = useState([]);
  const hoverTimerMasterRef = useRef<HTMLVideoElement>(null); // Reference to the video element

  const { wordsState, updateAdhocSentenceData } = useData();

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
        />
      </p>
      <p className='text-right opacity-30'>{sentence.baseLang}</p>
      <audio src={url} controls className='m-3 ml-auto w-full' />
      <ReviewSRSToggles
        contentItem={sentence}
        handleReviewFunc={handleReviewFunc}
      />
      <ul>
        {wordPopUpState?.map((popUpItem, index) => {
          return (
            <PopUpWordCard
              key={index}
              word={popUpItem}
              onClose={() => setWordPopUpState([])}
            />
          );
        })}
      </ul>
    </div>
  );
};

export default SentenceBlock;
