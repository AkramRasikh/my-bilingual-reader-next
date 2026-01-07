import { OverlappingSnippetData } from '@/app/types/shared-types';

export const getSecondsLoopedTranscriptData = ({
  formattedTranscriptState,
  loopStartTime,
  loopEndTime,
  mediaDuration,
}: {
  formattedTranscriptState: any[];
  loopStartTime: number;
  loopEndTime: number;
  mediaDuration: number | null;
}): OverlappingSnippetData[] | void => {
  const results: OverlappingSnippetData[] = [];

  formattedTranscriptState.forEach((item) => {
    const start = item.time;
    const end = item?.nextSentence ? item.nextSentence : mediaDuration;
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
