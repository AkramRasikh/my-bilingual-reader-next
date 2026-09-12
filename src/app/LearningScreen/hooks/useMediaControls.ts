import { useEffect, useState } from 'react';
import {
  FormattedTranscriptTypes,
  SentenceMapItemTypes,
} from '@/app/types/content-types';
import { isNumber } from '@/utils/is-number';

const SLOW_PLAYBACK_RATE = 0.75;
const HOLD_SLOWER_PLAYBACK_RATE = 0.5;
const NORMAL_PLAYBACK_RATE = 1;

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
  const [isSlowAudioState, setIsSlowAudioState] = useState(false);
  const [isHoldSlowerAudioState, setIsHoldSlowerAudioState] = useState(false);

  const getPlaybackRate = (isSlow: boolean, isHoldSlower: boolean) => {
    if (!isSlow) {
      return NORMAL_PLAYBACK_RATE;
    }
    return isHoldSlower ? HOLD_SLOWER_PLAYBACK_RATE : SLOW_PLAYBACK_RATE;
  };

  const applyPlaybackRate = (isSlow: boolean, isHoldSlower: boolean) => {
    if (ref.current) {
      ref.current.playbackRate = getPlaybackRate(isSlow, isHoldSlower);
    }
  };

  useEffect(() => {
    applyPlaybackRate(isSlowAudioState, isHoldSlowerAudioState);
  }, [isSlowAudioState, isHoldSlowerAudioState, ref]);

  const handleToggleSlowAudio = () => {
    setIsSlowAudioState((prev) => !prev);
    setIsHoldSlowerAudioState(false);
  };

  const handleHoldSlowerAudio = () => {
    if (!isSlowAudioState) {
      return;
    }
    setIsHoldSlowerAudioState(true);
  };

  const handleReleaseSlowerAudio = () => {
    setIsHoldSlowerAudioState(false);
  };

  const handleTimeUpdate = () => {
    if (ref.current) {
      setCurrentTime(ref.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (ref.current) {
      applyPlaybackRate(isSlowAudioState, isHoldSlowerAudioState);
      if (ref.current.duration) {
        setMediaDuration(ref.current.duration);
      }
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

  const handleForward = () => {
    if (!ref.current) {
      return;
    }
    const el = ref.current;
    const next = el.currentTime + 3;
    const duration = el.duration;
    if (Number.isFinite(duration) && duration > 0) {
      el.currentTime = Math.min(next, duration);
    } else {
      el.currentTime = next;
    }
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
    handleToggleSlowAudio,
    handleHoldSlowerAudio,
    handleReleaseSlowerAudio,
  };
};
