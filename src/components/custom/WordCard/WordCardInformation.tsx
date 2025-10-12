import clsx from 'clsx';

const WordCardInformation = ({
  openContentState,
  baseForm,
  surfaceForm,
  phonetic,
  transliteration,
  definition,
}) => {
  {
    /* {!previewImage && ( */
  }
  return (
    <div
      className={clsx(
        !openContentState ? 'blur-xs' : '',
        'flex flex-col gap-1 mb-4 flex-wrap',
      )}
    >
      {baseForm && (
        <span className='text-sm font-medium my-auto'>
          BaseForm: {baseForm}
        </span>
      )}
      {surfaceForm && (
        <span className='text-sm font-medium'>Surface Form: {surfaceForm}</span>
      )}
      {phonetic && (
        <span className='text-sm font-medium'>Phonetic: {phonetic}</span>
      )}
      {transliteration && (
        <span className='text-sm font-medium'>
          Transliteration: {transliteration}
        </span>
      )}
      {definition && (
        <span className='text-sm font-medium'>Definition: {definition}</span>
      )}
    </div>
  );
};
{
  /* )} */
}

export default WordCardInformation;
