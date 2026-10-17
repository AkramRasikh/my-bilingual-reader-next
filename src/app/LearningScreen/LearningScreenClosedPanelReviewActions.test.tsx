import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { mockSnippetPartiallyBrokenDown } from '@/components/custom/SnippetReview/SnippetReview.mocks';
import {
  clearSnippetReviewVisual,
  getSnippetReviewVisualSnapshot,
} from '@/components/custom/SnippetReview/snippetReviewVisualMirror';
import LearningScreenClosedPanelReviewActions from './LearningScreenClosedPanelReviewActions';

const handleUpdateSnippet = jest.fn();

const mockLearningScreenState = {
  isInReviewMode: true,
  postSnippetsMemoized: [mockSnippetPartiallyBrokenDown],
  postWordsMemoized: [],
  postSentencesMemoized: [],
  firstElIdInReview: mockSnippetPartiallyBrokenDown.id,
  isVideoPlaying: false,
  threeSecondLoopState: null,
  handleLoopReviewMode: jest.fn(),
  handleUpdateSnippet,
  setThreeSecondLoopState: jest.fn(),
  setContractThreeSecondLoopState: jest.fn(),
  handleBreakdownSentence: jest.fn(),
  isBreakingDownSentenceArrState: [],
  currentTime: 0,
  getSentenceDataOfOverlappingWordsDuringSave: jest.fn(),
  selectedContentTitleState: 'Mock Chinese Content',
  sentenceMapMemoized: {},
  handleSaveWord: jest.fn(),
  handleDeleteWordDataProvider: jest.fn(),
};

jest.mock('./useLearningScreen', () => () => mockLearningScreenState);

jest.mock('@/app/Providers/FetchDataProvider', () => ({
  useFetchData: () => ({
    languageSelectedState: 'chinese',
    wordsState: [],
  }),
}));

describe('closed panel snippet controls', () => {
  beforeEach(() => {
    handleUpdateSnippet.mockReset();
    mockLearningScreenState.setThreeSecondLoopState.mockClear();
    mockLearningScreenState.setContractThreeSecondLoopState.mockClear();
    clearSnippetReviewVisual(mockSnippetPartiallyBrokenDown.id);
    Object.defineProperty(navigator, 'getGamepads', {
      configurable: true,
      value: () => [],
    });
  });

  afterEach(() => {
    clearSnippetReviewVisual(mockSnippetPartiallyBrokenDown.id);
  });

  it('keeps the snippet review controls mounted while the transcript panel is closed', async () => {
    render(<LearningScreenClosedPanelReviewActions isRightPanelOpen={false} />);

    expect(
      screen.getByTestId(
        `snippet-review-item-${mockSnippetPartiallyBrokenDown.id}`,
      ),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(getSnippetReviewVisualSnapshot()?.snippetId).toBe(
        mockSnippetPartiallyBrokenDown.id,
      );
    });

    const startIndex = getSnippetReviewVisualSnapshot()?.startIndexKey ?? 0;
    act(() => {
      window.dispatchEvent(
        new CustomEvent('snippet-loop-shift-start', { detail: { delta: 1 } }),
      );
    });

    await waitFor(() => {
      expect(getSnippetReviewVisualSnapshot()?.startIndexKey).toBe(startIndex + 1);
    });

    act(() => {
      window.dispatchEvent(new CustomEvent('snippet-loop-save'));
    });

    await waitFor(() => {
      expect(handleUpdateSnippet).toHaveBeenCalledWith(
        expect.objectContaining({
          snippetData: expect.objectContaining({
            id: mockSnippetPartiallyBrokenDown.id,
            isPreSnippet: false,
          }),
        }),
      );
    });
    expect(mockLearningScreenState.setThreeSecondLoopState).not.toHaveBeenCalled();
    expect(
      mockLearningScreenState.setContractThreeSecondLoopState,
    ).not.toHaveBeenCalled();
  });

  it('stops the snippet loop after an SRS grade', async () => {
    handleUpdateSnippet.mockResolvedValue(undefined);
    render(<LearningScreenClosedPanelReviewActions isRightPanelOpen={false} />);

    fireEvent.click(
      screen.getByTestId(`good-${mockSnippetPartiallyBrokenDown.id}`),
    );

    await waitFor(() => {
      expect(handleUpdateSnippet).toHaveBeenCalledWith(
        expect.objectContaining({
          isSnippetReview: true,
          snippetData: expect.objectContaining({
            id: mockSnippetPartiallyBrokenDown.id,
          }),
        }),
      );
    });
    expect(mockLearningScreenState.setThreeSecondLoopState).toHaveBeenCalledWith(
      null,
    );
    expect(
      mockLearningScreenState.setContractThreeSecondLoopState,
    ).toHaveBeenCalledWith(false);
  });

  it('leaves snippet controls to the open transcript panel', () => {
    render(<LearningScreenClosedPanelReviewActions isRightPanelOpen />);

    expect(
      screen.queryByTestId(
        `snippet-review-item-${mockSnippetPartiallyBrokenDown.id}`,
      ),
    ).not.toBeInTheDocument();
  });
});
