import { SentenceMapItemTypes } from '@/app/types/content-types';
import { OverlappingSnippetData } from '@/app/types/shared-types';

export const threeSecondLoopLogicLegacy = ({
  formattedTranscriptState,
  startTime,
  endTime,
}: {
  formattedTranscriptState: SentenceMapItemTypes[];
  startTime: number;
  endTime: number;
}): OverlappingSnippetData[] => {
  const results: OverlappingSnippetData[] = [];

  formattedTranscriptState.forEach((item, index) => {
    const start = item.time;
    const end = item?.nextSentence
      ? item.nextSentence
      : index < formattedTranscriptState.length - 1
        ? formattedTranscriptState[index + 1].time
        : start;
    const duration = end - start;

    const overlapStart = Math.max(start, startTime);
    const overlapEnd = Math.min(end, endTime);

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
        vocab: item?.vocab ?? [
          { surfaceForm: item.targetLang, meaning: 'n/a', sentenceId: item.id },
        ],
      });
    }
  });

  return results;
};
