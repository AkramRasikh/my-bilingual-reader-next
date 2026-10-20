import AnimationWrapper from '../AnimationWrapper';
import HighlightedTextFocus from './HighlightedTextFocus';
import HighlightedTextActions from './HighlightedTextActions';
import clsx from 'clsx';

const HighlightedText = ({
  isLoadingState,
  handleSaveFunc,
  highlightedTextState,
  focusIcons = false,
}: {
  isLoadingState?: boolean;
  handleSaveFunc: (isGoogle: boolean) => void;
  highlightedTextState: string;
  focusIcons?: boolean;
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
        focusIcons={focusIcons}
      />
    </div>
  </AnimationWrapper>
);

export default HighlightedText;
