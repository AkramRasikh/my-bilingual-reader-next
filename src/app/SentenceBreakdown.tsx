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
    <div
      style={{
        display: 'flex',
        justifyContent: 'right',
      }}
    >
      <button onClick={() => setShowSentenceBreakdownState(false)}>❌</button>
      <ul>
        {vocab?.map(({ surfaceForm, meaning }, index) => {
          return (
            <li key={index}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 10,
                }}
              >
                <span>{surfaceForm}</span> <span>{meaning}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default SentenceBreakdown;
