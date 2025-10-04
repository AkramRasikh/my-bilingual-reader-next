import getColorByIndex from '@/utils/get-color-by-index';
import SentenceBreakdownHover from './SentenceBreakdownHover';
import SentenceBreakdownTargetLangWord from './SentenceBreakdownTargetLangWord';

const SentenceBreakdownTargetLang = ({
  vocab,
  thisSentencesSavedWords,
  handleSaveFunc,
  handleAddIndexToArr,
  handleOnMouseExit,
}) => {
  return (
    <ul className='flex flex-wrap'>
      {vocab.map(({ surfaceForm, meaning }, index) => {
        const wordIsSaved = thisSentencesSavedWords?.some(
          (item) => item.text === surfaceForm,
        );

        const color = getColorByIndex(index);

        return (
          <li
            key={index}
            id={`vocab-${index}`}
            className='relative'
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
          </li>
        );
      })}
    </ul>
  );
};

export default SentenceBreakdownTargetLang;
