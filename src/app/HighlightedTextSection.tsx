import LoadingSpinner from './LoadingSpinner';

const HighlightedTextSection = ({
  isLoadingState,
  handleSaveFunc,
  setHighlightedTextState,
  highlightedTextState,
}) => {
  return (
    <div
      style={{
        margin: 'auto',
        marginTop: 5,
        display: 'flex',
        gap: 10,
        justifyContent: 'flex-end',
      }}
    >
      <p
        style={{
          textAlign: 'right',
          display: 'flex',
          gap: 10,
          alignItems: 'center',
        }}
      >
        Highlighted word: {highlightedTextState}{' '}
      </p>
      <div className='flex gap-1.5 relative'>
        {isLoadingState && (
          <div className='absolute inset-0 flex items-center justify-center bg-white/70 rounded'>
            <LoadingSpinner />
          </div>
        )}
        <div className='flex gap-1.5 m-auto'>
          <button
            className='border'
            style={{
              padding: 5,
              borderRadius: 5,
            }}
            onClick={() => handleSaveFunc(false)}
          >
            <img src='/deepseek.png' alt='Deepseek logo' className='h-5' />
          </button>
          <button
            className='border'
            style={{
              padding: 5,
              borderRadius: 5,
            }}
            onClick={() => handleSaveFunc(true)}
          >
            <img src='/google.png' alt='Google logo' className='h-5' />
          </button>
          <button
            style={{ padding: 5, background: 'grey', borderRadius: 5 }}
            onClick={() => setHighlightedTextState('')}
          >
            CLEAR
          </button>
        </div>
      </div>
    </div>
  );
};

export default HighlightedTextSection;
