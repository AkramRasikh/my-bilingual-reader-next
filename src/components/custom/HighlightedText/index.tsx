import AnimationWrapper from '../AnimationWrapper';
import HighlightedTextFocus from './HighlightedTextFocus';
import LoadingSpinner from '../LoadingSpinner';
import HighlightedTextActions from './HighlightedTextActions';

const HighlightedText = ({
  isLoadingState,
  handleSaveFunc,
  setHighlightedTextState,
  highlightedTextState,
}) => (
  <AnimationWrapper className='m-auto mt-1.5 flex gap-2.5 justify-end'>
    <HighlightedTextFocus highlightedTextState={highlightedTextState} />
    <div className='flex gap-1.5 relative'>
      {isLoadingState && (
        <div className='absolute inset-0 flex items-center justify-center bg-white/70 rounded'>
          <LoadingSpinner />
        </div>
      )}
      <HighlightedTextActions
        handleSaveFunc={handleSaveFunc}
        setHighlightedTextState={setHighlightedTextState}
        isLoadingState={isLoadingState}
      />
    </div>
  </AnimationWrapper>
);

export default HighlightedText;
