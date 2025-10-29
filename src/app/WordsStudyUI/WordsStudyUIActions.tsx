import CountUpTimer from '@/components/custom/CountUpTimer';
import { useWordsStudyUIScreen } from './WordsStudyUIProvider';

const WordsStudyUIActions = () => {
  const { elapsed, setElapsed } = useWordsStudyUIScreen();

  return (
    <div className='mx-auto flex flex-row my-1 justify-center gap-2'>
      <CountUpTimer elapsed={elapsed} setElapsed={setElapsed} />
    </div>
  );
};

export default WordsStudyUIActions;
