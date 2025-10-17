import PageContainer from '@/components/custom/PageContainer';
import { useWordsStudyUIScreen } from './WordsStudyUIProvider';
import LoadingSpinner from '@/components/custom/LoadingSpinner';
import WordCard from '@/components/custom/WordCard';
import useData from '../Providers/useData';
import WordsStudyUIMediaElement from './WordsStudyUIMediaElement';

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
      <div className='flex justify-around gap-3'>
        <WordsStudyUIMediaElement />
        <div className='flex flex-col gap-2'>
          {formattedWordsStudyState.map((wordItem, index) => {
            return (
              <div key={wordItem.id}>
                <WordCard
                  indexNum={index + 1}
                  {...wordItem}
                  updateWordData={updateWordDataProvider}
                />
              </div>
            );
          })}
        </div>
      </div>
    </PageContainer>
  );
};

export default WordsStudyUI;
