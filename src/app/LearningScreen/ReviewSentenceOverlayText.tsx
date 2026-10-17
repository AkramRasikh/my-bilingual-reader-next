import { pinyin } from 'pinyin-pro';
import { chinese, isTrimmedLang, LanguageEnum } from '@/app/languages';
import { Vocab } from '@/app/types/content-types';
import getColorByIndex from '@/utils/get-color-by-index';
import { PhraseBreakdownPiece } from './find-breakdown-pieces-for-phrase';
import {
  PLAYBACK_CAPTION_PLATE_CLASS,
  PLAYBACK_CAPTION_SECONDARY_TEXT_CLASS,
} from './playbackCaptionSurface';

export function ColoredPhraseBreakdown({
  pieces,
  languageSelectedState,
  testId,
  pinyinTestId,
  withTopMargin = false,
  chip = false,
}: {
  pieces: PhraseBreakdownPiece[];
  languageSelectedState: string;
  testId: string;
  pinyinTestId: string;
  withTopMargin?: boolean;
  chip?: boolean;
}) {
  const addSpace = !isTrimmedLang(languageSelectedState as LanguageEnum);
  const pinyinPieces =
    languageSelectedState === chinese
      ? pieces.map((piece) =>
          pinyin(piece.surfaceForm, {
            toneType: 'symbol',
            separator: '\u2009',
          }),
        )
      : [];

  return (
    <>
      <span
        data-testid={testId}
        className={
          chip
            ? `mx-auto flex w-fit max-w-full flex-wrap justify-center px-1.5 py-0.5 text-base leading-tight ${PLAYBACK_CAPTION_PLATE_CLASS} ${withTopMargin ? 'mt-0.5' : ''}`
            : `flex flex-wrap justify-center text-base ${withTopMargin ? 'mt-0.5' : ''}`
        }
      >
        {pieces.map((piece) => (
          <span
            key={`${piece.surfaceForm}-${piece.index}`}
            style={{ color: getColorByIndex(piece.index) }}
          >
            {piece.surfaceForm}
            {addSpace ? '\u00A0' : ''}
          </span>
        ))}
      </span>
      {pinyinPieces.length > 0 ? (
        <span
          data-testid={pinyinTestId}
          className={
            chip
              ? `mx-auto mt-0.5 flex w-fit max-w-full flex-wrap justify-center px-1.5 py-0.5 text-xs leading-tight ${PLAYBACK_CAPTION_PLATE_CLASS}`
              : 'mt-0.5 flex flex-wrap justify-center text-xs leading-tight'
          }
        >
          {pinyinPieces.map((syllables, index) => (
            <span
              key={`${syllables}-${pieces[index].index}`}
              style={{ color: getColorByIndex(pieces[index].index) }}
            >
              {index > 0 ? '\u2009' : ''}
              {syllables}
            </span>
          ))}
        </span>
      ) : null}
    </>
  );
}

type ReviewSentenceOverlayTextProps = {
  targetLang: string;
  baseLang: string;
  meaning?: string;
  showEnglish: boolean;
  vocab?: Vocab[];
  sentenceStructure?: string;
  languageSelectedState: string;
  showBreakdown?: boolean;
};

function reviewSentenceEnglish(baseLang: string, meaning?: string) {
  const trimmedMeaning = meaning?.trim() ?? '';
  if (trimmedMeaning && trimmedMeaning !== 'n/a') return trimmedMeaning;
  return baseLang;
}

const ReviewSentenceOverlayText = ({
  targetLang,
  baseLang,
  meaning,
  showEnglish,
  vocab,
  sentenceStructure,
  languageSelectedState,
  showBreakdown = false,
}: ReviewSentenceOverlayTextProps) => {
  const english = reviewSentenceEnglish(baseLang, meaning);
  const hasBreakdown = Boolean(sentenceStructure);
  const pieces: Array<PhraseBreakdownPiece & { meaning: string }> = hasBreakdown
    ? (vocab ?? []).flatMap((item, index) => {
        const surfaceForm = item.surfaceForm?.trim();
        if (!surfaceForm) return [];
        const pieceMeaning = item.meaning?.trim() ?? '';
        return [
          {
            surfaceForm,
            index,
            meaning:
              pieceMeaning && pieceMeaning.toLowerCase() !== 'n/a'
                ? pieceMeaning
                : '',
          },
        ];
      })
    : [];
  const visiblePieces = showBreakdown ? pieces : [];
  const wordMeanings = visiblePieces.filter((piece) => piece.meaning);

  return (
    <>
      {hasBreakdown ? (
        <span
          data-testid='learning-screen-review-sentence-breakdown-mark'
          className='pointer-events-none absolute top-1/2 left-1 z-10 -translate-y-1/2 text-[10px] leading-none opacity-70'
          aria-hidden
        >
          🧱
        </span>
      ) : null}
      {visiblePieces.length > 0 ? (
        <ColoredPhraseBreakdown
          pieces={visiblePieces}
          languageSelectedState={languageSelectedState}
          testId='learning-screen-review-sentence-target-lang'
          pinyinTestId='learning-screen-review-sentence-pinyin'
        />
      ) : (
        <span
          data-testid='learning-screen-review-sentence-target-lang'
          className='text-base text-white'
        >
          {targetLang}
        </span>
      )}
      {wordMeanings.length > 0 ? (
        <span
          data-testid='learning-screen-review-sentence-word-meanings'
          className='mt-0.5 flex flex-wrap justify-center gap-x-1 text-xs leading-tight'
        >
          {wordMeanings.map((piece) => (
            <span
              key={`${piece.surfaceForm}-${piece.index}`}
              style={{ color: getColorByIndex(piece.index) }}
            >
              {piece.meaning}
            </span>
          ))}
        </span>
      ) : null}
      {showEnglish && english ? (
        <span
          data-testid='learning-screen-review-sentence-base-lang'
          className={`mt-0.5 block text-xs leading-tight ${PLAYBACK_CAPTION_SECONDARY_TEXT_CLASS}`}
        >
          {english}
        </span>
      ) : null}
    </>
  );
};

export default ReviewSentenceOverlayText;
