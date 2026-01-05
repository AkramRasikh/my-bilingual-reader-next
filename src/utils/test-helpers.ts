import { screen, within } from '@testing-library/react';
import * as apiLib from '@/lib/api-request-wrapper';

type ApiMockHandler = (params: { url: string; [key: string]: any }) => Promise<any>;

/**
 * Creates a mock implementation for apiRequestWrapper with custom handlers
 * @param handlers - Object mapping URLs to their mock responses or handler functions
 * @returns Jest spy instance
 * 
 * @example
 * ```ts
 * mockApiRequestWrapper({
 *   '/api/getOnLoadData': {
 *     contentData: [mockContent],
 *     wordsData: [],
 *     sentencesData: [],
 *   },
 *   '/api/updateSentence': (params) => ({
 *     reviewData: { ... }
 *   }),
 * });
 * ```
 */
export function mockApiRequestWrapper(
  handlers: Record<string, any | ((params: any) => any | Promise<any>)>
) {
  return jest.spyOn(apiLib, 'apiRequestWrapper').mockImplementation(async (params) => {
    const handler = handlers[params.url];
    
    if (handler !== undefined) {
      // If handler is a function, call it with params
      if (typeof handler === 'function') {
        return await handler(params);
      }
      // Otherwise return the static value
      return handler;
    }
    
    // Default mock response if no handler matched
    return {};
  });
}

/**
 * Creates a simple mock for getOnLoadData endpoint
 * @param contentData - Array of content objects
 * @param wordsData - Array of word objects (defaults to [])
 * @param sentencesData - Array of sentence objects (defaults to [])
 * @returns Jest spy instance
 */
export function mockGetOnLoadData(
  contentData: any[] = [],
  wordsData: any[] = [],
  sentencesData: any[] = []
) {
  return mockApiRequestWrapper({
    '/api/getOnLoadData': {
      contentData,
      wordsData,
      sentencesData,
    },
  });
}

/**
 * Test helper assertions for LearningScreen components
 */

/**
 * Checks the initial metadata state when content loads with no review data
 * @param mockTitle - The expected content title to verify
 */
export const checkMetaDataOnLoad = (mockTitle: string) => {
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

/**
 * Checks words metadata displays correct counts
 * @param wordsNumber - Expected number of words
 * @param wordTabText - Expected words tab text (e.g., "3/3")
 */
export const checkWordsMetaData = (wordsNumber: number, wordTabText: string) => {
  expect(screen.getByText(`Words Due: ${wordsNumber}`)).toBeInTheDocument();
  const breadcrumbWordsButton = screen.getByTestId('breadcrumb-words-button');
  expect(breadcrumbWordsButton).toHaveTextContent(`Words (${wordsNumber})`);
  const wordsTabTrigger = screen.getByTestId('words-tab-trigger');

  expect(wordsTabTrigger).toHaveTextContent(`Words ${wordTabText}`);
};

/**
 * Checks review toggles are in their disabled initial state
 */
export const checkReviewTogglesOnLoad = () => {
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

/**
 * Checks tab triggers display correct initial state
 */
export const checkTabTriggersOnLoad = () => {
  expect(screen.getByTestId('transcript-tab-trigger')).toBeInTheDocument();
  const wordsTabTrigger = screen.getByTestId('words-tab-trigger');
  expect(wordsTabTrigger).toBeDisabled();
  expect(wordsTabTrigger).toHaveTextContent('Words 0/0');
  expect(screen.getByTestId('meta-tab-trigger')).toBeInTheDocument();
};

/**
 * Checks timeline markers have correct counts
 * @param snippets - Expected number of snippet markers
 * @param words - Expected number of word markers
 * @param sentence - Expected number of sentence markers
 */
export const checkingTimelineMarkers = (snippets = 0, words = 0, sentence = 0) => {
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
