import { useEffect, useRef, useState } from 'react';
import SentenceBlock from '@/components/custom/SentenceBlock';
import useData from '../Providers/useData';
import { getAudioURL } from '@/utils/get-media-url';

const SentenceBlockContainer = ({
  sentence,
  sentenceIndex,
  languageSelectedState,
}) => {
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

  const url = getAudioURL(sentence.id, languageSelectedState);

  const handleReviewFunc = async (arg) => {
    if (arg?.isRemoveReview) {
      await updateAdhocSentenceData({
        ...arg,
        language: languageSelectedState,
        fieldToUpdate: { reviewData: {} },
      });
    } else {
      await updateAdhocSentenceData({
        ...arg,
        language: languageSelectedState,
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
    <SentenceBlock
      thisSentencesWordsState={thisSentencesWordsState}
      sentence={sentence}
      sentenceIndex={sentenceIndex}
      handleMouseLeave={handleMouseLeave}
      handleMouseEnter={handleMouseEnter}
      wordPopUpState={wordPopUpState}
      setWordPopUpState={setWordPopUpState}
      handleDeleteWordDataProvider={handleDeleteWordDataProvider}
      wordsState={wordsState}
      handleReviewFunc={handleReviewFunc}
      url={url}
      languageSelectedState={languageSelectedState}
    />
  );
};

export default SentenceBlockContainer;
