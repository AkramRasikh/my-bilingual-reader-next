'use client';

import { useEffect } from 'react';

const qRewindTime = 3;

type Props = {
  isVideoPlaying: boolean;
};

const KeyListener = ({
  isVideoPlaying,
  handleJumpToSentenceViaKeys,
  handleRewind,
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
        case 'q':
          handleRewind(qRewindTime);
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
