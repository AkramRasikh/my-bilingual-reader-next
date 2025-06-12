const colors = [
  '#1f77b4',
  '#ff7f0e',
  '#2ca02c',
  '#d62728',
  '#9467bd',
  '#8c564b',
  '#e377c2',
  '#7f7f7f',
  '#bcbd22',
  '#17becf',
];

function getColorByIndex(index) {
  return colors[index % colors.length];
}

const SentenceBreakdown = ({
  vocab,
  meaning,
  thisSentencesSavedWords,
  handleSaveFunc,
}) => {
  return (
    <div>
      <ul className='flex flex-wrap gap-2'>
        {vocab.map(({ surfaceForm, meaning }, index) => {
          const wordIsSaved = thisSentencesSavedWords?.some(
            (item) => item.text === surfaceForm,
          );
          return (
            <li key={index}>
              <div
                className='flex flex-col'
                style={{
                  color: getColorByIndex(index),
                }}
              >
                <span className='m-auto'>{surfaceForm}</span>
                <span className='m-auto'>{meaning}</span>
                {!wordIsSaved && (
                  <div className='flex gap-1.5 m-auto'>
                    <button
                      className='border'
                      style={{
                        padding: 5,
                        borderRadius: 5,
                      }}
                      onClick={() =>
                        handleSaveFunc(false, surfaceForm, meaning)
                      }
                    >
                      <img
                        src='/deepseek.png'
                        alt='Deepseek logo'
                        className='h-2'
                      />
                    </button>
                    <button
                      className='border'
                      style={{
                        padding: 5,
                        borderRadius: 5,
                      }}
                      onClick={() => handleSaveFunc(true, surfaceForm, meaning)}
                    >
                      <img
                        src='/google.png'
                        alt='Google logo'
                        className='h-2'
                      />
                    </button>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      <p>Translation: {meaning}</p>
    </div>
  );
};

export default SentenceBreakdown;
