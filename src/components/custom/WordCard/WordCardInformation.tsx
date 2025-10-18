import AnimationWrapper from '../AnimationWrapper';

const WordCardInformation = ({
  baseForm,
  surfaceForm,
  phonetic,
  transliteration,
  definition,
}) => {
  const wordDataArr = [
    { preText: 'BaseForm', text: baseForm },
    { preText: 'Surface Form', text: surfaceForm },
    { preText: 'Phonetic', text: phonetic },
    { preText: 'Transliteration', text: transliteration },
    { preText: 'Definition', text: definition },
  ];

  return (
    <AnimationWrapper>
      <div className={'flex flex-col gap-1 mb-2 flex-wrap items-start'}>
        {wordDataArr.map((wordData, index) => {
          return (
            wordData.text && (
              <span key={index} className='text-sm text-left font-medium'>
                {wordData.preText}: {wordData.text}
              </span>
            )
          );
        })}
      </div>
    </AnimationWrapper>
  );
};

export default WordCardInformation;
