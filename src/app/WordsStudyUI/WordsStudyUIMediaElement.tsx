import { useWordsStudyUIScreen } from './WordsStudyUIProvider';
import WordsStudyUIVideoEl from './WordsStudyUIVideoEl';
import WordStudyUIIsolatedSentence from './WordsStudyUIIsolatedSentence';

const WordsStudyUIMediaElement = () => {
  const { formattedWordsStudyState, selectedElState } = useWordsStudyUIScreen();

  const selectedEl = formattedWordsStudyState[selectedElState];
  const contextData = selectedEl.contextData;

  if (!Boolean(contextData?.length)) {
    return <span>No context</span>;
  }

  return (
    <div className='flex flex-col gap-5'>
      {contextData.map((contextDataEl, index) => {
        const isMedia = contextDataEl.isMedia;

        if (isMedia) {
          return (
            <WordsStudyUIVideoEl key={index} contextDataEl={contextDataEl} />
          );
        }

        return (
          <WordStudyUIIsolatedSentence
            key={index}
            contextData={contextDataEl}
          />
        );
      })}
    </div>
  );
};

export default WordsStudyUIMediaElement;
