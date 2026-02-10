import {
  FormattedTranscriptTypes,
  SentenceMapItemTypes,
} from '@/app/types/content-types';
import { isNumber } from '@/utils/is-number';

type MediaControlsParams = {
  ref: React.RefObject<HTMLVideoElement | HTMLAudioElement | null>;
  setCurrentTime: React.Dispatch<React.SetStateAction<number>>;
  setMediaDuration: React.Dispatch<React.SetStateAction<number | null>>;
  masterPlayComprehensive: SentenceMapItemTypes | null;
  mediaDuration: number | null;
  loopTranscriptState: FormattedTranscriptTypes[];
  setLoopTranscriptState: React.Dispatch<
    React.SetStateAction<FormattedTranscriptTypes[]>
  >;
  threeSecondLoopState: number | null;
  setThreeSecondLoopState: React.Dispatch<React.SetStateAction<number | null>>;
  setContractThreeSecondLoopState: React.Dispatch<
    React.SetStateAction<boolean>
  >;
  formattedTranscriptMemoized: FormattedTranscriptTypes[];
};

export const useMediaControls = ({
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
}: MediaControlsParams) => {
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

  const handlePlayFromHere = (time: number) => {
    if (ref.current) {
      ref.current.currentTime = time;
      ref.current.play();
    }
  };

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

  const handlePausePlay = () => {
    if (!ref.current) {
      return;
    }
    if (ref.current.paused) {
      ref.current.play();
    } else {
      ref.current.pause();
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

  const handleJumpNext = () => {
    handleJumpToSentenceViaKeys(1);
  };

  const handleJumpPrev = () => {
    handleJumpToSentenceViaKeys(-1);
  };

  const handleJumpCurrent = () => {
    handleJumpToSentenceViaKeys(0);
  };

  const handleUpdateLoopedSentence = (extendSentenceLoop: boolean) => {
    if (extendSentenceLoop) {
      const lastSentenceId =
        loopTranscriptState[loopTranscriptState.length - 1]?.id;
      if (!lastSentenceId) {
        return;
      }
      const lastSentenceIdIndex = formattedTranscriptMemoized.findIndex(
        (item) => item.id === lastSentenceId,
      );

      const thisItemData = formattedTranscriptMemoized[lastSentenceIdIndex + 1];

      setLoopTranscriptState((prev) => [...prev, thisItemData]);
    } else {
      setLoopTranscriptState((prev) => prev.slice(0, -1));
    }
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

  const handleLoopSentenceCombo = () => {
    // If loop already exists, extend it. Otherwise create new loop
    if (loopTranscriptState && loopTranscriptState.length > 0) {
      handleUpdateLoopedSentence(true);
    } else {
      handleLoopThisSentence();
    }
  };

  const handleShiftLoopSentenceForward = () => {
    handleShiftLoopSentence(true);
  };

  const handleShrinkLoop = () => {
    handleUpdateLoopedSentence(false);
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

  const handleRewindOrToggleContract = () => {
    if (threeSecondLoopState) {
      // When in 3-second loop mode, toggle contract state
      setContractThreeSecondLoopState((prev) => !prev);
    } else {
      // Normal rewind
      handleRewind();
    }
  };

  const handleShiftSnippetLeft = () => {
    if (isNumber(threeSecondLoopState) && threeSecondLoopState > 0) {
      const newCurrentNumber = threeSecondLoopState - 0.5;
      setThreeSecondLoopState(newCurrentNumber);
    }
  };

  const handleShiftSnippetRight = () => {
    if (isNumber(threeSecondLoopState) && threeSecondLoopState > 0) {
      const newCurrentNumber = threeSecondLoopState + 0.5;
      setThreeSecondLoopState(newCurrentNumber);
    }
  };

  return {
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
  };
};
