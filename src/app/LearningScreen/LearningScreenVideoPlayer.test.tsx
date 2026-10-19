import { render, screen } from '@testing-library/react';
import { chinese } from '@/app/languages';
import LearningScreenVideoPlayer from './LearningScreenVideoPlayer';

const mockLearningScreenState = {
  ref: { current: null },
  handleTimeUpdate: jest.fn(),
  handleLoadedMetadata: jest.fn(),
  setIsVideoPlaying: jest.fn(),
  threeSecondLoopState: null as number | null,
  handleSaveSnippet: undefined,
  overlappingTextMemoized: null,
  isSavedLoopPlayingState: null as string | null,
  isVideoPlaying: true,
  setThreeSecondLoopState: jest.fn(),
  currentTime: 0,
  mediaDuration: 10,
  loopTranscriptState: [] as Array<{ id: string }>,
};

jest.mock('./useLearningScreen', () => () => mockLearningScreenState);
jest.mock('./LearningScreenThreeSecondLoopEl', () => () => null);
jest.mock('./LearningScreenReviewContentOnScreen', () => () => null);
jest.mock('./LearningScreenPlaybackCaptions', () => () => null);
jest.mock('./LearningScreenOverlayWordRail', () => () => null);
jest.mock('./LearningScreenSnippetCoverageDot', () => () => null);

function renderPlayer() {
  return render(
    <LearningScreenVideoPlayer
      url='https://example.com/video.mp4'
      languageSelectedState={chinese}
      isRightPanelOpen={false}
    />,
  );
}

describe('LearningScreenVideoPlayer sentence loop indicator', () => {
  beforeEach(() => {
    mockLearningScreenState.threeSecondLoopState = null;
    mockLearningScreenState.isSavedLoopPlayingState = null;
    mockLearningScreenState.isVideoPlaying = true;
    mockLearningScreenState.loopTranscriptState = [];
  });

  it('shows a compact spinning loop mark and the sentence count', () => {
    mockLearningScreenState.loopTranscriptState = [
      { id: 'sentence-1' },
      { id: 'sentence-2' },
      { id: 'sentence-3' },
    ];

    renderPlayer();

    const indicator = screen.getByTestId(
      'learning-screen-sentence-loop-indicator',
    );
    expect(indicator).toHaveClass('gap-0.5', 'ml-[15px]');
    const icon = indicator.querySelector('svg');
    expect(icon).toHaveClass('size-3.5', 'animate-spin');
    expect(
      screen.getByTestId('learning-screen-sentence-loop-count'),
    ).toHaveTextContent('3');
    expect(document.querySelector('.text-amber-600')).not.toBeInTheDocument();
  });

  it('keeps the loop mark still while playback is paused', () => {
    mockLearningScreenState.isVideoPlaying = false;
    mockLearningScreenState.loopTranscriptState = [{ id: 'sentence-1' }];

    renderPlayer();

    expect(
      screen
        .getByTestId('learning-screen-sentence-loop-indicator')
        .querySelector('svg'),
    ).not.toHaveClass('animate-spin');
    expect(
      screen.getByTestId('learning-screen-sentence-loop-count'),
    ).toHaveTextContent('1');
  });

  it('stays hidden for a timed snippet loop', () => {
    mockLearningScreenState.threeSecondLoopState = 12;
    mockLearningScreenState.isSavedLoopPlayingState = 'snip-1';

    renderPlayer();

    expect(
      screen.queryByTestId('learning-screen-sentence-loop-indicator'),
    ).not.toBeInTheDocument();
    expect(document.querySelector('.text-amber-600')).toBeInTheDocument();
    expect(document.querySelector('.text-amber-600')).toHaveClass(
      'animate-spin',
    );
  });

  it('sits beside the amber spinner when a saved snippet and sentence loops are both active', () => {
    mockLearningScreenState.threeSecondLoopState = 12;
    mockLearningScreenState.isSavedLoopPlayingState = 'snip-1';
    mockLearningScreenState.loopTranscriptState = [
      { id: 'sentence-1' },
      { id: 'sentence-2' },
    ];

    renderPlayer();

    const spinner = document.querySelector('.text-amber-600');
    const indicator = screen.getByTestId(
      'learning-screen-sentence-loop-indicator',
    );
    expect(spinner).toBeInTheDocument();
    expect(indicator).not.toHaveClass('ml-[15px]');
    expect(indicator.parentElement).toContainElement(spinner?.parentElement ?? null);
    expect(
      screen.getByTestId('learning-screen-sentence-loop-count'),
    ).toHaveTextContent('2');
  });
});
