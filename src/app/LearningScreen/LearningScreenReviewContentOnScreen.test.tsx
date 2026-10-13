import { render, screen } from '@testing-library/react';
import { PLAYBACK_CAPTION_PLATE_CLASS } from './playbackCaptionSurface';
import LearningScreenReviewContentOnScreen, {
  reviewWordLinesMatch,
} from './LearningScreenReviewContentOnScreen';

const mockLearningScreenState = {
  firstElIdInReview: null as string | null,
  firstWordDefinitionInReview: null as string | null,
  firstWordInReviewDisplay: null,
  postSnippetsMemoized: [] as unknown[],
  postSentencesMemoized: [] as Array<{
    id: string;
    targetLang: string;
    baseLang: string;
  }>,
  isSavedLoopPlayingState: null,
  currentTime: 0,
  ref: { current: null },
  mediaDuration: 10,
  sentenceMapMemoized: {},
  threeSecondLoopState: null,
  isVideoPlaying: false,
  handleUpdateSnippet: jest.fn(),
  isBreakingDownSentenceArrState: [],
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
    mockLearningScreenState.isInReviewMode = false;
    mockLearningScreenState.isSavedLoopPlayingState = null;
  });

  it('puts the caption plate behind a plain review sentence', () => {
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

  it('puts the caption plate on a review word line', () => {
    mockLearningScreenState.firstElIdInReview = 'word-1';
    mockLearningScreenState.firstWordDefinitionInReview = 'a greeting';

    render(<LearningScreenReviewContentOnScreen />);

    expectCaptionPlate(screen.getByTestId('learning-screen-review-word-text'));
  });
});
