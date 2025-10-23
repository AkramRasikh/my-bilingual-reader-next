import WordCard from '@/components/custom/WordCard';
import useData from '../../Providers/useData';
import useLearningScreen from '../useLearningScreen';
import { TabsContent } from '@radix-ui/react-tabs';
import { useFetchData } from '@/app/Providers/FetchDataProvider';

const LearningScreenTabWords = () => {
  const {
    wordBasketState,
    setWordBasketState,
    updateWordDataProvider,
    addImageDataProvider,
  } = useData();
  const { wordsForSelectedTopic, playFromThisContext } = useLearningScreen();
  const { languageSelectedState } = useFetchData();

  const addWordToBasket = (word) => {
    const wordIsInBasic = wordBasketState.some(
      (wordItem) => wordItem?.id === word.id,
    );

    if (wordIsInBasic) {
      const updatedBasket = wordBasketState.filter(
        (item) => item.id !== word.id,
      );
      setWordBasketState(updatedBasket);
      return;
    }

    setWordBasketState((prev) => [...prev, word]);
  };

  return (
    <TabsContent value='words' className={'p-1 max-h-150 overflow-y-auto'}>
      <div className='text-center m-auto p-1.5'>
        <ul className='flex flex-wrap gap-2.5'>
          {wordsForSelectedTopic.map((word, index) => {
            const isInBasket = wordBasketState?.some((i) => i?.id === word.id);

            return (
              <li key={word.id}>
                <WordCard
                  {...word}
                  indexNum={index + 1}
                  updateWordData={updateWordDataProvider}
                  addWordToBasket={addWordToBasket}
                  isInBasket={isInBasket}
                  addImageDataProvider={addImageDataProvider}
                  playFromThisContext={playFromThisContext}
                  languageSelectedState={languageSelectedState}
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
