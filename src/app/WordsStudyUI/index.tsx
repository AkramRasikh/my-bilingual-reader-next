import PageContainer from '@/components/custom/PageContainer';
import { useWordsStudyUIScreen } from './WordsStudyUIProvider';
import LoadingSpinner from '@/components/custom/LoadingSpinner';
import WordCard from '@/components/custom/WordCard';
import WordsStudyUIMediaElement from './WordsStudyUIMediaElement';
import clsx from 'clsx';
import { useFetchData } from '../Providers/FetchDataProvider';
import WordsStudyUIUnifiedAnalytics from './WordsStudyUIUnifiedAnalytics';

const WordsStudyUI = () => {
  const {
    formattedWordsStudyState,
    setSelectedElState,
    selectedElState,
    updateWordDataWordsStudyUI,
    playFromThisContext,
  } = useWordsStudyUIScreen();

  const { languageSelectedState } = useFetchData();
  const hasWords = formattedWordsStudyState?.length > 0;
  if (!hasWords) {
    return (
      <div>
        <h1 className='text-center'>Words study</h1>
        <LoadingSpinner big />
      </div>
    );
  }

  return (
    <div>
      <div className='flex flex-row gap-2 mx-auto max-w-6xl'>
        <WordsStudyUIUnifiedAnalytics />
        <div className='flex justify-around gap-3'>
          <div className='w-1/2 flex flex-col gap-2 min-w-lg'>
            <WordsStudyUIMediaElement />
          </div>
          <div className='flex flex-col gap-2 w-1/2'>
            {formattedWordsStudyState.map((wordItem, index) => {
              const thisIsSelected = selectedElState === index;
              return (
                <div
                  key={wordItem.id}
                  className={clsx(
                    thisIsSelected
                      ? 'border border-black rounded-2xl w-fit'
                      : '',
                    'mx-auto',
                  )}
                >
                  <WordCard
                    indexNum={index + 1}
                    {...wordItem}
                    updateWordData={updateWordDataWordsStudyUI}
                    playFromThisContext={
                      !thisIsSelected
                        ? () => setSelectedElState(index)
                        : playFromThisContext
                    }
                    languageSelectedState={languageSelectedState}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WordsStudyUI;
