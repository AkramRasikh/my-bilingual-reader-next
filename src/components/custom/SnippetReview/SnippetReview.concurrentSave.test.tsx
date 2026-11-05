import { act, render, screen, within } from '@testing-library/react';
import SnippetReview from './index';
import { LanguageEnum } from '@/app/languages';
import { BUTTONS_STANDARD } from '@/app/LearningScreen/experimental/gamepadButtonMap';
import { clearSnippetReviewVisual } from './snippetReviewVisualMirror';

const snippet = {
  id: 'concurrent-snippet',
  baseLang: 'hello world',
  isContracted: false,
  isPreSnippet: true,
  time: 10,
  targetLang: '你好世界',
  suggestedFocusText: '你好世界',
  vocab: [
    { surfaceForm: '你', meaning: 'you' },
    { surfaceForm: '好', meaning: 'good' },
    { surfaceForm: '世界', meaning: 'world' },
  ],
};

function gamepad(pressedIndexes: number[]) {
  const buttons = Array.from({ length: 17 }, (_, index) => ({
    pressed: pressedIndexes.includes(index),
    touched: pressedIndexes.includes(index),
    value: pressedIndexes.includes(index) ? 1 : 0,
  }));
  return {
    id: 'test-pad',
    index: 0,
    connected: true,
    mapping: 'standard',
    timestamp: 0,
    axes: [0, 0, 0, 0],
    buttons,
  };
}

describe('SnippetReview concurrent word saves', () => {
  const pendingSaves: Array<() => void> = [];
  const handleSaveWord = jest.fn(
    () =>
      new Promise<void>((resolve) => {
        pendingSaves.push(resolve);
      }),
  );

  beforeEach(() => {
    jest.useFakeTimers();
    pendingSaves.length = 0;
    handleSaveWord.mockClear();
    clearSnippetReviewVisual(snippet.id);
    Object.defineProperty(navigator, 'getGamepads', {
      configurable: true,
      value: () => [gamepad([])],
    });
  });

  afterEach(async () => {
    await act(async () => {
      clearSnippetReviewVisual(snippet.id);
    });
    jest.useRealTimers();
  });

  async function tick(ms = 100) {
    await act(async () => {
      jest.advanceTimersByTime(ms);
    });
  }

  function hold(indexes: number[]) {
    Object.defineProperty(navigator, 'getGamepads', {
      configurable: true,
      value: () => [gamepad(indexes)],
    });
  }

  it('saves a second chunk while the first is still saving and keeps both spinners', async () => {
    render(
      <>
        <SnippetReview
          snippetData={snippet}
          handleLoopHere={() => {}}
          isVideoPlaying={false}
          threeSecondLoopState={null}
          handleUpdateSnippetComprehensiveReview={async () => {}}
          isReadyForQuickReview
          handleBreakdownSentence={async () => {}}
          getSentenceDataOfOverlappingWordsDuringSave={() => 'sentence-1'}
          selectedContentTitleState='Lesson'
          sentenceMapMemoized={{}}
          languageSelectedState={LanguageEnum.Chinese}
          wordsState={[]}
          handleSaveWord={handleSaveWord}
          handleDeleteWordDataProvider={() => {}}
          currentTime={9.7}
        />
        <SnippetReview
          snippetData={snippet}
          handleLoopHere={() => {}}
          isVideoPlaying={false}
          threeSecondLoopState={null}
          handleUpdateSnippetComprehensiveReview={async () => {}}
          isReadyForQuickReview
          handleBreakdownSentence={async () => {}}
          getSentenceDataOfOverlappingWordsDuringSave={() => 'sentence-1'}
          selectedContentTitleState='Lesson'
          sentenceMapMemoized={{}}
          languageSelectedState={LanguageEnum.Chinese}
          wordsState={[]}
          handleSaveWord={handleSaveWord}
          handleDeleteWordDataProvider={() => {}}
          currentTime={9.7}
          variant='overlay'
        />
      </>,
    );

    hold([BUTTONS_STANDARD.L_STICK_CLICK_BTN]);
    await tick();
    await tick();

    expect(handleSaveWord).toHaveBeenCalledTimes(1);
    expect(handleSaveWord.mock.calls[0][0].highlightedWord).toBe('你');

    hold([BUTTONS_STANDARD.R1_BTN]);
    await tick();
    hold([BUTTONS_STANDARD.L_STICK_CLICK_BTN]);
    await tick();

    expect(handleSaveWord).toHaveBeenCalledTimes(2);
    expect(handleSaveWord.mock.calls[1][0].highlightedWord).toBe('好');

    const panel = screen.getByTestId('snippet-review-item-concurrent-snippet');
    const overlay = screen.getByTestId(
      'snippet-review-overlay-concurrent-snippet',
    );
    expect(within(panel).getAllByTestId('snippet-word-save-spinner')).toHaveLength(
      2,
    );
    expect(
      within(overlay).getAllByTestId('snippet-word-save-spinner'),
    ).toHaveLength(2);

    pendingSaves.forEach((resolve) => resolve());
    await act(async () => {
      await Promise.resolve();
    });
  });
});
