import { pinyin } from 'pinyin-pro';
import { chinese, isTrimmedLang, LanguageEnum } from '@/app/languages';
import { Vocab } from '@/app/types/content-types';
import getColorByIndex from '@/utils/get-color-by-index';

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
  const pieces = hasBreakdown
    ? (vocab ?? []).flatMap((item) => {
        const surfaceForm = item.surfaceForm?.trim();
        return surfaceForm ? [surfaceForm] : [];
      })
    : [];
  const showColoredPieces = pieces.length > 0;
  const addSpace = !isTrimmedLang(languageSelectedState as LanguageEnum);
  const pinyinPieces =
    languageSelectedState === chinese && showColoredPieces
      ? pieces.map((surfaceForm) =>
          pinyin(surfaceForm, {
            toneType: 'symbol',
            separator: '\u2009',
          }),
        )
      : [];

  return (
    <>
      {showColoredPieces ? (
        <span
          data-testid='learning-screen-review-sentence-target-lang'
          className='flex flex-wrap justify-center text-base'
        >
          {pieces.map((surfaceForm, index) => (
            <span
              key={`${surfaceForm}-${index}`}
              style={{ color: getColorByIndex(index) }}
            >
              {surfaceForm}
              {addSpace ? '\u00A0' : ''}
            </span>
          ))}
        </span>
      ) : (
        <span
          data-testid='learning-screen-review-sentence-target-lang'
          className='text-base'
        >
          {targetLang}
        </span>
      )}
      {pinyinPieces.length > 0 ? (
        <span
          data-testid='learning-screen-review-sentence-pinyin'
          className='mt-0.5 flex flex-wrap justify-center text-xs leading-tight'
        >
          {pinyinPieces.map((syllables, index) => (
            <span
              key={`${syllables}-${index}`}
              style={{ color: getColorByIndex(index) }}
            >
              {index > 0 ? '\u2009' : ''}
              {syllables}
            </span>
          ))}
        </span>
      ) : null}
      {showEnglish && baseLang ? (
        <span
          data-testid='learning-screen-review-sentence-base-lang'
          className='mt-0.5 block text-xs leading-tight'
        >
          {baseLang}
        </span>
      ) : null}
    </>
  );
};

export default ReviewSentenceOverlayText;
