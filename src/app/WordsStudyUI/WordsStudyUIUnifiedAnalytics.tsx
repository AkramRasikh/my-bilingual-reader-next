import { Button } from '@/components/ui/button';
import { HistoryIcon } from 'lucide-react';
import { useWordsStudyUIScreen } from './WordsStudyUIProvider';
import { useEffect, useRef, useState } from 'react';

const WordsStudyUIUnifiedAnalytics = () => {
  const [wordsRepsPerMinState, setWordsRepsPerMinState] = useState<
    string | null
  >(null);
  const { wordsRepsState, setWordsRepsState, elapsed } =
    useWordsStudyUIScreen();

  const handleClearReps = () => {
    setWordsRepsState(0);
  };

  const prevValueWordssRef = useRef(wordsRepsState);

  useEffect(() => {
    if (elapsed > 0 && wordsRepsState !== prevValueWordssRef.current) {
      prevValueWordssRef.current = wordsRepsState;
      const perMinute = (wordsRepsState / elapsed) * 60;
      setWordsRepsPerMinState(perMinute.toFixed(1));
    }
  }, [wordsRepsState, elapsed]);

  const repsText = `Reps: ${wordsRepsState}`;

  return (
    <div className='flex flex-col gap-2 h-fit'>
      <div className='flex gap-2 w-fit m-auto'>
        <span className='m-auto flex-none text-xs font-medium'>{repsText}</span>
        {wordsRepsState ? (
          <Button
            className='w-5 h-5'
            variant='destructive'
            onClick={handleClearReps}
          >
            <HistoryIcon />
          </Button>
        ) : null}
      </div>
      {wordsRepsPerMinState && (
        <p className='text-xs font-medium m-auto w-fit'>
          Reps/Min: {wordsRepsPerMinState}
        </p>
      )}
    </div>
  );
};

export default WordsStudyUIUnifiedAnalytics;
