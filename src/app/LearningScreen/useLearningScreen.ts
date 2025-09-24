import { useContext } from 'react';
import { LearningScreenContext } from './LearningScreenProvider';

const useLearningScreen = () => {
  const context = useContext(LearningScreenContext);

  if (!context)
    throw new Error(
      'useLearningScreen must be used within a LearningScreenProvider',
    );

  return context;
};

export default useLearningScreen;
