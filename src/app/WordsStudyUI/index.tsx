import PageContainer from '@/components/custom/PageContainer';
import { useWordsStudyUIScreen } from './WordsStudyUIProvider';
import LoadingSpinner from '@/components/custom/LoadingSpinner';
import WordCard from '@/components/custom/WordCard';
import useData from '../Providers/useData';
import WordsStudyUIMediaElement from './WordsStudyUIMediaElement';
import clsx from 'clsx';
import { useFetchData } from '../Providers/FetchDataProvider';

const WordsStudyUI = () => {
  const { formattedWordsStudyState, setSelectedElState, selectedElState } =
    useWordsStudyUIScreen();
  const { updateWordDataProvider } = useData();
  const { languageSelectedState } = useFetchData();
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
      <div className='flex justify-around gap-3 max-w-6xl mx-auto'>
        <WordsStudyUIMediaElement />
        <div className='flex flex-col gap-2 w-1/2'>
          {formattedWordsStudyState.map((wordItem, index) => {
            const thisIsSelected = selectedElState === index;
            return (
              <div
                key={wordItem.id}
                className={clsx(
                  thisIsSelected ? 'border border-black rounded-2xl w-fit' : '',
                  'mx-auto',
                )}
              >
                <WordCard
                  indexNum={index + 1}
                  {...wordItem}
                  updateWordData={updateWordDataProvider}
                  playFromThisContext={() => setSelectedElState(index)}
                  languageSelectedState={languageSelectedState}
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
