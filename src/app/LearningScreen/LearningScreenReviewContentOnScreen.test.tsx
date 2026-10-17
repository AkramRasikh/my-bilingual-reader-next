import { act, render, screen } from '@testing-library/react';
import { PLAYBACK_CAPTION_PLATE_CLASS } from './playbackCaptionSurface';
import LearningScreenReviewContentOnScreen, {
  reviewWordLinesMatch,
} from './LearningScreenReviewContentOnScreen';
import {
  publishReviewOverlayWait,
  resetReviewOverlayWait,
} from './reviewOverlayWait';

const mockLearningScreenState = {
  firstElIdInReview: null as string | null,
  firstWordDefinitionInReview: null as string | null,
  firstWordInReviewDisplay: null,
  postSnippetsMemoized: [] as unknown[],
  postSentencesMemoized: [] as Array<{
    id: string;
    targetLang: string;
    baseLang: string;
    meaning?: string;
  }>,
  isSavedLoopPlayingState: null,
  currentTime: 0,
  ref: { current: null },
  mediaDuration: 10,
  sentenceMapMemoized: {},
  threeSecondLoopState: null,
  isVideoPlaying: false,
  handleUpdateSnippet: jest.fn(),
  isBreakingDownSentenceArrState: [] as string[],
  handleBreakdownSentence: jest.fn(),
  getSentenceDataOfOverlappingWordsDuringSave: jest.fn(),
  selectedContentTitleState: '',
  handleSaveWord: jest.fn(),
  handleDeleteWordDataProvider: jest.fn(),
  setThreeSecondLoopState: jest.fn(),
  setContractThreeSecondLoopState: jest.fn(),
  handleLoopReviewMode: jest.fn(),
  isInReviewMode: false,
  onlyShowEngState: false,
  showPlaybackCaptionsState: false,
};

jest.mock('./useLearningScreen', () => () => mockLearningScreenState);

jest.mock('@/app/Providers/FetchDataProvider', () => ({
  useFetchData: () => ({
    languageSelectedState: 'Chinese',
    wordsState: [],
  }),
}));

function expectCaptionPlate(element: Element | null) {
  expect(element).not.toBeNull();
  for (const className of PLAYBACK_CAPTION_PLATE_CLASS.split(' ')) {
    expect(element).toHaveClass(className);
  }
}

describe('reviewWordLinesMatch', () => {
  it('treats the details line and transliteration as the same text', () => {
    expect(
      reviewWordLinesMatch(
        'J\'ai posé un pied au Québec',
        'J\'ai posé un pied au Québec',
      ),
    ).toBe(true);
    expect(
      reviewWordLinesMatch(
        'J\'ai posé un pied au Québec',
        '  J\'ai   posé un pied au Québec  ',
      ),
    ).toBe(true);
  });

  it('keeps a transliteration that adds something to the details line', () => {
    expect(
      reviewWordLinesMatch(
        'J\'ai posé un pied au Québec - I set foot in Quebec',
        'J\'ai posé un pied au Québec',
      ),
    ).toBe(false);
  });
});

describe('LearningScreenReviewContentOnScreen caption contrast', () => {
  beforeEach(() => {
    mockLearningScreenState.firstElIdInReview = null;
    mockLearningScreenState.firstWordDefinitionInReview = null;
    mockLearningScreenState.firstWordInReviewDisplay = null;
    mockLearningScreenState.postSentencesMemoized = [];
    mockLearningScreenState.postSnippetsMemoized = [];
    mockLearningScreenState.sentenceMapMemoized = {};
    mockLearningScreenState.isInReviewMode = false;
    mockLearningScreenState.isSavedLoopPlayingState = null;
    mockLearningScreenState.isBreakingDownSentenceArrState = [];
    resetReviewOverlayWait();
  });

  it('puts the caption plate behind a plain review sentence', () => {
    mockLearningScreenState.isInReviewMode = true;
    mockLearningScreenState.firstElIdInReview = 'sentence-1';
    mockLearningScreenState.postSentencesMemoized = [
      {
        id: 'sentence-1',
        targetLang: '你好',
        baseLang: 'hello',
      },
    ];

    render(<LearningScreenReviewContentOnScreen />);

    const target = screen.getByTestId(
      'learning-screen-review-sentence-target-lang',
    );
    expect(target).toHaveClass('text-white');
    expectCaptionPlate(target.parentElement?.parentElement ?? null);
  });

  it('puts a brick in the middle of the sentence overlay while that sentence is breaking down', () => {
    mockLearningScreenState.isInReviewMode = true;
    mockLearningScreenState.firstElIdInReview = 'sentence-1';
    mockLearningScreenState.postSentencesMemoized = [
      {
        id: 'sentence-1',
        targetLang: '你好',
        baseLang: 'hello',
      },
    ];
    mockLearningScreenState.isBreakingDownSentenceArrState = ['sentence-1'];

    render(<LearningScreenReviewContentOnScreen />);

    const plate = screen.getByTestId(
      'learning-screen-review-sentence-target-lang',
    ).parentElement?.parentElement;
    const brick = screen.getByTestId('sentence-breakdown-overlay-brick');
    expect(plate).toContainElement(brick);
    expect(plate).toHaveClass('opacity-60');
    expect(plate).toHaveAttribute('data-sentence-breakdown', 'on');
    expect(brick).toHaveClass('inset-0', 'items-center', 'justify-center');
    expect(brick.querySelector('span')).toHaveClass('opacity-60');
    expect(brick).toHaveTextContent('🧱');
  });

  it('shows the sentence meaning in place of the base language', () => {
    mockLearningScreenState.isInReviewMode = true;
    mockLearningScreenState.firstElIdInReview = 'sentence-1';
    mockLearningScreenState.postSentencesMemoized = [
      {
        id: 'sentence-1',
        targetLang: '你好',
        baseLang: 'hello',
        meaning: 'hello there',
      },
    ];

    render(<LearningScreenReviewContentOnScreen />);

    expect(
      screen.getByTestId('learning-screen-review-sentence-base-lang'),
    ).toHaveTextContent('hello there');
    expect(screen.queryByText('hello')).not.toBeInTheDocument();
  });

  it('puts the caption plate on a review word line', () => {
    mockLearningScreenState.isInReviewMode = true;
    mockLearningScreenState.firstElIdInReview = 'word-1';
    mockLearningScreenState.firstWordDefinitionInReview = 'a greeting';

    render(<LearningScreenReviewContentOnScreen />);

    expectCaptionPlate(screen.getByTestId('learning-screen-review-word-text'));
  });

  it('hides a queued review word after leaving review mode', () => {
    mockLearningScreenState.isInReviewMode = false;
    mockLearningScreenState.firstElIdInReview = 'word-1';
    mockLearningScreenState.firstWordDefinitionInReview = 'a greeting';

    render(<LearningScreenReviewContentOnScreen />);

    expect(
      screen.queryByTestId('learning-screen-review-word-text'),
    ).not.toBeInTheDocument();
  });

  it('gives each snippet overlay line its own solid beige plate', () => {
    mockLearningScreenState.isInReviewMode = true;
    mockLearningScreenState.isSavedLoopPlayingState = 'snip-1';
    mockLearningScreenState.postSnippetsMemoized = [
      {
        id: 'snip-1',
        time: 10,
        targetLang: '你好',
        baseLang: 'hello',
        vocab: [
          { surfaceForm: '你', meaning: 'you' },
          { surfaceForm: '好', meaning: 'good' },
        ],
      },
    ];

    render(<LearningScreenReviewContentOnScreen />);

    const frame = screen.getByTestId('learning-screen-review-snippet-focus-text');
    expect(frame).not.toHaveClass('bg-amber-50');
    expect(frame).not.toHaveClass('bg-amber-50/80');

    const lines = screen.getAllByTestId('snippet-overlay-line');
    expect(lines.length).toBeGreaterThan(1);
    for (const line of lines) {
      expect(line).toHaveClass('w-fit');
      expect(line).toHaveClass('bg-amber-100');
      expect(line).not.toHaveClass('bg-amber-50');
    }
  });

  it('puts the sentence meaning on the black review plate', () => {
    mockLearningScreenState.isInReviewMode = true;
    mockLearningScreenState.isSavedLoopPlayingState = 'snip-1';
    mockLearningScreenState.postSnippetsMemoized = [
      {
        id: 'snip-1',
        time: 10,
        targetLang: '你好',
        baseLang: 'hello',
        vocab: [],
      },
    ];
    mockLearningScreenState.sentenceMapMemoized = {
      'sentence-1': {
        time: 10,
        meaning: 'hello there',
      },
    };

    render(<LearningScreenReviewContentOnScreen />);

    const meaning = screen.getByTestId('snippet-review-overlay-meaning');
    expect(meaning).toHaveTextContent('hello there');
    expect(meaning).toHaveClass('bg-black/70');
    expect(meaning).toHaveClass('text-white');
    expect(meaning).not.toHaveClass('bg-amber-100');
  });

  it('dims the sentence, word, and snippet overlays while that review is in flight', () => {
    mockLearningScreenState.isInReviewMode = true;
    mockLearningScreenState.firstElIdInReview = 'sentence-1';
    mockLearningScreenState.postSentencesMemoized = [
      {
        id: 'sentence-1',
        targetLang: '你好',
        baseLang: 'hello',
      },
    ];
    publishReviewOverlayWait('other-item');
    const { rerender } = render(<LearningScreenReviewContentOnScreen />);
    expect(screen.queryByTestId('review-overlay-wait')).not.toBeInTheDocument();

    act(() => publishReviewOverlayWait('sentence-1'));
    const sentencePlate = screen
      .getByTestId('learning-screen-review-sentence-target-lang')
      .parentElement?.parentElement;
    const sentenceWait = screen.getByTestId('review-overlay-wait');
    expect(sentencePlate).toContainElement(sentenceWait);
    expect(sentenceWait).toHaveClass('inset-0', 'items-center', 'justify-center');
    expect(sentencePlate).toHaveClass('opacity-60');
    expect(sentencePlate).toHaveAttribute('data-review-wait', 'on');

    mockLearningScreenState.postSentencesMemoized = [];
    mockLearningScreenState.firstElIdInReview = 'word-1';
    mockLearningScreenState.firstWordDefinitionInReview = 'a greeting';
    act(() => publishReviewOverlayWait('word-1'));
    rerender(<LearningScreenReviewContentOnScreen />);
    const wordPlate = screen.getByTestId('learning-screen-review-word-text')
      .parentElement?.parentElement;
    expect(wordPlate).toContainElement(screen.getByTestId('review-overlay-wait'));
    expect(wordPlate).toHaveClass('opacity-60');
    expect(wordPlate).toHaveClass('max-w-[66.666%]');

    mockLearningScreenState.firstWordDefinitionInReview = null;
    mockLearningScreenState.isSavedLoopPlayingState = 'snip-1';
    mockLearningScreenState.postSnippetsMemoized = [
      {
        id: 'snip-1',
        time: 10,
        targetLang: '你好',
        baseLang: 'hello',
        vocab: [],
      },
    ];
    act(() => publishReviewOverlayWait('snip-1'));
    rerender(<LearningScreenReviewContentOnScreen />);
    expect(screen.getByTestId('review-overlay-wait')).toBeInTheDocument();
    expect(
      screen.getByTestId('learning-screen-review-snippet-focus-text'),
    ).toHaveClass('opacity-60');
  });
});
