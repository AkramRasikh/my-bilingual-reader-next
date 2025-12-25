import { useMemo } from 'react';
import { threeSecondLoopLogic } from './useManageThreeSecondLoop';

export const useSavedSnippetsMemoized = (
  snippets: any[] | undefined,
  formattedTranscriptMemoized: any[],
  loopDataRef: React.RefObject<any>,
) => {
  return useMemo(() => {
    const allRes = [];

    if (!snippets) {
      return [];
    }

    snippets.forEach((snippetData) => {
      const startTime =
        snippetData.time - (snippetData?.isContracted ? 0.75 : 1.5);
      const endTime =
        snippetData.time + (snippetData?.isContracted ? 0.75 : 1.5);

      const resultOfThis = threeSecondLoopLogic({
        refSeconds: loopDataRef,
        threeSecondLoopState: snippetData.time,
        formattedTranscriptState: formattedTranscriptMemoized,
        realStartTime: 0,
        startTime,
        endTime,
        setState: null,
      });

      allRes.push(
        ...resultOfThis?.map((item) => ({
          ...item,
          snippetId: snippetData.id,
          time: snippetData.time,
          isContracted: snippetData?.isContracted,
          isPreSnippet: snippetData?.isPreSnippet,
        })),
      );
    });

    return allRes;
  }, [snippets, formattedTranscriptMemoized, loopDataRef]);
};
