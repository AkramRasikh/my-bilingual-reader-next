export type InputAction =
  | 'REWIND'
  | 'PAUSE_PLAY'
  | 'JUMP_NEXT'
  | 'JUMP_PREV'
  | 'JUMP_CURRENT';

interface InputHandlers {
  handleRewind: () => void;
  handlePausePlay: () => void;
  handleJumpNext: () => void;
  handleJumpPrev: () => void;
  handleJumpCurrent: () => void;
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
      // Add more cases as you expand
    }
  };

  return { dispatch };
};
