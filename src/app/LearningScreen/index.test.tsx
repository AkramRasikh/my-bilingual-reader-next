jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    // add other router methods/properties as needed
  }),
}));
// ...existing code...
import { render, screen } from '@testing-library/react';
import { LearningScreenProvider } from './LearningScreenProvider';
import { useFetchData } from '../Providers/FetchDataProvider';
import { ContentScreenContainer } from '../content/page';

// Mock the dependencies
jest.mock('../Providers/FetchDataProvider');
jest.mock('./LearningScreenContentContainer', () => {
  return function MockLearningScreenContentContainer() {
    return <div data-testid='content-container'>Content Container</div>;
  };
});
jest.mock('./LearningScreenLeftSideContainer', () => {
  return function MockLearningScreenLeftSideContainer() {
    return <div data-testid='left-side-container'>Left Side Container</div>;
  };
});

const mockUseFetchData = useFetchData as jest.MockedFunction<
  typeof useFetchData
>;

describe('LearningScreen', () => {
  const mockSelectedContent = {
    id: 'content-1',
    title: 'Test Content title',
    contentIndex: 0,
    content: [
      {
        id: 'sentence-1',
        targetLang: 'Hello world',
        baseLang: 'Hola mundo',
        time: 0,
      },
      {
        id: 'sentence-2',
        targetLang: 'How are you?',
        baseLang: '¿Cómo estás?',
        time: 2,
      },
    ],
    snippets: [],
  };

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

    // left side section
    expect(screen.getByText('Sentences: 0/0')).toBeInTheDocument();
    expect(screen.getByText('Words Due: 0')).toBeInTheDocument();
    expect(screen.getByText('Snippets Due: 0/0/0')).toBeInTheDocument();
    expect(screen.getByText('Reps: 0')).toBeInTheDocument();
    expect(screen.queryByText('Bulk Review: 0')).not.toBeInTheDocument();

    // navbar
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Test Content title')).toBeInTheDocument();
  });

  it('should render with correct container classes', () => {
    const { container } = renderWithProvider();
    const mainDiv = container.querySelector('.flex.gap-5.w-fit.mx-auto.mt-4');

    expect(mainDiv).toBeInTheDocument();
  });

  it('should render with empty content array', () => {
    const emptyContent = {
      ...mockSelectedContent,
      content: [],
    };

    renderWithProvider(emptyContent);

    expect(screen.getByTestId('chapter-navigation')).toBeInTheDocument();
    expect(screen.getByTestId('left-side-container')).toBeInTheDocument();
  });

  it('should render with content containing review data', () => {
    const contentWithReviews = {
      ...mockSelectedContent,
      content: [
        {
          id: 'sentence-1',
          targetLang: 'Hello world',
          baseLang: 'Hola mundo',
          time: 0,
          reviewData: {
            due: new Date(Date.now() - 1000).toISOString(),
          },
        },
      ],
    };

    renderWithProvider(contentWithReviews);

    expect(screen.getByTestId('chapter-navigation')).toBeInTheDocument();
  });

  it('should render with snippets data', () => {
    const contentWithSnippets = {
      ...mockSelectedContent,
      snippets: [
        {
          id: 'snippet-1',
          time: 1.5,
          targetLang: 'Hello',
          baseLang: 'Hola',
          reviewData: {
            due: new Date(Date.now() + 1000).toISOString(),
          },
        },
      ],
    };

    renderWithProvider(contentWithSnippets);

    expect(screen.getByTestId('left-side-container')).toBeInTheDocument();
  });
});
