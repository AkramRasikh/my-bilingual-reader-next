import clsx from 'clsx';

const SentenceBreakdownTargetLangWord = ({
  color,
  wordIsSaved,
  surfaceForm,
}) => (
  <span
    className={clsx(wordIsSaved && 'underline')}
    style={{
      color,
    }}
  >
    {surfaceForm}
  </span>
);

export default SentenceBreakdownTargetLangWord;
