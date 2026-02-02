export type InputAction =
  | 'REWIND'
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
  | 'SHIFT_SNIPPET_RIGHT';

interface InputHandlers {
  handleRewind: () => void;
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
  // Add more handlers as you expand
}

export const useInputActions = (handlers: InputHandlers) => {
  const dispatch = (action: InputAction) => {
    switch (action) {
      case 'REWIND':
        handlers.handleRewind();
        break;
      case 'PAUSE_PLAY':
        handlers.handlePausePlay();
        break;
      case 'JUMP_NEXT':
        handlers.handleJumpNext();
        break;
      case 'JUMP_PREV':
        handlers.handleJumpPrev();
        break;
      case 'JUMP_CURRENT':
        handlers.handleJumpCurrent();
        break;
      case 'LOOP_SENTENCE':
        handlers.handleLoopThisSentence();
        break;
      case 'SLICE_LOOP':
        handlers.handleShiftLoopSentence();
        break;
      case 'SHRINK_LOOP':
        handlers.handleShrinkLoop();
        break;
      case 'THREE_SECOND_LOOP':
        handlers.handleThreeSecondLoop();
        break;
      case 'QUICK_SAVE_SNIPPET':
        handlers.handleQuickSaveSnippet();
        break;
      case 'SHIFT_SNIPPET_LEFT':
        handlers.handleShiftSnippetLeft();
        break;
      case 'SHIFT_SNIPPET_RIGHT':
        handlers.handleShiftSnippetRight();
    }
  };
  return { dispatch };
};
