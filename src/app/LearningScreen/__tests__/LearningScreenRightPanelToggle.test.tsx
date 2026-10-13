import { fireEvent, screen } from '@testing-library/react';
import {
  mockTitle,
  mockSelectedContent,
  renderWithProvider,
} from './test-helpers/test-utils';
import { mockGetOnLoadData } from './test-helpers/api-mocks';

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

const openWidthClass = 'xl:w-[45rem]';
const closedWidthClass =
  'xl:w-[min(calc(45rem+27rem+1.25rem),50rem,calc((100dvh-18rem)*16/9))]';

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
  mockGetOnLoadData([mockSelectedContent], [], []);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('LearningScreen right panel toggle', () => {
  it('hides the transcript column and gives its width to the video', async () => {
    await renderWithProvider();

    const toggle = await screen.findByTestId('right-panel-toggle');
    expect(toggle).toHaveAttribute('aria-pressed', 'true');
    expect(toggle).toHaveAccessibleName('Hide transcript panel');
    expect(toggle.previousElementSibling).toHaveTextContent('Total/Min');

    const videoColumn = screen.getByTestId('learning-screen-video-column');
    expect(screen.getByTestId('transcript-tab-trigger')).toBeInTheDocument();
    expect(videoColumn).toHaveClass(openWidthClass);
    expect(videoColumn).not.toHaveClass(closedWidthClass);

    fireEvent.click(toggle);

    expect(toggle).toHaveAttribute('aria-pressed', 'false');
    expect(toggle).toHaveAccessibleName('Show transcript panel');
    expect(screen.queryByTestId('transcript-tab-trigger')).not.toBeInTheDocument();
    expect(toggle.nextElementSibling).toHaveAttribute(
      'data-testid',
      'closed-panel-review-filters',
    );
    expect(screen.getByTestId('closed-panel-review-mode')).toHaveAttribute(
      'data-review-mode',
      'off',
    );
    const wordsInReview = screen.getByTestId('closed-panel-words-toggle');
    const sentencesInReview = screen.getByTestId('closed-panel-sentences-toggle');
    const snippetsInReview = screen.getByTestId('closed-panel-snippets-toggle');
    expect(wordsInReview).toBeChecked();
    expect(sentencesInReview).toBeChecked();
    expect(snippetsInReview).toBeChecked();
    expect(wordsInReview).toBeDisabled();
    expect(sentencesInReview).toBeDisabled();
    expect(snippetsInReview).toBeDisabled();
    expect(wordsInReview.parentElement?.parentElement).toHaveClass('opacity-40');
    expect(wordsInReview.nextElementSibling).toHaveTextContent('🔤 (0)');
    expect(sentencesInReview.nextElementSibling).toHaveTextContent('📝 (0)');
    expect(snippetsInReview.nextElementSibling).toHaveTextContent('✂️ (0)');

    fireEvent.click(wordsInReview);
    expect(wordsInReview).toBeChecked();
    expect(videoColumn).toHaveClass(closedWidthClass);
    expect(videoColumn).not.toHaveClass(openWidthClass);

    fireEvent.click(toggle);

    expect(toggle).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('transcript-tab-trigger')).toBeInTheDocument();
    expect(screen.queryByTestId('closed-panel-review-filters')).not.toBeInTheDocument();
    expect(videoColumn).toHaveClass(openWidthClass);
    expect(videoColumn).not.toHaveClass(closedWidthClass);
  });
});
