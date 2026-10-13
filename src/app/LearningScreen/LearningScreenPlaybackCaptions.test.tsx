import { render, screen } from '@testing-library/react';
import { PlaybackCaptionStack } from './LearningScreenPlaybackCaptions';

const previous = {
  targetLang: '上一句',
  baseLang: 'the previous sentence',
};

const current = {
  targetLang: '这一句',
  baseLang: 'this sentence',
};

describe('PlaybackCaptionStack', () => {
  it('shows only the playing sentence, with English underneath', () => {
    render(
      <PlaybackCaptionStack
        previous={previous}
        current={current}
        showEnglish
      />,
    );

    expect(
      screen.queryByTestId('playback-caption-previous-target'),
    ).not.toBeInTheDocument();
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

    expect(
      screen.queryByTestId('playback-caption-previous-target'),
    ).not.toBeInTheDocument();
    expect(screen.getByTestId('playback-caption-current-target')).toBeInTheDocument();
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

  it('shows the playing sentence at full size and does not draw a progress bar', () => {
    render(
      <PlaybackCaptionStack previous={previous} current={current} showEnglish />,
    );

    expect(
      screen.queryByRole('progressbar'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('playback-caption-previous-target'),
    ).not.toBeInTheDocument();
    expect(
      screen.getByTestId('playback-caption-current-target').parentElement,
    ).toHaveClass('text-base');
  });

  it('replaces the playing sentence instead of keeping the previous one on screen', () => {
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
        <PlaybackCaptionStack previous={null} current={first} showEnglish />,
      );

      rerender(
        <PlaybackCaptionStack
          previous={first}
          current={second}
          showEnglish
        />,
      );

      expect(
        screen.queryByTestId('playback-caption-previous-target'),
      ).not.toBeInTheDocument();
      expect(screen.queryByText('第一句')).not.toBeInTheDocument();
      expect(screen.getByTestId('playback-caption-current-target')).toHaveTextContent(
        '第二句',
      );
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();

      const fade = animate.mock.calls.find((call) => call[0]?.[0]?.opacity === 0);
      expect(fade?.[1]).toMatchObject({ duration: 450 });
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
