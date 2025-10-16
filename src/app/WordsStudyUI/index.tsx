import PageContainer from '@/components/custom/PageContainer';
import { useWordsStudyUIScreen } from './WordsStudyUIProvider';
import LoadingSpinner from '@/components/custom/LoadingSpinner';
import WordCard from '@/components/custom/WordCard';
import useData from '../Providers/useData';

const WordsStudyUI = () => {
  const { formattedWordsStudyState } = useWordsStudyUIScreen();
  const { updateWordDataProvider } = useData();

  const hasWords = formattedWordsStudyState?.length > 0;
  if (!hasWords) {
    return (
      <PageContainer>
        <h1>Words study</h1>
        <LoadingSpinner big />
      </PageContainer>
    );
  }
  return (
    <PageContainer>
      <h1>Word Study</h1>
      <div className='flex justify-around'>
        <div>Audio/Video component</div>
        <div>
          {formattedWordsStudyState.map((wordItem, index) => {
            return (
              <div key={wordItem.id}>
                <WordCard
                  indexNum={index + 1}
                  {...wordItem}
                  updateWordData={updateWordDataProvider}
                />
                <span>Number of contexts: {wordItem.contextData.length}</span>
              </div>
            );
          })}
        </div>
      </div>
    </PageContainer>
  );
};

export default WordsStudyUI;
