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
  showEnglish: boolean;
  vocab?: Vocab[];
  sentenceStructure?: string;
  languageSelectedState: string;
};

const ReviewSentenceOverlayText = ({
  targetLang,
  baseLang,
  showEnglish,
  vocab,
  sentenceStructure,
  languageSelectedState,
}: ReviewSentenceOverlayTextProps) => {
  const hasBreakdown = Boolean(sentenceStructure);
  const pieces: PhraseBreakdownPiece[] = hasBreakdown
    ? (vocab ?? []).flatMap((item, index) => {
        const surfaceForm = item.surfaceForm?.trim();
        return surfaceForm ? [{ surfaceForm, index }] : [];
      })
    : [];

  return (
    <>
      {pieces.length > 0 ? (
        <ColoredPhraseBreakdown
          pieces={pieces}
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
      {showEnglish && baseLang ? (
        <span
          data-testid='learning-screen-review-sentence-base-lang'
          className={`mt-0.5 block text-xs leading-tight ${PLAYBACK_CAPTION_SECONDARY_TEXT_CLASS}`}
        >
          {baseLang}
        </span>
      ) : null}
    </>
  );
};

export default ReviewSentenceOverlayText;
