import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { LearningScreenProvider } from './LearningScreenProvider';
import { FetchDataProvider } from '../Providers/FetchDataProvider';
import ContentScreen from '../content/page';
import * as apiLib from '@/lib/api-request-wrapper';
jest.mock('../Providers/useDataSaveToLocalStorage', () => () => {});

const mockTitle = 'Test-Content-title';
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    // add other router methods/properties as needed
  }),
  useSearchParams: () => ({
    get: (key: string) => (key === 'topic' ? mockTitle : null),
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
  title: mockTitle,
  contentIndex: 0,
  content: [
    {
      id: 'sentence-1',
      baseLang: 'Hello world',
      targetLang: 'こんにちは世界',
      time: 0,
    },
    {
      id: 'sentence-2',
      baseLang: 'How are you?',
      targetLang: 'お元気ですか？',
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
  expect(screen.getByText(mockTitle)).toBeInTheDocument();
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

const addFirstSentenceToReview = async () => {
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
  expect(screen.queryByText('Sentence reviewed ✅')).not.toBeInTheDocument();
  jest.spyOn(apiLib, 'apiRequestWrapper').mockImplementation(async (params) => {
    if (params.url === '/api/updateSentence') {
      const dueTime = new Date();
      const lastReviewTime = new Date();
      const reviewData = {
        due: dueTime.toISOString(),
        stability: 0.40255,
        difficulty: 7.1949,
        elapsed_days: 0,
        scheduled_days: 0,
        reps: 1,
        lapses: 0,
        state: 1,
        last_review: lastReviewTime.toISOString(),
        ease: 2.5,
        interval: 0,
      };

      return {
        reviewData,
      };
    }
    // Default mock response
    return {};
  });
  reviewMenuItem.click();
  await waitFor(() => {
    expect(screen.getByText('Sentence reviewed ✅')).toBeInTheDocument();
  });
  expect(screen.getByText('Reps: 1')).toBeInTheDocument();
  expect(await screen.findByTestId('progress-header')).toBeInTheDocument();
  expect(screen.getByText('0/1')).toBeInTheDocument();
  const sentenceMetaCount = screen.getByTestId('analytics-sentences-count');
  expect(sentenceMetaCount).toHaveTextContent('Sentences: 1/1'); // due/pending+pending
};
const addSecondSentenceToReview = async () => {
  const transcriptMenuToggle = screen.getByTestId(
    'transcript-menu-toggle-sentence-2',
  );

  transcriptMenuToggle.click();
  const nonVisibleReviewMenuItem = screen.queryByTestId(
    'transcript-menu-review-sentence-2',
  );
  expect(nonVisibleReviewMenuItem).not.toBeInTheDocument();
  await waitFor(() => {
    const visibleReviewMenuItem = screen.getByTestId(
      'transcript-menu-review-sentence-2',
    );
    expect(visibleReviewMenuItem).toBeInTheDocument();
  });
  const reviewMenuItem = screen.getByTestId(
    'transcript-menu-review-sentence-2',
  );
  jest.spyOn(apiLib, 'apiRequestWrapper').mockImplementation(async (params) => {
    if (params.url === '/api/updateSentence') {
      const dueTime = new Date();
      const lastReviewTime = new Date();
      const reviewData = {
        due: dueTime.toISOString(),
        stability: 0.40255,
        difficulty: 7.1949,
        elapsed_days: 0,
        scheduled_days: 0,
        reps: 1,
        lapses: 0,
        state: 1,
        last_review: lastReviewTime.toISOString(),
        ease: 2.5,
        interval: 0,
      };

      return {
        reviewData,
      };
    }
    // Default mock response
    return {};
  });
  reviewMenuItem.click();
  await waitFor(() => {
    expect(screen.getAllByText('Sentence reviewed ✅')).toHaveLength(2);
  });
  expect(screen.getByText('Reps: 2')).toBeInTheDocument();
  expect(await screen.findByTestId('progress-header')).toBeInTheDocument();
  expect(screen.getByText('0/2')).toBeInTheDocument();
  const sentenceMetaCount = screen.getByTestId('analytics-sentences-count');
  expect(sentenceMetaCount).toHaveTextContent('Sentences: 2/2'); // due/pending+pending
};

const startReviewMode = () => {
  const reviewButton = screen.getByTestId('review-switch');
  fireEvent.click(reviewButton);
  const sentenceReviewLabel = screen.getByTestId('sentences-toggle-label');
  expect(sentenceReviewLabel).toBeInTheDocument();
  expect(sentenceReviewLabel).toHaveTextContent('📝 (2)');
};

const reviewFirstSentenceAgain = async () => {
  const srsTogglesFirstSentence = screen.getByTestId(
    'review-srs-toggles-sentence-1',
  );
  expect(srsTogglesFirstSentence).toBeInTheDocument();
  const easyButton = within(srsTogglesFirstSentence).getByText('2 days');
  jest.spyOn(apiLib, 'apiRequestWrapper').mockImplementation(async (params) => {
    if (params.url === '/api/updateSentence') {
      const dueTime = new Date();
      dueTime.setDate(dueTime.getDate() + 2);
      const lastReviewTime = new Date();
      const reviewData = {
        due: dueTime.toISOString(),
        stability: 0.7,
        difficulty: 6.5,
        elapsed_days: 0,
        scheduled_days: 2,
        reps: 2,
        lapses: 0,
        state: 1,
        last_review: lastReviewTime.toISOString(),
        ease: 2.6,
        interval: 2,
      };

      return {
        reviewData,
      };
    }
    // Default mock response
    return {};
  });
  fireEvent.click(easyButton);
  await waitFor(() => {
    expect(screen.getAllByText('Sentence reviewed ✅')).toHaveLength(3);
  });
  expect(screen.getByText('Reps: 3')).toBeInTheDocument();
  expect(await screen.findByTestId('progress-header')).toBeInTheDocument();
  const sentenceMetaCount = screen.getByTestId('analytics-sentences-count');
  expect(sentenceMetaCount).toHaveTextContent('Sentences: 1/2'); // due/pending+pending
  // expect(screen.getByTestId('progress-header-text')).toHaveTextContent('1/2'); // come back to when fixing and testing progress header
};

const removeSecondSentenceFromReview = async () => {
  const srsTogglesSecondSentence = screen.getByTestId(
    'review-srs-toggles-sentence-2',
  );
  expect(srsTogglesSecondSentence).toBeInTheDocument();
  const removeButton = screen.getByTestId(
    `review-srs-toggles-remove-sentence-2`,
  );
  jest.spyOn(apiLib, 'apiRequestWrapper').mockImplementation(async (params) => {
    if (params.url === '/api/updateSentence') {
      const reviewData = {
        due: null,
        stability: null,
        difficulty: null,
        elapsed_days: null,
        scheduled_days: null,
        reps: 0,
        lapses: 0,
        state: 0,
        last_review: null,
        ease: 2.5,
        interval: null,
      };

      return {
        reviewData,
      };
    }
    // Default mock response
    return {};
  });
  fireEvent.click(removeButton);
  await waitFor(() => {
    expect(
      screen.getByText('Successful learned sentence ✅'),
    ).toBeInTheDocument();
  });
  expect(screen.getByText('Reps: 4')).toBeInTheDocument();
  expect(screen.queryByTestId('progress-header')).not.toBeInTheDocument();
  const sentenceMetaCount = screen.getByTestId('analytics-sentences-count');
  expect(sentenceMetaCount).toHaveTextContent('Sentences: 0/1'); // due/pending+pending
};

const saveWordFirstInTranscript = async () => {
  const element = screen.getByTestId('transcript-target-lang-sentence-1');
  const highlightedTextContainer = screen.queryByTestId(
    'highlighted-text-container',
  );
  expect(highlightedTextContainer).not.toBeInTheDocument();
  const textNode = element.firstChild; // Get the text node inside the element
  const range = document.createRange();
  range.setStart(textNode, 5); // start after 'こんにちは' (position 5)
  range.setEnd(textNode, 7); // end after '世界' (position 7)
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);

  // Verify the selection
  expect(selection.toString()).toBe('世界');

  // Trigger mouseup event to make the component recognize the selection
  fireEvent.mouseUp(element);

  await waitFor(() => {
    // Now highlightedTextState should be populated
    expect(screen.getByText('世界')).toBeInTheDocument();
  });

  // Spy for api/saveWord
  jest.spyOn(apiLib, 'apiRequestWrapper').mockImplementation(async (params) => {
    if (params.url === '/api/saveWord') {
      const dueTime = new Date();
      const lastReviewTime = new Date();
      return {
        word: {
          baseForm: '世界',
          surfaceForm: '世界',
          contexts: ['sentence-1'],
          definition: 'world',
          id: 'mocked-id-sekai',
          notes:
            'In this context, 世界 refers to the world or universe as a whole.',
          phonetic: 'せかい',
          reviewData: {
            difficulty: 7.1949,
            due: dueTime.toISOString(),
            ease: 2.5,
            elapsed_days: 0,
            interval: 0,
            lapses: 0,
            last_review: lastReviewTime.toISOString(),
            reps: 1,
            scheduled_days: 0,
            stability: 0.40255,
            state: 1,
          },
          transliteration: 'sekai',
        },
      };
    }
    // fallback to previous mocks
    return {};
  });

  const saveWordButton = screen.getByTestId('save-word-openai-button');
  const genericFirstSentenceSpinnerNotPresent = screen.queryByTestId(
    'transcript-action-loading-sentence-1',
  );

  const wordTabText = screen.getByTestId('words-tab-trigger');
  expect(wordTabText).toHaveTextContent('Words 0/0');

  expect(genericFirstSentenceSpinnerNotPresent).not.toBeInTheDocument();
  fireEvent.click(saveWordButton);
  const genericFirstSentenceSpinner = screen.getByTestId(
    'transcript-action-loading-sentence-1',
  );
  expect(genericFirstSentenceSpinner).toBeInTheDocument();
  await waitFor(() => {
    expect(screen.getByText('世界 saved!')).toBeInTheDocument();
  });
  expect(wordTabText).toHaveTextContent('Words 1/1');
  expect(screen.getByText('Words Due: 1')).toBeInTheDocument();
};
const saveWordSecondInTranscript = async () => {
  const element = screen.getByTestId('transcript-target-lang-sentence-2');
  const highlightedTextContainer = screen.queryByTestId(
    'highlighted-text-container',
  );
  expect(highlightedTextContainer).not.toBeInTheDocument();
  const textNode = element.firstChild; // Get the text node inside the element
  const range = document.createRange();
  range.setStart(textNode, 1);
  range.setEnd(textNode, 3);
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);

  // Verify the selection
  expect(selection.toString()).toBe('元気');

  // Trigger mouseup event to make the component recognize the selection
  fireEvent.mouseUp(element);

  await waitFor(() => {
    // Now highlightedTextState should be populated
    expect(screen.getByText('元気')).toBeInTheDocument();
  });

  // Spy for api/saveWord
  jest.spyOn(apiLib, 'apiRequestWrapper').mockImplementation(async (params) => {
    if (params.url === '/api/saveWord') {
      const dueTime = new Date();
      const lastReviewTime = new Date();
      return {
        word: {
          baseForm: '元気',
          surfaceForm: '元気',
          contexts: ['sentence-2'],
          definition: 'healthy; energetic',
          id: 'mocked-id-genki',
          notes: 'In this context, 元気 refers to being healthy or energetic.',
          phonetic: 'げんき',
          reviewData: {
            difficulty: 7.1949,
            due: dueTime.toISOString(),
            ease: 2.5,
            elapsed_days: 0,
            interval: 0,
            lapses: 0,
            last_review: lastReviewTime.toISOString(),
            reps: 1,
            scheduled_days: 0,
            stability: 0.40255,
            state: 1,
          },
          transliteration: 'genki',
        },
      };
    }
    // fallback to previous mocks
    return {};
  });

  const saveWordButton = screen.getByTestId('save-word-openai-button');
  const genericFirstSentenceSpinnerNotPresent = screen.queryByTestId(
    'transcript-action-loading-sentence-2',
  );

  const wordTabText = screen.getByTestId('words-tab-trigger');
  expect(wordTabText).toHaveTextContent('Words 1/1');

  expect(genericFirstSentenceSpinnerNotPresent).not.toBeInTheDocument();
  fireEvent.click(saveWordButton);
  const genericFirstSentenceSpinner = screen.getByTestId(
    'transcript-action-loading-sentence-2',
  );
  expect(genericFirstSentenceSpinner).toBeInTheDocument();
  await waitFor(() => {
    expect(screen.getByText('元気 saved!')).toBeInTheDocument();
  });
  expect(wordTabText).toHaveTextContent('Words 2/2'); // hmmm
  expect(screen.getByText('Words Due: 2')).toBeInTheDocument();
};

const hoverOverSavedWord = async () => {
  const wordPopUpContainer = screen.queryByTestId('word-pop-up-container');
  expect(wordPopUpContainer).not.toBeInTheDocument();
  const firstSentenceElTargetLang = screen.getByTestId(
    'transcript-target-lang-sentence-1',
  );
  const savedWordElement = within(firstSentenceElTargetLang).getByText('世');

  // Trigger hover events - HoverCard needs multiple events to open
  fireEvent.pointerEnter(savedWordElement);
  fireEvent.mouseEnter(savedWordElement);
  fireEvent.pointerMove(savedWordElement);

  await waitFor(() => {
    expect(screen.getByTestId('word-pop-up-container')).toBeInTheDocument();
  }); // Increase timeout for HoverCard delay
};

const deleteFirstWord = async () => {
  const wordPopUpContainer = screen.getByTestId('word-pop-up-container');
  const deleteButton = within(wordPopUpContainer).getByTestId('delete-button');

  const genericFirstSentenceSpinnerNotPresent = screen.queryByTestId(
    'transcript-action-loading-sentence-1',
  );

  expect(genericFirstSentenceSpinnerNotPresent).not.toBeInTheDocument();
  jest.spyOn(apiLib, 'apiRequestWrapper').mockImplementation(async (params) => {
    if (params.url === '/api/deleteWord') {
      return {
        id: 'mocked-id-sekai',
      };
    }
  });

  deleteButton.click();
  const confirmDeleteButton =
    within(wordPopUpContainer).getByText('Confirm Delete');
  confirmDeleteButton.click();
  await waitFor(() => {
    expect(screen.getByText('Word deleted!')).toBeInTheDocument();
  });

  const wordTabText = screen.getByTestId('words-tab-trigger');
  expect(wordTabText).toHaveTextContent('Words 1/1');
  expect(screen.getByText('Words Due: 1')).toBeInTheDocument();
};

describe('LearningScreen', () => {
  beforeAll(() => {
    jest
      .spyOn(apiLib, 'apiRequestWrapper')
      .mockImplementation(async (params) => {
        if (params.url === '/api/getOnLoadData') {
          return {
            contentData: [mockSelectedContent],
            wordsData: [],
            sentencesData: [],
          };
        }
        // Default mock response
        return {};
      });
  });
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderWithProvider = (selectedContent = mockSelectedContent) => {
    return render(
      <FetchDataProvider>
        <LearningScreenProvider selectedContentStateMemoized={selectedContent}>
          <ContentScreen />
        </LearningScreenProvider>
      </FetchDataProvider>,
    );
  };

  describe('Review sentences', () => {
    it('should render a blank project with no previously reviewed content', async () => {
      renderWithProvider();
      expect(await screen.findByText('Sentences: 0/0')).toBeInTheDocument();

      checkMetaDataOnLoad();
      checkReviewTogglesOnLoad();
      checkTabTriggersOnLoad();
      checkingMainTranscriptContent();
      checkingNoTimelineMarkers();
      checkAllTranscriptItems();
      checkingMediaActionButtons();
      await addFirstSentenceToReview();
      await addSecondSentenceToReview();
      startReviewMode();
      await reviewFirstSentenceAgain();
      await removeSecondSentenceFromReview();
    });
  });

  describe('Review words', () => {
    it('should allow to add and remove words from transcript', async () => {
      renderWithProvider();
      expect(await screen.findByText('Sentences: 0/0')).toBeInTheDocument();
      await saveWordFirstInTranscript();
      await saveWordSecondInTranscript();
      await hoverOverSavedWord();
      await deleteFirstWord();
    });
  });
});
