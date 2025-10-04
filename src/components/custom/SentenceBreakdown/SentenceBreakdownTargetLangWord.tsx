import clsx from 'clsx';

const SentenceBreakdownTargetLangWord = ({
  color,
  wordIsSaved,
  surfaceForm,
}) => (
  <div
    className={clsx('flex gap-0.5 flex-col')}
    style={{
      color,
    }}
  >
    <span className={clsx(wordIsSaved && 'underline', 'm-auto')}>
      {surfaceForm}
    </span>
  </div>
);

export default SentenceBreakdownTargetLangWord;
