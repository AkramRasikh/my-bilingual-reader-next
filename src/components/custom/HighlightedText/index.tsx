import AnimationWrapper from '../AnimationWrapper';
import HighlightedTextFocus from './HighlightedTextFocus';
import HighlightedTextActions from './HighlightedTextActions';

const HighlightedText = ({
  isLoadingState,
  handleSaveFunc,
  setHighlightedTextState,
  highlightedTextState,
}) => (
  <AnimationWrapper className='m-auto mt-1.5 flex gap-2.5 justify-end'>
    <HighlightedTextFocus highlightedTextState={highlightedTextState} />
    <div className='flex gap-1.5'>
      <HighlightedTextActions
        handleSaveFunc={handleSaveFunc}
        setHighlightedTextState={setHighlightedTextState}
        isLoadingState={isLoadingState}
      />
    </div>
  </AnimationWrapper>
);

export default HighlightedText;
