import { useMemo } from 'react';
import { threeSecondLoopLogicLegacy } from './useManageThreeSecondLoopLegacy';
import {
  ContentTypes,
  FormattedTranscriptTypes,
} from '@/app/types/content-types';

export const useSavedSnippetsMemoized = (
  snippets: ContentTypes['snippets'] | undefined,
  formattedTranscriptMemoized: FormattedTranscriptTypes[],
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

      const resultOfThis = threeSecondLoopLogicLegacy({
        refSeconds: loopDataRef,
        threeSecondLoopState: snippetData.time,
        formattedTranscriptState: formattedTranscriptMemoized,
        realStartTime: 0,
        startTime,
        endTime,
      });

      if (!resultOfThis) {
        return;
      }
      allRes.push(
        ...resultOfThis.map((item) => ({
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
