import LoadingSpinner from '@/components/custom/LoadingSpinner';
import ReviewSRSToggles from '@/components/custom/ReviewSRSToggles';
import SnippetReviewChineseAudioControls from './SnippetReviewAudioControls';
import { useEffect, useMemo, useRef, useState } from 'react';
import FormattedSentenceSnippet from '@/components/custom/SnippetReview/SnippetReviewContent';
import HighlightedText from '@/components/custom/HighlightedText';
import {
  findApproxIndexForSnippet,
  highlightSnippetTextApprox,
} from '@/components/custom/TranscriptItem/TranscriptItemLoopingSentence/highlight-snippet-text-approx';
import {
  ContentTranscriptTypes,
  SentenceMapItemTypes,
  Snippet,
} from '@/app/types/content-types';
import useSnippetLoopEvents from '@/components/custom/TranscriptItem/TranscriptItemLoopingSentence/useSnippetLoopEvents';
import getColorByIndex from '@/utils/get-color-by-index';
import SnippetReviewPinyinHelper from './SnippetReviewPinyinHelper';
import SnippetReviewBoundaryToggles from './SnippetReviewBoundaryToggles';
import { isTrimmedLang, LanguageEnum } from '@/app/languages';
import { WordTypes } from '@/app/types/word-types';
import {
  HandleDeleteWordDataProviderCallTypes,
  HandleSaveWordCallTypes,
} from '@/app/Providers/FetchDataProvider';
import SnippetReviewBreakdownDefinitions from './SnippetReviewBreakdownDefinitions';
import { useSnippetReviewDataMemoized } from './useSnippetReviewDataMemoized';
import { getButtonMap } from '@/app/LearningScreen/experimental/gamepadButtonMap';

interface HandleReviewSnippetsFinalArg {
  isRemoveReview?: boolean;
  snippetData: Snippet & Pick<ContentTranscriptTypes, 'vocab'>;
  isSnippetReview?: boolean;
}

interface SnippetReviewProps {
  snippetData: Snippet & Pick<ContentTranscriptTypes, 'vocab'>;
  handleLoopHere: (arg: { time: number; isContracted?: boolean }) => void;
  isVideoPlaying: boolean;
  threeSecondLoopState: number | null;
  handleUpdateSnippetComprehensiveReview: (arg: {
    snippetData: Snippet;
    isRemoveReview?: boolean;
    isSnippetReview?: boolean;
  }) => Promise<void>;
  isReadyForQuickReview: boolean;
  handleBreakdownSentence: (arg: { sentenceId: string }) => Promise<void>;
  isBreakingDownSentenceArrState?: string[];
  currentTime?: number;
  getSentenceDataOfOverlappingWordsDuringSave: (
    time: number,
    highlightedText: string,
  ) => string | null;
  selectedContentTitleState: string;
  sentenceMapMemoized: Record<string, SentenceMapItemTypes>;
  languageSelectedState: LanguageEnum;
  wordsState: WordTypes[];
  handleSaveWord: (params: HandleSaveWordCallTypes) => void;
  handleDeleteWordDataProvider: (
    params: HandleDeleteWordDataProviderCallTypes,
  ) => void;
}

const SnippetReview = ({
  snippetData,
  handleLoopHere,
  isVideoPlaying,
  threeSecondLoopState,
  handleUpdateSnippetComprehensiveReview,
  isReadyForQuickReview,
  handleBreakdownSentence,
  isBreakingDownSentenceArrState,
  currentTime,
  getSentenceDataOfOverlappingWordsDuringSave,
  selectedContentTitleState,
  sentenceMapMemoized,
  languageSelectedState,
  wordsState,
  handleSaveWord,
  handleDeleteWordDataProvider,
}: SnippetReviewProps) => {
  const [startIndexKeyState, setStartIndexKeyState] = useState(0);
  const [endIndexKeyState, setEndIndexKeyState] = useState(0);
  const [lengthAdjustmentState, setLengthAdjustmentState] = useState(0);
  const [wordPopUpState, setWordPopUpState] = useState([]);
  const [isLoadingSaveSnippetState, setIsLoadingSaveSnippetState] =
    useState(false);
  const [highlightedTextState, setHighlightedTextState] = useState('');
  const [isLoadingWordState, setIsLoadingWordState] = useState(false);
  const [matchStartWordState, setMatchStartWordState] = useState<null | number>(
    null,
  );
  const [matchWordsHighlghtedState, setMatchWordsHighlghtedState] = useState<number>(0);
  const [wordIsLoadingGamePadState, setWordIsLoadingGamePadState] = useState<
    null | number
  >(null);
  const thisIsPlaying =
    isVideoPlaying && threeSecondLoopState === snippetData.time;
  const isPreSnippet = snippetData?.isPreSnippet;
  const ulRef = useRef<NodeJS.Timeout | null>(null);
  const vocab = snippetData?.vocab;

  const contractionAmount = snippetData?.isContracted ? 0.75 : 1.5;
  const startTime = snippetData.time - contractionAmount;
  const endTime = snippetData.time + contractionAmount;
  const isChinese = languageSelectedState === LanguageEnum.Chinese;
  const isArabic = languageSelectedState === LanguageEnum.Arabic;
  const snippetText =
    snippetData?.focusedText || snippetData?.suggestedFocusText || '';
  const suggestedFocusStartIndex = findApproxIndexForSnippet(
    snippetData.targetLang,
    snippetText,
  );

  const onMoveLeft = () => {
    const stopUserSpillingOverStartPoint = !(matchStartKey <= 0);
    if (!stopUserSpillingOverStartPoint) return;
    if (!isTrimmedLang(languageSelectedState)) {
      let cursor = matchStartKey - 1;

      while (cursor >= 0 && /\s/.test(snippetData.targetLang[cursor])) {
        cursor -= 1;
      }
      while (cursor >= 0 && !/\s/.test(snippetData.targetLang[cursor])) {
        cursor -= 1;
      }

      const previousWordStart = Math.max(0, cursor + 1);
      const nextStartIndexState = previousWordStart - suggestedFocusStartIndex;
      setStartIndexKeyState(nextStartIndexState);
      setEndIndexKeyState(nextStartIndexState);
      return;
    }
    setStartIndexKeyState(startIndexKeyState - 1);
    setEndIndexKeyState(endIndexKeyState - 1);
  };

  const onMoveRight = () => {
    const stopUserSpillingOverEndPoint = !(
      matchEndKey >=
      snippetData.targetLang.length - 1
    );
    if (!stopUserSpillingOverEndPoint) return;
    if (!isTrimmedLang(languageSelectedState)) {
      let cursor = matchStartKey + 1;

      while (
        cursor < snippetData.targetLang.length &&
        !/\s/.test(snippetData.targetLang[cursor])
      ) {
        cursor += 1;
      }
      while (
        cursor < snippetData.targetLang.length &&
        /\s/.test(snippetData.targetLang[cursor])
      ) {
        cursor += 1;
      }

      const nextWordStart = Math.min(cursor, snippetData.targetLang.length - 1);
      const nextStartIndexState = nextWordStart - suggestedFocusStartIndex;
      setStartIndexKeyState(nextStartIndexState);
      setEndIndexKeyState(nextStartIndexState);
      return;
    }
    setStartIndexKeyState(startIndexKeyState + 1);
    setEndIndexKeyState(endIndexKeyState + 1);
  };

  const onExpandLength = () => {
    const stopUserSpillingOverEndPoint = !(
      matchEndKey >=
      snippetData.targetLang.length - 1
    );
    if (!stopUserSpillingOverEndPoint) return;
    if (!isTrimmedLang(languageSelectedState)) {
      let cursor = matchEndKey;

      // Skip spaces before the next word.
      while (
        cursor < snippetData.targetLang.length &&
        /\s/.test(snippetData.targetLang[cursor])
      ) {
        cursor += 1;
      }
      // Walk right through the next word.
      while (
        cursor < snippetData.targetLang.length &&
        !/\s/.test(snippetData.targetLang[cursor])
      ) {
        cursor += 1;
      }

      const delta = cursor - matchEndKey;
      setLengthAdjustmentState(lengthAdjustmentState + delta);
      return;
    }
    setLengthAdjustmentState(lengthAdjustmentState + 1);
  };

  const onContractLength = () => {
    if (matchEndKey - matchStartKey < 1) return;
    if (!isTrimmedLang(languageSelectedState)) {
      let cursor = matchEndKey - 1;

      // Skip spaces at the current end.
      while (
        cursor >= matchStartKey &&
        /\s/.test(snippetData.targetLang[cursor])
      ) {
        cursor -= 1;
      }
      // Walk left through the previous word.
      while (
        cursor >= matchStartKey &&
        !/\s/.test(snippetData.targetLang[cursor])
      ) {
        cursor -= 1;
      }

      const previousWordStart = Math.max(matchStartKey + 1, cursor + 1);
      const delta = previousWordStart - matchEndKey;
      setLengthAdjustmentState(lengthAdjustmentState + delta);
      return;
    }
    setLengthAdjustmentState(lengthAdjustmentState - 1);
  };

  const onReset = () => {
    setStartIndexKeyState(0);
    setEndIndexKeyState(0);
    setLengthAdjustmentState(0);
  };

  const handlePlaySnippet = () => {
    handleLoopHere({
      time: snippetData.time,
      isContracted: snippetData.isContracted,
    });
  };

  const handleSaveFunc = async (isGoogle, thisWord, thisWordMeaning) => {
    try {
      setIsLoadingWordState(true);
      const belongingSentenceId = getSentenceDataOfOverlappingWordsDuringSave(
        snippetData.time,
        highlightedTextState,
      );
      if (belongingSentenceId) {
        await handleSaveWord({
          highlightedWord: highlightedTextState || thisWord,
          highlightedWordSentenceId: belongingSentenceId,
          contextSentence: snippetData.targetLang, // maybe these two should match?
          meaning: thisWordMeaning,
          isGoogle,
          originalContext: selectedContentTitleState,
          time: sentenceMapMemoized[belongingSentenceId]?.time,
        });
      } else {
        console.log('## no belonding sentence found');
      }
    } finally {
      setHighlightedTextState('');
      setWordPopUpState([]);
      setIsLoadingWordState(false);
    }
  };

  const { textMatch, matchStartKey, matchEndKey } = useMemo(() => {
    return highlightSnippetTextApprox(
      snippetData.targetLang,
      snippetData?.focusedText || snippetData?.suggestedFocusText || '',
      isLoadingSaveSnippetState,
      startIndexKeyState,
      lengthAdjustmentState,
      suggestedFocusStartIndex,
    );
  }, [
    snippetData,
    isLoadingSaveSnippetState,
    startIndexKeyState,
    lengthAdjustmentState,
    suggestedFocusStartIndex,
  ]);

  const hasSnippetText = Boolean(textMatch);

  const handleSaveSnippetFlow = async () => {
    if (!textMatch) {
      return;
    }
    try {
      setIsLoadingSaveSnippetState(true);
      await handleUpdateSnippetComprehensiveReview({
        snippetData: {
          ...snippetData,
          isPreSnippet: false,
          focusedText: textMatch,
        },
      });
      setStartIndexKeyState(0);
      setEndIndexKeyState(0);
      setLengthAdjustmentState(0);
    } finally {
      setIsLoadingSaveSnippetState(false);
    }
  };

  const onUpdateSnippet = async () => {
    await handleSaveSnippetFlow();
  };
  useEffect(() => {
    const handleMouseUp = () => {
      const selection = window.getSelection();
      const selectedText = selection?.toString().trim();

      const anchorNode = selection?.anchorNode;
      if (!anchorNode || !ulRef.current?.contains(anchorNode)) return;

      // setSentenceHighlightingState(contentItem.id);
      setHighlightedTextState(selectedText || '');
    };

    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  useSnippetLoopEvents({
    enabled: isReadyForQuickReview,
    hasSnippetText,
    matchEndKey,
    matchStartKey,
    targetLangLength: snippetData.targetLang.length,
    onAdjustLength: (delta) =>
      delta > 0 ? onExpandLength() : onContractLength(),
    onShiftStart: (delta) => (delta > 0 ? onMoveRight() : onMoveLeft()),
    onSaveSnippet: async () => {
      // console.log('## 🎮 snippet-loop-save SnippetReview');
      await onUpdateSnippet();
    },
  });

  // Function to get the second representation for a given index in the matchKey range
  const getSecondForIndex = (index) => {
    if (
      typeof index !== 'number' ||
      typeof matchStartKey !== 'number' ||
      typeof matchEndKey !== 'number' ||
      typeof startTime !== 'number' ||
      typeof endTime !== 'number'
    ) {
      return null;
    }
    if (index < matchStartKey || index > matchEndKey) return null;
    const totalKeys = matchEndKey - matchStartKey;
    const totalTime = endTime - startTime;
    if (totalKeys === 0) return startTime;
    // Spread time evenly across keys
    const t = (index - matchStartKey) / totalKeys;
    return startTime + t * totalTime;
  };

  const {
    wordsFromSentence,
    wordsInSuggestedText,
    targetLangWithVocabStartIndex,
    sentencesToBreakdown,
  } = useSnippetReviewDataMemoized({
    snippetData,
    wordsState,
    matchStartKey,
    matchEndKey,
    isReadyForQuickReview,
    getSecondForIndex,
  });

  const togglableWordDataArrMemo = useMemo(() => {
    const togglableWordDataArr = [];
    const togglableWordDataStartIndexes = [];
    if (isReadyForQuickReview) {
      targetLangWithVocabStartIndex.forEach((item) => {
        if (
          item?.meaning &&
          item.meaning !== 'n/a' &&
          !togglableWordDataStartIndexes.includes(item.startIndex)
        ) {
          togglableWordDataStartIndexes.push(item.startIndex);
          const endIndex = item.index + item.surfaceForm.length - 1;
          togglableWordDataArr.push({
            ...item,
            endIndex,
          });
        }
      });
    }

    return togglableWordDataArr;
  }, [targetLangWithVocabStartIndex]);

  const selectedWordDataMemo = useMemo(() => {
    if (
      matchStartWordState === null ||
      !Array.isArray(togglableWordDataArrMemo) ||
      togglableWordDataArrMemo.length === 0
    ) {
      return {
        slicedWordData: [],
        concatenatedSurfaceForm: '',
      };
    }

    const rawEndWordIndex = matchStartWordState + (matchWordsHighlghtedState ?? 0);
    const startWordIndex = Math.max(
      0,
      Math.min(matchStartWordState, togglableWordDataArrMemo.length - 1),
    );
    const endWordIndex = Math.max(
      0,
      Math.min(rawEndWordIndex, togglableWordDataArrMemo.length - 1),
    );
    const from = Math.min(startWordIndex, endWordIndex);
    const to = Math.max(startWordIndex, endWordIndex);

    const slicedWordData = togglableWordDataArrMemo.slice(from, to + 1);
    const concatenatedSurfaceForm = slicedWordData
      .map((word) => word?.surfaceForm ?? '')
      .join(isTrimmedLang(languageSelectedState) ? '' : ' ');

    return {
      slicedWordData,
      concatenatedSurfaceForm,
    };
  }, [
    languageSelectedState,
    matchStartWordState,
    matchWordsHighlghtedState,
    togglableWordDataArrMemo,
  ]);

  useEffect(() => {
    if (!isReadyForQuickReview) return;

    const handleSaveGamePad = async () => {
      if (matchStartWordState === null) return;
      const matchingWordData = togglableWordDataArrMemo?.[matchStartWordState];
      if (!matchingWordData) {
        return null;
      }

      const surfaceForm = matchingWordData.surfaceForm;
      const meaning = matchingWordData.meaning;

      if (wordIsLoadingGamePadState === matchingWordData.index) {
        // blocked save due to loading state
        return;
      }
      const isMultiWordSelection = matchWordsHighlghtedState > 0;
      try {
        setWordIsLoadingGamePadState(matchingWordData.index);
        console.log('## handleSaveGamePad args', {
          isGoogle: isMultiWordSelection,
          highlightedWord: isMultiWordSelection
            ? selectedWordDataMemo.concatenatedSurfaceForm
            : surfaceForm,
          meaning: isMultiWordSelection ? undefined : meaning,
        });
        await handleSaveFunc(
          isMultiWordSelection,
          isMultiWordSelection ? selectedWordDataMemo.concatenatedSurfaceForm : surfaceForm,
          isMultiWordSelection ? undefined : meaning,
        );
      } catch {
      } finally {
        setWordIsLoadingGamePadState(null);
      }
    };
    const handleMoveWordBackward = () => {
      if (matchStartWordState === null) return;
      setMatchStartWordState(Math.max(0, matchStartWordState - 1));
    };
    const handleMoveWordForward = () => {
      if (matchStartWordState === null) return;
      setMatchStartWordState(
        Math.min(togglableWordDataArrMemo.length - 1, matchStartWordState + 1),
      );
    };
    const handleDpadHatRightPressed = () => {
      const gamepads = navigator.getGamepads();
      const gamepad = Array.from(gamepads).find((gp) => gp !== null);
      const map = gamepad ? getButtonMap(gamepad) : null;

      if (
        matchStartWordState !== null &&
        map &&
        gamepad?.buttons[map.L2_BTN]?.pressed
      ) {
        const canIncrement = matchStartWordState + 1 <= togglableWordDataArrMemo.length - 1;

        if (canIncrement) {
          setMatchWordsHighlghtedState(matchWordsHighlghtedState + 1);
        }
      } else {
        handleMoveWordForward();
      }
    };
    const handleDpadHatLeftPressed = () => {
      const gamepads = navigator.getGamepads();
      const gamepad = Array.from(gamepads).find((gp) => gp !== null);
      const map = gamepad ? getButtonMap(gamepad) : null;

      if (
        matchStartWordState !== null &&
        map &&
        gamepad?.buttons[map.L2_BTN]?.pressed
      ) {
        const canDecrement = matchWordsHighlghtedState !== 0;

        if (canDecrement) {
          setMatchWordsHighlghtedState(matchWordsHighlghtedState - 1);
        }
      } else {
        handleMoveWordBackward();
      }
    };

    const handleGamepadPress = () => {
      const gamepads = navigator.getGamepads();
      // Find the first connected gamepad
      const gamepad = Array.from(gamepads).find((gp) => gp !== null);

      if (!gamepad) {
        return;
      }

      const map = getButtonMap(gamepad);

      // B without L2 held — avoids overlapping combo behavior with other handlers
      if (
        gamepad.buttons[map.B_BTN]?.pressed &&
        !gamepad.buttons[map.L2_BTN]?.pressed
      ) {
        handlePlaySnippet();
      }
      if (
        gamepad.buttons[map.R1_BTN]?.pressed &&
        matchStartWordState !== null
      ) {
        handleMoveWordForward();
      }

      if (
        gamepad.buttons[map.R2_BTN]?.pressed &&
        matchStartWordState !== null
      ) {
        handleMoveWordBackward();
      }

      if (
        wordIsLoadingGamePadState === null &&
        gamepad.buttons[map.L1_BTN]?.pressed &&
        gamepad.buttons[map.MINUS_BTN]?.pressed
      ) {
        handleSaveGamePad();
        return;
      }
      if (
        wordIsLoadingGamePadState === null &&
        gamepad.buttons[map.DPAD_LEFT_BTN]?.pressed
      ) {
        handleSaveGamePad();
        return;
      }
    };

    window.addEventListener('dpad-hat-left-pressed', handleDpadHatLeftPressed);
    window.addEventListener('dpad-hat-right-pressed', handleDpadHatRightPressed);
    const intervalId = setInterval(handleGamepadPress, 100);

    return () => {
      window.removeEventListener(
        'dpad-hat-left-pressed',
        handleDpadHatLeftPressed,
      );
      window.removeEventListener(
        'dpad-hat-right-pressed',
        handleDpadHatRightPressed,
      );
      clearInterval(intervalId);
    };
  }, [
    matchWordsHighlghtedState,
    wordIsLoadingGamePadState,
    togglableWordDataArrMemo.length,
    matchStartWordState,
    isReadyForQuickReview,
    thisIsPlaying,
    snippetData.time,
    snippetData.isContracted,
  ]);

  useEffect(() => {
    if (matchStartWordState === null && togglableWordDataArrMemo.length > 0) {
      setMatchStartWordState(0);
    }
  }, [togglableWordDataArrMemo.length, matchStartWordState]);

  useEffect(() => {
    setMatchWordsHighlghtedState(0);
  }, [matchStartWordState]);

  const pinyinStart = Math.max(0, matchStartKey - 5);

  const slicedSnippetSegment = targetLangWithVocabStartIndex.slice(
    pinyinStart,
    Math.min(targetLangWithVocabStartIndex.length, matchEndKey + 6),
  );
  const showTransliteration = isChinese || isArabic;

  const handleReviewSnippetsFinal = async (
    arg: HandleReviewSnippetsFinalArg,
  ): Promise<void> => {
    const isRemoveReview = arg?.isRemoveReview;
    await handleUpdateSnippetComprehensiveReview({
      snippetData: arg.snippetData,
      isRemoveReview: isRemoveReview && !(wordsInSuggestedText?.length > 0),
      isSnippetReview: true,
    });
  };

  const indexHasChanged =
    endIndexKeyState !== 0 ||
    startIndexKeyState !== 0 ||
    lengthAdjustmentState !== 0;

  return (
    <div
      className='relative'
      data-testid={`snippet-review-item-${snippetData.id}`}
    >
      {isLoadingSaveSnippetState && (
        <div className='absolute right-1/2 top-3/10'>
          <LoadingSpinner />
        </div>
      )}
      <div className='rounded border py-2 px-1'>
        <div className='flex min-w-0 gap-3'>
          <div className='min-w-0 flex-1'>
            <div className='flex min-w-0 mb-2 gap-1'>
              <SnippetReviewChineseAudioControls
                thisIsPlaying={thisIsPlaying}
                handlePlaySnippet={handlePlaySnippet}
                isPreSnippet={snippetData?.isPreSnippet}
                sentencesToBreakdown={sentencesToBreakdown}
                isBreakingDownSentenceArrState={isBreakingDownSentenceArrState}
                handleBreakdownSentence={handleBreakdownSentence}
              />
              <div className='min-w-0 flex-1 text-center'>
                <div className='min-w-0 max-w-full'>
                  <FormattedSentenceSnippet
                    ref={ulRef}
                    targetLangformatted={targetLangWithVocabStartIndex}
                    wordPopUpState={wordPopUpState}
                    setWordPopUpState={setWordPopUpState}
                    handleDeleteWordDataProvider={handleDeleteWordDataProvider}
                    wordsFromSentence={wordsFromSentence}
                    languageSelectedState={languageSelectedState}
                    matchStartKey={matchStartKey}
                    matchEndKey={matchEndKey}
                    handleSaveFunc={handleSaveFunc}
                    currentTime={currentTime}
                    isReadyForQuickReview={isReadyForQuickReview}
                    matchStartWordState={matchStartWordState}
                    setMatchStartWordState={setMatchStartWordState}
                    togglableWordDataArrMemo={togglableWordDataArrMemo}
                    wordIsLoadingGamePadState={wordIsLoadingGamePadState}
                    matchWordsHighlghtedState={matchWordsHighlghtedState}
                  />
                </div>
                {showTransliteration && (
                  <SnippetReviewPinyinHelper
                    slicedSnippetSegment={slicedSnippetSegment}
                    getColorByIndex={getColorByIndex}
                    matchStartKey={matchStartKey}
                    matchEndKey={matchEndKey}
                    pinyinStart={pinyinStart}
                    languageSelectedState={languageSelectedState}
                    isReadyForQuickReview={isReadyForQuickReview}
                    currentTime={currentTime}
                    togglableWordDataArrMemo={togglableWordDataArrMemo}
                    matchStartWordState={matchStartWordState}
                  />
                )}

                <SnippetReviewBreakdownDefinitions
                  slicedSnippetSegment={slicedSnippetSegment}
                  getColorByIndex={getColorByIndex}
                  matchStartKey={matchStartKey}
                  matchEndKey={matchEndKey}
                  pinyinStart={pinyinStart}
                  vocab={vocab}
                  togglableWordDataArrMemo={togglableWordDataArrMemo}
                  matchStartWordState={matchStartWordState}
                />
                {highlightedTextState && (
                  <HighlightedText
                    isLoadingState={
                      isLoadingWordState || isLoadingSaveSnippetState
                    }
                    handleSaveFunc={handleSaveFunc}
                    highlightedTextState={highlightedTextState}
                  />
                )}
              </div>
            </div>
          </div>
          {isPreSnippet && (
            <div>
              <SnippetReviewBoundaryToggles
                isLoading={isLoadingSaveSnippetState}
                indexHasChanged={indexHasChanged}
                onMoveLeft={onMoveLeft}
                onReset={onReset}
                onMoveRight={onMoveRight}
                onContractLength={onContractLength}
                onExpandLength={onExpandLength}
                onUpdateSnippet={onUpdateSnippet}
              />
            </div>
          )}
        </div>
        <ReviewSRSToggles
          isSnippet
          contentItem={snippetData}
          handleReviewFunc={handleReviewSnippetsFinal}
          isReadyForQuickReview={isReadyForQuickReview}
        />
      </div>
    </div>
  );
};

export default SnippetReview;
