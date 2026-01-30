import getColorByIndex from '@/utils/get-color-by-index';
import SentenceBreakdownHover from './SentenceBreakdownHover';
import SentenceBreakdownTargetLangWord from './SentenceBreakdownTargetLangWord';
import { arabic, isTrimmedLang } from '@/app/languages';
import clsx from 'clsx';

const SentenceBreakdownTargetLang = ({
  vocab,
  thisSentencesSavedWords,
  handleSaveFunc,
  handleAddIndexToArr,
  handleOnMouseExit,
  languageSelectedState,
}) => {
  const isArabic = languageSelectedState === arabic;
  const addSpace = !isTrimmedLang(languageSelectedState);

  return (
    <ul
      data-testid='sentence-breakdown-target-lang'
      className={clsx('flex flex-wrap', isArabic ? 'text-right' : '')}
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      {vocab.map(({ surfaceForm, meaning }, index) => {
        const wordIsSaved = thisSentencesSavedWords?.some(
          (item) =>
            item.surfaceForm === surfaceForm || item.baseForm === surfaceForm,
        );

        const color = getColorByIndex(index);

        return (
          <li
            key={index}
            id={`vocab-${index}`}
            onMouseEnter={() => handleAddIndexToArr(index)}
            onMouseLeave={() => handleOnMouseExit(index)}
          >
            {wordIsSaved ? (
              <SentenceBreakdownTargetLangWord
                color={color}
                wordIsSaved={wordIsSaved}
                surfaceForm={surfaceForm}
              />
            ) : (
              <SentenceBreakdownHover
                handleSaveFunc={handleSaveFunc}
                surfaceForm={surfaceForm}
                meaning={meaning}
                color={color}
                wordIsSaved={wordIsSaved}
              />
            )}
            {addSpace && '\u00A0'}
          </li>
        );
      })}
    </ul>
  );
};

export default SentenceBreakdownTargetLang;
