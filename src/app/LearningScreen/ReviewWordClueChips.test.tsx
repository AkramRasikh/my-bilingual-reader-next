import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import ReviewWordClueChips, { revealRandomClue } from './ReviewWordClueChips';

const pieces = [
  { surfaceForm: '警察', index: 0 },
  { surfaceForm: '射击', index: 1 },
  { surfaceForm: '有', index: 2 },
  { surfaceForm: '多', index: 3 },
  { surfaceForm: '不准', index: 4 },
];

describe('revealRandomClue', () => {
  it('reveals one of the hidden clues', () => {
    expect(revealRandomClue([], 5, () => 0)).toEqual([0]);
    expect(revealRandomClue([0, 1], 5, () => 0.99)).toEqual([0, 1, 4]);
    expect(revealRandomClue([0, 2], 5, () => 0.5)).toEqual([0, 2, 3]);
  });

  it('leaves the list alone once every clue is showing', () => {
    const all = [3, 1, 0, 4, 2];
    expect(revealRandomClue(all, 5)).toBe(all);
  });

  it('reveals every clue exactly once over repeated presses', () => {
    let revealed: number[] = [];
    for (let press = 0; press < 8; press++) {
      revealed = revealRandomClue(revealed, 5);
    }
    expect([...revealed].sort()).toEqual([0, 1, 2, 3, 4]);
  });
});

function Harness() {
  const [revealed, setRevealed] = useState<number[]>([]);
  return (
    <ReviewWordClueChips
      pieces={pieces}
      revealed={revealed}
      languageSelectedState='chinese'
      onReveal={() => setRevealed((prev) => revealRandomClue(prev, pieces.length))}
    />
  );
}

describe('ReviewWordClueChips', () => {
  it('starts with every clue blurred and reveals one per click until all are shown', () => {
    render(<Harness />);

    const clues = () => screen.getAllByTestId('learning-screen-review-word-clue');
    expect(clues()).toHaveLength(5);
    clues().forEach((clue) => expect(clue).toHaveClass('blur-sm'));

    const row = screen.getByTestId('learning-screen-review-word-clues');
    fireEvent.click(row);
    expect(clues().filter((clue) => !clue.classList.contains('blur-sm'))).toHaveLength(1);

    for (let press = 0; press < 6; press++) fireEvent.click(row);
    clues().forEach((clue) => {
      expect(clue).not.toHaveClass('blur-sm');
      expect(clue).toHaveAttribute('data-revealed', 'true');
    });
  });

  it('shows pinyin under each Chinese clue', () => {
    render(<Harness />);
    expect(clues0()).toHaveTextContent('警察');
    expect(clues0()).toHaveTextContent('jǐng');
  });
});

function clues0() {
  return screen.getAllByTestId('learning-screen-review-word-clue')[0];
}
