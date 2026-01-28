import { fireEvent, screen, waitFor } from '@testing-library/react';
import {
  mockTitle,
  mockSelectedContentWithDueData,
  mockWordsData,
  checkWordsMetaData,
  checkingTimelineMarkers,
  renderWithProvider,
} from './test-helpers/test-utils';
import {
  mockGetOnLoadData,
  mockSaveSnippetUnitTest,
  mockUpdateSentenceReview,
  mockUpdateWord,
  REVIEW_DATA_2_DAYS_AWAY,
} from './test-helpers/api-mocks';

jest.mock('../../Providers/useDataSaveToLocalStorage', () => () => {});

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => ({
    get: (key: string) => (key === 'topic' ? mockTitle : null),
  }),
}));

beforeAll(() => {
  Object.defineProperty(HTMLMediaElement.prototype, 'duration', {
    configurable: true,
    get() {
      return 15;
    },
  });

  process.env.NEXT_PUBLIC_CLOUDFLARE_ASSETS_URL = 'https://mocked-url/';
});

beforeEach(() => {
  mockGetOnLoadData([mockSelectedContentWithDueData], mockWordsData, []);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('LearningScreen - Review Mode', () => {
  const checkForDefaultReviewModeMetaData = () => {
    const wordsDueText = screen.getByTestId('analytics-words-due');
    const snippetsDueText = screen.getByTestId('analytics-snippets-due');
    const sentencesCountText = screen.getByTestId('analytics-sentences-count');
    const wordsBtnLink = screen.getByTestId('breadcrumb-words-button');
    expect(wordsBtnLink).toHaveTextContent('Words (3)');
    expect(wordsDueText).toHaveTextContent('Words Due: 3');
    expect(snippetsDueText).toHaveTextContent('Snippets Due: 3/3/3');
    expect(sentencesCountText).toHaveTextContent('Sentences: 3/3');
    expect(screen.getByText('Reps: 0')).toBeInTheDocument();

    const wordsTabTrigger = screen.getByTestId('words-tab-trigger');
    expect(wordsTabTrigger).toHaveTextContent('Words 3/3');
    const progressHeader = screen.getByTestId('progress-header-text');
    expect(progressHeader).toHaveTextContent('0/3');
    expect(
      document.querySelectorAll('[data-testid^="timeline-sentence-"]'),
    ).toHaveLength(3);
    expect(
      document.querySelectorAll('[data-testid^="timeline-word-marker-"]'),
    ).toHaveLength(3);
    expect(
      document.querySelectorAll('[data-testid^="timeline-snippet-marker-"]'),
    ).toHaveLength(3);
  };

  const checkForReviewLabelText = (
    snippets: number,
    words: number,
    sentences: number,
  ) => {
    const wordToggleLabel = screen.getByTestId('words-toggle-label');
    const sentenceToggleLabel = screen.getByTestId('sentences-toggle-label');
    const snippetToggleLabel = screen.getByTestId('snippets-toggle-label');

    expect(snippetToggleLabel).toHaveTextContent(`✂️ (${snippets})`);
    expect(wordToggleLabel).toHaveTextContent(`🔤 (${words})`);
    expect(sentenceToggleLabel).toHaveTextContent(`📝 (${sentences})`);
  };

  const switchToReviewMode = async () => {
    const wordToggleLabel = screen.getByTestId('words-toggle-label');
    const sentenceToggleLabel = screen.getByTestId('sentences-toggle-label');
    const snippetToggleLabel = screen.getByTestId('snippets-toggle-label');

    const wordToggleCheckBoxes = screen.getByTestId('words-toggle');
    const sentenceToggleCheckBoxes = screen.getByTestId('sentences-toggle');
    const snippetToggleCheckBoxes = screen.getByTestId('snippets-toggle');
    expect(wordToggleCheckBoxes).toBeDisabled();
    expect(sentenceToggleCheckBoxes).toBeDisabled();
    expect(snippetToggleCheckBoxes).toBeDisabled();
    expect(wordToggleLabel).toHaveTextContent('🔤 (0)');
    expect(sentenceToggleLabel).toHaveTextContent('📝 (0)');
    expect(snippetToggleLabel).toHaveTextContent('✂️ (0)');
    const reviewSwitch = screen.getByTestId('review-switch');
    fireEvent.click(reviewSwitch);
    const wordToggleLabelPost = screen.getByTestId('words-toggle-label');
    const sentenceToggleLabelPost = screen.getByTestId(
      'sentences-toggle-label',
    );
    const snippetToggleLabelPost = screen.getByTestId('snippets-toggle-label');
    expect(wordToggleLabelPost).toHaveTextContent('🔤 (3)');
    expect(sentenceToggleLabelPost).toHaveTextContent('📝 (3)');
    expect(snippetToggleLabelPost).toHaveTextContent('✂️ (3)');
    const reviewIntervalDecrement = screen.getByTestId(
      'review-interval-decrement',
    );
    const reviewIntervalCount = screen.getByTestId('review-interval-count');
    const reviewIntervalIncrement = screen.getByTestId(
      'review-interval-increment',
    );
    expect(reviewIntervalDecrement).toBeEnabled();
    expect(reviewIntervalCount).toHaveTextContent('60s');
    expect(reviewIntervalIncrement).toBeEnabled();
    await waitFor(() => {
      // Re-query inside waitFor to get fresh references on each retry
      const wordToggleCheckBoxes = screen.getByTestId('words-toggle');
      const sentenceToggleCheckBoxes = screen.getByTestId('sentences-toggle');
      const snippetToggleCheckBoxes = screen.getByTestId('snippets-toggle');
      expect(wordToggleCheckBoxes).toBeEnabled();
      expect(sentenceToggleCheckBoxes).toBeEnabled();
      expect(snippetToggleCheckBoxes).toBeEnabled();
    });
  };

  const dueIn2Days = () => {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 2);
    return dueDate.toISOString();
  };

  const reviewSnippetsInReviewMode = async () => {
    checkingTimelineMarkers(3, 3, 3);
    const snippetReviewToggle1 = screen.getByTestId(
      'snippet-review-item-snippet-due-1',
    );

    expect(snippetReviewToggle1).toHaveTextContent('天気がいい');
    const snippetReviewToggle2 = screen.getByTestId(
      'snippet-review-item-snippet-due-2',
    );
    expect(snippetReviewToggle2).toHaveTextContent('本を読む');
    const snippetReviewToggle3 = screen.getByTestId(
      'snippet-review-item-snippet-due-3',
    );
    expect(snippetReviewToggle3).toHaveTextContent('公園に行きましょう');

    mockSaveSnippetUnitTest({
      ...mockSelectedContentWithDueData.snippets[0],
      reviewData: {
        ...mockSelectedContentWithDueData.snippets[0].reviewData,
        due: dueIn2Days(),
      },
    });

    const reviewFirstSnippetBtn = screen.getByTestId('easy-snippet-due-1');
    reviewFirstSnippetBtn.click();
    await waitFor(() => {
      expect(screen.getByText('Snippet saved ✂️✅!')).toBeInTheDocument();
    });

    checkForReviewLabelText(2, 3, 3);
    checkingTimelineMarkers(2, 3, 3);

    mockSaveSnippetUnitTest({
      ...mockSelectedContentWithDueData.snippets[1],
      reviewData: {
        ...mockSelectedContentWithDueData.snippets[1].reviewData,
        due: dueIn2Days(),
      },
    });
    const reviewSecondSnippetBtn = screen.getByTestId('easy-snippet-due-2');
    reviewSecondSnippetBtn.click();
    await waitFor(() => {
      expect(screen.getByText('Snippet saved ✂️✅!')).toBeInTheDocument();
    });

    checkForReviewLabelText(1, 3, 3);
    checkingTimelineMarkers(1, 3, 3);

    mockSaveSnippetUnitTest({
      ...mockSelectedContentWithDueData.snippets[2],
      reviewData: {
        ...mockSelectedContentWithDueData.snippets[2].reviewData,
        due: dueIn2Days(),
      },
    });

    const reviewThirdSnippetBtn = screen.getByTestId('easy-snippet-due-3');
    reviewThirdSnippetBtn.click();
    await waitFor(() => {
      expect(screen.getByText('Snippet saved ✂️✅!')).toBeInTheDocument();
    });

    checkForReviewLabelText(0, 3, 3);
    checkingTimelineMarkers(0, 3, 3);
  };

  const reviewWordsInReviewMode = async () => {
    checkWordsMetaData(3, '3/3');
    mockUpdateWord(mockWordsData[0].reviewData, 2);

    const firstWord = screen.getByTestId('easy-mocked-id-tenki');
    firstWord.click();
    await waitFor(() => {
      expect(screen.getByText('Word updated ✅')).toBeInTheDocument();
    });
    checkForReviewLabelText(0, 2, 3);
    checkingTimelineMarkers(0, 2, 3);
    checkWordsMetaData(2, '2/3');
    const secondWord = screen.getByTestId('easy-mocked-id-hon');

    secondWord.click();
    await waitFor(() => {
      expect(screen.getByText('Word updated ✅')).toBeInTheDocument();
    });
    checkForReviewLabelText(0, 1, 3);
    checkingTimelineMarkers(0, 1, 3);
    checkWordsMetaData(1, '1/3');
    const thirdWord = screen.getByTestId('easy-mocked-id-kouen');
    thirdWord.click();
    await waitFor(() => {
      expect(screen.getByText('Word updated ✅')).toBeInTheDocument();
    });
    checkForReviewLabelText(0, 0, 3);
    checkingTimelineMarkers(0, 0, 3);
    checkWordsMetaData(0, '0/3');
  };

  const checkSentenceMetaData = (
    dueCount: number,
    pendingCountText: number,
    reps: number,
  ) => {
    const sentenceDueText = screen.getByTestId('analytics-sentences-count');
    expect(sentenceDueText).toHaveTextContent(
      `Sentences: ${dueCount}/${pendingCountText}`,
    );

    expect(screen.getByText(`Reps: ${reps}`)).toBeInTheDocument();
  };

  const reviewSentencesInReviewMode = async () => {
    expect(screen.queryByText('Done!')).not.toBeInTheDocument();
    checkSentenceMetaData(3, 3, 0);
    mockUpdateSentenceReview(REVIEW_DATA_2_DAYS_AWAY);
    const firstSentenceDueTime = screen.getByTestId('easy-sentence-due-1');

    firstSentenceDueTime.click();
    await waitFor(() => {
      expect(screen.getByText('Sentence reviewed ✅')).toBeInTheDocument();
    });
    checkSentenceMetaData(2, 3, 1);
    checkForReviewLabelText(0, 0, 2);
    checkingTimelineMarkers(0, 0, 2);

    const secondSentenceDueTime = screen.getByTestId('easy-sentence-due-2');

    secondSentenceDueTime.click();
    await waitFor(() => {
      expect(screen.getByText('Sentence reviewed ✅')).toBeInTheDocument();
    });

    checkSentenceMetaData(1, 3, 2);
    checkForReviewLabelText(0, 0, 1);
    checkingTimelineMarkers(0, 0, 1);

    const thirdSentenceDueTime = screen.getByTestId('easy-sentence-due-3');

    thirdSentenceDueTime.click();
    await waitFor(() => {
      expect(screen.getByText('Sentence reviewed ✅')).toBeInTheDocument();
    });

    checkSentenceMetaData(0, 3, 3);
    checkForReviewLabelText(0, 0, 0);
    checkingTimelineMarkers(0, 0, 0);

    expect(screen.getByText('Done!')).toBeInTheDocument();
  };

  it('should allow user to review words/sentences/snippets', async () => {
    await renderWithProvider(mockSelectedContentWithDueData);
    const onLoadTitle = await screen.findByText(mockTitle);
    expect(onLoadTitle).toBeDefined();
    checkForDefaultReviewModeMetaData();
    await switchToReviewMode();
    await reviewSnippetsInReviewMode();
    await reviewWordsInReviewMode();
    await reviewSentencesInReviewMode();
  });
});
