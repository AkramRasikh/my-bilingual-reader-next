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
const closedWidthClass = 'xl:w-[calc(45rem+27rem+1.25rem)]';

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
    expect(videoColumn).toHaveClass(closedWidthClass);
    expect(videoColumn).not.toHaveClass(openWidthClass);

    fireEvent.click(toggle);

    expect(toggle).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('transcript-tab-trigger')).toBeInTheDocument();
    expect(videoColumn).toHaveClass(openWidthClass);
    expect(videoColumn).not.toHaveClass(closedWidthClass);
  });
});
