import { SentenceMapItemTypes } from '@/app/types/content-types';
import { OverlappingSnippetData } from '@/app/types/shared-types';

export const getSecondsLoopedTranscriptData = ({
  formattedTranscriptState,
  loopStartTime,
  loopEndTime,
  mediaDuration,
  includeSecondsArrays = false,
}: {
  formattedTranscriptState: SentenceMapItemTypes[];
  loopStartTime: number;
  loopEndTime: number;
  mediaDuration: number | null;
  includeSecondsArrays?: boolean;
}): OverlappingSnippetData[] => {
  const results: OverlappingSnippetData[] = [];

  if (formattedTranscriptState.length === 0) {
    return [];
  }

  formattedTranscriptState.forEach((item) => {
    const start = item.time;
    const end = item?.nextSentence ? item.nextSentence : mediaDuration;
    if (!end) {
      return;
    }
    const duration = end - start;

    const overlapStart = Math.max(start, loopStartTime);
    const overlapEnd = Math.min(end, loopEndTime);

    if (overlapStart < overlapEnd) {
      const overlapDuration = overlapEnd - overlapStart;
      const percentageOverlap = (overlapDuration / duration) * 100;
      const startPoint = ((overlapStart - start) / duration) * 100;
      const sentenceSeconds: number[] = [];
      let filteredOverlappedSeconds: number[] = [];

      if (includeSecondsArrays) {
        // Create sentence seconds array
        const step = duration / 9; // Divide into 10 blocks (9 intervals)
        for (let i = 0; i < 10; i++) {
          sentenceSeconds.push(start + i * step);
        }

        // Create overlapped seconds array (same as sentence, then filter)
        const overlappedSeconds: number[] = [];
        for (let i = 0; i < 10; i++) {
          overlappedSeconds.push(start + i * step);
        }

        // Filter to only include values within overlap range
        filteredOverlappedSeconds = overlappedSeconds.filter(
          (time) => time >= overlapStart && time <= overlapEnd,
        );
      }

      results.push({
        id: item.id,
        start,
        end,
        percentageOverlap: Number(percentageOverlap.toFixed(2)),
        targetLang: item.targetLang,
        startPoint: Number(startPoint.toFixed(2)),
        sentenceSeconds,
        overlappedSeconds: filteredOverlappedSeconds,
      });
    }
  });

  return results;
};
