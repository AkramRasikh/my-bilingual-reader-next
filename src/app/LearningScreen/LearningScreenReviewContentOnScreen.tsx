'use client';
// 
import { useEffect, useMemo, useRef, useState } from 'react';
import useLearningScreen from './useLearningScreen';
import { useFetchData } from '@/app/Providers/FetchDataProvider';
import { chinese } from '@/app/languages';
import SnippetReview from '@/components/custom/SnippetReview';
import {
  getButtonMap,
  isGamepadButtonHeld,
} from '@/app/LearningScreen/experimental/gamepadButtonMap';
import {
  getCurrentTimeRangePhase,
  getSentenceTimeRange,
  getTimeRangeProgress,
  type ReviewTimeRangePhase,
} from './learning-screen-review-time-range';
import { PLAYBACK_CAPTION_PLATE_CLASS } from './playbackCaptionSurface';
import ReviewSentenceOverlayText, {
  ColoredPhraseBreakdown,
} from './ReviewSentenceOverlayText';
import { findSavedWordBreakdown, findWordContextSentence, splitSentenceAroundPhrase } from './find-breakdown-pieces-for-phrase';

const WORD_OVERLAY_LINE_CLASS = `mx-auto block w-fit max-w-full px-1.5 py-0.5 leading-tight ${PLAYBACK_CAPTION_PLATE_CLASS}`;

const WORD_SENTENCE_HOLD_MS = 180;

export function reviewWordLinesMatch(details: string, transliteration: string) {
  const normalize = (value: string) => value.trim().replace(/\s+/g, ' ');
  const left = normalize(details);
  const right = normalize(transliteration);
  return left.length > 0 && left === right;
}
const CLOSED_WORD_DEFINITION_LENGTH = 60;

function closedWordDefinition(definition: string) {
  if (definition.length <= CLOSED_WORD_DEFINITION_LENGTH) {
    return definition;
  }
  return `${definition.slice(0, CLOSED_WORD_DEFINITION_LENGTH).trimEnd()}…`;
}

function ReviewOverlayPanel({
  children,
  timeRangePhase = null,
  expanded = false,
  progress = null,
  anchor = 'bottom',
  plain = false,
  liftForCaptions = false,
}: {
  children: React.ReactNode;
  timeRangePhase?: ReviewTimeRangePhase | null;
  expanded?: boolean;
  progress?: number | null;
  anchor?: 'top' | 'bottom';
  plain?: boolean;
  liftForCaptions?: boolean;
}) {
  const textClassName = plain
    ? 'text-sm font-medium leading-tight break-words text-white'
    : 'text-sm font-medium break-words text-white';

  const showProgress = progress != null && Number.isFinite(progress);
  const progressPercent = showProgress
    ? Math.min(100, Math.max(0, progress * 100))
    : 0;

  const containerClassName = expanded
    ? `pointer-events-auto mx-auto max-h-[50%] w-fit max-w-[calc(100%-1rem)] overflow-y-auto px-3 py-1.5 ${PLAYBACK_CAPTION_PLATE_CLASS}`
    : plain
      ? 'pointer-events-auto relative mx-auto w-fit max-w-[66.666%] px-1 py-0.5 text-white'
      : `pointer-events-auto relative mx-auto w-fit max-w-[66.666%] overflow-hidden px-4 py-1.5 ${PLAYBACK_CAPTION_PLATE_CLASS}`;

  return (
    <div
      className={`pointer-events-none absolute inset-0 flex flex-col ${anchor === 'top' ? 'justify-start' : 'justify-end'} ${liftForCaptions && anchor === 'bottom' ? 'pb-28' : ''}`}
    >
      <div
        className={containerClassName}
        data-testid={
          expanded ? 'learning-screen-review-snippet-focus-text' : undefined
        }
      >
        {showProgress && (
          <div
            className={`pointer-events-none absolute inset-x-0 top-0 h-1 ${timeRangePhase === 'beyond' ? 'bg-green-200' : 'bg-amber-200'}`}
            data-testid='learning-screen-review-sentence-progress'
            role='progressbar'
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progressPercent)}
            aria-label='Sentence playback progress'
          >
            <div
              className={`h-full ${timeRangePhase === 'beyond' ? 'bg-green-500' : 'bg-amber-600'}`}
              data-testid='learning-screen-review-sentence-progress-fill'
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}
        {expanded ? (
          children
        ) : (
          <p className={`text-center ${textClassName}`}>{children}</p>
        )}
      </div>
    </div>
  );
}

const LearningScreenReviewContentOnScreen = () => {
  const {
    firstElIdInReview,
    firstWordDefinitionInReview,
    firstWordInReviewDisplay,
    postSnippetsMemoized,
    postSentencesMemoized,
    isSavedLoopPlayingState,
    currentTime,
    ref,
    mediaDuration,
    sentenceMapMemoized,
    threeSecondLoopState,
    isVideoPlaying,
    handleUpdateSnippet,
    isBreakingDownSentenceArrState,
    handleBreakdownSentence,
    getSentenceDataOfOverlappingWordsDuringSave,
    selectedContentTitleState,
    handleSaveWord,
    handleDeleteWordDataProvider,
    setThreeSecondLoopState,
    setContractThreeSecondLoopState,
    handleLoopReviewMode,
    isInReviewMode,
    onlyShowEngState,
    showPlaybackCaptionsState,
  } = useLearningScreen();
  const { languageSelectedState, wordsState } = useFetchData();

  const [showWordDetailsState, setShowWordDetailsState] = useState(false);
  const [showWordSentenceState, setShowWordSentenceState] = useState(false);
  const [liveTime, setLiveTime] = useState(currentTime);
  const quickReviewToggleFiredRef = useRef(false);
  const wordSentenceHoldStartedAtRef = useRef<number | null>(null);
  const showWordDetailsRef = useRef(false);
  showWordDetailsRef.current = showWordDetailsState;

  const playingReviewedSnippet = useMemo(() => {
    if (!isInReviewMode || !isSavedLoopPlayingState) {
      return undefined;
    }
    return postSnippetsMemoized.find(
      (snippet) => snippet.id === isSavedLoopPlayingState,
    );
  }, [isInReviewMode, isSavedLoopPlayingState, postSnippetsMemoized]);

  const firstSentenceInReview = useMemo(
    () => postSentencesMemoized.find((sentence) => sentence.id === firstElIdInReview),
    [postSentencesMemoized, firstElIdInReview],
  );

  const sentenceTargetLang = firstSentenceInReview?.targetLang?.trim() || '';
  const sentenceBaseLang = firstSentenceInReview?.baseLang?.trim() || '';
  const showSentenceEnglish = !onlyShowEngState && sentenceBaseLang.length > 0;

  const isFirstSentenceInReview =
    Boolean(firstSentenceInReview) && sentenceTargetLang.length > 0;
  const showSentenceOverlay =
    isFirstSentenceInReview && !playingReviewedSnippet;

  const sentenceMapEntry = firstElIdInReview
    ? sentenceMapMemoized[firstElIdInReview]
    : undefined;

  useEffect(() => {
    if (!isVideoPlaying || !showSentenceOverlay) return;

    let frame = 0;
    const tick = () => {
      const time = ref.current?.currentTime;
      if (typeof time === 'number' && Number.isFinite(time)) {
        setLiveTime(time);
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [isVideoPlaying, showSentenceOverlay, ref]);

  const sentencePlayhead =
    isVideoPlaying && showSentenceOverlay ? liveTime : currentTime;

  const sentenceTimeRange = useMemo(() => {
    if (!sentenceMapEntry) {
      return null;
    }
    return getSentenceTimeRange(sentenceMapEntry, mediaDuration);
  }, [sentenceMapEntry, mediaDuration]);

  const sentenceTimeRangePhase = useMemo(() => {
    if (!sentenceTimeRange) {
      return null;
    }
    return getCurrentTimeRangePhase(
      sentencePlayhead,
      sentenceTimeRange.startTime,
      sentenceTimeRange.endTime,
    );
  }, [sentenceTimeRange, sentencePlayhead]);

  const sentenceProgress = useMemo(() => {
    if (!sentenceTimeRange) {
      return 0;
    }
    return getTimeRangeProgress(
      sentencePlayhead,
      sentenceTimeRange.startTime,
      sentenceTimeRange.endTime,
    );
  }, [sentenceTimeRange, sentencePlayhead]);

  const phonetic = firstWordInReviewDisplay?.phonetic?.trim() ?? '';
  const transliteration = firstWordInReviewDisplay?.transliteration?.trim() ?? '';
  const surfaceForm = firstWordInReviewDisplay?.surfaceForm?.trim() ?? '';
  const baseForm = firstWordInReviewDisplay?.baseForm?.trim() ?? '';
  const phoneticOnFormsLine =
    phonetic &&
    phonetic.replace(/\s/g, '').toLowerCase() !==
      transliteration.replace(/\s/g, '').toLowerCase()
      ? phonetic
      : '';

  const showWordOverlay = Boolean(firstElIdInReview && firstWordDefinitionInReview);

  const wordPhrasePieces = useMemo(() => {
    const surfaceForm = firstWordInReviewDisplay?.surfaceForm;
    if (!surfaceForm) {
      return null;
    }
    const contextId = firstWordInReviewDisplay?.contextId;
    const contextSentence = contextId
      ? sentenceMapMemoized[contextId]
      : undefined;
    return findSavedWordBreakdown(
      surfaceForm,
      Object.values(sentenceMapMemoized),
      contextSentence,
    );
  }, [firstWordInReviewDisplay, sentenceMapMemoized]);

  const breakdownShowsReading =
    Boolean(wordPhrasePieces) && languageSelectedState === chinese;

  const shownWordForms = new Set<string>();
  if (wordPhrasePieces?.length) {
    shownWordForms.add(wordPhrasePieces.map((piece) => piece.surfaceForm).join(''));
    shownWordForms.add(
      wordPhrasePieces.map((piece) => piece.surfaceForm).join(' '),
    );
  }
  const compactWordDetailsText = [surfaceForm, baseForm, phoneticOnFormsLine]
    .filter((part) => {
      if (!part || shownWordForms.has(part)) {
        return false;
      }
      shownWordForms.add(part);
      return true;
    })
    .join(' - ');
  const transliterationRepeatsDetails = reviewWordLinesMatch(
    compactWordDetailsText,
    transliteration,
  );

  const wordContextSentenceText = useMemo(() => {
    const surface = firstWordInReviewDisplay?.surfaceForm?.trim();
    if (!surface) {
      return null;
    }
    const contextId = firstWordInReviewDisplay?.contextId;
    const contextSentence = contextId
      ? sentenceMapMemoized[contextId]
      : undefined;
    return findWordContextSentence(
      surface,
      Object.values(sentenceMapMemoized),
      contextSentence,
    );
  }, [firstWordInReviewDisplay, sentenceMapMemoized]);

  useEffect(() => {
    setShowWordDetailsState(false);
    showWordDetailsRef.current = false;
    setShowWordSentenceState(false);
    wordSentenceHoldStartedAtRef.current = null;
  }, [firstElIdInReview]);

  useEffect(() => {
    if (!firstWordInReviewDisplay) return;

    let frameId = 0;
    const handleGamepadPress = () => {
      const gamepads = navigator.getGamepads?.();
      let sawGamepad = false;
      let aPressed = false;
      let rPressed = false;

      if (gamepads) {
        for (const gamepad of gamepads) {
          if (!gamepad) continue;
          sawGamepad = true;
          const map = getButtonMap(gamepad);
          aPressed =
            aPressed || isGamepadButtonHeld(gamepad.buttons, map.A_BTN);
          rPressed =
            rPressed || isGamepadButtonHeld(gamepad.buttons, map.R1_BTN);
        }
      }

      if (!sawGamepad) {
        frameId = requestAnimationFrame(handleGamepadPress);
        return;
      }

      if (aPressed && rPressed && !quickReviewToggleFiredRef.current) {
        setShowWordDetailsState((prev) => {
          const next = !prev;
          showWordDetailsRef.current = next;
          return next;
        });
        setShowWordSentenceState(false);
        wordSentenceHoldStartedAtRef.current = null;
        quickReviewToggleFiredRef.current = true;
        frameId = requestAnimationFrame(handleGamepadPress);
        return;
      }

      if (!aPressed || !rPressed) {
        quickReviewToggleFiredRef.current = false;
      }

      if (showWordDetailsRef.current && aPressed) {
        if (wordSentenceHoldStartedAtRef.current == null) {
          wordSentenceHoldStartedAtRef.current = performance.now();
        } else if (
          performance.now() - wordSentenceHoldStartedAtRef.current >=
          WORD_SENTENCE_HOLD_MS
        ) {
          setShowWordSentenceState(true);
        }
      } else if (!aPressed) {
        wordSentenceHoldStartedAtRef.current = null;
      }

      frameId = requestAnimationFrame(handleGamepadPress);
    };

    frameId = requestAnimationFrame(handleGamepadPress);
    return () => cancelAnimationFrame(frameId);
  }, [firstWordInReviewDisplay]);

  if (playingReviewedSnippet) {
    return (
      <ReviewOverlayPanel expanded liftForCaptions={showPlaybackCaptionsState}>
        <SnippetReview
          variant='overlay'
          snippetData={playingReviewedSnippet}
          handleLoopHere={(params) =>
            handleLoopReviewMode({
              ...params,
              snippetId: playingReviewedSnippet.id,
            })
          }
          isVideoPlaying={isVideoPlaying}
          threeSecondLoopState={threeSecondLoopState}
          handleUpdateSnippetComprehensiveReview={async ({
            snippetData,
            isRemoveReview,
            isSnippetReview,
          }) => {
            await handleUpdateSnippet({
              snippetData,
              isRemoveReview,
              isSnippetReview,
            });
            setThreeSecondLoopState(null);
            setContractThreeSecondLoopState(false);
          }}
          isReadyForQuickReview={
            firstElIdInReview === playingReviewedSnippet.id
          }
          handleBreakdownSentence={({ sentenceId }) =>
            handleBreakdownSentence({
              sentenceId,
              targetLang: sentenceMapMemoized[sentenceId]?.targetLang || '',
            })
          }
          isBreakingDownSentenceArrState={isBreakingDownSentenceArrState}
          currentTime={currentTime}
          getSentenceDataOfOverlappingWordsDuringSave={(time, highlightedText) => {
            const out = getSentenceDataOfOverlappingWordsDuringSave(
              time,
              highlightedText,
            );
            return typeof out === 'string' ? out : null;
          }}
          selectedContentTitleState={selectedContentTitleState}
          sentenceMapMemoized={sentenceMapMemoized}
          languageSelectedState={languageSelectedState}
          wordsState={wordsState}
          handleSaveWord={handleSaveWord}
          handleDeleteWordDataProvider={handleDeleteWordDataProvider}
        />
      </ReviewOverlayPanel>
    );
  }

  if (isFirstSentenceInReview) {
    return (
      <ReviewOverlayPanel
        timeRangePhase={sentenceTimeRangePhase}
        progress={sentenceProgress}
        liftForCaptions={showPlaybackCaptionsState}
      >
        <ReviewSentenceOverlayText
          targetLang={sentenceTargetLang}
          baseLang={sentenceBaseLang}
          showEnglish={showSentenceEnglish}
          vocab={firstSentenceInReview?.vocab}
          sentenceStructure={firstSentenceInReview?.sentenceStructure}
          languageSelectedState={languageSelectedState}
        />
      </ReviewOverlayPanel>
    );
  }

  if (!showWordOverlay) {
    return null;
  }

  return (
    <ReviewOverlayPanel anchor='top' plain>
      <span
        data-testid='learning-screen-review-word-text'
        className={WORD_OVERLAY_LINE_CLASS}
      >
        {showWordDetailsState
          ? firstWordDefinitionInReview
          : closedWordDefinition(firstWordDefinitionInReview ?? '')}
      </span>
      {showWordDetailsState && wordPhrasePieces ? (
        <ColoredPhraseBreakdown
          pieces={wordPhrasePieces}
          languageSelectedState={languageSelectedState}
          testId='learning-screen-review-word-breakdown'
          pinyinTestId='learning-screen-review-word-breakdown-pinyin'
          withTopMargin
          chip
        />
      ) : null}
      {showWordDetailsState && compactWordDetailsText ? (
        <span
          data-testid='learning-screen-review-word-details'
          className={`${WORD_OVERLAY_LINE_CLASS} mt-0.5`}
        >
          {compactWordDetailsText}
        </span>
      ) : null}
      {showWordDetailsState &&
      transliteration &&
      !breakdownShowsReading &&
      !transliterationRepeatsDetails ? (
        <span
          data-testid='learning-screen-review-word-transliteration'
          className={`${WORD_OVERLAY_LINE_CLASS} mt-0.5`}
        >
          {transliteration}
        </span>
      ) : null}
      {showWordDetailsState && showWordSentenceState && wordContextSentenceText ? (
        <span
          data-testid='learning-screen-review-word-sentence'
          className={`${WORD_OVERLAY_LINE_CLASS} mt-0.5 text-xs`}
        >
          {splitSentenceAroundPhrase(wordContextSentenceText, surfaceForm).map(
            (part, index) =>
              part.highlighted ? (
                <span
                  key={`${part.text}-${index}`}
                  data-testid='learning-screen-review-word-sentence-mark'
                  className='rounded-sm bg-amber-400 px-0.5 font-semibold'
                >
                  {part.text}
                </span>
              ) : (
                <span key={`${part.text}-${index}`}>{part.text}</span>
              ),
          )}
        </span>
      ) : null}
    </ReviewOverlayPanel>
  );
};

export default LearningScreenReviewContentOnScreen;
