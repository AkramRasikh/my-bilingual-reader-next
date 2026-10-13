import { render, screen } from '@testing-library/react';
import { pinyin } from 'pinyin-pro';
import { chinese, french } from '@/app/languages';
import getColorByIndex from '@/utils/get-color-by-index';
import LearningScreenOverlayWordRail from './LearningScreenOverlayWordRail';
import { PLAYBACK_CAPTION_PLATE_CLASS } from './playbackCaptionSurface';

const mockLearningScreenState = {
  masterPlayComprehensive: null as null | {
    sentenceStructure?: string;
    vocab?: { meaning: string; surfaceForm: string }[];
  },
};

jest.mock('./useLearningScreen', () => () => mockLearningScreenState);

const vocab = [
  { meaning: 'really want to', surfaceForm: '好想' },
  { meaning: 'n/a', surfaceForm: '，' },
  { meaning: 'at', surfaceForm: '在' },
  { meaning: 'on-site', surfaceForm: '现场' },
];

describe('LearningScreenOverlayWordRail', () => {
  beforeEach(() => {
    mockLearningScreenState.masterPlayComprehensive = null;
  });

  it('stays hidden when the current sentence has no breakdown', () => {
    mockLearningScreenState.masterPlayComprehensive = {
      vocab,
    };

    const { rerender } = render(
      <LearningScreenOverlayWordRail languageSelectedState={chinese} />,
    );

    expect(
      screen.queryByTestId('learning-screen-overlay-word-rail'),
    ).not.toBeInTheDocument();

    mockLearningScreenState.masterPlayComprehensive = null;
    rerender(
      <LearningScreenOverlayWordRail languageSelectedState={chinese} />,
    );

    expect(
      screen.queryByTestId('learning-screen-overlay-word-rail'),
    ).not.toBeInTheDocument();
  });

  it('stacks the target word, pinyin, and meaning in that word’s color', () => {
    mockLearningScreenState.masterPlayComprehensive = {
      sentenceStructure: '好想 + 在 + 现场',
      vocab,
    };

    render(
      <LearningScreenOverlayWordRail languageSelectedState={chinese} />,
    );

    const rail = screen.getByTestId('learning-screen-overlay-word-rail');
    expect(rail).toHaveClass('left-[3%]', 'top-[10%]', 'bottom-[10%]');

    const items = screen.getAllByTestId('learning-screen-overlay-word-rail-item');
    expect(items).toHaveLength(3);

    const expected = [
      { surfaceForm: '好想', meaning: 'really want to', index: 0 },
      { surfaceForm: '在', meaning: 'at', index: 2 },
      { surfaceForm: '现场', meaning: 'on-site', index: 3 },
    ];

    expected.forEach((word, itemIndex) => {
      const item = items[itemIndex];
      expect(item).toHaveStyle({ color: getColorByIndex(word.index) });
      for (const className of PLAYBACK_CAPTION_PLATE_CLASS.split(' ')) {
        expect(item).toHaveClass(className);
      }

      const surface = item.querySelector(
        '[data-testid="learning-screen-overlay-word-rail-surface"]',
      );
      const reading = item.querySelector(
        '[data-testid="learning-screen-overlay-word-rail-pinyin"]',
      );
      const meaning = item.querySelector(
        '[data-testid="learning-screen-overlay-word-rail-meaning"]',
      );

      expect(surface).toHaveTextContent(word.surfaceForm);
      expect(reading?.textContent).toBe(
        pinyin(word.surfaceForm, { toneType: 'symbol', separator: '\u2009' }),
      );
      expect(meaning).toHaveTextContent(word.meaning);
      expect(surface?.nextElementSibling).toBe(reading);
      expect(reading?.nextElementSibling).toBe(meaning);
    });
  });

  it('omits pinyin when the language is not Chinese', () => {
    mockLearningScreenState.masterPlayComprehensive = {
      sentenceStructure: 'bonjour + le monde',
      vocab: [
        { meaning: 'hello', surfaceForm: 'bonjour' },
        { meaning: 'the world', surfaceForm: 'le monde' },
      ],
    };

    render(<LearningScreenOverlayWordRail languageSelectedState={french} />);

    expect(
      screen.queryByTestId('learning-screen-overlay-word-rail-pinyin'),
    ).not.toBeInTheDocument();
    expect(screen.getAllByTestId('learning-screen-overlay-word-rail-surface')[0])
      .toHaveTextContent('bonjour');
    expect(
      screen.getAllByTestId('learning-screen-overlay-word-rail-meaning')[0]
        .previousElementSibling,
    ).toHaveAttribute(
      'data-testid',
      'learning-screen-overlay-word-rail-surface',
    );
  });
});
