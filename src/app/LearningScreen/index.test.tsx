import { render, screen, waitFor, within } from '@testing-library/react';
import { LearningScreenProvider } from './LearningScreenProvider';
import { FetchDataProvider } from '../Providers/FetchDataProvider';
import { ContentScreenContainer } from '../content/page';
import * as apiLib from '@/lib/api-request-wrapper';
jest.mock('../Providers/useDataSaveToLocalStorage', () => () => {});

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    // add other router methods/properties as needed
  }),
}));

beforeAll(() => {
  Object.defineProperty(HTMLMediaElement.prototype, 'duration', {
    configurable: true,
    get() {
      return 5;
    },
  });
});

const mockSelectedContent = {
  id: 'content-1',
  title: 'Test Content title',
  contentIndex: 0,
  content: [
    {
      id: 'sentence-1',
      targetLang: 'Hello world',
      baseLang: 'こんにちは世界',
      time: 0,
    },
    {
      id: 'sentence-2',
      targetLang: 'How are you?',
      baseLang: 'お元気ですか？',
      time: 2,
    },
  ],
  snippets: [],
};

const checkMetaDataOnLoad = () => {
  expect(screen.getByText('Sentences: 0/0')).toBeInTheDocument();
  expect(screen.getByText('Words Due: 0')).toBeInTheDocument();
  expect(screen.getByText('Snippets Due: 0/0/0')).toBeInTheDocument();
  expect(screen.getByText('Reps: 0')).toBeInTheDocument();
  expect(screen.queryByText('Bulk Review: 0')).not.toBeInTheDocument();

  // navbar
  expect(screen.getByText('Home')).toBeInTheDocument();
  expect(screen.getByText('Test Content title')).toBeInTheDocument();
  expect(screen.queryByTestId('progress-header')).not.toBeInTheDocument();

  const breadcrumbSentencesButton = screen.getByTestId(
    'breadcrumb-sentences-button',
  );
  const breadcrumbWordsButton = screen.getByTestId('breadcrumb-words-button');
  const breadcrumbContentButton = screen.getByTestId(
    'breadcrumb-content-button',
  );
  const breadcrumbBasketButton = screen.getByTestId('basket-button');

  expect(breadcrumbSentencesButton).toBeDisabled();
  expect(breadcrumbSentencesButton).toHaveTextContent('Sentence (0)');
  expect(breadcrumbBasketButton).toHaveTextContent('🧺 (0)');
  expect(breadcrumbWordsButton).toHaveTextContent('Words (0)');
  expect(breadcrumbWordsButton).toBeDisabled();
  expect(breadcrumbContentButton).toHaveTextContent('Content');
};

const checkReviewTogglesOnLoad = () => {
  const reviewButton = screen.getByTestId('review-label');
  expect(reviewButton).toBeInTheDocument();
  const wordsToggles = screen.getByTestId('words-toggle');
  const sentencesToggles = screen.getByTestId('sentences-toggle');
  const snippetsToggles = screen.getByTestId('snippets-toggle');
  const reviewIntervalDecrement = screen.getByTestId(
    'review-interval-decrement',
  );
  const reviewIntervalIncrement = screen.getByTestId(
    'review-interval-increment',
  );
  expect(wordsToggles).toBeDisabled();
  expect(sentencesToggles).toBeDisabled();
  expect(snippetsToggles).toBeDisabled();
  expect(reviewIntervalDecrement).toBeDisabled();
  expect(reviewIntervalIncrement).toBeDisabled();
};

const checkTabTriggersOnLoad = () => {
  expect(screen.getByTestId('transcript-tab-trigger')).toBeInTheDocument();
  const wordsTabTrigger = screen.getByTestId('words-tab-trigger');
  expect(wordsTabTrigger).toBeDisabled();
  expect(wordsTabTrigger).toHaveTextContent('Words 0/0');
  expect(screen.getByTestId('meta-tab-trigger')).toBeInTheDocument();
};

const checkingMainTranscriptContent = () => {
  const mainTranscriptItem = screen.getByTestId('transcript-item-secondary');
  expect(mainTranscriptItem).toBeInTheDocument();
  within(mainTranscriptItem).getByText(
    mockSelectedContent.content[0].targetLang,
  );
};
beforeAll(() => {
  jest.spyOn(apiLib, 'apiRequestWrapper').mockImplementation(async (params) => {
    if (params.url === '/api/getOnLoadData') {
      return {
        contentData: [mockSelectedContent],
        wordsData: [],
        sentencesData: [],
      };
    }
    if (params.url === '/api/updateSentence') {
      return {
        reviewData: {
          /* mock reviewData object here if needed */
        },
      };
    }
    // Default mock response
    return {};
  });
});

const checkingNoTimelineMarkers = () => {
  expect(
    document.querySelectorAll('[data-testid^="timeline-sentence-"]'),
  ).toHaveLength(0);

  expect(
    document.querySelectorAll('[data-testid^="timeline-word-marker-"]'),
  ).toHaveLength(0);
  expect(
    document.querySelectorAll('[data-testid^="timeline-snippet-marker-"]'),
  ).toHaveLength(0);
};

const checkingMediaActionButtons = () => {
  const englishSwitch = screen.getByTestId('english-switch');
  expect(englishSwitch).toBeChecked();
  const trackMediaElLabel = screen.getByTestId('track-current-switch');
  expect(trackMediaElLabel).toBeChecked();
  expect(trackMediaElLabel).toBeEnabled();
  expect(screen.getByTestId('countup-timer-button')).toBeInTheDocument();
  expect(screen.getByTestId('countdown-timer-button')).toBeInTheDocument();

  const currentMediaPositionBtn = screen.getByTestId('current-button');
  expect(currentMediaPositionBtn).toBeInTheDocument();
  const studyHereButton = screen.getByTestId('study-here-button');
  expect(studyHereButton).toHaveTextContent('Study here 1');
  const checkpointButton = screen.getByTestId('checkpoint-button');
  expect(checkpointButton).toBeInTheDocument();
};

const checkAllTranscriptItems = () => {
  mockSelectedContent.content.forEach((sentence) => {
    const transcriptItemTargetLang = screen.getByTestId(
      `transcript-target-lang-${sentence.id}`,
    );
    const transcriptItemBaseLang = screen.getByTestId(
      `transcript-base-lang-${sentence.id}`,
    );
    expect(transcriptItemTargetLang).toHaveTextContent(sentence.targetLang);
    expect(transcriptItemBaseLang).toHaveTextContent(sentence.baseLang);
  });
};

describe('LearningScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderWithProvider = (selectedContent = mockSelectedContent) => {
    return render(
      <FetchDataProvider>
        <LearningScreenProvider selectedContentStateMemoized={selectedContent}>
          <ContentScreenContainer />
        </LearningScreenProvider>
      </FetchDataProvider>,
    );
  };

  it.only('should render a blank project with no previously reviewed content', async () => {
    renderWithProvider();
    expect(await screen.findByText('Sentences: 0/0')).toBeInTheDocument();

    checkMetaDataOnLoad();
    checkReviewTogglesOnLoad();
    checkTabTriggersOnLoad();
    checkingMainTranscriptContent();
    checkingNoTimelineMarkers();
    checkAllTranscriptItems();
    checkingMediaActionButtons();

    // transcript-menu-toggle-f378ec1d-c885-4e6a-9821-405b0ff9aa24
    const transcriptMenuToggle = screen.getByTestId(
      'transcript-menu-toggle-sentence-1',
    );

    transcriptMenuToggle.click();
    const nonVisibleReviewMenuItem = screen.queryByTestId(
      'transcript-menu-review-sentence-1',
    );
    expect(nonVisibleReviewMenuItem).not.toBeInTheDocument();
    await waitFor(() => {
      const visibleReviewMenuItem = screen.getByTestId(
        'transcript-menu-review-sentence-1',
      );
      expect(visibleReviewMenuItem).toBeInTheDocument();
    });

    const reviewMenuItem = screen.getByTestId(
      'transcript-menu-review-sentence-1',
    );
    // await waitFor(() => {
    reviewMenuItem.click();

    // const dueTime = new Date();
    // const lastReviewTime = new Date();
    // const reviewData = {
    //   due: dueTime.toISOString(),
    //   stability: 0.40255,
    //   difficulty: 7.1949,
    //   elapsed_days: 0,
    //   scheduled_days: 0,
    //   reps: 1,
    //   lapses: 0,
    //   state: 1,
    //   last_review: lastReviewTime.toISOString(),
    //   ease: 2.5,
    //   interval: 0,
    // };

    // mockUseFetchData.mockReturnValue({
    //   ...mockFetchData,
    //   updateSentenceData: jest.fn().mockResolvedValue({ reviewData }),
    // });

    // // // ...render and trigger clicks...

    // // // Now assert the UI reflects the new reviewData, e.g.:
    // await waitFor(() => {
    //   expect(screen.getByText('Sentence reviewed ✅')).toBeInTheDocument();
    // });
  });
});
