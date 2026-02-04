import WordCard from '@/components/custom/WordCard';
import useLearningScreen from '../useLearningScreen';
import { TabsContent } from '@radix-ui/react-tabs';
import { useFetchData } from '@/app/Providers/FetchDataProvider';

const LearningScreenTabWords = () => {
  const {
    wordsForSelectedTopic,
    playFromThisContext,
    masterPlay,
    handlePause,
    isVideoPlaying,
  } = useLearningScreen();
  const {
    updateWordDataProvider,
    languageSelectedState,
    addImageDataProvider,
  } = useFetchData();



  return (
    <TabsContent value='words' className={'p-1 max-h-150 overflow-y-auto'}>
      <div className='text-center m-auto p-1.5'>
        <ul className='flex flex-wrap gap-2.5 justify-center'>
          {wordsForSelectedTopic.map((word, index) => {
            const wordContextIsPlaying =
              isVideoPlaying && word?.contexts?.[0] === masterPlay;

            return (
              <li key={word.id}>
                <WordCard
                  {...word}
                  indexNum={index + 1}
                  updateWordData={updateWordDataProvider}
                  addImageDataProvider={addImageDataProvider}
                  playFromThisContext={playFromThisContext}
                  languageSelectedState={languageSelectedState}
                  wordContextIsPlaying={wordContextIsPlaying}
                  handlePause={handlePause}
                />
              </li>
            );
          })}
        </ul>
      </div>
    </TabsContent>
  );
};

export default LearningScreenTabWords;
