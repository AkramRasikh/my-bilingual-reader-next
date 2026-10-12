import { fireEvent, render, screen } from '@testing-library/react';
import LearningScreenUnifiedAnalytics from './LearningScreenUnifiedAnalytics';
import {
  LearningScreenContext,
  LearningScreenContextTypes,
} from './LearningScreenProvider';

function renderAnalytics(isInReviewMode = false) {
  const handleFromHere = jest.fn();
  const setLoopTranscriptState = jest.fn();
  const setThreeSecondLoopState = jest.fn();

  const value = {
    sentenceRepsState: 0,
    wordRepsState: 0,
    snippetRepsState: 0,
    elapsed: 0,
    overlappedSentencesViableForReviewMemoized: [],
    handleAddOverlappedSnippetsToReview: jest.fn(),
    isInReviewMode,
    handleFromHere,
    loopTranscriptState: [],
    setLoopTranscriptState,
    threeSecondLoopState: null,
    setThreeSecondLoopState,
    formattedTranscriptState: [
      { id: 'early', time: 7, reviewData: { due: new Date() } },
      { id: 'later', time: 125, reviewData: { due: new Date() } },
      { id: 'unread', time: 200 },
    ],
  } as unknown as LearningScreenContextTypes;

  render(
    <LearningScreenContext.Provider value={value}>
      <LearningScreenUnifiedAnalytics />
    </LearningScreenContext.Provider>,
  );

  return {
    handleFromHere,
    setLoopTranscriptState,
    setThreeSecondLoopState,
  };
}

describe('checkpoint timestamp', () => {
  it('jumps to the last reviewed sentence outside review mode', () => {
    const {
      handleFromHere,
      setLoopTranscriptState,
      setThreeSecondLoopState,
    } = renderAnalytics(false);

    fireEvent.click(screen.getByRole('button', { name: '🚩 2:05' }));

    expect(handleFromHere).toHaveBeenCalledWith(125);
    expect(setLoopTranscriptState).not.toHaveBeenCalled();
    expect(setThreeSecondLoopState).not.toHaveBeenCalled();
  });

  it('does not jump from the timestamp during review mode', () => {
    const { handleFromHere } = renderAnalytics(true);

    const timestamp = screen.getByTestId('checkpoint-timestamp');
    expect(timestamp.tagName).toBe('P');
    expect(timestamp).toHaveTextContent('🚩 2:05');
    fireEvent.click(timestamp);
    expect(handleFromHere).not.toHaveBeenCalled();
  });
});
