import {
  studiedWordContainsAnotherSavedWord,
  studiedWordIsInsideAnotherSavedWord,
} from './saved-word-containment';

const elaborate = {
  id: 'word-1',
  surfaceForm: 'elaborate',
  baseForm: 'elaborate',
};

describe('studiedWordIsInsideAnotherSavedWord', () => {
  it('matches when the studied word sits inside another saved surface form', () => {
    expect(
      studiedWordIsInsideAnotherSavedWord(elaborate, [
        elaborate,
        {
          id: 'word-2',
          surfaceForm: 'elaborate on this issue',
          baseForm: 'elaborate on this issue',
        },
      ]),
    ).toBe(true);
  });

  it('matches a longer saved base form when the surface does not contain it', () => {
    expect(
      studiedWordIsInsideAnotherSavedWord(elaborate, [
        {
          id: 'word-2',
          surfaceForm: 'go into detail',
          baseForm: 'to elaborate on this issue',
        },
      ]),
    ).toBe(true);
  });

  it('matches either the studied surface or the studied base', () => {
    expect(
      studiedWordIsInsideAnotherSavedWord(
        { id: 'word-1', surfaceForm: 'went', baseForm: 'go' },
        [{ id: 'word-2', surfaceForm: 'go ahead', baseForm: 'go ahead' }],
      ),
    ).toBe(true);
  });

  it('ignores the studied word itself and equal forms', () => {
    expect(
      studiedWordIsInsideAnotherSavedWord(elaborate, [
        elaborate,
        { id: 'word-3', surfaceForm: 'Elaborate', baseForm: 'elaborate' },
      ]),
    ).toBe(false);
  });

  it('does not treat a shorter saved word as containing the one being studied', () => {
    expect(
      studiedWordIsInsideAnotherSavedWord(
        {
          id: 'word-2',
          surfaceForm: 'elaborate on this issue',
          baseForm: 'elaborate on this issue',
        },
        [elaborate],
      ),
    ).toBe(false);
  });

  it('ignores source text because only saved word forms are compared', () => {
    expect(
      studiedWordIsInsideAnotherSavedWord(elaborate, [
        {
          id: 'sentence',
          surfaceForm: 'hello',
          baseForm: 'hello',
        },
      ]),
    ).toBe(false);
  });
});

describe('studiedWordContainsAnotherSavedWord', () => {
  const phrase = {
    id: 'word-2',
    surfaceForm: 'elaborate on this issue',
    baseForm: 'elaborate on this issue',
  };

  it('matches when another saved word sits inside the studied word', () => {
    expect(studiedWordContainsAnotherSavedWord(phrase, [phrase, elaborate])).toBe(
      true,
    );
  });

  it('does not match when the studied word is the shorter one', () => {
    expect(studiedWordContainsAnotherSavedWord(elaborate, [phrase])).toBe(false);
  });

  it('ignores the studied word itself and equal forms', () => {
    expect(
      studiedWordContainsAnotherSavedWord(elaborate, [
        elaborate,
        { id: 'word-3', surfaceForm: 'Elaborate', baseForm: 'elaborate' },
      ]),
    ).toBe(false);
  });

  it('can be true alongside being inside another saved word', () => {
    const others = [
      elaborate,
      {
        id: 'word-4',
        surfaceForm: 'elaborate on this issue please',
        baseForm: 'elaborate on this issue please',
      },
    ];
    expect(studiedWordContainsAnotherSavedWord(phrase, others)).toBe(true);
    expect(studiedWordIsInsideAnotherSavedWord(phrase, others)).toBe(true);
  });
});
