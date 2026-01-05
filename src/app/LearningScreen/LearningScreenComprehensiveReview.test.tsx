import { render, screen, waitFor, within } from '@testing-library/react';
import { LearningScreenProvider } from './LearningScreenProvider';
import { FetchDataProvider } from '../Providers/FetchDataProvider';
import ContentScreen from '../content/page';
import { mockGetOnLoadData } from '@/utils/test-helpers';
import * as apiLib from '@/lib/api-request-wrapper';
import {
  mockSelectedContent,
  mockSelectedContentWithDueData,
} from './mock-data';
import { startReviewMode } from './LearningScreen.test';
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

const mockReviewSentence = () => {
  jest.spyOn(apiLib, 'apiRequestWrapper').mockImplementation(async (params) => {
    if (params.url === '/api/updateSentence') {
      const dueTime = new Date();
      dueTime.setMinutes(dueTime.getMinutes() + 5);
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
};
const dueDateOneDayAgo = new Date();
dueDateOneDayAgo.setDate(dueDateOneDayAgo.getDate() - 1);

const lastReviewDateTwoDaysAgo = new Date();
lastReviewDateTwoDaysAgo.setDate(lastReviewDateTwoDaysAgo.getDate() - 2);

const reviewSentenceIn5Mins = async () => {
  const againSRSToggleFirstSentence = screen.getByTestId(
    'again-sentence-due-1',
  );
  expect(againSRSToggleFirstSentence).toHaveTextContent('5 mins');
  mockReviewSentence();
  againSRSToggleFirstSentence.click();
  await waitFor(() => {
    expect(screen.getAllByText('Sentence reviewed ✅')).toHaveLength(1);
  });
  expect(screen.getByText('Reps: 1')).toBeInTheDocument();
};

describe('LearningScreen - comprehensive review', () => {
  beforeAll(() => {
    mockGetOnLoadData([mockSelectedContentWithDueData]);
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

  it.only('should show freshly added review content after it is added in to review AND within timebox', async () => {
    renderWithProvider(mockSelectedContentWithDueData);
    const sentenceCounter = await screen.findByTestId(
      'analytics-sentences-count',
    );
    expect(sentenceCounter).toHaveTextContent('Sentences: 3/3');
    startReviewMode(3);
    await reviewSentenceIn5Mins();

    // mock call ✅
    // wait 6 mins
    // review next one
    // the first one should not appear DESPITE it being due because we've timeboxed it
  });

  // xit('should lock in review session block given an interval and timeframe', async () => {});
});
