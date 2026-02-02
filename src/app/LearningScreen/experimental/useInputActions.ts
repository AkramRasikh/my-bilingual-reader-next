export type InputAction = 'REWIND';
// Add more actions as needed:
// | 'PAUSE_PLAY'
// | 'JUMP_NEXT'
// | 'JUMP_PREV'

interface InputHandlers {
  handleRewind: () => void;
  // Add more handlers as you expand
}

export const useInputActions = (handlers: InputHandlers) => {
  const dispatch = (action: InputAction) => {
    switch (action) {
      case 'REWIND':
        console.log('## REWIND action dispatched');

        handlers.handleRewind();
        break;
      // Add more cases as you expand
    }
  };

  return { dispatch };
};
