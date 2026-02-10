import { getUniqueSegmentOfArray } from './get-unique-segment-of-array';
import { SentenceMapItemTypes } from '@/app/types/content-types';

type GetLoopTranscriptSegmentArgs = {
  secondsState: string[];
  sentenceMap: Record<string, SentenceMapItemTypes>;
  startTime: number;
  endTime: number;
};

export const getLoopTranscriptSegment = ({
  secondsState,
  sentenceMap,
  startTime,
  endTime,
}: GetLoopTranscriptSegmentArgs): SentenceMapItemTypes[] => {
  const secondsStateSliceArr = getUniqueSegmentOfArray(
    secondsState,
    startTime,
    endTime,
  );

  return secondsStateSliceArr.map(
    (secondsSentenceId) => sentenceMap[secondsSentenceId],
  );
};
