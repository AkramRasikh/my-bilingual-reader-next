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
import { useSavedSnippetsMemoized } from './hooks/useSavedSnippetsMemoized';
import { isDueCheck } from '@/utils/is-due-check';
import { underlineWordsInSentence } from '@/utils/underline-words-in-sentences';
import { findAllInstancesOfWordsInSentence } from '@/utils/find-all-instances-of-words-in-sentences';
import { mapSentenceIdsToSeconds } from './utils/map-sentence-ids-to-seconds';
import { useFetchData } from '../Providers/FetchDataProvider';
import { WordTypes } from '../types/word-types';
import { sliceTranscriptViaPercentageOverlap } from './utils/slice-transcript-via-percentage-overlap';
import { isTrimmedLang } from '../languages';
import useManageThreeSecondLoopMemo from './hooks/useManageThreeSecondLoopMemo';
import { getSecondsLoopedTranscriptData } from './utils/get-seconds-looped-transcript-data';
import {
  FormattedTranscriptTypes,
  SentenceMapItemTypes,
} from '../types/content-types';
import { getUniqueSegmentOfArray } from './utils/get-unique-segment-of-array';

export const LearningScreenContext = createContext(null);

// type time

export const LearningScreenProvider = ({
  selectedContentStateMemoized,
  children,
}: PropsWithChildren<object>) => {
  const ref = useRef<HTMLVideoElement>(null);
  const transcriptRef = useRef(null);
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
  const [studyFromHereTimeState, setStudyFromHereTimeState] = useState(null);
  const [isGenericItemLoadingState, setIsGenericItemLoadingState] = useState(
    [],
  );
  const [isBreakingDownSentenceArrState, setIsBreakingDownSentenceArrState] =
    useState([]);
  const [breakdownSentencesArrState, setBreakdownSentencesArrState] = useState(
    [],
  );

  const [loopTranscriptState, setLoopTranscriptState] = useState([]);
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
    pureWordsMemoized,
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

    const formattedTranscriptMemoized: FormattedTranscriptTypes[] = content.map(
      (item, index) => {
        const hasBeenReviewed = item?.reviewData?.due;
        if (hasBeenReviewed) {
          sentencesPendingOrDue += 1;
        }

        if (isDueCheck(item, now)) {
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

        const isDueNow = new Date(hasBeenReviewed) < now;
        const dueStatus = !hasBeenReviewed ? '' : isDueNow ? 'now' : 'pending';

        const targetLangformatted = underlineWordsInSentence(
          item.targetLang,
          pureWordsMemoized,
        );
        const wordsFromSentence = findAllInstancesOfWordsInSentence(
          item.targetLang,
          wordsState,
        );

        // Check if next item is due
        const nextItem = content[index + 1];
        const nextHasBeenReviewed = nextItem?.reviewData?.due;
        const nextIsDueNow = new Date(nextHasBeenReviewed) < now;
        const nextDueStatus = !nextHasBeenReviewed
          ? ''
          : nextIsDueNow
          ? 'now'
          : 'pending';
        const helperReviewSentence = index > 0 && nextDueStatus === 'now';

        return {
          ...item,
          dueStatus,
          isDue: isDueNow,
          targetLangformatted,
          wordsFromSentence,
          ...(helperReviewSentence && { helperReviewSentence: true }),
        };
      },
    );

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

    // Step 4: Capture latest due info

    return {
      firstDueIndexMemoized,
      formattedTranscriptMemoized,
      sentenceMapMemoized,
      sentencesNeedReview,
      sentencesPendingOrDue,
      firstSentenceDueTime,
    };
  }, [pureWordsMemoized, content, enableTranscriptReviewState, wordsState]);

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
    const masterPlayIndex = masterPlayComprehensive.index;
    setStudyFromHereTimeState(masterPlayIndex);
    if (transcriptRef.current) {
      transcriptRef.current.scrollIntoView();
    }
  };

  const getSentenceDataOfOverlappingWordsDuringSave = (
    thisSnippetsTime,
    highlightedTextFromSnippet,
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
      reviewData: null,
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
    } catch (error) {
      console.log('## handleQuickSaveSnippet error', error);
    } finally {
      setIsGenericItemLoadingState((prev) =>
        prev.filter((item) => !overlappingIds.includes(item)),
      );
    }
  };

  const handleUpdateSnippet = async (snippetToUpdate) => {
    const contentSnippets = selectedContentStateMemoized.snippets;
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

  const handleSaveSnippet = async (snippetArgs) => {
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
      reviewData: null,
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

  const handleDeleteSnippet = async (snippetId, wordsFromSentence) => {
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

  const handleUpdateSnippetReview = async (snippetArgs) => {
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

  const handleJumpToFirstElInReviewTranscript = (isSecondIndex) => {
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
      isVideoModeState: true,
      realStartTime: 0,
    });

    return arrOfSeconds;
  }, [mediaDuration, selectedContentStateMemoized]);

  const getLoopTranscriptSegment = ({ startTime, endTime }) => {
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

  const handleFromHere = (time) => {
    if (!isNumber(time)) {
      return null;
    }

    handlePlayFromHere(time);
  };
  const handlePause = () => ref.current.pause();

  const handleRewind = () =>
    (ref.current.currentTime = ref.current.currentTime - 3);

  const playFromThisContext = (contextId) => {
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

    if (nextTimeToFollow >= 0) {
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

  const handleReviewFunc = async ({ sentenceId, isRemoveReview, nextDue }) => {
    const cardDataRelativeToNow = getEmptyCard();
    const nextScheduledOptions = getNextScheduledOptions({
      card: cardDataRelativeToNow,
      contentType: srsRetentionKeyTypes.sentences,
    });

    try {
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
    } catch (error) {
      console.log('## handleReviewFunc error', error);
    }
  };

  const handleLoopThis3Second = () => {
    if (loopTranscriptState) {
      setLoopTranscriptState(null);
    }
    if (isNumber(threeSecondLoopState)) {
      setThreeSecondLoopState(null);
      return;
    }

    setThreeSecondLoopState(ref.current.currentTime);
    // account for the three seconds on both extremes
  };

  const handleShiftLoopSentence = (shiftForward) => {
    if (shiftForward) {
      setLoopTranscriptState((prev) => prev.slice(1));
    }
  };

  const handleLoopThisSentence = () => {
    if (!masterPlayComprehensive) return null;
    const thisIndex = masterPlayComprehensive.index;

    if (
      loopTranscriptState?.length === 1 &&
      loopTranscriptState[0]?.id === masterPlayComprehensive.id
    ) {
      setLoopTranscriptState(null);
      return;
    }

    setLoopTranscriptState([
      {
        ...masterPlayComprehensive,
        nextTime:
          thisIndex === formattedTranscriptMemoized.length - 1
            ? mediaDuration - 0.05
            : thisIndex === 0
            ? 0
            : formattedTranscriptMemoized[thisIndex - 1].time,
      },
    ]);
  };

  const handleUpdateLoopedSentence = (extendSentenceLoop) => {
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
    } catch (error) {
      console.log('## handleBreakdownMasterSentence error', error);
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
        nextDue: null,
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
    } catch (error) {
      console.log('## handleIsEasyReviewShortCut', error);
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

  const sentencesForReviewMemoized = useMemo(() => {
    if (!isInReviewMode || wordsForSelectedTopicMemoized?.length === 0) {
      return [];
    }

    const sentenceIdsForReview = [];

    learnFormattedTranscript.forEach((transcriptEl) => {
      if (transcriptEl.dueStatus === 'now') {
        sentenceIdsForReview.push(transcriptEl.id);
      }
    });

    if (sentenceIdsForReview.length === 0) {
      return [];
    }
    const now = new Date();
    const sentencesForReviewMemoized = [];
    wordsForSelectedTopicMemoized.forEach((wordItem) => {
      const firstContext = wordItem.contexts[0];

      if (
        sentenceIdsForReview.includes(firstContext) &&
        isDueCheck(wordItem, now)
      ) {
        sentencesForReviewMemoized.push({
          ...wordItem,
          time: learnFormattedTranscript.find(
            (item) => item.id === firstContext,
          ).time,
        });
      }
    });

    return sentencesForReviewMemoized;
  }, [learnFormattedTranscript, isInReviewMode, wordsForSelectedTopicMemoized]);

  const groupedByContextBySentence = useMemo(() => {
    if (!isInReviewMode || wordsForSelectedTopicMemoized?.length === 0) {
      return [];
    }

    return sentencesForReviewMemoized.reduce((acc, obj) => {
      const key = obj.contexts[0];
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(obj);
      return acc;
    }, {});
  }, [sentencesForReviewMemoized]);

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

      const snippetsWithDueStatusMemoized = [];
      selectedContentStateMemoized?.snippets?.forEach((item) => {
        if (new Date(item?.reviewData?.due) < now) {
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
    // Combine potential candidates from both arrays, normalized to a common structure
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

  const overlappingTextMemoized = useMemo(() => {
    if (
      !threeSecondLoopState ||
      !overlappingSnippetDataMemoised ||
      overlappingSnippetDataMemoised.length === 0
    ) {
      return;
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

  function accumulateSentenceOverlap(snippetsBySentence) {
    const sentenceMap = {};

    for (const snip of snippetsBySentence) {
      const { id, percentageOverlap, startPoint } = snip;

      const start = Math.max(0, startPoint);
      const end = Math.min(100, startPoint + percentageOverlap);

      if (!sentenceMap[id]) sentenceMap[id] = [];
      sentenceMap[id].push([start, end]);
    }

    // Merge intervals for each sentence
    const results = {};

    for (const [sentenceId, intervals] of Object.entries(sentenceMap)) {
      // Sort by start position
      intervals.sort((a, b) => a[0] - b[0]);

      const merged = [];
      let [currStart, currEnd] = intervals[0];

      for (let i = 1; i < intervals.length; i++) {
        const [nextStart, nextEnd] = intervals[i];

        if (nextStart <= currEnd) {
          // Overlapping → extend
          currEnd = Math.max(currEnd, nextEnd);
        } else {
          // No overlap → push previous
          merged.push([currStart, currEnd]);
          [currStart, currEnd] = [nextStart, nextEnd];
        }
      }
      merged.push([currStart, currEnd]);

      // Total coverage
      const total = merged.reduce((sum, [s, e]) => sum + (e - s), 0);

      if (total > 50) {
        results[sentenceId] = {
          mergedRanges: merged,
          totalOverlap: total, // in %
        };
      }
    }

    return results;
  }

  const overlappedSentencesViableForReviewMemoized = useMemo(() => {
    const contentSnippets = selectedContentStateMemoized?.snippets;
    if (!contentSnippets || contentSnippets?.length === 0) {
      return null;
    }

    const allSentenceIntervals = [];

    contentSnippets.forEach((snippetEl) => {
      const snippetTime = snippetEl.time;
      const snippetIsContracted = snippetEl.isContracted;

      const snippetStartTime = snippetTime - (snippetIsContracted ? 0.75 : 1.5);
      const snippetEndTime = snippetTime + (snippetIsContracted ? 0.75 : 1.5);
      const overlappingSentenceData = getSecondsLoopedTranscriptData({
        formattedTranscriptState: getLoopTranscriptSegment({
          startTime: snippetStartTime,
          endTime: snippetEndTime,
        }),
        loopStartTime: snippetStartTime,
        loopEndTime: snippetEndTime,
        mediaDuration,
      });

      if (!overlappingSentenceData) {
        return;
      }
      overlappingSentenceData.forEach((item) => {
        const sentenceIsUpForReview =
          sentenceMapMemoized[item.id].isUpForReview;
        if (!sentenceIsUpForReview) {
          allSentenceIntervals.push(item);
        }
      });
    });

    if (allSentenceIntervals.length === 0) {
      return null;
    }

    const allOverlappingDataReviewEligible =
      accumulateSentenceOverlap(allSentenceIntervals);

    return {
      keyMap: allOverlappingDataReviewEligible,
      keyArray: Object.keys(allOverlappingDataReviewEligible),
    };
  }, [
    selectedContentStateMemoized,
    sentenceMapMemoized,
    formattedTranscriptMemoized,
    mediaDuration,
  ]);

  const handleAddOverlappedSnippetsToReview = async () => {
    const emptyCard = getEmptyCard();

    const nextScheduledOptions = getNextScheduledOptions({
      card: emptyCard,
      contentType: srsRetentionKeyTypes.sentences,
    });

    const nextDueCard = nextScheduledOptions['2'].card;

    if (
      !overlappedSentencesViableForReviewMemoized?.keyArray ||
      overlappedSentencesViableForReviewMemoized?.keyArray?.length === 0
    ) {
      return null;
    }

    const sentenceIds = overlappedSentencesViableForReviewMemoized.keyArray;
    try {
      setIsGenericItemLoadingState((prev) => [...prev, ...sentenceIds]);
      await sentenceReviewBulk({
        contentId,
        reviewData: nextDueCard,
        contentIndex,
        sentenceIds: overlappedSentencesViableForReviewMemoized.keyArray,
      });
      setSentenceRepsState((prev) => prev + sentenceIds.length);
    } catch (error) {
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
        overlappingSnippetDataState: overlappingSnippetDataMemoised,
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
        groupedByContextBySentence,
        sentencesForReviewMemoized,
        firstTime,
        handleSaveSnippet,
        overlappingTextMemoized,
        savedSnippetsMemoized,
        handleUpdateSnippetReview,
        handleDeleteSnippet,
        contentSnippets: selectedContentStateMemoized?.snippets || [],
        sentenceMapMemoized,
        handleQuickSaveSnippet,
        handleUpdateSnippet,
        getSentenceDataOfOverlappingWordsDuringSave,
        overlappedSentencesViableForReviewMemoized,
        handleAddOverlappedSnippetsToReview,
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
      }}
    >
      {children}
    </LearningScreenContext.Provider>
  );
};
