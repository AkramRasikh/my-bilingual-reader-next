import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LucideWand2, LucideLoader2 } from 'lucide-react';
import { AdhocSentenceCustomWordCallTypes } from '@/app/Providers/FetchDataProvider';

interface WordCardGenerateSentenceProps {
  adhocSentenceCustomWord: (
    params: AdhocSentenceCustomWordCallTypes,
  ) => Promise<void>;
}

const WordCardGenerateSentence = ({
  id,
  adhocSentenceCustomWord,
  getSentenceFromContextId,
  surfaceForm,
  originalContextId,
}: WordCardGenerateSentenceProps) => {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const contextData = getSentenceFromContextId(originalContextId);
      await adhocSentenceCustomWord({
        id,
        inputWord: surfaceForm,
        context: contextData,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={'secondary'}
      className={`h-3 w-3 p-3 bg-gray-200 ${loading ? 'animate-pulse' : ''}`}
      onDoubleClick={handleClick}
      disabled={loading}
      data-testid='word-card-generate-sentence'
    >
      {loading ? <LucideLoader2 className='animate-spin' /> : <LucideWand2 />}
    </Button>
  );
};

export default WordCardGenerateSentence;
