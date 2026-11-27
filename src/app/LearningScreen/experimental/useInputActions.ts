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
  | 'QUICK_SAVE_CONTRACTED_SNIPPET'
  | 'SHIFT_SNIPPET_LEFT'
  | 'SHIFT_SNIPPET_RIGHT'
  | 'BREAKDOWN_SENTENCE'
  | 'ADD_MASTER_TO_REVIEW'
  | 'TOGGLE_REVIEW_MODE'
  | 'TIMER_PRESS'
  | 'TOGGLE_SLOW_AUDIO'
  | 'HOLD_SLOWER_AUDIO'
  | 'RELEASE_SLOWER_AUDIO'
  | 'SENTENCE_SNIPPET_HOLD_START'
  | 'SENTENCE_SNIPPET_HOLD_END'
  | 'SENTENCE_SNIPPET_SELECT_LAST'
  | 'SENTENCE_SNIPPET_PREV'
  | 'SENTENCE_SNIPPET_NEXT'
  | 'SENTENCE_SNIPPET_START_EARLIER'
  | 'SENTENCE_SNIPPET_START_LATER'
  | 'SENTENCE_SNIPPET_END_EARLIER'
  | 'SENTENCE_SNIPPET_END_LATER'
  | 'SENTENCE_SNIPPET_FOCUS_LEFT'
  | 'SENTENCE_SNIPPET_FOCUS_RIGHT'
  | 'SENTENCE_SNIPPET_FOCUS_SHRINK'
  | 'SENTENCE_SNIPPET_FOCUS_GROW'
  | 'SENTENCE_SNIPPET_SAVE'
  | 'SENTENCE_SNIPPET_END_LOOP';

export interface SentenceSnippetInputHandlers {
  holdStart: () => void;
  holdEnd: () => void;
  selectLast: () => void;
  step: (direction: -1 | 1) => void;
  nudge: (edge: 'start' | 'end', direction: -1 | 1) => void;
  moveFocus: (move: 'left' | 'right' | 'shrink' | 'grow') => void;
  save: () => Promise<void>;
  endLoop: () => void;
}

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
  handleQuickSaveSnippet: (isContracted?: boolean) => Promise<void | null>;
  handleShiftSnippetLeft: () => void;
  handleShiftSnippetRight: () => void;
  handleBreakdownSentence: () => Promise<void | null>;
  handleAddMasterToReview: () => Promise<void>;
  handleToggleReviewMode: () => void;
  handleTimerPress: () => void;
  handleToggleSlowAudio: () => void;
  handleHoldSlowerAudio: () => void;
  handleReleaseSlowerAudio: () => void;
  sentenceSnippets?: SentenceSnippetInputHandlers;
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
      case 'QUICK_SAVE_CONTRACTED_SNIPPET':
        currentHandlers.handleQuickSaveSnippet(true);
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
      case 'SENTENCE_SNIPPET_HOLD_START':
        currentHandlers.sentenceSnippets?.holdStart();
        break;
      case 'SENTENCE_SNIPPET_HOLD_END':
        currentHandlers.sentenceSnippets?.holdEnd();
        break;
      case 'SENTENCE_SNIPPET_SELECT_LAST':
        currentHandlers.sentenceSnippets?.selectLast();
        break;
      case 'SENTENCE_SNIPPET_PREV':
        currentHandlers.sentenceSnippets?.step(-1);
        break;
      case 'SENTENCE_SNIPPET_NEXT':
        currentHandlers.sentenceSnippets?.step(1);
        break;
      case 'SENTENCE_SNIPPET_START_EARLIER':
        currentHandlers.sentenceSnippets?.nudge('start', -1);
        break;
      case 'SENTENCE_SNIPPET_START_LATER':
        currentHandlers.sentenceSnippets?.nudge('start', 1);
        break;
      case 'SENTENCE_SNIPPET_END_EARLIER':
        currentHandlers.sentenceSnippets?.nudge('end', -1);
        break;
      case 'SENTENCE_SNIPPET_END_LATER':
        currentHandlers.sentenceSnippets?.nudge('end', 1);
        break;
      case 'SENTENCE_SNIPPET_FOCUS_LEFT':
        currentHandlers.sentenceSnippets?.moveFocus('left');
        break;
      case 'SENTENCE_SNIPPET_FOCUS_RIGHT':
        currentHandlers.sentenceSnippets?.moveFocus('right');
        break;
      case 'SENTENCE_SNIPPET_FOCUS_SHRINK':
        currentHandlers.sentenceSnippets?.moveFocus('shrink');
        break;
      case 'SENTENCE_SNIPPET_FOCUS_GROW':
        currentHandlers.sentenceSnippets?.moveFocus('grow');
        break;
      case 'SENTENCE_SNIPPET_SAVE':
        void currentHandlers.sentenceSnippets?.save();
        break;
      case 'SENTENCE_SNIPPET_END_LOOP':
        currentHandlers.sentenceSnippets?.endLoop();
        break;
    }
  }, []);
  return { dispatch };
};
