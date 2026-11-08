import { describe, expect, it } from '@jest/globals';
import { chinese, japanese } from '@/app/languages';
import {
  categoriesInOrder,
  categoryLabel,
  constraintExampleCopy,
  linguisticConstraints,
  parseLinguisticConstraints,
} from './constraints';

describe('linguistic constraints', () => {
  it('loads the supplied Chinese POC array unchanged', () => {
    expect(linguisticConstraints).toHaveLength(20);
    expect(linguisticConstraints[0]).toMatchObject({
      id: 'gram_001',
      category: 'grammatical_structures',
      name: 'Indicative',
      difficulty: 'beginner',
    });
    expect(linguisticConstraints[0].examples.zh).toBe('我觉得我们现在应该离开。');
    expect(linguisticConstraints.at(-1)?.id).toBe('conv_004');
    expect(categoriesInOrder(linguisticConstraints)).toEqual([
      'grammatical_structures',
      'communicative_functions',
      'rhetorical_techniques',
      'conversational_techniques',
    ]);
  });

  it('rejects a payload that is not the constraint shape', () => {
    expect(() => parseLinguisticConstraints({ id: 'gram_001' })).toThrow(
      'Linguistic constraints must be an array',
    );
    expect(() =>
      parseLinguisticConstraints([
        {
          id: 'gram_001',
          category: 'grammatical_structures',
          name: 'Indicative',
          instruction: 'Say a fact.',
          examples: { en: 'Hello.' },
        },
      ]),
    ).toThrow('Invalid linguistic constraint at index 0');
  });

  it('labels known categories and readable unknown ids', () => {
    expect(categoryLabel('grammatical_structures')).toBe(
      'Grammatical structures',
    );
    expect(categoryLabel('made_up_moves')).toBe('Made Up Moves');
  });

  it('shows Chinese when that language is selected, otherwise English', () => {
    const constraint = linguisticConstraints[0];
    expect(constraintExampleCopy(constraint, chinese)).toEqual({
      primary: constraint.examples.zh,
      primaryLabel: 'Chinese',
      english: constraint.examples.en,
    });
    expect(constraintExampleCopy(constraint, japanese)).toEqual({
      primary: constraint.examples.en,
      primaryLabel: 'English',
      english: null,
    });
  });
});
