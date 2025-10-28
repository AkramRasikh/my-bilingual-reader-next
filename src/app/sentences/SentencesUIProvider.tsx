'use client';
import {
  createContext,
  useRef,
  useContext,
  useState,
  useEffect,
  useMemo,
} from 'react';
import useData from '../Providers/useData';
import useSentencesProgress from './useSentencesProgress';
import { findAllInstancesOfWordsInSentence } from '@/utils/find-all-instances-of-words-in-sentences';
import { useFetchData } from '../Providers/FetchDataProvider';

const SentencesUIContext = createContext(null);

export const SentencesUIProvider = ({
  children,
}: PropsWithChildren<object>) => {
  const ref = useRef<HTMLAudioElement>(null);
  const transcriptRef = useRef(null);
  const [selectedElState, setSelectedElState] = useState(2);
  const [progressState, setProgressState] = useState(0);
  const [initNumState, setInitNumState] = useState();

  const { sentencesState, wordsState, updateAdhocSentenceData } = useData();
  const { languageSelectedState } = useFetchData();
  const numberOfSentences = sentencesState.length;

  useEffect(() => {
    if (!initNumState) {
      setInitNumState(numberOfSentences);
    }
  }, [initNumState]);

  useSentencesProgress({
    setProgressState,
    initNumState,
    numberOfSentences,
  });

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

  const sentencesInQueue = sentencesState.slice(0, 5);

  const selectedSentenceDataMemoized = useMemo(() => {
    if (sentencesInQueue.length === 0) {
      return [];
    }
    const selectedEl = sentencesInQueue[selectedElState];

    const matchedWordsId = selectedEl?.matchedWordsId;
    const matchedWordsViaState = [];

    const allInstancesOfthisWord = findAllInstancesOfWordsInSentence(
      selectedEl.targetLang,
      wordsState,
    );

    wordsState.forEach((wordItem) => {
      if (matchedWordsId?.includes(wordItem.id)) {
        matchedWordsViaState.push(wordItem);
      }
    });

    const words = [...allInstancesOfthisWord, ...matchedWordsViaState];

    const uniqueWords = words.filter(
      (item, index, self) => index === self.findIndex((t) => t.id === item.id),
    );
    return {
      notes: selectedEl?.notes,
      words: uniqueWords,
    };
  }, [selectedElState, sentencesInQueue, wordsState]);

  return (
    <SentencesUIContext.Provider
      value={{
        ref,
        transcriptRef,
        sentencesInQueue,
        progressState,
        numberOfSentences,
        selectedElState,
        setSelectedElState,
        selectedSentenceDataMemoized,
        initNumState,
        handleReviewFunc,
      }}
    >
      {children}
    </SentencesUIContext.Provider>
  );
};

export const useSentencesUIScreen = () => {
  const context = useContext(SentencesUIContext);

  if (!context)
    throw new Error(
      'useSentencesUIScreen must be used within a SentencesUIScreenProvider',
    );

  return context;
};
