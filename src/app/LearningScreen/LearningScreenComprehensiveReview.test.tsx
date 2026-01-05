import { render, screen, waitFor, within } from '@testing-library/react';
import { LearningScreenProvider } from './LearningScreenProvider';
import { FetchDataProvider } from '../Providers/FetchDataProvider';
import ContentScreen from '../content/page';
import { mockGetOnLoadData } from '@/utils/test-helpers';
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
  });

  // xit('should lock in review session block given an interval and timeframe', async () => {});
});
