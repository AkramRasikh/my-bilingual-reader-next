import { indexOfFirstTogglableWordInRange } from './indexOfFirstTogglableWordInRange';

const words = [
  { index: 0, endIndex: 4 },
  { index: 6, endIndex: 10 },
  { index: 12, endIndex: 15 },
];

describe('indexOfFirstTogglableWordInRange', () => {
  it('starts on the first word inside the estimated snippet', () => {
    expect(indexOfFirstTogglableWordInRange(words, 12, 20)).toBe(2);
  });

  it('starts on the word that contains the estimated start', () => {
    expect(indexOfFirstTogglableWordInRange(words, 8, 20)).toBe(1);
  });

  it('skips the gap and starts on the next word inside the estimate', () => {
    expect(indexOfFirstTogglableWordInRange(words, 11, 20)).toBe(2);
  });

  it('falls back to the first word when nothing overlaps the estimate', () => {
    expect(indexOfFirstTogglableWordInRange(words, 20, 25)).toBe(0);
  });
});
