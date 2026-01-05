import { render, screen, waitFor, within } from '@testing-library/react';
import { LearningScreenProvider } from './LearningScreenProvider';
import { FetchDataProvider } from '../Providers/FetchDataProvider';
import ContentScreen from '../content/page';
import { checkMetaDataOnLoad, mockGetOnLoadData } from '@/utils/test-helpers';
import * as apiLib from '@/lib/api-request-wrapper';
import { mockSelectedContent } from './mock-data';
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

const dueDateOneDayAgo = new Date();
dueDateOneDayAgo.setDate(dueDateOneDayAgo.getDate() - 1);

const lastReviewDateTwoDaysAgo = new Date();
lastReviewDateTwoDaysAgo.setDate(lastReviewDateTwoDaysAgo.getDate() - 2);

describe('LearningScreen - comprehensive review', () => {
  beforeAll(() => {
    mockGetOnLoadData([mockSelectedContent]);
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

  it('should show freshly added review content after it is added in to review AND within timebox', async () => {
    renderWithProvider();
    expect(await screen.findByText('Sentences: 0/0')).toBeInTheDocument();
    checkMetaDataOnLoad(mockTitle);
  });

  // xit('should lock in review session block given an interval and timeframe', async () => {});
});
