'use client';
import { isNumber } from '@/utils/is-number';
import { v4 as uuidv4 } from 'uuid';
import { createContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  getEmptyCard,
  getNextScheduledOptions,
  srsCalculationAndText,
  srsRetentionKeyTypes,
} from '../srs-utils/srs-algo';
import useManageLoopInit from './hooks/useManageLoopInit';
import { useLoopSecondsHook } from './hooks/useMapTranscriptToSeconds';
import {
  SavedSnippetsMemoizedProps,
  useSavedSnippetsMemoized,
} from './hooks/useSavedSnippetsMemoized';
import { useOverlappedSentencesViableForReviewMemo } from './hooks/useOverlappedSentencesViableForReviewMemo';
import { useFetchData } from '../Providers/FetchDataProvider';
import { WordTypes } from '../types/word-types';
import { sliceTranscriptViaPercentageOverlap } from './utils/slice-transcript-via-percentage-overlap';
import { isTrimmedLang } from '../languages';
import useManageThreeSecondLoopMemo from './hooks/useManageThreeSecondLoopMemo';
import { getSecondsLoopedTranscriptData } from './utils/get-seconds-looped-transcript-data';
import { useSecondsStateMemoized } from './hooks/useSecondsStateMemoized';
import { useTranscriptMetaMemoized } from './hooks/useTranscriptMetaMemoized';
import { useWordMetaMemoized } from './hooks/useWordMetaMemoized';
import { useTopicWordsForReviewMemoized } from './hooks/useTopicWordsForReviewMemoized';
import { useSnippetDueMemoized } from './hooks/useSnippetDueMemoized';
import { useLoopedTranscriptMemoized } from './hooks/useLoopedTranscriptMemoized';
import { useOverlappingTextMemoized } from './hooks/useOverlappingTextMemoized';
import { useMediaControls } from './hooks/useMediaControls';
import {
  ContentTypes,
  FormattedTranscriptTypes,
  SentenceMapItemTypes,
  Snippet,
} from '../types/content-types';
import { getUniqueSegmentOfArray } from './utils/get-unique-segment-of-array';
import { getLoopTranscriptSegment as getLoopTranscriptSegmentFromTimes } from './utils/get-loop-transcript-segment';
import { OverlappingSnippetData, ReviewDataTypes } from '../types/shared-types';
import { useGamepad } from './experimental/useGamePad';
import { useInputActions } from './experimental/useInputActions';

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
  sentenceId: string;
  targetLang: string;
}

interface TopicWordsForReviewMemoizedProps extends WordTypes {
  time?: number;
}

export type ContextIdType = WordTypes['contexts'][number];

export interface LearningScreenContextTypes {
  getSentenceFromContextId: (contextId: ContextIdType) => string;
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
  isGenericItemsLoadingArrayState: SentenceMapItemTypes['id'][];
  setIsGenericItemsLoadingArrayState: React.Dispatch<
    React.SetStateAction<SentenceMapItemTypes['id'][]>
  >;
  snippetLoadingState: string[];
  setSnippetLoadingState: React.Dispatch<React.SetStateAction<string[]>>;
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
  handleSaveSnippet: (
    snippetArgs: OverlappingTextTypes,
  ) => Promise<void | null>;
  overlappingTextMemoized: OverlappingTextTypes | null;
  savedSnippetsMemoized: SavedSnippetsMemoizedProps[];
  handleDeleteSnippet: (
    snippetData: Snippet,
    wordsFromSentence?: WordTypes[],
  ) => Promise<void>;
  contentSnippets: Snippet[];
  sentenceMapMemoized: Record<string, SentenceMapItemTypes>;
  handleQuickSaveSnippet: () => Promise<void | null>;
  handleUpdateSnippet: (params: {
    snippetData: Snippet;
    isRemoveReview?: boolean;
  }) => Promise<void>;
  getSentenceDataOfOverlappingWordsDuringSave: (
    thisSnippetsTime: number,
    highlightedTextFromSnippet: string,
  ) => string | number | null;
  overlappedSentencesViableForReviewMemoized: string[] | null;
  handleAddOverlappedSnippetsToReview: () => Promise<void | null>;
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
  const [isGenericItemsLoadingArrayState, setIsGenericItemsLoadingArrayState] =
    useState<SentenceMapItemTypes['id'][]>([]);
  const [snippetLoadingState, setSnippetLoadingState] = useState<string[]>([]);
  const [isBreakingDownSentenceArrState, setIsBreakingDownSentenceArrState] =
    useState<SentenceMapItemTypes['id'][]>([]);

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
    languageSelectedState,
    handleSaveSnippetFetchProvider,
    handleDeleteSnippetFetchProvider,
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
  } = useTranscriptMetaMemoized({
    content,
    enableTranscriptReviewState,
    wordsState,
  });

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
      contentType: srsRetentionKeyTypes.snippet,
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
      setIsGenericItemsLoadingArrayState((prev) => [
        ...prev,
        ...overlappingIds,
      ]);
      await handleSaveSnippetFetchProvider({
        snippetData: finalSnippetObject,
        contentId,
        contentIndex,
      });
    } finally {
      setIsGenericItemsLoadingArrayState((prev) =>
        prev.filter((item) => !overlappingIds.includes(item)),
      );
    }
  };

  const handleSaveSnippet = async (snippetArgs: OverlappingTextTypes) => {
    const contentSnippets = selectedContentStateMemoized?.snippets || [];
    if (!threeSecondLoopState) {
      return null;
    }

    const hasThisSnippet =
      contentSnippets?.length === 0
        ? false
        : contentSnippets.some((item) => item?.time === threeSecondLoopState);
    if (hasThisSnippet) {
      return null;
    }
    const timeNow = new Date();

    const { nextScheduledOptions } = srsCalculationAndText({
      contentType: srsRetentionKeyTypes.snippet,
      timeNow,
    });

    const reviewData = nextScheduledOptions['1'].card;

    const { vocab: _unusedVocab, ...finalSnippetWithoutVocab } = snippetArgs;
    await handleSaveSnippetFetchProvider({
      snippetData: {
        id: uuidv4(),
        time: threeSecondLoopState,
        isContracted: contractThreeSecondLoopState,
        reviewData,
        ...finalSnippetWithoutVocab,
      },
      contentId,
      contentIndex,
    });
    setThreeSecondLoopState(null);
    setContractThreeSecondLoopState(false);
  };

  const handleDeleteSnippet = async (
    snippetData: Snippet,
    wordsFromSentence?: WordTypes[],
  ) => {
    if (
      !selectedContentStateMemoized?.snippets ||
      selectedContentStateMemoized?.snippets?.length === 0
    ) {
      return;
    }

    setSnippetLoadingState((prev) => [...prev, snippetData.id]);
    try {
      if (wordsFromSentence) {
        await handleSaveSnippetFetchProvider({
          snippetData: { ...snippetData, reviewData: undefined },
          contentId,
          contentIndex,
          isUpdate: true,
        });
      } else {
        await handleDeleteSnippetFetchProvider({
          contentIndex,
          contentId,
          snippetId: snippetData.id,
        });
      }
    } finally {
      setSnippetLoadingState((prev) =>
        prev.filter((id) => id !== snippetData.id),
      );
    }
  };

  const handleUpdateSnippet = async ({
    snippetData,
    isRemoveReview,
  }: {
    snippetData: Snippet;
    isRemoveReview?: boolean;
  }) => {
    if (isRemoveReview) {
      await handleDeleteSnippetFetchProvider({
        contentIndex,
        contentId,
        snippetId: snippetData.id,
      });
    } else {
      const { vocab: _unusedVocab, ...snippetWithoutVocab } = snippetData;
      await handleSaveSnippetFetchProvider({
        snippetData: snippetWithoutVocab,
        contentIndex,
        contentId,
        isUpdate: true,
      });
    }
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

  const secondsStateMemoized = useSecondsStateMemoized({
    content,
    mediaDuration,
  });

  const getLoopTranscriptSegment = ({
    startTime,
    endTime,
  }: {
    startTime: number;
    endTime: number;
  }) =>
    getLoopTranscriptSegmentFromTimes({
      secondsState: secondsStateMemoized,
      sentenceMap: sentenceMapMemoized,
      startTime,
      endTime,
    });

  useEffect(() => {
    if (isInReviewMode) {
      setStudyFromHereTimeState(null);
    }
  }, [isInReviewMode, studyFromHereTimeState]);

  const loopedTranscriptMemoized = useLoopedTranscriptMemoized({
    threeSecondLoopState,
    secondsState: secondsStateMemoized,
    contractThreeSecondLoopState,
    getLoopTranscriptSegment,
  });

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

  const {
    handleTimeUpdate,
    handleLoadedMetadata,
    handlePlayFromHere,
    handleFromHere,
    handlePause,
    handleRewind,
    handlePausePlay,
    handleJumpToSentenceViaKeys,
    handleJumpNext,
    handleJumpPrev,
    handleJumpCurrent,
    handleLoopSentenceCombo,
    handleLoopThisSentence,
    handleUpdateLoopedSentence,
    handleShiftLoopSentence,
    handleShiftLoopSentenceForward,
    handleShrinkLoop,
    handleLoopThis3Second,
    handleRewindOrToggleContract,
    handleShiftSnippetLeft,
    handleShiftSnippetRight,
  } = useMediaControls({
    ref,
    setCurrentTime,
    setMediaDuration,
    masterPlayComprehensive,
    mediaDuration,
    loopTranscriptState,
    setLoopTranscriptState,
    threeSecondLoopState,
    setThreeSecondLoopState,
    setContractThreeSecondLoopState,
    formattedTranscriptMemoized,
  });

  const handleToggleReviewMode = () => {
    setIsInReviewMode((prev) => !prev);
  };

  const handleBreakdownMasterSentence = async () => {
    if (!masterPlayComprehensive) return null;
    const alreadyHasBreakdown = masterPlayComprehensive?.sentenceStructure;
    if (alreadyHasBreakdown) {
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

  const playFromThisContext = (contextId: FormattedTranscriptTypes['id']) => {
    const contextSentence = sentenceMapMemoized[contextId];
    if (contextSentence) {
      handleFromHere(contextSentence.time);
    }
  };

  const {
    contentMetaWordMemoized,
    wordsForSelectedTopicMemoized,
    firstWordDueTime,
  } = useWordMetaMemoized({
    selectedContentTitleState,
    wordsState,
    enableWordReviewState,
  });

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
    //   setIsGenericItemsLoadingArrayState((prev) => [...prev, ...sentenceIds]);
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
    //   setIsGenericItemsLoadingArrayState((prev) =>
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

  const handleAddMasterToReview = async () => {
    if (!masterPlayComprehensive) {
      return;
    }

    const sentenceHasReview = masterPlayComprehensive?.reviewData;

    try {
      setIsGenericItemsLoadingArrayState((prev) => [
        ...prev,
        masterPlayComprehensive.id,
      ]);
      await handleReviewFunc({
        sentenceId: masterPlayComprehensive.id,
        isRemoveReview: Boolean(sentenceHasReview),
      });
    } finally {
      setIsGenericItemsLoadingArrayState((prev) =>
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
      setIsGenericItemsLoadingArrayState((prev) => [
        ...prev,
        masterPlayComprehensive.id,
      ]);
      await handleReviewFunc({
        sentenceId: masterPlayComprehensive.id,
        nextDue: nextReviewData,
      });
      setSentenceRepsState(sentenceRepsState + 1);
    } finally {
      setIsGenericItemsLoadingArrayState((prev) =>
        prev.filter((item) => item !== masterPlayComprehensive.id),
      );
    }
  };

  const handleBreakdownSentence = async ({
    sentenceId,
  }: {
    sentenceId: string;
  }) => {
    const targetLangSentence = sentenceMapMemoized[sentenceId].targetLang;
    try {
      setIsBreakingDownSentenceArrState((prev) => [...prev, sentenceId]);
      await breakdownSentence({
        indexKey: selectedContentStateMemoized.id,
        sentenceId,
        targetLang: targetLangSentence,
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

  const topicWordsForReviewMemoized = useTopicWordsForReviewMemoized({
    learnFormattedTranscript,
    isInReviewMode,
    wordsForSelectedTopicMemoized,
  });

  const { overlappingSnippetElements, snippetsWithVocab } =
    useSavedSnippetsMemoized(
      selectedContentStateMemoized?.snippets,
      formattedTranscriptMemoized,
    );

  const { snippetsWithDueStatusMemoized, earliestSnippetDueTime } =
    useSnippetDueMemoized({
      snippetsWithVocab,
      enableSnippetReviewState,
    });

  const firstTime = useMemo(() => {
    if (!isInReviewMode) {
      return null;
    }
    const timeArrays = [
      earliestSnippetDueTime,
      firstWordDueTime,
      firstSentenceDueTime,
    ];

    const validTimes = timeArrays.filter((time) => time !== null) as number[];
    return validTimes.length > 0 ? Math.min(...validTimes) : null;
  }, [
    isInReviewMode,
    earliestSnippetDueTime,
    firstWordDueTime,
    firstSentenceDueTime,
  ]);

  const overlappingTextMemoized = useOverlappingTextMemoized({
    threeSecondLoopState,
    overlappingSnippetDataMemoised,
    loopedTranscriptMemoized,
  });

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
      setIsGenericItemsLoadingArrayState((prev) => [...prev, ...sentenceIds]);
      await sentenceReviewBulk({
        contentId,
        reviewData: nextDueCard,
        contentIndex,
        sentenceIds,
      });
      setSentenceRepsState((prev) => prev + sentenceIds.length);
    } finally {
      setIsGenericItemsLoadingArrayState((prev) =>
        prev.filter((item) => !sentenceIds.includes(item)),
      );
    }
  };

  const { dispatch } = useInputActions({
    handleRewind: handleRewindOrToggleContract,
    handlePausePlay,
    handleJumpNext,
    handleJumpPrev,
    handleJumpCurrent,
    handleLoopThisSentence: handleLoopSentenceCombo,
    handleShiftLoopSentence: handleShiftLoopSentenceForward,
    handleShrinkLoop,
    handleThreeSecondLoop: handleLoopThis3Second,
    handleQuickSaveSnippet,
    handleShiftSnippetLeft,
    handleShiftSnippetRight,
    handleBreakdownSentence: handleBreakdownMasterSentence,
    handleAddMasterToReview,
    handleToggleReviewMode,
  });
  useGamepad(dispatch, threeSecondLoopState, isVideoPlaying);

  const getSentenceFromContextId = (contextId: ContextIdType) => {
    const sentence = sentenceMapMemoized[contextId].targetLang;
    return sentence || '';
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
        isGenericItemsLoadingArrayState,
        setIsGenericItemsLoadingArrayState,
        snippetLoadingState,
        setSnippetLoadingState,
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
        savedSnippetsMemoized: overlappingSnippetElements,
        handleUpdateSnippet,
        contentSnippets: selectedContentStateMemoized?.snippets || [],
        sentenceMapMemoized,
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
        getSentenceFromContextId,
      }}
    >
      {children}
    </LearningScreenContext.Provider>
  );
};
