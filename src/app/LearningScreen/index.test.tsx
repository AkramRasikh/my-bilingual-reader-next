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
import { render, screen, within } from '@testing-library/react';
import { LearningScreenProvider } from './LearningScreenProvider';
import { useFetchData } from '../Providers/FetchDataProvider';
import { ContentScreenContainer } from '../content/page';

// Mock the dependencies
jest.mock('../Providers/FetchDataProvider');

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

const mockUseFetchData = useFetchData as jest.MockedFunction<
  typeof useFetchData
>;

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
  within(mainTranscriptItem).getByText(mockSelectedContent.content[0].baseLang);
};

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
  const mockFetchData = {
    pureWordsMemoized: [],
    wordsState: [],
    breakdownSentence: jest.fn(),
    sentenceReviewBulk: jest.fn(),
    updateSentenceData: jest.fn(),
    updateContentMetaData: jest.fn(),
    hasFetchedDataState: true,
    contentState: [mockSelectedContent],
    languageSelectedState: 'japanese',
    sentencesDueForReviewMemoized: [],
    wordsForReviewMemoized: [],
    wordBasketState: [],
  };
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseFetchData.mockReturnValue(mockFetchData);
  });

  const renderWithProvider = (selectedContent = mockSelectedContent) => {
    return render(
      <LearningScreenProvider selectedContentStateMemoized={selectedContent}>
        <ContentScreenContainer />
      </LearningScreenProvider>,
    );
  };

  it.only('should render a blank project with no previously reviewed content', () => {
    renderWithProvider();

    checkMetaDataOnLoad();
    checkReviewTogglesOnLoad();
    checkTabTriggersOnLoad();
    checkingMainTranscriptContent();
    checkingNoTimelineMarkers();
    checkAllTranscriptItems();
    checkingMediaActionButtons();
  });
});
