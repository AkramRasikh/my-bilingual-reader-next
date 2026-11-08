import { describe, expect, it } from '@jest/globals';
import {
  addHardItem,
  anotherWord,
  dismissCurrentWord,
  dismissWord,
  endSession,
  nextConstraint,
  restoreWord,
  skipConstraint,
  startSession,
  visibleWordIds,
  type ConstraintLike,
  type ImprovConfig,
} from './improv-session';

const constraints: ConstraintLike[] = [
  { id: 'a', category: 'grammatical_structures' },
  { id: 'b', category: 'grammatical_structures' },
  { id: 'c', category: 'communicative_functions', weight: 100 },
];

const words = [{ id: 'w1' }, { id: 'w2' }, { id: 'w3' }, { id: 'w4' }, { id: 'w5' }];

const config: ImprovConfig = {
  enabledCategories: ['grammatical_structures', 'communicative_functions'],
  weightingEnabled: false,
  wordLimit: 5,
};

const zero = () => 0;

describe('improv session', () => {
  it('samples a stable word pool and one enabled constraint', () => {
    const session = startSession(words, constraints, { ...config, wordLimit: 2 }, zero);
    expect(session.started).toBe(true);
    expect(session.poolWordIds).toEqual(['w2', 'w3']);
    expect(session.currentWordId).toBe('w2');
    expect(session.currentConstraintId).toBe('a');
    expect(words.map((word) => word.id)).toEqual(['w1', 'w2', 'w3', 'w4', 'w5']);
  });

  it('keeps Next completions out until the pool is exhausted, and Skip does not complete', () => {
    const started = startSession(
      words,
      constraints,
      { ...config, enabledCategories: ['grammatical_structures'] },
      zero,
    );
    expect(started.currentConstraintId).toBe('a');

    const skipped = skipConstraint(started, constraints, zero);
    expect(skipped.currentConstraintId).toBe('b');
    expect(skipped.completedConstraintIds).toEqual([]);

    const firstNext = nextConstraint(started, constraints, zero);
    expect(firstNext.currentConstraintId).toBe('b');
    expect(firstNext.completedConstraintIds).toEqual(['a']);

    const exhausted = nextConstraint(firstNext, constraints, zero);
    expect(exhausted.currentConstraintId).toBe('a');
    expect(exhausted.completedConstraintIds).toEqual([]);
  });

  it('does not draw a constraint from a disabled category', () => {
    const session = startSession(
      words,
      constraints,
      { ...config, enabledCategories: ['communicative_functions'] },
      zero,
    );
    expect(session.currentConstraintId).toBe('c');
    const again = skipConstraint(session, constraints, zero);
    expect(again.currentConstraintId).toBe('c');
  });

  it('uses weight only when weighting is on', () => {
    const weighted = startSession(
      [{ id: 'w1' }],
      [
        { id: 'light', category: 'grammatical_structures', weight: 1 },
        { id: 'heavy', category: 'grammatical_structures', weight: 100 },
      ],
      {
        enabledCategories: ['grammatical_structures'],
        weightingEnabled: true,
        wordLimit: 1,
      },
      () => 0.1,
    );
    const uniform = startSession(
      [{ id: 'w1' }],
      [
        { id: 'light', category: 'grammatical_structures', weight: 1 },
        { id: 'heavy', category: 'grammatical_structures', weight: 100 },
      ],
      {
        enabledCategories: ['grammatical_structures'],
        weightingEnabled: false,
        wordLimit: 1,
      },
      () => 0.1,
    );

    expect(weighted.currentConstraintId).toBe('heavy');
    expect(uniform.currentConstraintId).toBe('light');
  });

  it('adds a word or constraint to the Hard List once and leaves the current cards in place', () => {
    const started = startSession(words, constraints, config, zero);
    const withWord = addHardItem(started, { type: 'word', id: 'w2' });
    const again = addHardItem(withWord, { type: 'word', id: 'w2' });
    const withConstraint = addHardItem(again, { type: 'constraint', id: 'a' });

    expect(withConstraint.hardItems).toEqual([
      { type: 'word', id: 'w2' },
      { type: 'constraint', id: 'a' },
    ]);
    expect(withConstraint.currentWordId).toBe(started.currentWordId);
    expect(withConstraint.currentConstraintId).toBe(started.currentConstraintId);
    expect(again).toBe(withWord);
  });

  it('dismisses and restores eligibility without touching the Hard List', () => {
    const started = {
      ...startSession(words, constraints, config, zero),
      poolWordIds: ['w1', 'w2', 'w3'],
      currentWordId: 'w1',
    };
    const marked = addHardItem(started, { type: 'word', id: 'w1' });
    const dismissed = dismissCurrentWord(marked);

    expect(dismissed.dismissedWordIds).toEqual(['w1']);
    expect(dismissed.currentWordId).toBe('w2');
    expect(dismissed.hardItems).toEqual([{ type: 'word', id: 'w1' }]);
    expect(dismissed.poolWordIds).toEqual(['w1', 'w2', 'w3']);

    const restored = restoreWord(dismissed, 'w1');
    expect(restored.dismissedWordIds).toEqual([]);
    expect(restored.currentWordId).toBe('w2');
    expect(anotherWord(restored).currentWordId).toBe('w2');
  });

  it('keeps 100 words in the session and five on screen', () => {
    const many = Array.from({ length: 120 }, (_, index) => ({
      id: `n${index}`,
    }));
    const session = startSession(
      many,
      constraints,
      { ...config, wordLimit: 100 },
      zero,
    );
    expect(session.poolWordIds).toHaveLength(100);

    const windowed = {
      ...session,
      poolWordIds: Array.from({ length: 12 }, (_, index) => `p${index}`),
      currentWordId: 'p0',
      dismissedWordIds: [],
    };
    expect(visibleWordIds(windowed)).toEqual(['p0', 'p1', 'p2', 'p3', 'p4']);

    const advanced = anotherWord(windowed);
    expect(advanced.currentWordId).toBe('p5');
    expect(visibleWordIds(advanced)).toEqual(['p5', 'p6', 'p7', 'p8', 'p9']);

    const dismissed = dismissWord(windowed, 'p2');
    expect(dismissed.currentWordId).toBe('p0');
    expect(visibleWordIds(dismissed)).toEqual(['p0', 'p1', 'p3', 'p4', 'p5']);
    expect(dismissed.poolWordIds).toHaveLength(12);
  });

  it('clears the session, including the Hard List, when the session ends', () => {
    const started = addHardItem(startSession(words, constraints, config, zero), {
      type: 'constraint',
      id: 'a',
    });
    expect(endSession()).toEqual({
      started: false,
      enabledCategories: [],
      weightingEnabled: false,
      poolWordIds: [],
      dismissedWordIds: [],
      completedConstraintIds: [],
      currentWordId: null,
      currentConstraintId: null,
      hardItems: [],
    });
    expect(started.hardItems).toHaveLength(1);
  });
});
