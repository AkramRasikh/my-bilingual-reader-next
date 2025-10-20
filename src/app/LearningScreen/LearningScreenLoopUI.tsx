import useLearningScreen from './useLearningScreen';
import LoopIndicatorWithProgress from '@/components/custom/LoopIndicatorWithProgress';

const LearningScreenLoopUI = () => {
  const {
    ref,
    threeSecondLoopState,
    progress,
    setProgress,
    contractThreeSecondLoopState,
  } = useLearningScreen();

  return (
    <LoopIndicatorWithProgress
      ref={ref}
      threeSecondLoopState={threeSecondLoopState}
      progress={progress}
      setProgress={setProgress}
      contractThreeSecondLoopState={contractThreeSecondLoopState}
    />
  );
};

export default LearningScreenLoopUI;
