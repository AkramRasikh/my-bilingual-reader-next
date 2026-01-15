import { useMemo } from 'react';
import { threeSecondLoopLogicLegacy } from './useManageThreeSecondLoopLegacy';
import {
  ContentTypes,
  FormattedTranscriptTypes,
  Snippet,
} from '@/app/types/content-types';
import { OverlappingSnippetData } from '@/app/types/shared-types';

export interface SavedSnippetsMemoizedProps extends OverlappingSnippetData {
  snippetId: Snippet['id'];
  time: Snippet['time'];
  isContracted?: Snippet['isContracted'];
  isPreSnippet?: Snippet['isPreSnippet'];
}

export const useSavedSnippetsMemoized = (
  snippets: ContentTypes['snippets'] | undefined,
  formattedTranscriptMemoized: FormattedTranscriptTypes[],
  loopDataRef: React.RefObject<any>,
) => {
  return useMemo(() => {
    const allRes = [] as SavedSnippetsMemoizedProps[];

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
