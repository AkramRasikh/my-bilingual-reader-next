import AnimationWrapper from '../AnimationWrapper';

const WordCardInformation = ({
  baseForm,
  surfaceForm,
  phonetic,
  transliteration,
  definition,
}) => (
  <AnimationWrapper>
    <div className={'flex flex-col gap-1 mb-2 flex-wrap items-start'}>
      {baseForm && (
        <span className='text-sm text-left font-medium my-auto'>
          BaseForm: {baseForm}
        </span>
      )}
      {surfaceForm && (
        <span className='text-sm text-left font-medium'>
          Surface Form: {surfaceForm}
        </span>
      )}
      {phonetic && (
        <span className='text-sm text-left font-medium'>
          Phonetic: {phonetic}
        </span>
      )}
      {transliteration && (
        <span className='text-sm text-left font-medium'>
          Transliteration: {transliteration}
        </span>
      )}
      {definition && (
        <span className='text-sm text-left font-medium'>
          Definition: {definition}
        </span>
      )}
    </div>
  </AnimationWrapper>
);

export default WordCardInformation;
