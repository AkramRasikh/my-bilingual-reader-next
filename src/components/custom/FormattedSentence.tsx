import HoverWordCard from '@/components/custom/HoverWordCard';

const FormattedSentence = ({
  ref,
  targetLangformatted,
  handleMouseLeave,
  handleMouseEnter,
  wordPopUpState,
  setWordPopUpState,
  wordsForSelectedTopic,
  handleDeleteWordDataProvider,
  wordsFromSentence,
}) => {
  return (
    <span ref={ref} className='mt-auto mb-auto'>
      {targetLangformatted.map((item, indexNested) => {
        const isUnderlined = item?.style?.textDecorationLine;
        const text = item?.text;
        if (isUnderlined) {
          return (
            <HoverWordCard
              key={indexNested}
              text={text}
              wordPopUpState={wordPopUpState}
              setWordPopUpState={setWordPopUpState}
              wordsForSelectedTopic={wordsForSelectedTopic}
              handleDeleteWordDataProvider={handleDeleteWordDataProvider}
              wordsFromSentence={wordsFromSentence}
            />
          );
        }
        return (
          <span
            key={indexNested}
            onMouseEnter={
              isUnderlined ? () => handleMouseEnter?.(text) : () => {}
            }
            onMouseLeave={handleMouseLeave}
            style={{
              textDecorationLine: isUnderlined ? 'underline' : 'none',
            }}
          >
            {text}
          </span>
        );
      })}
    </span>
  );
};

export default FormattedSentence;
