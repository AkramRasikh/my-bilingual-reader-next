import PageContainer from '@/components/custom/PageContainer';
import { useWordsStudyUIScreen } from './WordsStudyUIProvider';
import LoadingSpinner from '@/components/custom/LoadingSpinner';
import WordCard from '@/components/custom/WordCard';
import useData from '../Providers/useData';
import WordsStudyUIMediaElement from './WordsStudyUIMediaElement';
import clsx from 'clsx';

const WordsStudyUI = () => {
  const {
    formattedWordsStudyState,
    setSelectedElState,
    selectedElState,
    wordsToReviewOnMountState,
  } = useWordsStudyUIScreen();
  const { updateWordDataProvider, wordsForReviewState } = useData();

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
      <h2 className='text-center mb-4'>
        {wordsToReviewOnMountState - wordsForReviewState.length}/
        {wordsForReviewState.length} Studied
      </h2>
      <div className='flex justify-around gap-3'>
        <WordsStudyUIMediaElement />
        <div className='flex flex-col gap-2 w-fit'>
          {formattedWordsStudyState.map((wordItem, index) => {
            const thisIsSelected = selectedElState === index;
            return (
              <div
                key={wordItem.id}
                className={clsx(
                  thisIsSelected ? 'border border-black rounded-2xl w-fit' : '',
                )}
              >
                <WordCard
                  indexNum={index + 1}
                  {...wordItem}
                  updateWordData={updateWordDataProvider}
                  playFromThisContext={() => setSelectedElState(index)}
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
