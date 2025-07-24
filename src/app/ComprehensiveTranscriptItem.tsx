import FormattedSentence from './FormattedSentence';
import PopUpWordCard from './PopUpWordCard';
import { NewSentenceBreakdown } from './SentenceBreakdown';

const ComprehensiveTranscriptItem = ({
  contentItem,
  thisSentencesSavedWords,
  wordPopUpState,
  setWordPopUpState,
  handleMouseLeave,
  handleMouseEnter,
}) => {
  const hasSentenceBreakdown = contentItem?.sentenceStructure;
  const baseLang = contentItem?.baseLang;
  const targetLangformatted = contentItem.targetLangformatted;

  return (
    <div className='rounded border-2 p-2 mt-2 flex flex-col gap-2'>
      <FormattedSentence
        // ref={ulRef}
        targetLangformatted={targetLangformatted}
        handleMouseLeave={handleMouseLeave}
        handleMouseEnter={handleMouseEnter}
      />
      <p>{baseLang}</p>
      {hasSentenceBreakdown && (
        <>
          <hr className='bg-gray-500' />
          <NewSentenceBreakdown
            vocab={contentItem.vocab}
            meaning={contentItem.meaning}
            thisSentencesSavedWords={thisSentencesSavedWords}
            sentenceStructure={contentItem.sentenceStructure}
            // handleSaveFunc={handleSaveFunc}
          />
        </>
      )}

      {wordPopUpState?.length > 0 ? (
        <ul>
          {wordPopUpState?.map((item) => (
            <li key={item.id}>
              <PopUpWordCard
                word={item}
                onClose={() => setWordPopUpState([])}
                // handleDelete={handleDeleteFunc}
              />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
};

export default ComprehensiveTranscriptItem;
