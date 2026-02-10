import { useMemo } from 'react';
import { threeSecondLoopLogicLegacy } from './useManageThreeSecondLoopLegacy';
import {
  ContentTranscriptTypes,
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
    const overlappingSnippetElements = [] as SavedSnippetsMemoizedProps[];
    const snippetsWithVocab: Array<
      Snippet & Pick<ContentTranscriptTypes, 'vocab'>
    > = [];

    if (!snippets) {
      return {
        overlappingSnippetElements,
        snippetsWithVocab,
      };
    }

    snippets.forEach((snippetData) => {
      const startTime =
        snippetData.time - (snippetData?.isContracted ? 0.75 : 1.5);
      const endTime =
        snippetData.time + (snippetData?.isContracted ? 0.75 : 1.5);

      const overlappingSnippetMetaDataGivenTime = threeSecondLoopLogicLegacy({
        refSeconds: loopDataRef,
        threeSecondLoopState: snippetData.time,
        formattedTranscriptState: formattedTranscriptMemoized,
        startTime,
        endTime,
      });

      if (!overlappingSnippetMetaDataGivenTime) {
        return {
          overlappingSnippetElements,
          snippetsWithVocab,
        };
      }

      const snippetDataForOverlappingSnippetData = {
        snippetId: snippetData.id,
        time: snippetData.time,
        isContracted: snippetData?.isContracted,
        isPreSnippet: snippetData?.isPreSnippet,
        hasReview: Boolean(snippetData?.reviewData),
      };

      const updatedForSnippetMetaData = overlappingSnippetMetaDataGivenTime.map(
        (item) => ({
          ...item,
          ...snippetDataForOverlappingSnippetData,
        }),
      );

      const vocabFromMetaData = overlappingSnippetMetaDataGivenTime
        .map((item) => item?.vocab)
        .filter(Boolean);

      snippetsWithVocab.push({
        ...snippetData,
        vocab: vocabFromMetaData.flat(),
      });

      overlappingSnippetElements.push(...updatedForSnippetMetaData);
    });

    return {
      overlappingSnippetElements: overlappingSnippetElements.flat(),
      snippetsWithVocab,
    };
  }, [snippets, formattedTranscriptMemoized, loopDataRef]);
};
