'use client';

import { useEffect } from 'react';

type Props = {
  isVideoPlaying: boolean;
};

const KeyListener = ({
  isVideoPlaying,
  handleJumpToSentenceViaKeys,
}: Props) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      console.log('## handleKeyDown?? isVideoPlaying', isVideoPlaying);

      if (!isVideoPlaying) return;

      switch (e.key.toLowerCase()) {
        case 'a':
          handleJumpToSentenceViaKeys(-1);
          console.log('Pressed A - action A triggered');
          break;
        case 's':
          handleJumpToSentenceViaKeys(0);
          console.log('Pressed S - action S triggered');
          break;
        case 'd':
          handleJumpToSentenceViaKeys(1);
          console.log('Pressed D - action D triggered');
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVideoPlaying]);

  return null;
};

export default KeyListener;
