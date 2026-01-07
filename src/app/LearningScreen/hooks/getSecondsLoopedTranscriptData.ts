import { OverlappingSnippetData } from '@/app/types/shared-types';

export const getSecondsLoopedTranscriptData = ({
  formattedTranscriptState,
  loopStartTime,
  loopEndTime,
  isRealEndTime,
}: {
  formattedTranscriptState: any[];
  loopStartTime: number;
  loopEndTime: number;
  isRealEndTime?: number;
}): OverlappingSnippetData[] | void => {
  const results: OverlappingSnippetData[] = [];

  formattedTranscriptState.forEach((item, index) => {
    const start = item.time;
    const end = item?.nextSentence
      ? item.nextSentence
      : isRealEndTime
      ? isRealEndTime
      : index < formattedTranscriptState.length - 1
      ? formattedTranscriptState[index + 1].time
      : start;
    const duration = end - start;

    const overlapStart = Math.max(start, loopStartTime);
    const overlapEnd = Math.min(end, loopEndTime);

    if (overlapStart < overlapEnd) {
      const overlapDuration = overlapEnd - overlapStart;
      const percentageOverlap = (overlapDuration / duration) * 100;
      const startPoint = ((overlapStart - start) / duration) * 100;

      results.push({
        id: item.id,
        start,
        end,
        percentageOverlap: Number(percentageOverlap.toFixed(2)),
        targetLang: item.targetLang,
        startPoint: Number(startPoint.toFixed(2)),
      });
    }
  });

  return results;
};
