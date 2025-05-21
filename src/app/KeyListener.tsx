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
      if (!isVideoPlaying) return;

      switch (e.key.toLowerCase()) {
        case 'a':
          handleJumpToSentenceViaKeys(-1);
          break;
        case 's':
          handleJumpToSentenceViaKeys(0);
          break;
        case 'd':
          handleJumpToSentenceViaKeys(1);
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
