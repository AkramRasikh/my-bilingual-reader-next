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
import { getAudioURL } from '@/utils/get-media-url';

const SentencesUIContext = createContext(null);

export const SentencesUIProvider = ({
  children,
}: PropsWithChildren<object>) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const rafRef = useRef<number | null>(null);

  const transcriptRef = useRef(null);
  const [selectedElState, setSelectedElState] = useState(0);
  const [isPlayingState, setIsPlayingState] = useState(false);
  const [progressState, setProgressState] = useState(0);
  const [audioProgressState, setAudioProgressState] = useState(0);
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

  // Smooth progress updater
  const updateProgress = () => {
    const audio = audioRef.current;
    if (audio && !audio.paused) {
      setAudioProgressState(audio.currentTime);
      rafRef.current = requestAnimationFrame(updateProgress);
    }
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlayingState) {
      audio.pause();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    } else {
      audio.play();
      rafRef.current = requestAnimationFrame(updateProgress);
    }
    setIsPlayingState(!isPlayingState);
  };

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

  const handlePause = () => audioRef.current.pause();

  const sentencesInQueue = sentencesState.slice(0, 4);

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
    const audioUrl = getAudioURL(selectedEl.id, languageSelectedState);
    return {
      notes: selectedEl?.notes,
      words: uniqueWords,
      audioUrl,
      id: selectedEl.id,
    };
  }, [selectedElState, sentencesInQueue, wordsState]);

  const masterPlay = selectedSentenceDataMemoized?.id;

  return (
    <SentencesUIContext.Provider
      value={{
        audioRef,
        transcriptRef,
        sentencesInQueue,
        progressState,
        numberOfSentences,
        selectedElState,
        setSelectedElState,
        selectedSentenceDataMemoized,
        initNumState,
        handleReviewFunc,
        togglePlay,
        isPlayingState,
        setIsPlayingState,
        audioProgressState,
        setAudioProgressState,
        masterPlay,
        handlePause,
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
