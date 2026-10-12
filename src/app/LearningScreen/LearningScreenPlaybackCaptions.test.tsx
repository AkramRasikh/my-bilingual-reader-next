import { render, screen } from '@testing-library/react';
import {
  getCaptionSentenceProgress,
  PlaybackCaptionStack,
} from './LearningScreenPlaybackCaptions';

const previous = {
  targetLang: '上一句',
  baseLang: 'the previous sentence',
};

const current = {
  targetLang: '这一句',
  baseLang: 'this sentence',
};

describe('PlaybackCaptionStack', () => {
  it('shows the previous and current sentences with English under each', () => {
    render(
      <PlaybackCaptionStack
        previous={previous}
        current={current}
        showEnglish
      />,
    );

    expect(screen.getByTestId('playback-caption-previous-target')).toHaveTextContent(
      '上一句',
    );
    expect(screen.getByTestId('playback-caption-previous-base')).toHaveTextContent(
      'the previous sentence',
    );
    expect(screen.getByTestId('playback-caption-current-target')).toHaveTextContent(
      '这一句',
    );
    expect(screen.getByTestId('playback-caption-current-base')).toHaveTextContent(
      'this sentence',
    );
    expect(screen.getByTestId('playback-caption-current-base')).toHaveClass(
      'text-xs',
    );
  });

  it('omits the previous line when there is no previous sentence', () => {
    render(
      <PlaybackCaptionStack previous={null} current={current} showEnglish />,
    );

    expect(
      screen.queryByTestId('playback-caption-previous-target'),
    ).not.toBeInTheDocument();
    expect(screen.getByTestId('playback-caption-current-target')).toHaveTextContent(
      '这一句',
    );
  });

  it('hides English lines when showEnglish is false', () => {
    render(
      <PlaybackCaptionStack
        previous={previous}
        current={current}
        showEnglish={false}
      />,
    );

    expect(screen.getByTestId('playback-caption-previous-target')).toBeInTheDocument();
    expect(screen.getByTestId('playback-caption-current-target')).toBeInTheDocument();
    expect(
      screen.queryByTestId('playback-caption-previous-base'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('playback-caption-current-base'),
    ).not.toBeInTheDocument();
  });

  it('renders nothing when there is no current sentence', () => {
    const { container } = render(
      <PlaybackCaptionStack previous={previous} current={null} showEnglish />,
    );

    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByTestId('playback-captions')).not.toBeInTheDocument();
  });

  it('draws a progress bar only on the current sentence, with a smaller previous container', () => {
    render(
      <PlaybackCaptionStack
        previous={previous}
        current={current}
        showEnglish
        currentProgress={0.4}
        currentPhase='during'
      />,
    );

    expect(
      screen.queryByTestId('playback-caption-previous-progress'),
    ).not.toBeInTheDocument();
    expect(
      screen.getByTestId('playback-caption-previous-target').parentElement,
    ).toHaveClass('text-sm');

    const currentBar = screen.getByTestId('playback-caption-current-progress');
    expect(currentBar).toHaveAttribute('aria-valuenow', '40');
    expect(currentBar).toHaveClass('bg-amber-200');
    expect(screen.getByTestId('playback-caption-current-progress-fill')).toHaveStyle({
      width: '40%',
    });
    expect(currentBar.className).toContain('top-0');
    expect(
      screen.getByTestId('playback-caption-current-target').parentElement,
    ).toHaveClass('text-base');
  });

  it('moves the current sentence up into the previous slot when the sentence changes', () => {
    const animate = jest.fn(() => ({ cancel() {} }));
    const originalAnimate = HTMLElement.prototype.animate;
    HTMLElement.prototype.animate = animate as unknown as HTMLElement['animate'];
    const offsets = {
      offsetHeight: {
        get(this: HTMLElement) {
          return this.dataset.captionRole === 'previous' ? 32 : 48;
        },
      },
      offsetWidth: {
        get() {
          return 120;
        },
      },
      offsetTop: {
        get(this: HTMLElement) {
          return this.dataset.captionRole === 'previous' ? 0 : 40;
        },
      },
      offsetLeft: {
        get() {
          return 10;
        },
      },
    };
    const originals = Object.entries(offsets).map(([key, descriptor]) => {
      const original = Object.getOwnPropertyDescriptor(HTMLElement.prototype, key);
      Object.defineProperty(HTMLElement.prototype, key, {
        configurable: true,
        ...descriptor,
      });
      return [key, original] as const;
    });

    const first = { id: 'a', targetLang: '第一句', baseLang: 'first sentence' };
    const second = { id: 'b', targetLang: '第二句', baseLang: 'second sentence' };

    try {
      const { rerender } = render(
        <PlaybackCaptionStack
          previous={null}
          current={first}
          showEnglish
          currentProgress={0.2}
          currentPhase='during'
        />,
      );

      rerender(
        <PlaybackCaptionStack
          previous={first}
          current={second}
          showEnglish
          currentProgress={0.1}
          currentPhase='during'
        />,
      );

      expect(screen.getByTestId('playback-caption-previous-target')).toHaveTextContent(
        '第一句',
      );
      expect(screen.getByTestId('playback-caption-current-target')).toHaveTextContent(
        '第二句',
      );
      expect(
        screen.queryByTestId('playback-caption-previous-progress'),
      ).not.toBeInTheDocument();

      const slide = animate.mock.calls.find((call) =>
        String(call[0]?.[0]?.transform ?? '').includes('scale('),
      );
      expect(slide?.[1]).toMatchObject({ duration: 450 });
    } finally {
      HTMLElement.prototype.animate = originalAnimate;
      for (const [key, original] of originals) {
        if (original) {
          Object.defineProperty(HTMLElement.prototype, key, original);
        } else {
          delete (HTMLElement.prototype as unknown as Record<string, unknown>)[key];
        }
      }
    }
  });
});

describe('getCaptionSentenceProgress', () => {
  it('fills the current sentence from its start to the next sentence', () => {
    expect(
      getCaptionSentenceProgress(
        { time: 12, nextSentence: 14 },
        13,
        100,
      ),
    ).toEqual({ progress: 0.5, timeRangePhase: 'during' });

    expect(
      getCaptionSentenceProgress(
        { time: 11, nextSentence: 12 },
        13,
        100,
      ),
    ).toEqual({ progress: 1, timeRangePhase: 'beyond' });
  });
});
