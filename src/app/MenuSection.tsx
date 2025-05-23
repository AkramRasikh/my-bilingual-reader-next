'use client';

const MenuSection = ({
  contentItem,
  setShowSentenceBreakdownState,
  showSentenceBreakdownState,
}) => {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(contentItem.targetLang);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const hasBeenReviewed = contentItem?.reviewData?.due;
  return (
    <div className='flex gap-8 justify-center border-t-1 pt-1.5'>
      {contentItem?.sentenceStructure && !showSentenceBreakdownState ? (
        <div className='mt-auto mb-auto'>
          <button onClick={() => setShowSentenceBreakdownState(true)}>
            🔨
          </button>
        </div>
      ) : contentItem?.sentenceStructure ? (
        <div>
          <button onClick={() => setShowSentenceBreakdownState(false)}>
            close
          </button>
        </div>
      ) : null}
      {hasBeenReviewed && <button>Reviewed!</button>}
      <button
        className='border rounded-lg p-1 transition active:scale-95 cursor-pointer'
        onClick={handleCopy}
      >
        Copy
      </button>
    </div>
  );
};

export default MenuSection;
