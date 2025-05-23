const SentenceBreakdown = ({
  vocab,
  meaning,
  sentenceStructure,
  showSentenceBreakdownState,
  setShowSentenceBreakdownState,
}) => {
  if (!showSentenceBreakdownState) {
    return (
      <button onClick={() => setShowSentenceBreakdownState(true)}>🔨</button>
    );
  }

  return (
    <div>
      <div
        className='border-b-1 m-1'
        style={{ display: 'flex', justifyContent: 'space-around' }}
      >
        <button
          onClick={() => setShowSentenceBreakdownState(false)}
          style={{ marginBottom: 'auto' }}
        >
          ❌
        </button>
        <div
          style={{
            display: 'flex',
          }}
        >
          <ul>
            {vocab?.map(({ surfaceForm, meaning }, index) => {
              const leftSideText = (index + 1).toString() + ') ' + surfaceForm;
              return (
                <li key={index}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 10,
                    }}
                  >
                    <span>{leftSideText}</span> <span>{meaning}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      <p>{meaning}</p>
      <p>{sentenceStructure}</p>
    </div>
  );
};

export default SentenceBreakdown;
