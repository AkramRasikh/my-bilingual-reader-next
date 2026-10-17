import { render, screen } from '@testing-library/react';
import { pinyin } from 'pinyin-pro';
import { chinese, french } from '@/app/languages';
import getColorByIndex from '@/utils/get-color-by-index';
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

  it('shows the sentence meaning in place of the base language', () => {
    render(
      <PlaybackCaptionStack
        previous={previous}
        current={{ ...current, meaning: 'what this sentence means' }}
        showEnglish
      />,
    );

    expect(screen.getByTestId('playback-caption-current-base')).toHaveTextContent(
      'what this sentence means',
    );
    expect(screen.queryByText('this sentence')).not.toBeInTheDocument();
  });

  it('keeps the base language when meaning is unavailable', () => {
    render(
      <PlaybackCaptionStack
        previous={previous}
        current={{ ...current, meaning: 'n/a' }}
        showEnglish
      />,
    );

    expect(screen.getByTestId('playback-caption-current-base')).toHaveTextContent(
      'this sentence',
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

  it('puts a brick in the middle of the caption while that sentence is breaking down', () => {
    render(
      <PlaybackCaptionStack
        previous={previous}
        current={{ ...current, id: 'sentence-1' }}
        showEnglish
        breakingDown
      />,
    );

    const plate = screen.getByTestId('playback-caption-current-target').parentElement;
    const brick = screen.getByTestId('sentence-breakdown-overlay-brick');
    expect(plate).toContainElement(brick);
    expect(plate).toHaveClass('opacity-60');
    expect(brick).toHaveClass('inset-0', 'items-center', 'justify-center');
    expect(brick.querySelector('span')).toHaveClass('opacity-60');
    expect(brick).toHaveTextContent('🧱');
  });

  it('draws a thin amber border when the playing sentence has been reviewed', () => {
    render(
      <PlaybackCaptionStack
        previous={previous}
        current={current}
        showEnglish
        reviewed
      />,
    );

    const plate = screen.getByTestId('playback-caption-current-target').parentElement;
    expect(plate).toHaveClass('border', 'border-amber-500');
    expect(plate).not.toHaveClass('border-2');
    expect(plate).toHaveAttribute('data-caption-reviewed', 'on');
  });

  it('leaves the caption border off when the playing sentence has not been reviewed', () => {
    render(
      <PlaybackCaptionStack previous={previous} current={current} showEnglish />,
    );

    const plate = screen.getByTestId('playback-caption-current-target').parentElement;
    expect(plate).not.toHaveClass('border-amber-500');
    expect(plate).toHaveAttribute('data-caption-reviewed', 'off');
  });

  it('shows the breakdown, word meanings, and pinyin when that caption is opened', () => {
    render(
      <PlaybackCaptionStack
        previous={null}
        current={{
          id: 'sentence-1',
          targetLang: '你好世界',
          baseLang: 'hello world',
          meaning: 'a greeting',
          sentenceStructure: 'greeting',
          vocab: [
            { surfaceForm: '你好', meaning: 'hello' },
            { surfaceForm: '世界', meaning: 'n/a' },
          ],
        }}
        showEnglish
        showBreakdown
        languageSelectedState={chinese}
      />,
    );

    expect(screen.getByTestId('playback-caption-current-target')).toHaveTextContent(
      '你好世界',
    );
    const helloPinyin = pinyin('你好', { toneType: 'symbol', separator: ' ' });
    const worldPinyin = pinyin('世界', { toneType: 'symbol', separator: ' ' });
    expect(screen.getByTestId('playback-caption-current-pinyin')).toHaveTextContent(
      `${helloPinyin} ${worldPinyin}`,
    );
    const meanings = screen.getByTestId('playback-caption-current-word-meanings');
    expect(meanings).toHaveTextContent('hello');
    expect(meanings).not.toHaveTextContent('n/a');
    expect(meanings.querySelector('span')).toHaveStyle({
      color: getColorByIndex(0),
    });
    expect(screen.getByTestId('playback-caption-current-base')).toHaveTextContent(
      'a greeting',
    );
  });

  it('keeps pinyin off the opened breakdown when the language is not Chinese', () => {
    render(
      <PlaybackCaptionStack
        previous={null}
        current={{
          targetLang: 'bonjour le monde',
          baseLang: 'hello world',
          sentenceStructure: 'greeting',
          vocab: [
            { surfaceForm: 'bonjour', meaning: 'hello' },
            { surfaceForm: 'le monde', meaning: 'the world' },
          ],
        }}
        showEnglish
        showBreakdown
        languageSelectedState={french}
      />,
    );

    expect(screen.queryByTestId('playback-caption-current-pinyin')).not.toBeInTheDocument();
    expect(screen.getByTestId('playback-caption-current-word-meanings')).toHaveTextContent(
      'hello',
    );
    expect(screen.getByTestId('playback-caption-current-word-meanings')).toHaveTextContent(
      'the world',
    );
  });

  it('puts a small brick on the left of a caption that already has a breakdown', () => {
    render(
      <PlaybackCaptionStack
        previous={null}
        current={{
          targetLang: '你好',
          baseLang: 'hello',
          sentenceStructure: 'greeting',
        }}
        showEnglish
      />,
    );

    const plate = screen.getByTestId('playback-caption-current-target').parentElement;
    const mark = screen.getByTestId('playback-caption-current-breakdown-mark');
    expect(plate).toContainElement(mark);
    expect(mark).toHaveTextContent('🧱');
    expect(mark).toHaveClass('left-1', 'text-[10px]', 'opacity-70');
  });

  it('leaves the brick off a caption that has not been broken down', () => {
    render(
      <PlaybackCaptionStack previous={null} current={current} showEnglish />,
    );

    expect(
      screen.queryByTestId('playback-caption-current-breakdown-mark'),
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
