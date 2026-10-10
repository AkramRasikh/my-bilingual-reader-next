'use client';

import { useEffect, useMemo, useState } from 'react';
import useLearningScreen from './useLearningScreen';
import { layoutReviewedSnippetCoverage } from './snippet-coverage-lanes';

export function useReviewedSnippetCoverage() {
  const { contentSnippets, ref, currentTime, isVideoPlaying } =
    useLearningScreen();
  const [liveTime, setLiveTime] = useState(currentTime);

  useEffect(() => {
    if (!isVideoPlaying) return;

    let frame = 0;
    const tick = () => {
      const time = ref.current?.currentTime;
      if (typeof time === 'number' && Number.isFinite(time)) {
        setLiveTime(time);
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [isVideoPlaying, ref]);

  const playhead = isVideoPlaying ? liveTime : currentTime;

  return useMemo(
    () => layoutReviewedSnippetCoverage(contentSnippets, playhead),
    [contentSnippets, playhead],
  );
}
