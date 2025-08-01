import { useContext } from 'react';
import { WordsContext } from './WordsProvider';

const useWords = () => {
  const context = useContext(WordsContext);

  if (!context) throw new Error('useWords must be used within a WordsProvider');

  return context;
};

export default useWords;
