'use client';

import { pinyin } from 'pinyin-pro';
import { chinese } from '@/app/languages';
import getColorByIndex from '@/utils/get-color-by-index';
import { type ClueSegment } from './clue-segments';
import { PLAYBACK_CAPTION_PLATE_CLASS } from './playbackCaptionSurface';

const GAP_CLUE_COLOR = 'rgb(209 213 219)';

export function revealRandomClue(
  revealed: number[],
  pieceCount: number,
  random: () => number = Math.random,
) {
  const hidden: number[] = [];
  for (let position = 0; position < pieceCount; position++) {
    if (!revealed.includes(position)) {
      hidden.push(position);
    }
  }
  if (hidden.length === 0) {
    return revealed;
  }
  const pick = hidden[Math.min(hidden.length - 1, Math.floor(random() * hidden.length))];
  return [...revealed, pick];
}

export default function ReviewWordClueChips({
  pieces,
  revealed,
  languageSelectedState,
  onReveal,
}: {
  pieces: ClueSegment[];
  revealed: number[];
  languageSelectedState: string;
  onReveal: () => void;
}) {
  const showPinyin = languageSelectedState === chinese;

  return (
    <button
      type='button'
      data-testid='learning-screen-review-word-clues'
      aria-label='Reveal a clue'
      onClick={onReveal}
      className={`pointer-events-auto mx-auto mt-0.5 flex w-fit max-w-full flex-wrap justify-center gap-0.5 px-1 py-0.5 leading-none ${PLAYBACK_CAPTION_PLATE_CLASS}`}
    >
      {pieces.map((piece, position) => {
        const isRevealed = revealed.includes(position);
        return (
          <span
            key={`${piece.surfaceForm}-${piece.index ?? 'gap'}-${position}`}
            data-testid='learning-screen-review-word-clue'
            data-gap={piece.index === null ? 'true' : 'false'}
            data-revealed={isRevealed ? 'true' : 'false'}
            aria-hidden={!isRevealed}
            style={{
              color:
                piece.index === null
                  ? GAP_CLUE_COLOR
                  : getColorByIndex(piece.index),
            }}
            className={`flex flex-col items-center rounded-sm px-0.5 transition-[filter] duration-200 select-none ${
              isRevealed ? '' : 'blur-sm'
            }`}
          >
            <span className='text-xs'>{piece.surfaceForm}</span>
            {showPinyin ? (
              <span className='text-[10px]'>
                {pinyin(piece.surfaceForm, {
                  toneType: 'symbol',
                  separator: ' ',
                })}
              </span>
            ) : null}
          </span>
        );
      })}
    </button>
  );
}
