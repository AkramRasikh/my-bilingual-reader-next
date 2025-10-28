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

const SentencesUIContext = createContext(null);

export const SentencesUIProvider = ({
  children,
}: PropsWithChildren<object>) => {
  const ref = useRef<HTMLAudioElement>(null);
  const transcriptRef = useRef(null);
  const [selectedElState, setSelectedElState] = useState(2);
  const [progressState, setProgressState] = useState(0);
  const [initNumState, setInitNumState] = useState();
  const { sentencesState } = useData();

  const { wordsState } = useData();

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

  const sentencesInQueue = sentencesState.slice(0, 5);

  const selectedSentenceDataMemoized = useMemo(() => {
    const selectedEl = sentencesInQueue[selectedElState];
    console.log('## selectedEl', selectedEl);
    const matchedWordsId = selectedEl.matchedWordsId;
    const matchedWordsViaState = [];

    const allInstancesOfthisWord = findAllInstancesOfWordsInSentence(
      selectedEl.targetLang,
      wordsState,
    );

    wordsState.forEach((wordItem) => {
      if (matchedWordsId.includes(wordItem.id)) {
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
