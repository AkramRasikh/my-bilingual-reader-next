'use client';
import { useEffect } from 'react';
import LearningScreenLoopUI from './LearningScreen/LearningScreenLoopUI';
import clsx from 'clsx';
import LearningScreenLoopBtn from './LearningScreen/LearningScreenLoopBtn';
import { Button } from '@/components/ui/button';

const VideoPlayer = ({
  url,
  ref,
  handleTimeUpdate,
  setIsVideoPlaying,
  masterPlayComprehensiveState,
  threeSecondLoopState,
  playFromHereUI,
  isVideoPlaying,
  previousSentence,
  nextSentence,
}) => {
  const videoUrl = url;

  useEffect(() => {
    const video = ref?.current;

    if (!video) return;

    const handlePlay = () => setIsVideoPlaying(true);
    const handlePause = () => setIsVideoPlaying(false);

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, []);

  return (
    <div className='flex flex-col'>
      <video
        ref={ref}
        src={videoUrl}
        controls
        className='w-full rounded-lg shadow-lg m-auto'
        onTimeUpdate={handleTimeUpdate}
      >
        Your browser does not support the video tag.
      </video>
      {threeSecondLoopState && <LearningScreenLoopUI />}{' '}
      <div
        className={clsx(
          threeSecondLoopState || playFromHereUI
            ? 'flex w-full justify-between'
            : '',
        )}
      >
        <div>
          {previousSentence && (
            <p className='text-center font-bold text-l text-gray-600  backdrop-blur-xs backdrop-brightness-75 p-1 m-1 rounded-lg'>
              {previousSentence}
            </p>
          )}
          {masterPlayComprehensiveState?.targetLang && (
            <p className='text-center font-bold text-xl text-blue-900  backdrop-blur-xs backdrop-brightness-75 p-1 m-1 rounded-lg'>
              {masterPlayComprehensiveState.targetLang}
            </p>
          )}
          {nextSentence && (
            <p className='text-center font-bold text-l text-gray-600  backdrop-blur-xs backdrop-brightness-75 p-1 m-1 rounded-lg'>
              {nextSentence}
            </p>
          )}
          {playFromHereUI && (
            <Button onClick={playFromHereUI} className='w-fit m-auto'>
              {isVideoPlaying ? 'Pause' : 'Play'}
            </Button>
          )}
        </div>
        {threeSecondLoopState && <LearningScreenLoopBtn />}
      </div>
    </div>
  );
};

export default VideoPlayer;
