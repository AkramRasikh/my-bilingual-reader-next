import clsx from 'clsx';

const SentenceBreakdownTargetLangWord = ({
  color,
  wordIsSaved,
  surfaceForm,
}) => {
  return (
    <span>
      <span
        className={clsx(wordIsSaved && 'underline')}
        style={{
          color,
        }}
      >
        {surfaceForm}
      </span>
    </span>
  );
};

export default SentenceBreakdownTargetLangWord;
