import {
  isDuplicateSavingWord,
  middleIndexOfSavingWordSpan,
  sameSavingWordSpans,
  SavingWordSpan,
} from './savingWordSpans';

const span = (
  start: number,
  end: number,
  text: string,
): SavingWordSpan => ({ start, end, text });

describe('saving word spans', () => {
  it('places the spinner on the middle character of a chunk', () => {
    expect(middleIndexOfSavingWordSpan(span(2, 3, '世界'))).toBe(2);
    expect(middleIndexOfSavingWordSpan(span(0, 0, '你'))).toBe(0);
  });

  it('blocks the same span and the same word text while a save is in flight', () => {
    const inflight = [span(0, 0, '你')];

    expect(isDuplicateSavingWord(inflight, span(0, 0, '你'))).toBe(true);
    expect(isDuplicateSavingWord(inflight, span(4, 4, ' 你 '))).toBe(true);
    expect(isDuplicateSavingWord(inflight, span(1, 1, '好'))).toBe(false);
  });

  it('treats equal span lists as the same overlay snapshot', () => {
    expect(
      sameSavingWordSpans([span(0, 0, '你')], [{ start: 0, end: 0, text: '你' }]),
    ).toBe(true);
    expect(sameSavingWordSpans([span(0, 0, '你')], [span(1, 1, '好')])).toBe(
      false,
    );
  });
});
