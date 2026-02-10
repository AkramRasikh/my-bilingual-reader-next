import { useMemo } from 'react';
import { FormattedTranscriptTypes } from '@/app/types/content-types';

type UseLoopedTranscriptMemoizedArgs = {
  threeSecondLoopState: number | null;
  secondsState: string[];
  contractThreeSecondLoopState: boolean;
  getLoopTranscriptSegment: (args: {
    startTime: number;
    endTime: number;
  }) => FormattedTranscriptTypes[];
};

export const useLoopedTranscriptMemoized = ({
  threeSecondLoopState,
  secondsState,
  contractThreeSecondLoopState,
  getLoopTranscriptSegment,
}: UseLoopedTranscriptMemoizedArgs): FormattedTranscriptTypes[] => {
  return useMemo(() => {
    if (!threeSecondLoopState || secondsState.length === 0) {
      return [];
    }

    const startTime =
      threeSecondLoopState - (contractThreeSecondLoopState ? 0.75 : 1.5);
    const endTime =
      threeSecondLoopState + (contractThreeSecondLoopState ? 0.75 : 1.5);

    return getLoopTranscriptSegment({
      startTime,
      endTime,
    });
  }, [
    threeSecondLoopState,
    secondsState,
    contractThreeSecondLoopState,
    getLoopTranscriptSegment,
  ]);
};
