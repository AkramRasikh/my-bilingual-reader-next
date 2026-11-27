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
import {
  HandleDeleteWordDataProviderCallTypes,
  HandleSaveWordCallTypes,
  UpdateWordDataProviderCallTypes,
} from '../Providers/FetchDataProvider';
import { WordTypes } from '../types/word-types';
import { isTrimmedLang, LanguageEnum } from '../languages';
import { playbackCaptionBreakdownToggle } from './playbackCaptionBreakdown';
import useManageThreeSecondLoopMemo from './hooks/useManageThreeSecondLoopMemo';
import { getSecondsLoopedTranscriptData } from './utils/get-seconds-looped-transcript-data';
import { useSecondsStateMemoized } from './hooks/useSecondsStateMemoized';
import { useTranscriptMetaMemoized } from './hooks/useTranscriptMetaMemoized';
import { useWordMetaMemoized } from './hooks/useWordMetaMemoized';
import { useTopicWordsForReviewMemoized } from './hooks/useTopicWordsForReviewMemoized';
import { useSnippetDueMemoized } from './hooks/useSnippetDueMemoized';
import { useLoopedTranscriptMemoized } from './hooks/useLoopedTranscriptMemoized';
import useComprehensiveReviewModeData from './hooks/useComprehensiveReviewModeData';
import {
  getOverlappingText,
  useOverlappingTextMemoized,
} from './hooks/useOverlappingTextMemoized';
import { useMediaControls } from './hooks/useMediaControls';
import {
  ContentTypes,
  FormattedTranscriptTypes,
  SentenceMapItemTypes,
  Snippet,
  Vocab,
} from '../types/content-types';
import { getUniqueSegmentOfArray } from './utils/get-unique-segment-of-array';
import { getLoopTranscriptSegment as getLoopTranscriptSegmentFromTimes } from './utils/get-loop-transcript-segment';
import { OverlappingSnippetData, ReviewDataTypes } from '../types/shared-types';
import { useGamepad } from './experimental/useGamePad';
import { useInputActions } from './experimental/useInputActions';
import { useCountUpTimer } from '@/components/custom/CountUpTimer/useCountUpTimer';
import { getSnippetTimeRange } from './learning-screen-review-time-range';
import { getAutoBreakdownSentenceIds } from './utils/get-sentence-snippet-coverage';
import {
  isSentenceSnippet,
  withoutSentenceSnippets,
} from './sentence-snippets/sentence-snippet-utils';
import {
  RangeLoopState,
  SentenceSnippetsApi,
  useSentenceSnippets,
} from './sentence-snippets/useSentenceSnippets';
import { filterWordsForCustomSnippetReview } from './hooks/useComprehensiveReviewModeData';

type LearningScreenProviderProps = React.PropsWithChildren<{
  selectedContentStateMemoized: ContentTypes & { contentIndex: number };
}>;

type OverlappingTextTypes = {
  targetLang: string;
  baseLang: string;
  suggestedFocusText: string;
  focusedText?: string;
  suggestedFocusStartIndex?: number;
  isSnippetReview?: boolean;
  vocab?: Vocab[];
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
type FirstWordInReviewDisplay = Pick<
  WordTypes,
  'definition' | 'surfaceForm' | 'baseForm' | 'phonetic' | 'transliteration'
> & {
  contextId?: string;
};

export interface LearningScreenContextTypes {
  getSentenceFromContextId: (contextId: ContextIdType) => string;
  handlePlayFromHere: (time: number) => void;
  handleTimeUpdate: () => void;
  handleLoadedMetadata: () => void;
  handleLoopReviewMode: (params: {
    time: number;
    isContracted?: boolean;
    snippetId?: string;
  }) => void;
  isSavedLoopPlayingState: string | null;
  setIsSavedLoopPlayingState: React.Dispatch<
    React.SetStateAction<string | null>
  >;
  firstTimeState: number | null;
  setFirstTimeState: React.Dispatch<React.SetStateAction<number | null>>;
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
  autoSentenceBreakdownEnabled: boolean;
  setAutoSentenceBreakdownEnabled: React.Dispatch<
    React.SetStateAction<boolean>
  >;
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
  showPlaybackCaptionsState: boolean;
  setShowPlaybackCaptionsState: React.Dispatch<
    React.SetStateAction<boolean>
  >;
  showWordHintsState: boolean;
  setShowWordHintsState: React.Dispatch<React.SetStateAction<boolean>>;
  playbackCaptionBreakdownId: string | null;
  isSlowAudioState: boolean;
  isHoldSlowerAudioState: boolean;
  handleToggleSlowAudio: () => void;
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
  handleReviewFunc: (params: HandleReviewFuncParams) => Promise<void>;
  handleBreakdownSentence: (
    params: HandleBreakdownSentenceParams,
  ) => Promise<void>;
  isBreakingDownSentenceArrState: SentenceMapItemTypes['id'][];
  transcriptRef: React.RefObject<HTMLElement | null>;
  scrollToElState: string;
  selectedContentTitleState: string;
  wordsForSelectedTopic: WordTypes[];
  selectedContentState: ContentTypes & { contentIndex: number };
  sentenceRepsState: number;
  wordRepsState: number;
  elapsed: number;
  setElapsed: React.Dispatch<React.SetStateAction<number>>;
  countUpTimerIsRunning: boolean;
  onCountUpTimerPress: () => void;
  playFromThisContext: (contextId: FormattedTranscriptTypes['id']) => void;
  setSentenceRepsState: React.Dispatch<React.SetStateAction<number>>;
  setWordRepsState: React.Dispatch<React.SetStateAction<number>>;
  setSnippetRepsState: React.Dispatch<React.SetStateAction<number>>;
  snippetRepsState: number;
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
    snippetIdOrData: string | Snippet,
    wordsFromSentence?: WordTypes[],
  ) => Promise<void>;
  contentSnippets: Snippet[];
  sentenceMapMemoized: Record<string, SentenceMapItemTypes>;
  handleQuickSaveSnippet: (isContracted?: boolean) => Promise<void | null>;
  handleUpdateSnippet: (params: {
    snippetData: Snippet;
    isRemoveReview?: boolean;
    isSnippetReview?: boolean;
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
  postWordsMemoized: WordTypes[];
  postSnippetsMemoized: Snippet[];
  postSentencesMemoized: FormattedTranscriptTypes[];
  slicedTranscriptArray: FormattedTranscriptTypes[];
  firstElIdInReview: string | undefined;
  firstWordDefinitionInReview: string | null;
  firstWordInReviewDisplay: FirstWordInReviewDisplay | null;
  snippetsWithDueStatusMemoized: Snippet[];
  handleSaveWord: (params: HandleSaveWordCallTypes) => Promise<unknown>;
  handleDeleteWordDataProvider: (
    params: HandleDeleteWordDataProviderCallTypes,
  ) => Promise<boolean | void>;
  updateWordDataProvider: (
    params: UpdateWordDataProviderCallTypes,
  ) => Promise<unknown>;
  languageSelectedState: LanguageEnum;
  /** Custom sentence snippets (YouTube): clips, focus and handlers. */
  sentenceSnippets: SentenceSnippetsApi;
  /** This content's sentence snippet records (origin: 'sentence'). */
  sentenceSnippetRecords: Snippet[];
  /** The clip range loop; separate from threeSecondLoopState. */
  rangeLoopState: RangeLoopState | null;
  onlyCustomSnippetWordsState: boolean;
  /** Sets the filter and restarts the review window (as the extension does). */
  setOnlyCustomSnippetWordsState: (value: boolean) => void;
  /** Words due in the review window before the custom-snippet filter. */
  postWordsUnfilteredCount: number;
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
  const [autoSentenceBreakdownEnabled, setAutoSentenceBreakdownEnabled] =
    useState(true);
  const [onlyShowEngState, setOnlyShowEngState] = useState(false);
  const [showWordsBasketState, setShowWordsBasketState] = useState(false);
  const [trackCurrentState, setTrackCurrentState] = useState(true);
  const [playbackCaptionsEnabled, setShowPlaybackCaptionsState] =
    useState(true);
  const showPlaybackCaptionsState = playbackCaptionsEnabled && !isInReviewMode;
  const [showWordHintsState, setShowWordHintsState] = useState(true);
  const [playbackCaptionBreakdownId, setPlaybackCaptionBreakdownId] = useState<
    string | null
  >(null);
  const initialSentenceCount = useRef<number | null>(null);

  const [scrollToElState, setScrollToElState] = useState('');
  const [sentenceRepsState, setSentenceRepsState] = useState(0);
  const [wordRepsState, setWordRepsState] = useState(0);
  const [snippetRepsState, setSnippetRepsState] = useState(0);

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
  const [isSavedLoopPlayingState, setIsSavedLoopPlayingState] = useState<
    string | null
  >(null);
  const lastSavedLoopTimeRef = useRef<number | null>(null);
  const lastSavedLoopContractedRef = useRef(false);
  const lastSavedLoopSnippetIdRef = useRef<string | null>(null);

  const [elapsed, setElapsed] = useState(0);
  const { isRunning: countUpTimerIsRunning, onTimerPress: onCountUpTimerPress } =
    useCountUpTimer(elapsed, setElapsed);
  const [errorVideoState, setErrorVideoState] = useState(false);
  const [enableWordReviewState, setEnableWordReviewState] = useState(true);
  const [enableTranscriptReviewState, setEnableTranscriptReviewState] =
    useState(true);
  const [enableSnippetReviewState, setEnableSnippetReviewState] =
    useState(true);
  const [reviewIntervalState, setReviewIntervalState] = useState(60);
  const [mediaDuration, setMediaDuration] = useState<number | null>(null);
  const [firstTimeState, setFirstTimeState] = useState<number | null>(null);
  const [rangeLoopState, setRangeLoopState] = useState<RangeLoopState | null>(
    null,
  );
  // "only words in custom snippets": off by default, not persisted.
  const [onlyCustomSnippetWordsState, setOnlyCustomSnippetWordsState] =
    useState(false);

  const {
    wordsState,
    breakdownSentence,
    sentenceReviewBulk,
    updateSentenceData,
    languageSelectedState,
    handleSaveWord: handleSaveWordFetchData,
    handleDeleteWordDataProvider: handleDeleteWordDataProviderFetchData,
    updateWordDataProvider: updateWordDataProviderFetchData,
    handleSaveSnippetFetchProvider,
    handleDeleteSnippetFetchProvider,
    sentenceDataKeyMapped,
    setToastMessageState,
  } = useFetchData();

  const handleSaveWord = async (params: HandleSaveWordCallTypes) => {
    const response = (await handleSaveWordFetchData(params)) as unknown;
    if (Boolean(response)) {
      setWordRepsState((prev) => prev + 1);
    }
    return response;
  };

  const handleDeleteWordDataProvider = async (
    params: HandleDeleteWordDataProviderCallTypes,
  ) => {
    const response = (await handleDeleteWordDataProviderFetchData(
      params,
    )) as unknown;
    if (Boolean(response)) {
      setWordRepsState((prev) => prev + 1);
    }
    return response as boolean | void;
  };

  const updateWordDataProvider = async (
    params: UpdateWordDataProviderCallTypes,
  ) => {
    const response = (await updateWordDataProviderFetchData(params)) as unknown;
    const isWordData = (params as { isWordData?: boolean }).isWordData;
    if (Boolean(response) && !isWordData) {
      setWordRepsState((prev) => prev + 1);
    }
    return response;
  };

  const selectedContentTitleState = selectedContentStateMemoized.title;
  const selectedContentDescriptionState =
    selectedContentStateMemoized?.description;
  const fallbackYoutubeDescription =
    selectedContentStateMemoized.origin === 'youtube'
      ? `This is a youtube video from ${selectedContentStateMemoized.url}`
      : undefined;
  const content = selectedContentStateMemoized.content;
  const contentIndex = selectedContentStateMemoized.contentIndex;
  const contentId = selectedContentStateMemoized.id;
  const allContentSnippets = selectedContentStateMemoized?.snippets;
  // Custom sentence snippets live in content.snippets but stay out of the
  // existing snippet machinery (due, 3 s drawing, coverage, browse lists).
  const regularSnippets = useMemo(
    () => withoutSentenceSnippets(allContentSnippets),
    [allContentSnippets],
  );
  const sentenceSnippetRecords = useMemo(
    () => (allContentSnippets ?? []).filter(isSentenceSnippet),
    [allContentSnippets],
  );

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

  const handleQuickSaveSnippet = async (isContracted = false) => {
    const contentSnippets = regularSnippets;
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
    const { startTime, endTime } = getSnippetTimeRange({
      time: currentTime,
      isContracted,
    });

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

    const { targetLang, baseLang, suggestedFocusText } = getOverlappingText(
      resultOfThis,
      loopedTranscriptSegment,
      isTrimmedLang(languageSelectedState),
    );

    const finalSnippetObject = {
      id: uuidv4(),
      time: currentTime,
      isContracted,
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
      const saved = await handleSaveSnippetFetchProvider({
        snippetData: finalSnippetObject,
        contentId,
        contentIndex,
      });
      if (saved) {
        await maybeAutoBreakdownSentences(finalSnippetObject);
      }
    } finally {
      setIsGenericItemsLoadingArrayState((prev) =>
        prev.filter((item) => !overlappingIds.includes(item)),
      );
    }
  };

  const handleSaveSnippet = async (snippetArgs: OverlappingTextTypes) => {
    console.log('## snippetArgs handleSaveSnippet', snippetArgs);
    const contentSnippets = regularSnippets;
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

    const {
      vocab: _unusedVocab,
      suggestedFocusStartIndex: _suggestedFocusStartIndex,
      isSnippetReview: _isSnippetReview,
      ...finalSnippetWithoutVocab
    } = snippetArgs;
    const snippetData: Snippet = {
      id: uuidv4(),
      time: threeSecondLoopState,
      isContracted: contractThreeSecondLoopState,
      reviewData,
      ...finalSnippetWithoutVocab,
    };
    const saved = await handleSaveSnippetFetchProvider({
      snippetData,
      contentId,
      contentIndex,
    });
    if (saved) {
      await maybeAutoBreakdownSentences(snippetData);
    }
    if (_isSnippetReview) {
      setSnippetRepsState((prev) => prev + 1);
    }
    setThreeSecondLoopState(null);
    setContractThreeSecondLoopState(false);
  };

  const handleDeleteSnippet = async (
    snippetIdOrData: string | Snippet,
    wordsFromSentence?: WordTypes[],
  ) => {
    const snippetId =
      typeof snippetIdOrData === 'string'
        ? snippetIdOrData
        : snippetIdOrData?.id;
    const snippetData =
      selectedContentStateMemoized?.snippets?.find((s) => s.id === snippetId) ??
      (typeof snippetIdOrData === 'object' ? snippetIdOrData : null);
    const hasWordsInSentence = (wordsFromSentence?.length ?? 0) > 0;

    if (!snippetId || !snippetData) {
      return;
    }

    if (
      !selectedContentStateMemoized?.snippets ||
      selectedContentStateMemoized?.snippets?.length === 0
    ) {
      return;
    }

    setSnippetLoadingState((prev) => [...prev, snippetData.id]);
    try {
      // Sentence snippets have no reviewData: never "re-save without
      // reviewData", just delete.
      if (hasWordsInSentence && !isSentenceSnippet(snippetData)) {
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
    isSnippetReview,
  }: {
    snippetData: Snippet;
    isRemoveReview?: boolean;
    isSnippetReview?: boolean;
  }) => {
    if (isRemoveReview) {
      if (!snippetData.id || !contentId) {
        console.warn('## handleUpdateSnippet delete skipped', {
          snippetId: snippetData.id,
          contentId,
        });
        return;
      }
      await handleDeleteSnippetFetchProvider({
        contentIndex,
        contentId,
        snippetId: snippetData.id,
      });
      if (isSnippetReview) {
        setSnippetRepsState((prev) => prev + 1);
      }
    } else {
      const snippetWithoutVocab = { ...snippetData } as Record<string, unknown>;
      delete snippetWithoutVocab.vocab;
      await handleSaveSnippetFetchProvider({
        snippetData: snippetWithoutVocab as unknown as Snippet,
        contentIndex,
        contentId,
        isUpdate: true,
      });
      if (isSnippetReview) {
        setSnippetRepsState((prev) => prev + 1);
      }
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
    rangeLoopState,
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
    handleForward,
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
    isSlowAudioState,
    isHoldSlowerAudioState,
    handleToggleSlowAudio,
    handleHoldSlowerAudio,
    handleReleaseSlowerAudio,
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

  const handleLoopReviewMode = ({
    time,
    isContracted,
    snippetId,
  }: {
    time: number;
    isContracted?: boolean;
    snippetId?: string;
  }) => {
    const playFromTime = time - (isContracted ? 0.75 : 1.5);
    setThreeSecondLoopState(time);
    const contracted = Boolean(isContracted);
    setContractThreeSecondLoopState(contracted);
    lastSavedLoopTimeRef.current = time;
    lastSavedLoopContractedRef.current = contracted;
    lastSavedLoopSnippetIdRef.current = snippetId || null;
    setIsSavedLoopPlayingState(snippetId || null);
    handlePlayFromHere(playFromTime);
  };

  useEffect(() => {
    if (!isSavedLoopPlayingState) return;

    const isSameAsSaved =
      threeSecondLoopState === lastSavedLoopTimeRef.current &&
      contractThreeSecondLoopState === lastSavedLoopContractedRef.current;

    if (!isSameAsSaved) {
      lastSavedLoopSnippetIdRef.current = null;
      setIsSavedLoopPlayingState(null);
    }
  }, [
    isSavedLoopPlayingState,
    threeSecondLoopState,
    contractThreeSecondLoopState,
  ]);

  const handleToggleReviewMode = () => {
    setIsInReviewMode((prev) => !prev);
  };

  const handleBreakdownMasterSentence = async () => {
    const reviewSentenceOnScreen =
      isInReviewMode && firstElIdInReview
        ? postSentencesMemoized.find((sentence) => sentence.id === firstElIdInReview)
        : undefined;
    const sentenceForBreakdown = reviewSentenceOnScreen
      ? sentenceMapMemoized[reviewSentenceOnScreen.id] ?? masterPlayComprehensive
      : masterPlayComprehensive;
    if (!sentenceForBreakdown) return null;
    const alreadyHasBreakdown = Boolean(sentenceForBreakdown.sentenceStructure);
    const breakdownToggle = playbackCaptionBreakdownToggle(
      playbackCaptionBreakdownId,
      sentenceForBreakdown.id,
      alreadyHasBreakdown,
    );
    if (!breakdownToggle.requestBreakdown) {
      setPlaybackCaptionBreakdownId(breakdownToggle.nextId);
      return null;
    }

    const prevSentence =
      formattedTranscriptMemoized[sentenceForBreakdown.index - 1]
        ?.targetLang;
    const nextSentence =
      formattedTranscriptMemoized[sentenceForBreakdown.index + 1]
        ?.targetLang;

    try {
      setIsBreakingDownSentenceArrState((prev) => [
        ...prev,
        sentenceForBreakdown.id,
      ]);
      await breakdownSentence({
        indexKey: selectedContentStateMemoized.id,
        sentenceId: sentenceForBreakdown.id,
        targetLang: sentenceForBreakdown.targetLang,
        contentIndex,
        prevSentence,
        nextSentence,
        contentDescription:
          selectedContentDescriptionState || fallbackYoutubeDescription,
      });
    } finally {
      setIsBreakingDownSentenceArrState((prev) =>
        prev.filter((item) => item !== sentenceForBreakdown.id),
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

    const { nextScheduledOptions, isScheduledForDeletion } =
      srsCalculationAndText({
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
      if (isScheduledForDeletion) {
        await handleReviewFunc({
          sentenceId: masterPlayComprehensive.id,
          isRemoveReview: true,
        });
        return;
      }
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
    const sentenceData = sentenceMapMemoized[sentenceId];
    if (!sentenceData) {
      return;
    }

    const targetLangSentence = sentenceData.targetLang;
    const prevSentence =
      formattedTranscriptMemoized[sentenceData.index - 1]?.targetLang;
    const nextSentence =
      formattedTranscriptMemoized[sentenceData.index + 1]?.targetLang;

    try {
      setIsBreakingDownSentenceArrState((prev) => [...prev, sentenceId]);
      await breakdownSentence({
        indexKey: selectedContentStateMemoized.id,
        sentenceId,
        targetLang: targetLangSentence,
        prevSentence,
        nextSentence,
        contentDescription:
          selectedContentDescriptionState || fallbackYoutubeDescription,
        contentIndex,
      });
    } finally {
      setIsBreakingDownSentenceArrState((prev) =>
        prev.filter((item) => item !== sentenceId),
      );
    }
  };

  const maybeAutoBreakdownSentences = async (newSnippet: Snippet) => {
    if (!autoSentenceBreakdownEnabled || isInReviewMode) {
      return;
    }

    const existingSnippets = regularSnippets;
    const snippets = existingSnippets.some((item) => item.id === newSnippet.id)
      ? existingSnippets
      : [...existingSnippets, newSnippet];
    const sentenceIds = getAutoBreakdownSentenceIds({
      snippets,
      newSnippet,
      sentenceMap: sentenceMapMemoized,
      mediaDuration,
      getLoopTranscriptSegment,
    });

    await Promise.all(
      sentenceIds.map((sentenceId) => handleBreakdownSentence({ sentenceId })),
    );
  };

  useEffect(() => {
    const seenThisSession = initialSentenceCount.current ?? 0;
    if (sentencesNeedReview > seenThisSession) {
      initialSentenceCount.current = sentencesNeedReview;
    }
  }, [sentencesNeedReview]);

  const learnFormattedTranscript = formattedTranscriptMemoized;

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

  // With "only words in custom snippets" on, the review window must start on
  // an eligible word, not on the earliest due word overall.
  const firstReviewableWordDueTime = useMemo(() => {
    if (!onlyCustomSnippetWordsState) {
      return firstWordDueTime;
    }
    if (!enableWordReviewState) {
      return null;
    }
    const times = filterWordsForCustomSnippetReview(
      contentMetaWordMemoized,
      sentenceSnippetRecords,
      true,
    )
      .map((word) => word.time)
      .filter((time): time is number => isNumber(time));
    return times.length > 0 ? Math.min(...times) : null;
  }, [
    onlyCustomSnippetWordsState,
    firstWordDueTime,
    enableWordReviewState,
    contentMetaWordMemoized,
    sentenceSnippetRecords,
  ]);

  const firstTime = useMemo(() => {
    if (!isInReviewMode) {
      return null;
    }
    const timeArrays = [
      earliestSnippetDueTime,
      firstReviewableWordDueTime,
      firstSentenceDueTime,
    ];

    const validTimes = timeArrays.filter((time) => time !== null) as number[];
    return validTimes.length > 0 ? Math.min(...validTimes) : null;
  }, [
    isInReviewMode,
    earliestSnippetDueTime,
    firstReviewableWordDueTime,
    firstSentenceDueTime,
  ]);

  // Flipping "only words in custom snippets" restarts the review window so it
  // re-anchors on the earliest item that is now eligible.
  const handleSetOnlyCustomSnippetWords = (value: boolean) => {
    setOnlyCustomSnippetWordsState(value);
    setFirstTimeState(null);
  };

  const {
    postWordsMemoized,
    postWordsUnfilteredCount,
    postSnippetsMemoized,
    slicedTranscriptArray,
    postSentencesMemoized,
  } = useComprehensiveReviewModeData({
    enableWordReviewState,
    enableSnippetReviewState,
    enableTranscriptReviewState,
    firstTime,
    firstTimeState,
    setFirstTimeState,
    reviewIntervalState,
    contentMetaWordMemoized,
    snippetsWithDueStatusMemoized,
    formattedTranscriptState: formattedTranscriptMemoized,
    onlyWordsInCustomSnippets: onlyCustomSnippetWordsState,
    sentenceSnippets: sentenceSnippetRecords,
  });

  const firstElIdInReview = [
    ...postSnippetsMemoized,
    ...postWordsMemoized,
    ...postSentencesMemoized,
  ]?.[0]?.id;

  const reviewSentenceId =
    isInReviewMode &&
    firstElIdInReview &&
    postSentencesMemoized.some((sentence) => sentence.id === firstElIdInReview)
      ? firstElIdInReview
      : null;
  const reviewWordId =
    isInReviewMode &&
    firstElIdInReview &&
    postWordsMemoized.some((word) => word.id === firstElIdInReview)
      ? firstElIdInReview
      : null;

  const sentenceSnippets = useSentenceSnippets({
    ref,
    contentId,
    contentOrigin: selectedContentStateMemoized.origin,
    isInReviewMode,
    reviewSentenceId,
    reviewWordId,
    contentSnippets: sentenceSnippetRecords,
    sentenceMap: sentenceMapMemoized,
    secondsState: secondsStateMemoized,
    mediaDuration,
    isTrimmed: isTrimmedLang(languageSelectedState),
    rangeLoopState,
    setRangeLoopState,
    threeSecondLoopState,
    setThreeSecondLoopState,
    loopTranscriptState,
    setLoopTranscriptState,
    saveSnippet: (snippetData, isUpdate) =>
      handleSaveSnippetFetchProvider({
        snippetData,
        contentId,
        contentIndex,
        isUpdate,
      }),
    deleteSnippet: (snippetId) =>
      handleDeleteSnippetFetchProvider({ contentIndex, contentId, snippetId }),
    notify: setToastMessageState,
  });

  const onScreenBreakdownSentenceId =
    isInReviewMode &&
    postSentencesMemoized.some((sentence) => sentence.id === firstElIdInReview)
      ? firstElIdInReview
      : masterPlayComprehensive?.id;

  useEffect(() => {
    setPlaybackCaptionBreakdownId(null);
  }, [onScreenBreakdownSentenceId]);

  const firstWordDefinitionInReview = useMemo(() => {
    if (!firstElIdInReview) {
      return null;
    }
    const firstWord = postWordsMemoized.find((word) => word.id === firstElIdInReview);
    return firstWord?.definition || null;
  }, [firstElIdInReview, postWordsMemoized]);

  const firstWordInReviewDisplay = useMemo(() => {
    if (!firstElIdInReview) {
      return null;
    }
    const firstWord = postWordsMemoized.find((word) => word.id === firstElIdInReview);
    if (!firstWord) {
      return null;
    }
    return {
      definition: firstWord.definition,
      surfaceForm: firstWord.surfaceForm,
      baseForm: firstWord.baseForm,
      phonetic: firstWord.phonetic,
      transliteration: firstWord.transliteration,
      contextId: firstWord.contexts?.[0],
    };
  }, [firstElIdInReview, postWordsMemoized]);

  const overlappingTextMemoized = useOverlappingTextMemoized({
    threeSecondLoopState,
    overlappingSnippetDataMemoised,
    loopedTranscriptMemoized,
    isTrimmed: isTrimmedLang(languageSelectedState),
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
    handleForward,
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
    handleTimerPress: onCountUpTimerPress,
    handleToggleSlowAudio,
    handleHoldSlowerAudio,
    handleReleaseSlowerAudio,
    sentenceSnippets,
  });
  useGamepad(dispatch, threeSecondLoopState, isVideoPlaying, isSlowAudioState, {
    canCreate: sentenceSnippets.canCreate,
    hasClips: sentenceSnippets.clips.length > 0,
    isClipFocused: Boolean(sentenceSnippets.focused),
  });

  const getSentenceFromContextId = (
    contextId: ContextIdType,
    isAdditionalContext?: boolean,
  ) => {
    if (isAdditionalContext) {
      const sentence = sentenceDataKeyMapped[contextId].targetLang;
      return sentence || '';
    }
    const sentence = sentenceMapMemoized[contextId].targetLang;
    return sentence || '';
  };

  return (
    <LearningScreenContext.Provider
      value={{
        handlePlayFromHere,
        handleTimeUpdate,
        handleLoadedMetadata,
        handleLoopReviewMode,
        isSavedLoopPlayingState,
        setIsSavedLoopPlayingState,
        firstTimeState,
        setFirstTimeState,
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
        autoSentenceBreakdownEnabled,
        setAutoSentenceBreakdownEnabled,
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
        showPlaybackCaptionsState,
        setShowPlaybackCaptionsState,
        showWordHintsState,
        setShowWordHintsState,
        playbackCaptionBreakdownId,
        isSlowAudioState,
        isHoldSlowerAudioState,
        handleToggleSlowAudio,
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
        handleReviewFunc,
        handleBreakdownSentence,
        isBreakingDownSentenceArrState,
        transcriptRef,
        scrollToElState,
        selectedContentTitleState,
        wordsForSelectedTopic: wordsForSelectedTopicMemoized,
        selectedContentState: selectedContentStateMemoized,
        sentenceRepsState,
        wordRepsState,
        elapsed,
        setElapsed,
        countUpTimerIsRunning,
        onCountUpTimerPress,
        playFromThisContext,
        setSentenceRepsState,
        setWordRepsState,
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
        contentSnippets: regularSnippets,
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
        postWordsMemoized,
        postSnippetsMemoized,
        postSentencesMemoized,
        slicedTranscriptArray,
        firstElIdInReview,
        firstWordDefinitionInReview,
        firstWordInReviewDisplay,
        snippetsWithDueStatusMemoized,
        handleSaveWord,
        handleDeleteWordDataProvider,
        updateWordDataProvider,
        handleSaveSnippet,
        handleDeleteSnippet,
        handleQuickSaveSnippet,
        overlappedSentencesViableForReviewMemoized,
        handleAddOverlappedSnippetsToReview,
        getSentenceFromContextId,
        setSnippetRepsState,
        snippetRepsState,
        languageSelectedState,
        sentenceSnippets,
        sentenceSnippetRecords,
        rangeLoopState,
        onlyCustomSnippetWordsState,
        setOnlyCustomSnippetWordsState: handleSetOnlyCustomSnippetWords,
        postWordsUnfilteredCount,
      }}
    >
      {children}
    </LearningScreenContext.Provider>
  );
};
