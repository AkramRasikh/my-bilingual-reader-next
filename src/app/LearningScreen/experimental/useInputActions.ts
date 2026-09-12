import { useCallback, useRef } from 'react';

export type InputAction =
  | 'REWIND'
  | 'FORWARD'
  | 'PAUSE_PLAY'
  | 'JUMP_NEXT'
  | 'JUMP_PREV'
  | 'JUMP_CURRENT'
  | 'LOOP_SENTENCE'
  | 'SLICE_LOOP'
  | 'SHRINK_LOOP'
  | 'THREE_SECOND_LOOP'
  | 'QUICK_SAVE_SNIPPET'
  | 'SHIFT_SNIPPET_LEFT'
  | 'SHIFT_SNIPPET_RIGHT'
  | 'BREAKDOWN_SENTENCE'
  | 'ADD_MASTER_TO_REVIEW'
  | 'TOGGLE_REVIEW_MODE'
  | 'TIMER_PRESS'
  | 'TOGGLE_SLOW_AUDIO'
  | 'HOLD_SLOWER_AUDIO'
  | 'RELEASE_SLOWER_AUDIO';

interface InputHandlers {
  handleRewind: () => void;
  handleForward: () => void;
  handlePausePlay: () => void;
  handleJumpNext: () => void;
  handleJumpPrev: () => void;
  handleJumpCurrent: () => void;
  handleLoopThisSentence: () => void;
  handleShiftLoopSentence: () => void;
  handleShrinkLoop: () => void;
  handleThreeSecondLoop: () => void;
  handleQuickSaveSnippet: () => Promise<void | null>;
  handleShiftSnippetLeft: () => void;
  handleShiftSnippetRight: () => void;
  handleBreakdownSentence: () => Promise<void | null>;
  handleAddMasterToReview: () => Promise<void>;
  handleToggleReviewMode: () => void;
  handleTimerPress: () => void;
  handleToggleSlowAudio: () => void;
  handleHoldSlowerAudio: () => void;
  handleReleaseSlowerAudio: () => void;
}

export const useInputActions = (handlers: InputHandlers) => {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  const dispatch = useCallback((action: InputAction) => {
    const currentHandlers = handlersRef.current;
    console.log('## Input action dispatched:', action);
    switch (action) {
      case 'REWIND':
        currentHandlers.handleRewind();
        break;
      case 'FORWARD':
        currentHandlers.handleForward();
        break;
      case 'PAUSE_PLAY':
        currentHandlers.handlePausePlay();
        break;
      case 'JUMP_NEXT':
        currentHandlers.handleJumpNext();
        break;
      case 'JUMP_PREV':
        currentHandlers.handleJumpPrev();
        break;
      case 'JUMP_CURRENT':
        currentHandlers.handleJumpCurrent();
        break;
      case 'LOOP_SENTENCE':
        currentHandlers.handleLoopThisSentence();
        break;
      case 'SLICE_LOOP':
        currentHandlers.handleShiftLoopSentence();
        break;
      case 'SHRINK_LOOP':
        currentHandlers.handleShrinkLoop();
        break;
      case 'THREE_SECOND_LOOP':
        currentHandlers.handleThreeSecondLoop();
        break;
      case 'QUICK_SAVE_SNIPPET':
        currentHandlers.handleQuickSaveSnippet();
        break;
      case 'SHIFT_SNIPPET_LEFT':
        currentHandlers.handleShiftSnippetLeft();
        break;
      case 'SHIFT_SNIPPET_RIGHT':
        currentHandlers.handleShiftSnippetRight();
        break;
      case 'BREAKDOWN_SENTENCE':
        currentHandlers.handleBreakdownSentence();
        break;
      case 'ADD_MASTER_TO_REVIEW':
        currentHandlers.handleAddMasterToReview();
        break;
      case 'TOGGLE_REVIEW_MODE':
        currentHandlers.handleToggleReviewMode();
        break;
      case 'TIMER_PRESS':
        currentHandlers.handleTimerPress();
        break;
      case 'TOGGLE_SLOW_AUDIO':
        currentHandlers.handleToggleSlowAudio();
        break;
      case 'HOLD_SLOWER_AUDIO':
        currentHandlers.handleHoldSlowerAudio();
        break;
      case 'RELEASE_SLOWER_AUDIO':
        currentHandlers.handleReleaseSlowerAudio();
        break;
    }
  }, []);
  return { dispatch };
};
