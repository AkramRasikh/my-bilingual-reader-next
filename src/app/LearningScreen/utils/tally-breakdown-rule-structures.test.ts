import { describe, it, expect } from '@jest/globals';
import { tallyBreakdownRuleStructures } from './tally-breakdown-rule-structures';
import { RuleCatalogCategory } from '../../types/breakdown-rules-types';

const catalog: RuleCatalogCategory[] = [
  {
    category: 'constructions',
    title: 'Constructions',
    groups: [
      {
        id: 'moods',
        name: 'Moods',
        options: [
          { key: 'constructions.subjunctive', id: 'subjunctive', name: 'Subj' },
          { key: 'constructions.imperative', id: 'imperative', name: 'Imp' },
        ],
      },
      {
        id: 'voice',
        name: 'Voice',
        options: [{ key: 'constructions.passive', id: 'passive', name: 'Pas' }],
      },
    ],
  },
];

describe('tallyBreakdownRuleStructures', () => {
  it('counts sentences per rule, letting one sentence count for several rules', () => {
    const { byRuleKey } = tallyBreakdownRuleStructures(
      [
        { structures: ['constructions.subjunctive', 'constructions.passive'] },
        { structures: ['constructions.subjunctive'] },
        {},
        { structures: [] },
      ],
      catalog,
    );
    expect(byRuleKey).toEqual({
      'constructions.subjunctive': 2,
      'constructions.passive': 1,
    });
  });

  it('counts distinct sentences per group', () => {
    const { byGroupId } = tallyBreakdownRuleStructures(
      [
        {
          structures: ['constructions.subjunctive', 'constructions.imperative'],
        },
        { structures: ['constructions.imperative', 'constructions.passive'] },
      ],
      catalog,
    );
    expect(byGroupId).toEqual({ moods: 2, voice: 1 });
  });

  it('ignores duplicate keys within a sentence and keys not in the catalog', () => {
    const { byRuleKey, byGroupId } = tallyBreakdownRuleStructures(
      [
        {
          structures: ['constructions.passive', 'constructions.passive', 'x.y'],
        },
      ],
      catalog,
    );
    expect(byRuleKey).toEqual({ 'constructions.passive': 1, 'x.y': 1 });
    expect(byGroupId).toEqual({ voice: 1 });
  });
});

describe('tallyBreakdownRuleStructures sentencesByRuleKey', () => {
  it('collects the matching sentences per rule in transcript order, once each', () => {
    type Sentence = { id: string; structures?: string[] };
    const a: Sentence = { id: 'a', structures: ['constructions.passive'] };
    const b = { id: 'b', structures: ['constructions.subjunctive'] };
    const c = {
      id: 'c',
      structures: ['constructions.passive', 'constructions.passive'],
    };
    const { sentencesByRuleKey } = tallyBreakdownRuleStructures<Sentence>(
      [a, b, c, { id: 'd' }],
      catalog,
    );
    expect(sentencesByRuleKey).toEqual({
      'constructions.passive': [a, c],
      'constructions.subjunctive': [b],
    });
  });
});
