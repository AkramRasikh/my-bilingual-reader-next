import { ContentTranscriptTypes } from '../../types/content-types';
import { RuleCatalogCategory } from '../../types/breakdown-rules-types';

type TallySentence = Pick<ContentTranscriptTypes, 'structures'>;

export interface BreakdownRuleTally<T extends TallySentence = TallySentence> {
  // rule key -> number of sentences tagged with that rule
  byRuleKey: Record<string, number>;
  // group id -> number of distinct sentences tagged with any rule in the group
  byGroupId: Record<string, number>;
  // rule key -> the sentences tagged with that rule, in transcript order
  sentencesByRuleKey: Record<string, T[]>;
}

// Counts sentences per rule and per catalog group. A sentence can carry several
// rules, so it contributes to each of them, but only once to any one group.
export const tallyBreakdownRuleStructures = <T extends TallySentence>(
  transcript: T[],
  catalog: RuleCatalogCategory[],
): BreakdownRuleTally<T> => {
  const groupIdByRuleKey: Record<string, string> = {};
  catalog.forEach((category) =>
    category.groups.forEach((group) =>
      group.options.forEach((option) => {
        groupIdByRuleKey[option.key] = group.id;
      }),
    ),
  );

  const byRuleKey: Record<string, number> = {};
  const byGroupId: Record<string, number> = {};
  const sentencesByRuleKey: Record<string, T[]> = {};

  transcript.forEach((sentence) => {
    const { structures } = sentence;
    if (!structures?.length) return;
    const groupsSeen = new Set<string>();
    new Set(structures).forEach((key) => {
      byRuleKey[key] = (byRuleKey[key] ?? 0) + 1;
      (sentencesByRuleKey[key] ??= []).push(sentence);
      const groupId = groupIdByRuleKey[key];
      if (groupId) groupsSeen.add(groupId);
    });
    groupsSeen.forEach((groupId) => {
      byGroupId[groupId] = (byGroupId[groupId] ?? 0) + 1;
    });
  });

  return { byRuleKey, byGroupId, sentencesByRuleKey };
};
