'use client';

import { useEffect } from 'react';

type Props = {
  isVideoPlaying: boolean;
};

const KeyListener = ({ isVideoPlaying }: Props) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      console.log('## handleKeyDown?? isVideoPlaying', isVideoPlaying);

      if (!isVideoPlaying) return;

      switch (e.key.toLowerCase()) {
        case 'a':
          console.log('Pressed A - action A triggered');
          break;
        case 's':
          console.log('Pressed S - action S triggered');
          break;
        case 'd':
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
