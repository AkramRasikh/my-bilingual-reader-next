import clsx from 'clsx';
import { pinyin } from 'pinyin-pro';
import { chinese } from '@/app/languages';

const SentenceBreakdownTargetLangWord = ({
  color,
  wordIsSaved,
  surfaceForm,
  isSnippetReview,
  languageSelectedState,
}) => {
  const showPinyin = isSnippetReview && languageSelectedState === chinese;
  const pinyinText = showPinyin
    ? pinyin(surfaceForm, { toneType: 'symbol' })
    : '';

  return (
    <span
      className={showPinyin ? 'inline-flex flex-col items-center' : undefined}
    >
      <span
        className={clsx(wordIsSaved && 'underline')}
        style={{
          color,
        }}
      >
        {surfaceForm}
      </span>
      {showPinyin && (
        <span className='text-[12px]' style={{ color }}>
          {pinyinText}
        </span>
      )}
    </span>
  );
};

export default SentenceBreakdownTargetLangWord;
