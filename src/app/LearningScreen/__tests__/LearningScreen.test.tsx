import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import {
  mockTitle,
  mockSelectedContent,
  checkingTimelineMarkers,
  renderWithProvider,
} from './test-utils';
import {
  DEFAULT_REVIEW_DATA,
  JAPANESE_WORD_FOR_REVIEW_1,
  JAPANESE_WORD_FOR_REVIEW_2,
  MOCK_SNIPPET_1,
  mockDeleteWord,
  mockGetOnLoadData,
  mockSaveWord,
  mockUpdateContentMetaData,
  mockUpdateSentenceReview,
  REVIEW_DATA_2_DAYS_AWAY,
} from './api-mocks';

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
  mockUpdateSentenceReview(DEFAULT_REVIEW_DATA);
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
  await mockUpdateSentenceReview(DEFAULT_REVIEW_DATA);
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
  mockUpdateSentenceReview(REVIEW_DATA_2_DAYS_AWAY);
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
  mockUpdateSentenceReview({ reviewData: {} });
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
  mockSaveWord(JAPANESE_WORD_FOR_REVIEW_1);

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
  mockSaveWord(JAPANESE_WORD_FOR_REVIEW_2);
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
  mockDeleteWord('mocked-id-sekai');

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

const triggerSnippetViaKeyboard = async () => {
  const transcriptMenuToggle = screen.getByTestId(
    'transcript-menu-toggle-sentence-4',
  );
  expect(transcriptMenuToggle).toBeInTheDocument();
  fireEvent.keyDown(document, { key: '"', shiftKey: true });

  await waitFor(() => {
    const snippetContainerVisible = screen.getByTestId(
      'video-player-snippet-text',
    );
    expect(snippetContainerVisible).toBeInTheDocument();
  });
  const stopLoopButton = screen.getByTestId('stop-loop');
  expect(stopLoopButton).toHaveTextContent('(3)');
  //

  const highlightedSnippetText = screen.getByTestId('highlighted-snippet-text');

  const highlightedSnippetString = highlightedSnippetText.textContent.trim();
  const initialExpectedSnippetString = 'ね、友達！また公園ですぐに会いま';

  expect(highlightedSnippetString).toBe(initialExpectedSnippetString);
};

const triggerContractedSnippet = async () => {
  fireEvent.keyDown(document, { key: 'arrowup' });
  const stopLoopButton = screen.getByTestId('stop-loop');

  expect(stopLoopButton).toHaveTextContent('(1.5)');
  const overlappingIndicator = screen.getByTestId(
    'transcript-time-overlap-indicator',
  );
  expect(overlappingIndicator).toBeInTheDocument();

  const transcriptMenuToggleNonVisible = screen.queryByTestId(
    'transcript-menu-toggle-sentence-4',
  );
  expect(transcriptMenuToggleNonVisible).not.toBeInTheDocument();
  const noSavedSnippets = screen.queryByTestId(
    'transcript-time-overlap-indicator-multi-sentence-4',
  );
  expect(noSavedSnippets).not.toBeInTheDocument();

  const originalTargetLang = screen.queryByTestId(
    'transcript-target-lang-sentence-4',
  );
  expect(originalTargetLang).not.toBeInTheDocument();
  const originalBaseLang = screen.queryByTestId(
    'transcript-base-lang-sentence-4',
  );
  expect(originalBaseLang).not.toBeInTheDocument();

  // SECONDLY, stop looping - save snippet ✅
  const visibleNestedLoopingText = screen.getByTestId(
    'transcript-looping-sentence-sentence-4',
  );
  expect(visibleNestedLoopingText).toBeInTheDocument();

  const highlightedSnippetTextPost = screen.getByTestId(
    'highlighted-snippet-text',
  );

  const initialExpectedSnippetString = 'ね、友達！また公園ですぐに会いま';

  const highlightedSnippetTextPostTrimmed =
    highlightedSnippetTextPost.textContent.trim();
  expect(highlightedSnippetTextPostTrimmed.length).toBeLessThan(
    initialExpectedSnippetString.length,
  );
};

const triggerMoveSnippetLeftAndRightExpandAndContract = async () => {
  const highlightedSnippetTextPost = screen.getByTestId(
    'highlighted-snippet-text',
  );
  const highlightedSnippetTextPostTrimmed =
    highlightedSnippetTextPost.textContent.trim();
  fireEvent.keyDown(document, { key: ',' });

  const highlightedSnippetTextMovedLeft = screen.getByTestId(
    'highlighted-snippet-text',
  );
  expect(highlightedSnippetTextMovedLeft.textContent.trim()).not.toEqual(
    highlightedSnippetTextPostTrimmed,
  );
  expect(highlightedSnippetTextMovedLeft.textContent.trim().length).toEqual(
    highlightedSnippetTextPostTrimmed.length,
  );

  fireEvent.keyDown(document, { key: '.' });

  const highlightedSnippetTextMovedRight = screen
    .getByTestId('highlighted-snippet-text')
    .textContent.trim();
  expect(highlightedSnippetTextMovedRight).not.toEqual(
    highlightedSnippetTextMovedLeft.textContent.trim(),
  );
  expect(highlightedSnippetTextMovedRight.length).toEqual(
    highlightedSnippetTextPostTrimmed.length,
  );

  fireEvent.keyDown(document, { key: '<', shiftKey: true });
  const highlightedSnippetTextContractedText = screen
    .getByTestId('highlighted-snippet-text')
    .textContent.trim();
  expect(highlightedSnippetTextContractedText.length).toBe(
    highlightedSnippetTextMovedRight.length - 1,
  );
  fireEvent.keyDown(document, { key: '>', shiftKey: true });
  const highlightedSnippetTextExpandedText = screen
    .getByTestId('highlighted-snippet-text')
    .textContent.trim();
  expect(highlightedSnippetTextExpandedText.length).toBe(
    highlightedSnippetTextContractedText.length + 1,
  );
};

const saveSnippet = async () => {
  const saveSnippetTranscriptBtn = screen.getByTestId(
    'save-snippet-button-sentence-4',
  );

  mockUpdateContentMetaData({
    ...mockSelectedContent,
    snippets: [
      {
        ...MOCK_SNIPPET_1,
      },
    ],
  });
  saveSnippetTranscriptBtn.click();
  await waitFor(() => {
    expect(screen.getByText('Updated content data ✅!')).toBeInTheDocument();
  });
};

const checkForRemovalOfPreSnippetUIComponents = async () => {
  const noLoopingSentence = screen.queryByTestId(
    'transcript-looping-sentence-sentence-4',
  );
  expect(noLoopingSentence).not.toBeInTheDocument();
  const noSnippetTextContainer = screen.queryByTestId(
    'video-player-snippet-text',
  );
  expect(noSnippetTextContainer).not.toBeInTheDocument();
  const overlappingIndicator = screen.queryByTestId(
    'transcript-time-overlap-indicator',
  );
  expect(overlappingIndicator).not.toBeInTheDocument();
};

const checkNewStableSnippetUIComponents = async () => {
  const savedSnippetBottomUIWidget = screen.getByTestId(
    'transcript-time-overlap-indicator-multi-sentence-4',
  );
  expect(savedSnippetBottomUIWidget).toBeInTheDocument();
  expect(screen.getByTestId('analytics-snippets-due')).toHaveTextContent(
    'Snippets Due: 0/1/1',
  ); // if review triggered it will show 1/1/1

  // expect(
  //   document.querySelectorAll('[data-testid^="timeline-snippet-marker-"]'),
  // ).toHaveLength(0); // need to trigger due state maybe?

  // const reviewButton = screen.getByTestId('review-switch');
  // fireEvent.click(reviewButton);

  // // expect(screen.getByTestId('analytics-snippets-due')).toHaveTextContent(
  // //   'Snippets Due: 1/1/1',
  // // ); // if review triggered it will show 1/1/1
  // expect(
  //   document.querySelectorAll('[data-testid^="timeline-snippet-marker-"]'),
  // ).toHaveLength(1); // need to trigger due state maybe?
};

const deleteSnippet = async () => {
  const multiSnippetActionsContainer = screen.getByTestId(
    `transcript-time-overlap-indicator-multi-sentence-4`,
  );
  mockUpdateContentMetaData({
    ...mockSelectedContent,
    snippets: [],
  });
  const deleteButton = within(multiSnippetActionsContainer).getByRole(
    'button',
    { name: '❌' },
  );
  fireEvent.doubleClick(deleteButton);

  await waitFor(() => {
    expect(screen.getByText('Updated content data ✅!')).toBeInTheDocument();
  });
  expect(screen.getByTestId('analytics-snippets-due')).toHaveTextContent(
    'Snippets Due: 0/0/0',
  );
};

describe('LearningScreen - studying new content', () => {
  beforeAll(() => {
    mockGetOnLoadData([mockSelectedContent], [], []);
    // jest
    //   .spyOn(apiLib, 'apiRequestWrapper')
    //   .mockImplementation(async (params) => {
    //     if (params.url === '/api/getOnLoadData') {
    //       return {
    //         contentData: [mockSelectedContent],
    //         wordsData: [],
    //         sentencesData: [],
    //       };
    //     }
    //     // Default mock response
    //     return {};
    //   });
  });
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('new sentences', () => {
    it('should render a blank project with no previously reviewed content', async () => {
      await renderWithProvider();
      expect(await screen.findByText('Sentences: 0/0')).toBeInTheDocument();

      checkMetaDataOnLoad();
      checkReviewTogglesOnLoad();
      checkTabTriggersOnLoad();
      checkingMainTranscriptContent();
      checkingTimelineMarkers();
      checkAllTranscriptItems();
      checkingMediaActionButtons();
      await addFirstSentenceToReview();
      await addSecondSentenceToReview();
      startReviewMode();
      await reviewFirstSentenceAgain();
      await removeSecondSentenceFromReview();
    });
  });

  describe('new words', () => {
    it('should allow to add and remove words from transcript', async () => {
      await renderWithProvider();
      expect(await screen.findByText('Sentences: 0/0')).toBeInTheDocument();
      await saveWordFirstInTranscript();
      await saveWordSecondInTranscript();
      await hoverOverSavedWord();
      await deleteFirstWord();
    });
  });

  describe('new snippets', () => {
    // just test for standard snippet and overlap snippet.
    it('should allow snippet creation and removal snippets from transcript', async () => {
      // Mock currentTime for this test
      Object.defineProperty(HTMLMediaElement.prototype, 'currentTime', {
        configurable: true,
        get() {
          return 10;
        },
        set() {
          // Mock setter to prevent errors
        },
      });

      await renderWithProvider();
      expect(await screen.findByText('Sentences: 0/0')).toBeInTheDocument();
      expect(
        screen.queryByTestId('video-player-snippet-text'),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId('transcript-looping-sentence-sentence-4'),
      ).not.toBeInTheDocument();

      await triggerSnippetViaKeyboard();
      await triggerContractedSnippet();
      await triggerMoveSnippetLeftAndRightExpandAndContract();
      await saveSnippet();
      await checkForRemovalOfPreSnippetUIComponents();
      await checkNewStableSnippetUIComponents();
      await deleteSnippet();

      // check snippet present in timeline
    });
  });
});
