import PageContainer from '@/components/custom/PageContainer';
import { useWordsStudyUIScreen } from './WordsStudyUIProvider';
import WordCard from '@/components/custom/WordCard';
import WordsStudyUIMediaElement from './WordsStudyUIMediaElement';
import clsx from 'clsx';
import { useFetchData } from '../Providers/FetchDataProvider';
import WordsStudyUIUnifiedAnalytics from './WordsStudyUIUnifiedAnalytics';
import WordsStudyUIActions from './WordsStudyUIActions';

const WordsStudyUI = () => {
  const {
    formattedWordsStudyState,
    setSelectedElState,
    selectedElState,
    updateWordDataWordsStudyUI,
  } = useWordsStudyUIScreen();

  const { languageSelectedState } = useFetchData();

  return (
    <PageContainer>
      <div className='flex flex-row gap-2 mx-auto max-w-6xl'>
        <WordsStudyUIUnifiedAnalytics />
        <div className='flex justify-around gap-3'>
          <div className='w-1/2 flex flex-col gap-2 min-w-lg'>
            <WordsStudyUIActions />
            <WordsStudyUIMediaElement />
          </div>
          <div className='flex flex-col gap-2 w-1/2'>
            {formattedWordsStudyState.map((wordItem, index) => {
              const thisIsSelected = selectedElState === index;

              if (index === 0) {
                console.log('## wordItem', wordItem);
              }
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
                    playFromThisContext={() => setSelectedElState(index)}
                    languageSelectedState={languageSelectedState}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default WordsStudyUI;
