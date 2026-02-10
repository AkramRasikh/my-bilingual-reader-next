import { useMemo } from 'react';
import { mapSentenceIdsToSeconds } from '../utils/map-sentence-ids-to-seconds';
import { ContentTypes } from '@/app/types/content-types';

type UseSecondsStateMemoizedArgs = {
  content: ContentTypes['content'];
  mediaDuration: number | null;
};

export const useSecondsStateMemoized = ({
  content,
  mediaDuration,
}: UseSecondsStateMemoizedArgs): string[] => {
  return useMemo(() => {
    if (!mediaDuration) {
      return [];
    }
    return mapSentenceIdsToSeconds({
      content,
      duration: mediaDuration,
    });
  }, [content, mediaDuration]);
};
