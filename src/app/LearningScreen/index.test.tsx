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

  process.env.NEXT_PUBLIC_CLOUDFLARE_ASSETS_URL = 'https://mocked-url/';
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
    {
      id: 'sentence-3',
      baseLang: 'Nice to meet you.',
      targetLang: 'はじめまして。',
      time: 5,
    },
    {
      id: 'sentence-4',
      baseLang: 'See you later, friend! Let us meet again soon at the park.',
      targetLang: 'またね、友達！また公園ですぐに会いましょう。',
      time: 8,
    },
    {
      id: 'sentence-5',
      baseLang: 'Thank you very much.',
      targetLang: 'どうもありがとうございます。',
      time: 12,
    },
  ],
  snippets: [],
};

const dueDateOneDayAgo = new Date();
dueDateOneDayAgo.setDate(dueDateOneDayAgo.getDate() - 1);

const lastReviewDateTwoDaysAgo = new Date();
lastReviewDateTwoDaysAgo.setDate(lastReviewDateTwoDaysAgo.getDate() - 2);

const mockSelectedContentWithDueData = {
  id: 'content-1',
  title: mockTitle,
  contentIndex: 0,
  content: [
    {
      id: 'sentence-due-1',
      baseLang: 'The weather is nice today.',
      targetLang: '今日は天気がいいですね。',
      time: 0,
      reviewData: {
        difficulty: 6.8,
        due: dueDateOneDayAgo.toISOString(),
        ease: 2.5,
        elapsed_days: 1,
        interval: 1,
        lapses: 0,
        last_review: lastReviewDateTwoDaysAgo.toISOString(),
        reps: 2,
        scheduled_days: 1,
        stability: 0.5,
        state: 2,
      },
    },
    {
      id: 'sentence-due-2',
      baseLang: 'I like reading books.',
      targetLang: '私は本を読むのが好きです。',
      time: 3,
      reviewData: {
        difficulty: 7.2,
        due: dueDateOneDayAgo.toISOString(),
        ease: 2.6,
        elapsed_days: 1,
        interval: 1,
        lapses: 0,
        last_review: lastReviewDateTwoDaysAgo.toISOString(),
        reps: 3,
        scheduled_days: 1,
        stability: 0.6,
        state: 2,
      },
    },
    {
      id: 'sentence-due-3',
      baseLang: "Let's go to the park tomorrow.",
      targetLang: '明日、公園に行きましょう。',
      time: 7,
      reviewData: {
        difficulty: 6.5,
        due: dueDateOneDayAgo.toISOString(),
        ease: 2.7,
        elapsed_days: 1,
        interval: 1,
        lapses: 0,
        last_review: lastReviewDateTwoDaysAgo.toISOString(),
        reps: 2,
        scheduled_days: 1,
        stability: 0.55,
        state: 2,
      },
    },
  ],
  snippets: [
    {
      id: 'snippet-due-1',
      baseLang: 'The weather is nice today.',
      targetLang: '今日は天気がいいですね。',
      time: 1.5,
      focusedText: '天気がいい',
      isContracted: false,
      isPreSnippet: false,
      reviewData: {
        difficulty: 7.0,
        due: dueDateOneDayAgo.toISOString(),
        ease: 2.5,
        elapsed_days: 1,
        interval: 1,
        lapses: 0,
        last_review: lastReviewDateTwoDaysAgo.toISOString(),
        reps: 1,
        scheduled_days: 1,
        stability: 0.45,
        state: 2,
      },
    },
    {
      id: 'snippet-due-2',
      baseLang: 'I like reading books.',
      targetLang: '私は本を読むのが好きです。',
      time: 4.5,
      focusedText: '本を読む',
      isContracted: false,
      isPreSnippet: false,
      reviewData: {
        difficulty: 6.9,
        due: dueDateOneDayAgo.toISOString(),
        ease: 2.6,
        elapsed_days: 1,
        interval: 1,
        lapses: 0,
        last_review: lastReviewDateTwoDaysAgo.toISOString(),
        reps: 2,
        scheduled_days: 1,
        stability: 0.5,
        state: 2,
      },
    },
    {
      id: 'snippet-due-3',
      baseLang: "Let's go to the park tomorrow.",
      targetLang: '明日、公園に行きましょう。',
      focusedText: '公園に行きましょう',
      isContracted: false,
      isPreSnippet: false,
      time: 8.5,
      reviewData: {
        difficulty: 7.1,
        due: dueDateOneDayAgo.toISOString(),
        ease: 2.5,
        elapsed_days: 1,
        interval: 1,
        lapses: 0,
        last_review: lastReviewDateTwoDaysAgo.toISOString(),
        reps: 1,
        scheduled_days: 1,
        stability: 0.48,
        state: 2,
      },
    },
  ],
};

const mockWordsData = [
  {
    baseForm: '天気',
    surfaceForm: '天気',
    contexts: ['sentence-due-1'],
    definition: 'weather',
    id: 'mocked-id-tenki',
    notes:
      'In this context, 天気 refers to the weather or atmospheric conditions.',
    phonetic: 'てんき',
    reviewData: {
      difficulty: 6.8,
      due: dueDateOneDayAgo.toISOString(),
      ease: 2.5,
      elapsed_days: 1,
      interval: 1,
      lapses: 0,
      last_review: lastReviewDateTwoDaysAgo.toISOString(),
      reps: 2,
      scheduled_days: 1,
      stability: 0.5,
      state: 2,
    },
    transliteration: 'tenki',
  },
  {
    baseForm: '本',
    surfaceForm: '本',
    contexts: ['sentence-due-2'],
    definition: 'book',
    id: 'mocked-id-hon',
    notes: 'In this context, 本 refers to a book or written material.',
    phonetic: 'ほん',
    reviewData: {
      difficulty: 7.0,
      due: dueDateOneDayAgo.toISOString(),
      ease: 2.6,
      elapsed_days: 1,
      interval: 1,
      lapses: 0,
      last_review: lastReviewDateTwoDaysAgo.toISOString(),
      reps: 3,
      scheduled_days: 1,
      stability: 0.55,
      state: 2,
    },
    transliteration: 'hon',
  },
  {
    baseForm: '公園',
    surfaceForm: '公園',
    contexts: ['sentence-due-3'],
    definition: 'park',
    id: 'mocked-id-kouen',
    notes: 'In this context, 公園 refers to a public park or garden.',
    phonetic: 'こうえん',
    reviewData: {
      difficulty: 6.7,
      due: dueDateOneDayAgo.toISOString(),
      ease: 2.7,
      elapsed_days: 1,
      interval: 1,
      lapses: 0,
      last_review: lastReviewDateTwoDaysAgo.toISOString(),
      reps: 2,
      scheduled_days: 1,
      stability: 0.52,
      state: 2,
    },
    transliteration: 'kouen',
  },
];

const checkWordsMetaData = (wordsNumber, wordTabText) => {
  expect(screen.getByText(`Words Due: ${wordsNumber}`)).toBeInTheDocument();
  const breadcrumbWordsButton = screen.getByTestId('breadcrumb-words-button');
  expect(breadcrumbWordsButton).toHaveTextContent(`Words (${wordsNumber})`);
  const wordsTabTrigger = screen.getByTestId('words-tab-trigger');

  expect(wordsTabTrigger).toHaveTextContent(`Words ${wordTabText}`);
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

const checkingTimelineMarkers = (snippets = 0, words = 0, sentence = 0) => {
  expect(
    document.querySelectorAll(`[data-testid^="timeline-sentence-${sentence}"]`),
  ).toHaveLength(0);

  expect(
    document.querySelectorAll(`[data-testid^="timeline-word-marker-${words}"]`),
  ).toHaveLength(0);
  expect(
    document.querySelectorAll(
      `[data-testid^="timeline-snippet-marker-${snippets}"]`,
    ),
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

const triggerMoveSnippetLeftAndRight = async () => {
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
};

const saveSnippet = async () => {
  const saveSnippetTranscriptBtn = screen.getByTestId(
    'save-snippet-button-sentence-4',
  );

  jest.spyOn(apiLib, 'apiRequestWrapper').mockImplementation(async (params) => {
    if (params.url === '/api/updateContentMetaData') {
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
        ...mockSelectedContent,
        snippets: [
          {
            id: 'mocked-snippet-id-1',
            time: 10,
            reviewData,
            isContracted: true,
            contentId: 'content-1',
            targetLang: 'またね、友達！また公園ですぐに会いましょう。',
            baseLang:
              'See you later, friend! Let us meet again soon at the park.',
            suggestedFocusText: '！また公園ですぐ',
            focusedText: '！また公園ですぐ',
          },
        ],
      };
    }
    // Default mock response
    return {};
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
  jest.spyOn(apiLib, 'apiRequestWrapper').mockImplementation(async (params) => {
    if (params.url === '/api/updateContentMetaData') {
      return {
        ...mockSelectedContent,
        snippets: [],
      };
    }
    // Default mock response
    return {};
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

  describe('studying new content', () => {
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

    describe('Review sentences', () => {
      it('should render a blank project with no previously reviewed content', async () => {
        renderWithProvider();
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

    describe('Review snippets', () => {
      // just test for standard snippet and overlap snippet.
      it('should allow to create and remove snippets from transcript', async () => {
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

        renderWithProvider();
        expect(await screen.findByText('Sentences: 0/0')).toBeInTheDocument();
        expect(
          screen.queryByTestId('video-player-snippet-text'),
        ).not.toBeInTheDocument();
        expect(
          screen.queryByTestId('transcript-looping-sentence-sentence-4'),
        ).not.toBeInTheDocument();

        await triggerSnippetViaKeyboard();
        await triggerContractedSnippet();
        await triggerMoveSnippetLeftAndRight();
        await saveSnippet();
        await checkForRemovalOfPreSnippetUIComponents();
        await checkNewStableSnippetUIComponents();
        await deleteSnippet();

        // check snippet present in timeline
      });
    });
  });

  describe('review mode', () => {
    const checkForDefaultReviewModeMetaData = () => {
      const wordsDueText = screen.getByTestId('analytics-words-due');
      const snippetsDueText = screen.getByTestId('analytics-snippets-due');
      const sentencesCountText = screen.getByTestId(
        'analytics-sentences-count',
      );
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

    const checkForReviewLabelText = (snippets, words, sentences) => {
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
      const snippetToggleLabelPost = screen.getByTestId(
        'snippets-toggle-label',
      );
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

      jest
        .spyOn(apiLib, 'apiRequestWrapper')
        .mockImplementation(async (params) => {
          if (params.url === '/api/updateContentMetaData') {
            // Clone the snippets array and update the due date of snippet-due-2
            return {
              ...mockSelectedContentWithDueData,
              snippets: [
                {
                  ...mockSelectedContentWithDueData.snippets[0],
                  reviewData: {
                    ...mockSelectedContentWithDueData.snippets[0].reviewData,
                    due: dueIn2Days(),
                  },
                },
                mockSelectedContentWithDueData.snippets[1],
                mockSelectedContentWithDueData.snippets[2],
              ],
            };
          }
          // Default mock response
          return {};
        });

      const reviewFirstSnippetBtn = screen.getByTestId('easy-snippet-due-1');
      reviewFirstSnippetBtn.click();
      await waitFor(() => {
        expect(
          screen.getByText('Updated content data ✅!'),
        ).toBeInTheDocument();
      });

      checkForReviewLabelText(2, 3, 3);
      checkingTimelineMarkers(2, 3, 3);

      jest
        .spyOn(apiLib, 'apiRequestWrapper')
        .mockImplementation(async (params) => {
          if (params.url === '/api/updateContentMetaData') {
            // Clone the snippets array and update the due date of snippet-due-2
            return {
              ...mockSelectedContentWithDueData,
              snippets: [
                {
                  ...mockSelectedContentWithDueData.snippets[0],
                  reviewData: {
                    ...mockSelectedContentWithDueData.snippets[0].reviewData,
                    due: dueIn2Days(),
                  },
                },
                {
                  ...mockSelectedContentWithDueData.snippets[1],
                  reviewData: {
                    ...mockSelectedContentWithDueData.snippets[1].reviewData,
                    due: dueIn2Days(),
                  },
                },
                mockSelectedContentWithDueData.snippets[2],
              ],
            };
          }
          // Default mock response
          return {};
        });

      const reviewSecondSnippetBtn = screen.getByTestId('easy-snippet-due-2');
      reviewSecondSnippetBtn.click();
      await waitFor(() => {
        expect(
          screen.getByText('Updated content data ✅!'),
        ).toBeInTheDocument();
      });

      checkForReviewLabelText(1, 3, 3);
      checkingTimelineMarkers(1, 3, 3);

      jest
        .spyOn(apiLib, 'apiRequestWrapper')
        .mockImplementation(async (params) => {
          if (params.url === '/api/updateContentMetaData') {
            // Clone the snippets array and update the due date of snippet-due-2
            return {
              ...mockSelectedContentWithDueData,
              snippets: [
                {
                  ...mockSelectedContentWithDueData.snippets[0],
                  reviewData: {
                    ...mockSelectedContentWithDueData.snippets[0].reviewData,
                    due: dueIn2Days(),
                  },
                },
                {
                  ...mockSelectedContentWithDueData.snippets[1],
                  reviewData: {
                    ...mockSelectedContentWithDueData.snippets[1].reviewData,
                    due: dueIn2Days(),
                  },
                },
                {
                  ...mockSelectedContentWithDueData.snippets[2],
                  reviewData: {
                    ...mockSelectedContentWithDueData.snippets[2].reviewData,
                    due: dueIn2Days(),
                  },
                },
              ],
            };
          }
          // Default mock response
          return {};
        });

      const reviewThirdSnippetBtn = screen.getByTestId('easy-snippet-due-3');
      reviewThirdSnippetBtn.click();
      await waitFor(() => {
        expect(
          screen.getByText('Updated content data ✅!'),
        ).toBeInTheDocument();
      });

      checkForReviewLabelText(0, 3, 3);
      checkingTimelineMarkers(0, 3, 3);
    };

    const reviewWordsInReviewMode = async () => {
      checkWordsMetaData(3, '3/3');
      jest
        .spyOn(apiLib, 'apiRequestWrapper')
        .mockImplementation(async (params) => {
          if (params.url === '/api/updateWord') {
            // Clone the snippets array and update the due date of snippet-due-2
            return {
              reviewData: { ...mockWordsData[0].reviewData, due: dueIn2Days() },
            };
          }
          // Default mock response
          return {};
        });

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

    const checkSentenceMetaData = (dueCount, pendingCountText, reps) => {
      const sentenceDueText = screen.getByTestId('analytics-sentences-count');
      expect(sentenceDueText).toHaveTextContent(
        `Sentences: ${dueCount}/${pendingCountText}`,
      );

      expect(screen.getByText(`Reps: ${reps}`)).toBeInTheDocument();
      // expect(screen.getByTestId('progress-header-text')).toHaveTextContent('1/2'); // come back to when fixing and testing progress header
    };

    const reviewSentencesInReviewMode = async () => {
      expect(screen.queryByText('Done!')).not.toBeInTheDocument();
      checkSentenceMetaData(3, 3, 0);
      jest
        .spyOn(apiLib, 'apiRequestWrapper')
        .mockImplementation(async (params) => {
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
      // expect(screen.getByTestId('progress-header-text')).toHaveTextContent('1/2'); // come back to when fixing and testing progress header
    };

    beforeAll(() => {
      jest
        .spyOn(apiLib, 'apiRequestWrapper')
        .mockImplementation(async (params) => {
          if (params.url === '/api/getOnLoadData') {
            return {
              contentData: [mockSelectedContentWithDueData],
              wordsData: mockWordsData,
              sentencesData: [],
            };
          }

          // Default mock response
          return {};
        });
    });
    it('should allow user to review words/sentences/snippets', async () => {
      renderWithProvider(mockSelectedContentWithDueData);
      const onLoadTitle = await screen.findByText(mockTitle);
      expect(onLoadTitle).toBeDefined();
      checkForDefaultReviewModeMetaData();
      await switchToReviewMode();
      await reviewSnippetsInReviewMode();
      await reviewWordsInReviewMode();
      await reviewSentencesInReviewMode();
    });
  });
});
