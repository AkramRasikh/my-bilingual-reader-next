/**
 * Shared state between the learning screen's sentence-snippet clip loop and
 * the separate gamepad pollers (WordCard, TranscriptItemActionBar,
 * LearningScreenClosedPanelReviewActions, useGamePadSRSShortcut). Those
 * pollers read the pad on their own timers, so they need a synchronous way
 * to know that B or L2+R2 belongs to the clip right now.
 */
type BridgeState = {
  clipLoopActive: boolean;
  /** B went down while a clip loop ran; ignore B until it is released. */
  bConsumed: boolean;
  deleteFocusedClip: (() => void) | null;
};

const state: BridgeState = {
  clipLoopActive: false,
  bConsumed: false,
  deleteFocusedClip: null,
};

export const sentenceSnippetGamepadBridge = {
  setClipLoopActive(active: boolean) {
    state.clipLoopActive = active;
  },
  isClipLoopActive() {
    return state.clipLoopActive;
  },
  consumeB() {
    state.bConsumed = true;
  },
  releaseB() {
    state.bConsumed = false;
  },
  /** B pollers call this: true means B is the clip's and must be ignored. */
  shouldIgnoreB() {
    return state.clipLoopActive || state.bConsumed;
  },
  setDeleteHandler(handler: (() => void) | null) {
    state.deleteFocusedClip = handler;
  },
  /**
   * L2+R2: delete the focused clip if there is one. Returns true when the
   * press was used by a clip, so the caller must not remove the sentence.
   */
  deleteFocusedClip() {
    if (!state.clipLoopActive || !state.deleteFocusedClip) return false;
    state.deleteFocusedClip();
    return true;
  },
  /** Test helper. */
  reset() {
    state.clipLoopActive = false;
    state.bConsumed = false;
    state.deleteFocusedClip = null;
  },
};
