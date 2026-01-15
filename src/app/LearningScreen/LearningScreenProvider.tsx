'use client';
import { isNumber } from '@/utils/is-number';
import { v4 as uuidv4 } from 'uuid';
import { createContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  getEmptyCard,
  getNextScheduledOptions,
  srsCalculationAndText,
  srsRetentionKey,
  srsRetentionKeyTypes,
} from '../srs-utils/srs-algo';
import useManageLoopInit from './hooks/useManageLoopInit';
import { useLoopSecondsHook } from './hooks/useMapTranscriptToSeconds';
import {
  SavedSnippetsMemoizedProps,
  useSavedSnippetsMemoized,
} from './hooks/useSavedSnippetsMemoized';
import { useOverlappedSentencesViableForReviewMemo } from './hooks/useOverlappedSentencesViableForReviewMemo';
import { isDueCheck } from '@/utils/is-due-check';
import { findAllInstancesOfWordsInSentence } from '@/utils/sentence-formatting/find-all-instances-of-words-in-sentences';
import { underlineWordsInSentence } from '@/utils/sentence-formatting/underline-words-in-sentences';
import { mapSentenceIdsToSeconds } from './utils/map-sentence-ids-to-seconds';
import { useFetchData } from '../Providers/FetchDataProvider';
import { WordTypes } from '../types/word-types';
import { sliceTranscriptViaPercentageOverlap } from './utils/slice-transcript-via-percentage-overlap';
import { isTrimmedLang } from '../languages';
import useManageThreeSecondLoopMemo from './hooks/useManageThreeSecondLoopMemo';
import { getSecondsLoopedTranscriptData } from './utils/get-seconds-looped-transcript-data';
import {
  ContentTypes,
  FormattedTranscriptTypes,
  SentenceMapItemTypes,
  Snippet,
} from '../types/content-types';
import { getUniqueSegmentOfArray } from './utils/get-unique-segment-of-array';
import { OverlappingSnippetData, ReviewDataTypes } from '../types/shared-types';

type LearningScreenProviderProps = React.PropsWithChildren<{
  selectedContentStateMemoized: ContentTypes & { contentIndex: number };
}>;

type OverlappingTextTypes = {
  targetLang: string;
  baseLang: string;
  suggestedFocusText: string;
};

interface HandleReviewFuncParams {
  sentenceId: string;
  isRemoveReview?: boolean;
  nextDue?: ReviewDataTypes;
}

interface HandleBreakdownSentenceParams {
  sentenceId: string | number;
  targetLang: string;
}

interface HandleUpdateSnippetReviewParams {
  id: string | number;
  fieldToUpdate: Partial<Snippet>;
}

interface TopicWordsForReviewMemoizedProps extends WordTypes {
  time?: number;
}

export interface LearningScreenContextTypes {
  handlePlayFromHere: (time: number) => void;
  handleTimeUpdate: () => void;
  handleLoadedMetadata: () => void;
  mediaDuration: number | null;
  ref: React.RefObject<HTMLVideoElement | HTMLAudioElement | null>;
  currentTime: number;
  formattedTranscriptState: FormattedTranscriptTypes[];
  secondsState: string[];
  masterPlayComprehensive: SentenceMapItemTypes | null;
  isVideoPlaying: boolean;
  setIsVideoPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  isInReviewMode: boolean;
  setIsInReviewMode: React.Dispatch<React.SetStateAction<boolean>>;
  isGenericItemLoadingState: SentenceMapItemTypes['id'][];
  setIsGenericItemLoadingState: React.Dispatch<
    React.SetStateAction<SentenceMapItemTypes['id'][]>
  >;
  breakdownSentencesArrState: SentenceMapItemTypes['id'][];
  setBreakdownSentencesArrState: React.Dispatch<
    React.SetStateAction<SentenceMapItemTypes['id'][]>
  >;
  overlappingSnippetDataState: OverlappingSnippetData[];
  loopTranscriptState: FormattedTranscriptTypes[];
  setLoopTranscriptState: React.Dispatch<
    React.SetStateAction<FormattedTranscriptTypes[]>
  >;
  threeSecondLoopState: number | null;
  setThreeSecondLoopState: React.Dispatch<React.SetStateAction<number | null>>;
  progress: number;
  setProgress: React.Dispatch<React.SetStateAction<number>>;
  onlyShowEngState: boolean;
  setOnlyShowEngState: React.Dispatch<React.SetStateAction<boolean>>;
  showWordsBasketState: boolean;
  setShowWordsBasketState: React.Dispatch<React.SetStateAction<boolean>>;
  trackCurrentState: boolean;
  setTrackCurrentState: React.Dispatch<React.SetStateAction<boolean>>;
  contractThreeSecondLoopState: boolean;
  setContractThreeSecondLoopState: React.Dispatch<
    React.SetStateAction<boolean>
  >;
  masterPlay: SentenceMapItemTypes['id'] | null;
  handleFromHere: (time: number) => void;
  handlePause: () => void;
  handleRewind: () => void;
  handleJumpToSentenceViaKeys: (nextIndex: number) => void;
  handleLoopThis3Second: () => void;
  handleShiftLoopSentence: (shiftForward: boolean) => void;
  handleLoopThisSentence: () => void;
  handleUpdateLoopedSentence: (extendSentenceLoop: boolean) => void;
  handleBreakdownMasterSentence: () => Promise<void | null>;
  handleAddMasterToReview: () => Promise<void>;
  handleIsEasyReviewShortCut: () => Promise<void>;
  handleBulkReviews: () => Promise<void>;
  handleReviewFunc: (params: HandleReviewFuncParams) => Promise<void>;
  handleBreakdownSentence: (
    params: HandleBreakdownSentenceParams,
  ) => Promise<void>;
  isBreakingDownSentenceArrState: SentenceMapItemTypes['id'][];
  handleStudyFromHere: () => void;
  setStudyFromHereTimeState: React.Dispatch<
    React.SetStateAction<number | null>
  >;
  studyFromHereTimeState: number | null;
  transcriptRef: React.RefObject<HTMLElement | null>;
  scrollToElState: string;
  selectedContentTitleState: string;
  wordsForSelectedTopic: WordTypes[];
  selectedContentState: ContentTypes & { contentIndex: number };
  sentenceRepsState: number;
  elapsed: number;
  setElapsed: React.Dispatch<React.SetStateAction<number>>;
  playFromThisContext: (contextId: FormattedTranscriptTypes['id']) => void;
  setSentenceRepsState: React.Dispatch<React.SetStateAction<number>>;
  sentencesNeedReview: number;
  sentencesPendingOrDue: number;
  contentMetaWordMemoized: WordTypes[];
  initialSentenceCount: number | null;
  errorVideoState: boolean;
  setErrorVideoState: React.Dispatch<React.SetStateAction<boolean>>;
  handleJumpToFirstElInReviewTranscript: (isSecondIndex?: boolean) => void;
  learnFormattedTranscript: FormattedTranscriptTypes[];
  topicWordsForReviewMemoized: TopicWordsForReviewMemoizedProps[];
  firstTime: number | null;
  handleSaveSnippet: (snippetArgs: OverlappingTextTypes) => Promise<void>;
  overlappingTextMemoized: OverlappingTextTypes | null;
  savedSnippetsMemoized: SavedSnippetsMemoizedProps[];
  handleUpdateSnippetReview: (
    snippetArgs: HandleUpdateSnippetReviewParams,
  ) => Promise<void>;
  handleDeleteSnippet: (
    snippetId: string | number,
    wordsFromSentence: boolean,
  ) => Promise<void>;
  contentSnippets: Snippet[];
  sentenceMapMemoized: Record<string, SentenceMapItemTypes>;
  handleQuickSaveSnippet: () => Promise<void>;
  handleUpdateSnippet: (snippetToUpdate: Snippet) => Promise<void>;
  getSentenceDataOfOverlappingWordsDuringSave: (
    thisSnippetsTime: number,
    highlightedTextFromSnippet: string,
  ) => string | number | null;
  overlappedSentencesViableForReviewMemoized: SentenceMapItemTypes['id'][];
  handleAddOverlappedSnippetsToReview: () => Promise<void>;
  setScrollToElState: React.Dispatch<React.SetStateAction<string>>;
  enableWordReviewState: boolean;
  setEnableWordReviewState: React.Dispatch<React.SetStateAction<boolean>>;
  enableTranscriptReviewState: boolean;
  setEnableTranscriptReviewState: React.Dispatch<React.SetStateAction<boolean>>;
  enableSnippetReviewState: boolean;
  setEnableSnippetReviewState: React.Dispatch<React.SetStateAction<boolean>>;
  reviewIntervalState: number;
  setReviewIntervalState: React.Dispatch<React.SetStateAction<number>>;
  snippetsWithDueStatusMemoized: Snippet[];
}

export const LearningScreenContext =
  createContext<LearningScreenContextTypes | null>(null);

export const LearningScreenProvider = ({
  selectedContentStateMemoized,
  children,
}: LearningScreenProviderProps) => {
  const ref = useRef<HTMLVideoElement | HTMLAudioElement>(null);
  const transcriptRef = useRef<HTMLElement | null>(null);
  const loopDataRef = useRef(null);

  const [currentTime, setCurrentTime] = useState(0);
  const [loopSecondsState, setLoopSecondsState] = useState([]);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isInReviewMode, setIsInReviewMode] = useState(false);
  const [onlyShowEngState, setOnlyShowEngState] = useState(false);
  const [showWordsBasketState, setShowWordsBasketState] = useState(false);
  const [trackCurrentState, setTrackCurrentState] = useState(true);
  const initialSentenceCount = useRef<number | null>(null);

  const [scrollToElState, setScrollToElState] = useState('');
  const [sentenceRepsState, setSentenceRepsState] = useState(0);
  const [studyFromHereTimeState, setStudyFromHereTimeState] = useState<
    number | null
  >(null);
  const [isGenericItemLoadingState, setIsGenericItemLoadingState] = useState<
    SentenceMapItemTypes['id'][]
  >([]);
  const [isBreakingDownSentenceArrState, setIsBreakingDownSentenceArrState] =
    useState<SentenceMapItemTypes['id'][]>([]);
  const [breakdownSentencesArrState, setBreakdownSentencesArrState] = useState<
    SentenceMapItemTypes['id'][]
  >([]);

  const [loopTranscriptState, setLoopTranscriptState] = useState<
    FormattedTranscriptTypes[]
  >([]);
  const [threeSecondLoopState, setThreeSecondLoopState] = useState<
    number | null
  >(null);
  const [progress, setProgress] = useState(0);
  const [contractThreeSecondLoopState, setContractThreeSecondLoopState] =
    useState(false);

  const [elapsed, setElapsed] = useState(0);
  const [errorVideoState, setErrorVideoState] = useState(false);
  const [enableWordReviewState, setEnableWordReviewState] = useState(true);
  const [enableTranscriptReviewState, setEnableTranscriptReviewState] =
    useState(true);
  const [enableSnippetReviewState, setEnableSnippetReviewState] =
    useState(true);
  const [reviewIntervalState, setReviewIntervalState] = useState(60);
  const [mediaDuration, setMediaDuration] = useState<number | null>(null);

  const {
    wordsState,
    breakdownSentence,
    sentenceReviewBulk,
    updateSentenceData,
    updateContentMetaData,
    languageSelectedState,
  } = useFetchData();

  const selectedContentTitleState = selectedContentStateMemoized.title;

  const content = selectedContentStateMemoized.content;
  const contentIndex = selectedContentStateMemoized.contentIndex;
  const contentId = selectedContentStateMemoized.id;

  const {
    firstDueIndexMemoized,
    formattedTranscriptMemoized,
    sentenceMapMemoized,
    sentencesNeedReview,
    sentencesPendingOrDue,
    firstSentenceDueTime,
  } = useMemo(() => {
    const now = new Date();
    let firstDueIndexMemoized: number | null = null;
    let sentencesNeedReview = 0;
    let sentencesPendingOrDue = 0;
    let firstSentenceDueTime = null;

    const formattedTranscriptMemoized = content.map((item, index) => {
      const hasBeenReviewed = item?.reviewData?.due;
      if (hasBeenReviewed) {
        sentencesPendingOrDue += 1;
      }
      const isDueNow = isDueCheck(item, now);

      if (isDueNow) {
        sentencesNeedReview += 1;
        if (!isNumber(firstDueIndexMemoized)) {
          if (enableTranscriptReviewState) {
            firstSentenceDueTime = item.time;
          }
          firstDueIndexMemoized = index;
          if (isNumber(firstDueIndexMemoized) && firstDueIndexMemoized > 0) {
            firstDueIndexMemoized = firstDueIndexMemoized - 1;
          }
        }
      }

      const wordsFromSentence = findAllInstancesOfWordsInSentence(
        item.targetLang,
        wordsState,
      );

      const targetLangformatted = underlineWordsInSentence(
        item.targetLang,
        wordsFromSentence,
      );

      const nextItem = content[index + 1];
      const nextIsDueNow = isDueCheck(nextItem, now);
      const helperReviewSentence = !!(index > 0 && nextIsDueNow);

      return {
        ...item,
        isDue: isDueNow,
        targetLangformatted,
        wordsFromSentence,
        helperReviewSentence,
      } as FormattedTranscriptTypes;
    });

    // Step 3: Build prev/next lookup map
    const sentenceMapMemoized: Record<string, SentenceMapItemTypes> = {};
    for (let i = 0; i < formattedTranscriptMemoized.length; i++) {
      const current = formattedTranscriptMemoized[i];
      const prev = formattedTranscriptMemoized[i - 1];
      const next = formattedTranscriptMemoized[i + 1];
      sentenceMapMemoized[current.id] = {
        ...current,
        index: i,
        prevSentence: prev ? prev.time : null,
        thisSentence: current.time,
        targetLang: current.targetLang,
        isUpForReview: Boolean(current?.reviewData),
        baseLang: current.baseLang,
        nextSentence: next ? next.time : null,
      };
    }

    return {
      firstDueIndexMemoized,
      formattedTranscriptMemoized,
      sentenceMapMemoized,
      sentencesNeedReview,
      sentencesPendingOrDue,
      firstSentenceDueTime,
    };
  }, [content, enableTranscriptReviewState, wordsState]);

  const handlePlayFromHere = (time: number) => {
    if (ref.current) {
      ref.current.currentTime = time;
      ref.current.play();
    }
  };

  // Update current time as video plays
  const handleTimeUpdate = () => {
    if (ref.current) {
      setCurrentTime(ref.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (ref.current?.duration) {
      setMediaDuration(ref.current.duration);
    }
  };

  const handleStudyFromHere = () => {
    if (!masterPlayComprehensive) {
      return;
    }
    const masterPlayIndex = masterPlayComprehensive.index;
    setStudyFromHereTimeState(masterPlayIndex);
    if (transcriptRef.current) {
      transcriptRef.current.scrollIntoView();
    }
  };

  const getSentenceDataOfOverlappingWordsDuringSave = (
    thisSnippetsTime: number,
    highlightedTextFromSnippet: string,
  ) => {
    const startTime = thisSnippetsTime - 1.5;
    const endTime = thisSnippetsTime + 1.5;

    const idsOfOverlappingSentences = getUniqueSegmentOfArray(
      secondsStateMemoized,
      startTime,
      endTime,
    );

    if (idsOfOverlappingSentences?.length === 0) {
      return null;
    }
    if (idsOfOverlappingSentences?.length === 1) {
      return idsOfOverlappingSentences[0];
    }

    const found = idsOfOverlappingSentences.find((sentenceId) => {
      const sentence = sentenceMapMemoized[sentenceId];
      return sentence.targetLang.includes(highlightedTextFromSnippet);
    });

    return found || idsOfOverlappingSentences[0];
  };

  const handleQuickSaveSnippet = async () => {
    const contentSnippets = selectedContentStateMemoized?.snippets || [];
    const hasThisSnippet =
      contentSnippets?.length === 0
        ? false
        : contentSnippets.some(
            (item) => item?.time.toFixed(1) === currentTime.toFixed(1),
          );

    if (hasThisSnippet) {
      return null;
    }

    const timeNow = new Date();

    const { nextScheduledOptions } = srsCalculationAndText({
      contentType: srsRetentionKey.snippet,
      timeNow,
    });
    const startTime = currentTime - 1.5;
    const endTime = currentTime + 1.5;

    const reviewData = nextScheduledOptions['1'].card;

    const loopedTranscriptSegment = getLoopTranscriptSegment({
      startTime,
      endTime,
    });

    const resultOfThis = getSecondsLoopedTranscriptData({
      formattedTranscriptState: loopedTranscriptSegment,
      loopStartTime: startTime,
      loopEndTime: endTime,
      mediaDuration,
    });

    if (!resultOfThis || resultOfThis?.length === 0) {
      return null;
    }

    const overlappingIds = resultOfThis.map((item) => item.id);
    const entries = loopedTranscriptSegment.filter((x) =>
      overlappingIds.includes(x.id),
    );

    const targetLang = entries.map((item) => item.targetLang).join('');
    const baseLang = entries.map((item) => item.baseLang).join('');
    const suggestedFocusText = sliceTranscriptViaPercentageOverlap(
      resultOfThis,
      !isTrimmedLang(languageSelectedState),
    );

    const finalSnippetObject = {
      id: uuidv4(),
      time: currentTime,
      isContracted: false,
      reviewData,
      targetLang,
      baseLang,
      suggestedFocusText,
      isPreSnippet: true,
    };

    try {
      setIsGenericItemLoadingState((prev) => [...prev, ...overlappingIds]);
      await updateContentMetaData({
        fieldToUpdate: {
          snippets: [...contentSnippets, finalSnippetObject],
        },
        contentId,
        contentIndex,
      });
    } finally {
      setIsGenericItemLoadingState((prev) =>
        prev.filter((item) => !overlappingIds.includes(item)),
      );
    }
  };

  const handleUpdateSnippet = async (snippetToUpdate: Snippet) => {
    const contentSnippets = selectedContentStateMemoized?.snippets;
    if (!contentSnippets || contentSnippets.length === 0) {
      return;
    }
    const updatedSnippetArray = contentSnippets.map((item) => {
      if (snippetToUpdate.id === item.id) {
        return {
          ...item,
          ...snippetToUpdate,
        };
      }

      return item;
    });

    const boolReturn = await updateContentMetaData({
      fieldToUpdate: {
        snippets: updatedSnippetArray,
      },
      contentId,
      contentIndex,
    });
    return boolReturn;
  };

  const handleSaveSnippet = async (snippetArgs: OverlappingTextTypes) => {
    const contentSnippets = selectedContentStateMemoized?.snippets || [];
    const hasThisSnippet =
      contentSnippets?.length === 0
        ? false
        : contentSnippets.some((item) => item?.time === threeSecondLoopState);
    if (hasThisSnippet) {
      return null;
    }
    const timeNow = new Date();

    const { nextScheduledOptions } = srsCalculationAndText({
      contentType: srsRetentionKey.snippet,
      timeNow,
    });

    const reviewData = nextScheduledOptions['1'].card;
    await updateContentMetaData({
      fieldToUpdate: {
        snippets: [
          ...contentSnippets,
          {
            id: uuidv4(),
            time: threeSecondLoopState,
            isContracted: contractThreeSecondLoopState,
            reviewData,
            ...snippetArgs,
          },
        ],
      },
      contentId,
      contentIndex,
    });
    setThreeSecondLoopState(null);
    setContractThreeSecondLoopState(false);
  };

  const handleDeleteSnippet = async (
    snippetId: Snippet['id'],
    wordsFromSentence?: WordTypes[],
  ) => {
    if (
      !selectedContentStateMemoized?.snippets ||
      selectedContentStateMemoized?.snippets?.length === 0
    ) {
      return;
    }
    let updatedSnippets = [];
    if (wordsFromSentence) {
      updatedSnippets = selectedContentStateMemoized.snippets.map((item) => {
        if (item.id !== snippetId) {
          return item;
        }
        const updatedObject = { ...item, reviewData: undefined };
        return updatedObject;
      });
    } else {
      updatedSnippets = selectedContentStateMemoized.snippets.filter(
        (item) => item.id !== snippetId,
      );
    }
    await updateContentMetaData({
      fieldToUpdate: {
        snippets: [...updatedSnippets],
      },
      contentIndex,
      contentId,
    });
  };

  const handleUpdateSnippetReview = async (
    snippetArgs: HandleUpdateSnippetReviewParams,
  ) => {
    if (
      !selectedContentStateMemoized?.snippets ||
      selectedContentStateMemoized.snippets.length === 0
    ) {
      return;
    }
    const snippetId = snippetArgs.id;
    const fieldToUpdate = snippetArgs.fieldToUpdate;
    const updatedSnippets = selectedContentStateMemoized.snippets.map(
      (item) => {
        if (item.id === snippetId) {
          return {
            ...item,
            ...fieldToUpdate,
          };
        }
        return item;
      },
    );

    await updateContentMetaData({
      fieldToUpdate: {
        snippets: [...updatedSnippets],
      },
      contentIndex,
      contentId,
    });
  };

  const handleJumpToFirstElInReviewTranscript = (isSecondIndex?: boolean) => {
    if (!isNumber(firstDueIndexMemoized) || !sentenceMapMemoized) {
      return;
    }
    if (loopSecondsState.length > 0) {
      setLoopSecondsState([]);
    } else if (threeSecondLoopState) {
      setThreeSecondLoopState(null);
    }

    const latestestReviewSentenceTime =
      formattedTranscriptMemoized[
        isSecondIndex ? firstDueIndexMemoized + 1 : firstDueIndexMemoized
      ].time;

    if (latestestReviewSentenceTime >= 0) {
      handleFromHere(latestestReviewSentenceTime);
    }
  };

  const secondsStateMemoized = useMemo(() => {
    if (!mediaDuration) {
      return [];
    }
    const arrOfSeconds = mapSentenceIdsToSeconds({
      content: selectedContentStateMemoized.content,
      duration: mediaDuration,
    });

    return arrOfSeconds;
  }, [mediaDuration, selectedContentStateMemoized]);

  const getLoopTranscriptSegment = ({
    startTime,
    endTime,
  }: {
    startTime: number;
    endTime: number;
  }) => {
    const secondsStateSliceArr = getUniqueSegmentOfArray(
      secondsStateMemoized,
      startTime,
      endTime,
    );

    const filtered = secondsStateSliceArr.map(
      (secondsSentenceId) => sentenceMapMemoized[secondsSentenceId],
    );

    return filtered;
  };

  const loopedTranscriptMemoized = useMemo(() => {
    if (!threeSecondLoopState || secondsStateMemoized.length === 0) {
      return [];
    }

    const startTime =
      threeSecondLoopState - (contractThreeSecondLoopState ? 0.75 : 1.5);
    const endTime =
      threeSecondLoopState + (contractThreeSecondLoopState ? 0.75 : 1.5);

    return getLoopTranscriptSegment({
      startTime,
      endTime,
    });
  }, [
    secondsStateMemoized,
    contractThreeSecondLoopState,
    threeSecondLoopState,
  ]);

  useEffect(() => {
    if (isInReviewMode) {
      setStudyFromHereTimeState(null);
    }
  }, [isInReviewMode, studyFromHereTimeState]);

  const overlappingSnippetDataMemoised = useManageThreeSecondLoopMemo({
    threeSecondLoopState,
    contractThreeSecondLoopState,
    formattedTranscriptState: loopedTranscriptMemoized,
    mediaDuration,
  });

  const masterPlay =
    currentTime && loopSecondsState.length > 0
      ? loopSecondsState[Math.floor(currentTime)]
      : secondsStateMemoized.length > 0
      ? secondsStateMemoized[Math.floor(currentTime)]
      : '';

  const masterPlayComprehensive = sentenceMapMemoized
    ? sentenceMapMemoized[masterPlay]
    : null;

  useManageLoopInit({
    ref,
    threeSecondLoopState,
    contractThreeSecondLoopState,
    loopTranscriptState,
    setContractThreeSecondLoopState,
    masterPlay,
  });

  useLoopSecondsHook({
    secondsState: secondsStateMemoized,
    setLoopSecondsState,
    loopTranscriptState,
  });

  const handleFromHere = (time: number) => {
    if (!isNumber(time)) {
      return null;
    }

    handlePlayFromHere(time);
  };
  const handlePause = () => {
    if (!ref.current) {
      return;
    }
    ref.current.pause();
  };

  const handleRewind = () => {
    if (!ref.current) {
      return;
    }
    ref.current.currentTime = ref.current.currentTime - 3;
  };

  const playFromThisContext = (contextId: FormattedTranscriptTypes['id']) => {
    const contextSentence = sentenceMapMemoized[contextId];
    if (contextSentence) {
      handleFromHere(contextSentence.time);
    }
  };

  const handleJumpToSentenceViaKeys = (nextIndex: number) => {
    if (!masterPlayComprehensive) {
      return;
    }

    const nextTimeToFollow =
      nextIndex === 1
        ? masterPlayComprehensive?.nextSentence
        : nextIndex === 0
        ? masterPlayComprehensive?.thisSentence
        : masterPlayComprehensive?.prevSentence;

    if (isNumber(nextTimeToFollow) && nextTimeToFollow >= 0) {
      handleFromHere(nextTimeToFollow);
    }
  };

  const {
    contentMetaWordMemoized,
    wordsForSelectedTopicMemoized,
    firstWordDueTime,
  } = useMemo(() => {
    if (wordsState.length === 0) {
      return {
        contentMetaWordMemoized: [],
        wordsForSelectedTopicMemoized: [],
        firstWordDueTime: null,
      };
    }

    const now = new Date();

    const allWords = [] as WordTypes[];
    const dueWords = [] as WordTypes[];

    wordsState.forEach((wordItem) => {
      if (wordItem.originalContext === selectedContentTitleState) {
        allWords.push(wordItem);
        if (wordItem.isDue) {
          dueWords.push(wordItem);
        } else if (isDueCheck(wordItem, now)) {
          dueWords.push(wordItem);
        }
      }
    });

    // Sort all words by due status
    const sortedAllWords = allWords.sort(
      (a, b) => Number(b.isDue) - Number(a.isDue),
    );

    const firstWordDueTime =
      enableWordReviewState && dueWords.length > 0
        ? dueWords.reduce((earliest, curr) =>
            curr.time < earliest.time ? curr : earliest,
          ).time
        : null;

    return {
      contentMetaWordMemoized: dueWords,
      wordsForSelectedTopicMemoized: sortedAllWords,
      firstWordDueTime,
    };
  }, [selectedContentTitleState, wordsState, enableWordReviewState]);

  const handleBulkReviews = async () => {
    // const emptyCard = getEmptyCard();
    //
    // const sentenceIdData =
    //   loopTranscriptState.filter((item) => !item?.reviewData) || [];
    // const nextScheduledOptions = getNextScheduledOptions({
    //   card: emptyCard,
    //   contentType: srsRetentionKeyTypes.sentences,
    // });
    // const hasContentToReview = content?.some(
    //   (sentenceWidget) => sentenceWidget?.reviewData,
    // );
    // const nextDueCard = nextScheduledOptions['2'].card;
    // if (sentenceIdData.length === 0) {
    //   console.log('## no sentenceIds');
    //   return;
    // }
    // const sentenceIds = sentenceIdData.map((item) => item.id);
    // try {
    //   setIsGenericItemLoadingState((prev) => [...prev, ...sentenceIds]);
    //   await sentenceReviewBulk({
    //     topicName: selectedContentStateMemoized.title,
    //     fieldToUpdate: {
    //       reviewData: nextDueCard,
    //     },
    //     contentIndex,
    //     removeReview: hasContentToReview,
    //     sentenceIds,
    //   });
    //   setSentenceRepsState((prev) => prev + sentenceIds.length);
    // } catch (error) {
    // } finally {
    //   setIsGenericItemLoadingState((prev) =>
    //     prev.filter((item) => !sentenceIds.includes(item)),
    //   );
    // }
  };

  const handleReviewFunc = async ({
    sentenceId,
    isRemoveReview,
    nextDue,
  }: HandleReviewFuncParams) => {
    const cardDataRelativeToNow = getEmptyCard();
    const nextScheduledOptions = getNextScheduledOptions({
      card: cardDataRelativeToNow,
      contentType: srsRetentionKeyTypes.sentences,
    });

    const result = await updateSentenceData({
      topicName: selectedContentTitleState,
      sentenceId,
      fieldToUpdate: isRemoveReview
        ? { removeReview: true }
        : {
            reviewData: nextDue || nextScheduledOptions['1'].card,
          },
      contentIndex: contentIndex,
      isRemoveReview,
      indexKey: selectedContentStateMemoized.id,
    });
    if (result) {
      setSentenceRepsState(sentenceRepsState + 1);
    }
  };

  const handleLoopThis3Second = () => {
    if (loopTranscriptState) {
      setLoopTranscriptState([]);
    }
    if (isNumber(threeSecondLoopState)) {
      setThreeSecondLoopState(null);
      return;
    }

    if (!ref.current) {
      return;
    }
    setThreeSecondLoopState(ref.current.currentTime);
    // account for the three seconds on both extremes
  };

  const handleShiftLoopSentence = (shiftForward: boolean) => {
    if (shiftForward) {
      setLoopTranscriptState((prev) => prev.slice(1));
    }
  };

  const handleLoopThisSentence = () => {
    if (!masterPlayComprehensive || !mediaDuration) return null;

    if (
      loopTranscriptState?.length === 1 &&
      loopTranscriptState[0]?.id === masterPlayComprehensive.id
    ) {
      setLoopTranscriptState([]);
      return;
    }

    setLoopTranscriptState([masterPlayComprehensive]);
  };

  const handleUpdateLoopedSentence = (extendSentenceLoop: boolean) => {
    if (extendSentenceLoop) {
      const lastSentenceId =
        loopTranscriptState[loopTranscriptState.length - 1]?.id;
      if (!lastSentenceId) {
        return;
      }
      const lastSentenceIdIndex = formattedTranscriptMemoized.findIndex(
        (i) => i.id === lastSentenceId,
      );

      const thisItemData = formattedTranscriptMemoized[lastSentenceIdIndex + 1];

      setLoopTranscriptState((prev) => [...prev, thisItemData]);
    } else {
      setLoopTranscriptState((prev) => prev.slice(0, -1));
    }
  };

  const handleOpenBreakdownSentence = () => {
    if (!masterPlayComprehensive) return null;

    const alreadyHasBreakdown = masterPlayComprehensive?.sentenceStructure;
    if (!alreadyHasBreakdown) return null;

    const isOpen = breakdownSentencesArrState.includes(
      masterPlayComprehensive.id,
    );

    if (isOpen) {
      const updatedList = breakdownSentencesArrState.filter(
        (i) => i !== masterPlayComprehensive.id,
      );
      setBreakdownSentencesArrState(updatedList);
    } else {
      const updatedList = [
        ...breakdownSentencesArrState,
        masterPlayComprehensive.id,
      ];
      setBreakdownSentencesArrState(updatedList);
    }
  };

  const handleBreakdownMasterSentence = async () => {
    if (!masterPlayComprehensive) return null;
    const alreadyHasBreakdown = masterPlayComprehensive?.sentenceStructure;
    if (alreadyHasBreakdown) {
      handleOpenBreakdownSentence();
      return null;
    }

    try {
      setIsBreakingDownSentenceArrState((prev) => [
        ...prev,
        masterPlayComprehensive.id,
      ]);
      await breakdownSentence({
        indexKey: selectedContentStateMemoized.id,
        sentenceId: masterPlayComprehensive.id,
        targetLang: masterPlayComprehensive.targetLang,
        contentIndex,
      });
    } finally {
      setIsBreakingDownSentenceArrState((prev) =>
        prev.filter((item) => item !== masterPlayComprehensive.id),
      );
    }
  };

  const handleAddMasterToReview = async () => {
    if (!masterPlayComprehensive) {
      return;
    }

    const sentenceHasReview = masterPlayComprehensive?.reviewData;

    try {
      setIsGenericItemLoadingState((prev) => [
        ...prev,
        masterPlayComprehensive.id,
      ]);
      await handleReviewFunc({
        sentenceId: masterPlayComprehensive.id,
        isRemoveReview: Boolean(sentenceHasReview),
      });
      setSentenceRepsState(sentenceRepsState + 1);
    } finally {
      setIsGenericItemLoadingState((prev) =>
        prev.filter((item) => item !== masterPlayComprehensive.id),
      );
    }
  };

  const handleIsEasyReviewShortCut = async () => {
    if (!masterPlayComprehensive) {
      return;
    }
    const sentenceHasReview = masterPlayComprehensive?.reviewData;

    const { nextScheduledOptions } = srsCalculationAndText({
      reviewData: sentenceHasReview,
      contentType: srsRetentionKeyTypes.sentences,
      timeNow: new Date(),
    });

    const nextReviewData = nextScheduledOptions['4'].card;

    try {
      setIsGenericItemLoadingState((prev) => [
        ...prev,
        masterPlayComprehensive.id,
      ]);
      await handleReviewFunc({
        sentenceId: masterPlayComprehensive.id,
        nextDue: nextReviewData,
      });
      setSentenceRepsState(sentenceRepsState + 1);
    } finally {
      setIsGenericItemLoadingState((prev) =>
        prev.filter((item) => item !== masterPlayComprehensive.id),
      );
    }
  };

  const handleBreakdownSentence = async ({ sentenceId, targetLang }) => {
    try {
      setIsBreakingDownSentenceArrState((prev) => [...prev, sentenceId]);
      await breakdownSentence({
        indexKey: selectedContentStateMemoized.id,
        sentenceId,
        targetLang,
        contentIndex,
      });
    } finally {
      setIsBreakingDownSentenceArrState((prev) =>
        prev.filter((item) => item !== sentenceId),
      );
    }
  };

  useEffect(() => {
    if (initialSentenceCount.current === null && sentencesNeedReview > 0) {
      initialSentenceCount.current = sentencesNeedReview;
    }
  }, [sentencesNeedReview]);

  const learnFormattedTranscript = studyFromHereTimeState
    ? formattedTranscriptMemoized.slice(studyFromHereTimeState)
    : formattedTranscriptMemoized;

  const topicWordsForReviewMemoized = useMemo(() => {
    if (!isInReviewMode || wordsForSelectedTopicMemoized?.length === 0) {
      return [];
    }

    const sentenceIdsForReview = [] as FormattedTranscriptTypes['id'][];

    learnFormattedTranscript.forEach((transcriptEl) => {
      if (transcriptEl.isDue) {
        sentenceIdsForReview.push(transcriptEl.id);
      }
    });

    if (sentenceIdsForReview.length === 0) {
      return [];
    }
    const now = new Date();
    const topicWordsForReviewMemoized =
      [] as TopicWordsForReviewMemoizedProps[];
    wordsForSelectedTopicMemoized.forEach((wordItem) => {
      const firstContext = wordItem.contexts[0];

      if (
        sentenceIdsForReview.includes(firstContext) &&
        isDueCheck(wordItem, now)
      ) {
        topicWordsForReviewMemoized.push({
          ...wordItem,
          time: learnFormattedTranscript.find(
            (item) => item.id === firstContext,
          )?.time,
        });
      }
    });

    return topicWordsForReviewMemoized;
  }, [learnFormattedTranscript, isInReviewMode, wordsForSelectedTopicMemoized]);

  const { snippetsWithDueStatusMemoized, earliestSnippetDueTime } =
    useMemo(() => {
      if (
        !selectedContentStateMemoized?.snippets ||
        selectedContentStateMemoized?.snippets.length === 0 ||
        !enableSnippetReviewState
      ) {
        return {
          snippetsWithDueStatusMemoized: [],
          earliestSnippetDueTime: null,
        };
      }
      const now = new Date();

      const snippetsWithDueStatusMemoized = [] as Snippet[];
      selectedContentStateMemoized?.snippets?.forEach((item) => {
        if (isDueCheck(item, now)) {
          snippetsWithDueStatusMemoized.push(item);
        }
      });

      const earliestSnippetDueTime =
        enableSnippetReviewState && snippetsWithDueStatusMemoized.length > 0
          ? snippetsWithDueStatusMemoized.reduce((earliest, curr) =>
              curr.time < earliest.time ? curr : earliest,
            ).time
          : null;

      return {
        snippetsWithDueStatusMemoized,
        earliestSnippetDueTime,
      };
    }, [selectedContentStateMemoized, enableSnippetReviewState]);

  const firstTime = useMemo(() => {
    if (!isInReviewMode) {
      return null;
    }
    const timeArrays = [
      earliestSnippetDueTime,
      firstWordDueTime,
      firstSentenceDueTime,
    ];

    const validTimes = timeArrays.filter((time) => time !== null);
    return validTimes.length > 0 ? Math.min(...validTimes) : null;
  }, [
    isInReviewMode,
    earliestSnippetDueTime,
    firstWordDueTime,
    firstSentenceDueTime,
  ]);

  const overlappingTextMemoized: OverlappingTextTypes | null = useMemo(() => {
    if (
      !threeSecondLoopState ||
      !overlappingSnippetDataMemoised ||
      overlappingSnippetDataMemoised.length === 0
    ) {
      return null;
    }

    const overlappingIds = overlappingSnippetDataMemoised.map(
      (item) => item.id,
    );
    const entries = loopedTranscriptMemoized.filter((x) =>
      overlappingIds.includes(x.id),
    );

    const targetLang = entries.map((item) => item.targetLang).join('');
    const baseLang = entries.map((item) => item.baseLang).join('');

    return {
      targetLang,
      baseLang,
      suggestedFocusText: sliceTranscriptViaPercentageOverlap(
        overlappingSnippetDataMemoised,
      ),
    };
  }, [
    overlappingSnippetDataMemoised,
    threeSecondLoopState,
    loopedTranscriptMemoized,
  ]);

  const savedSnippetsMemoized = useSavedSnippetsMemoized(
    selectedContentStateMemoized?.snippets,
    formattedTranscriptMemoized,
    loopDataRef,
  );

  const overlappedSentencesViableForReviewMemoized =
    useOverlappedSentencesViableForReviewMemo(
      selectedContentStateMemoized?.snippets,
      sentenceMapMemoized,
      formattedTranscriptMemoized,
      mediaDuration,
      getLoopTranscriptSegment,
    );

  const handleAddOverlappedSnippetsToReview = async () => {
    const emptyCard = getEmptyCard();

    const nextScheduledOptions = getNextScheduledOptions({
      card: emptyCard,
      contentType: srsRetentionKeyTypes.sentences,
    });

    const nextDueCard = nextScheduledOptions['2'].card;

    if (
      !overlappedSentencesViableForReviewMemoized ||
      overlappedSentencesViableForReviewMemoized.length === 0
    ) {
      return null;
    }

    const sentenceIds = overlappedSentencesViableForReviewMemoized;
    try {
      setIsGenericItemLoadingState((prev) => [...prev, ...sentenceIds]);
      await sentenceReviewBulk({
        contentId,
        reviewData: nextDueCard,
        contentIndex,
        sentenceIds,
      });
      setSentenceRepsState((prev) => prev + sentenceIds.length);
    } finally {
      setIsGenericItemLoadingState((prev) =>
        prev.filter((item) => !sentenceIds.includes(item)),
      );
    }
  };

  return (
    <LearningScreenContext.Provider
      value={{
        handlePlayFromHere,
        handleTimeUpdate,
        handleLoadedMetadata,
        mediaDuration,
        ref,
        currentTime,
        formattedTranscriptState: formattedTranscriptMemoized,
        secondsState: secondsStateMemoized,
        masterPlayComprehensive,
        isVideoPlaying,
        setIsVideoPlaying,
        isInReviewMode,
        setIsInReviewMode,
        isGenericItemLoadingState,
        setIsGenericItemLoadingState,
        breakdownSentencesArrState,
        setBreakdownSentencesArrState,
        overlappingSnippetDataState: overlappingSnippetDataMemoised || [],
        loopTranscriptState,
        setLoopTranscriptState,
        threeSecondLoopState,
        setThreeSecondLoopState,
        progress,
        setProgress,
        onlyShowEngState,
        setOnlyShowEngState,
        showWordsBasketState,
        setShowWordsBasketState,
        trackCurrentState,
        setTrackCurrentState,
        contractThreeSecondLoopState,
        setContractThreeSecondLoopState,
        masterPlay,
        handleFromHere,
        handlePause,
        handleRewind,
        handleJumpToSentenceViaKeys,
        handleLoopThis3Second,
        handleShiftLoopSentence,
        handleLoopThisSentence,
        handleUpdateLoopedSentence,
        handleBreakdownMasterSentence,
        handleAddMasterToReview,
        handleIsEasyReviewShortCut,
        handleBulkReviews,
        handleReviewFunc,
        handleBreakdownSentence,
        isBreakingDownSentenceArrState,
        handleStudyFromHere,
        setStudyFromHereTimeState,
        studyFromHereTimeState,
        transcriptRef,
        scrollToElState,
        selectedContentTitleState,
        wordsForSelectedTopic: wordsForSelectedTopicMemoized,
        selectedContentState: selectedContentStateMemoized,
        sentenceRepsState,
        elapsed,
        setElapsed,
        playFromThisContext,
        setSentenceRepsState,
        sentencesNeedReview,
        sentencesPendingOrDue,
        contentMetaWordMemoized,
        initialSentenceCount: initialSentenceCount.current,
        errorVideoState,
        setErrorVideoState,
        handleJumpToFirstElInReviewTranscript,
        learnFormattedTranscript,
        topicWordsForReviewMemoized,
        firstTime,
        overlappingTextMemoized,
        savedSnippetsMemoized,
        handleUpdateSnippetReview,
        contentSnippets: selectedContentStateMemoized?.snippets || [],
        sentenceMapMemoized,
        handleUpdateSnippet,
        getSentenceDataOfOverlappingWordsDuringSave,
        setScrollToElState,
        enableWordReviewState,
        setEnableWordReviewState,
        enableTranscriptReviewState,
        setEnableTranscriptReviewState,
        enableSnippetReviewState,
        setEnableSnippetReviewState,
        reviewIntervalState,
        setReviewIntervalState,
        snippetsWithDueStatusMemoized,
        handleSaveSnippet,
        handleDeleteSnippet,
        handleQuickSaveSnippet,
        overlappedSentencesViableForReviewMemoized,
        handleAddOverlappedSnippetsToReview,
      }}
    >
      {children}
    </LearningScreenContext.Provider>
  );
};
