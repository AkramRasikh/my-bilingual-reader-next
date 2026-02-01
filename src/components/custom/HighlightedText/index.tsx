import AnimationWrapper from '../AnimationWrapper';
import HighlightedTextFocus from './HighlightedTextFocus';
import HighlightedTextActions from './HighlightedTextActions';
import clsx from 'clsx';

const HighlightedText = ({
  isLoadingState,
  handleSaveFunc,
  highlightedTextState,
}) => (
  <AnimationWrapper
    data-testid='highlighted-text-container'
    className='m-auto mt-1.5 flex gap-2.5 justify-end'
  >
    <HighlightedTextFocus
      highlightedTextState={highlightedTextState}
      isLoadingState={isLoadingState}
    />
    <div className={clsx('flex gap-1.5', isLoadingState ? 'opacity-25' : '')}>
      <HighlightedTextActions
        handleSaveFunc={handleSaveFunc}
        isLoadingState={isLoadingState}
      />
    </div>
  </AnimationWrapper>
);

export default HighlightedText;
