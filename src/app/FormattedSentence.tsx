const FormattedSentence = ({
  ref,
  targetLangformatted,
  handleMouseLeave,
  handleMouseEnter,
}) => {
  return (
    <span ref={ref} className='mt-auto mb-auto'>
      {targetLangformatted.map((item, indexNested) => {
        const isUnderlined = item?.style?.textDecorationLine;
        const text = item?.text;
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
