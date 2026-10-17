import { render, screen } from '@testing-library/react';
import { pinyin } from 'pinyin-pro';
import { chinese, french, japanese } from '@/app/languages';
import getColorByIndex from '@/utils/get-color-by-index';
import { WordTypes } from '@/app/types/word-types';
import LearningScreenOverlayWordRail from './LearningScreenOverlayWordRail';
import { PLAYBACK_CAPTION_PLATE_CLASS } from './playbackCaptionSurface';

const mockLearningScreenState = {
  showWordHintsState: false,
  masterPlayComprehensive: null as null | {
    wordsFromSentence?: WordTypes[];
  },
};

jest.mock('./useLearningScreen', () => () => mockLearningScreenState);

function savedWord(
  surfaceForm: string,
  definition: string,
  transliteration = '',
): WordTypes {
  return {
    id: surfaceForm,
    baseForm: surfaceForm,
    contexts: [],
    definition,
    phonetic: '',
    reviewData: {} as WordTypes['reviewData'],
    surfaceForm,
    transliteration,
    originalContext: '',
    isDue: false,
  };
}

const savedWords = [
  savedWord('好想', 'really want to', 'hǎo xiǎng'),
  savedWord('在', 'at'),
  savedWord('现场', 'on-site', 'xiànchǎng'),
];

describe('LearningScreenOverlayWordRail', () => {
  beforeEach(() => {
    mockLearningScreenState.showWordHintsState = false;
    mockLearningScreenState.masterPlayComprehensive = null;
  });

  it('stays hidden unless word hints are on and the sentence has saved words', () => {
    mockLearningScreenState.showWordHintsState = true;
    mockLearningScreenState.masterPlayComprehensive = {
      wordsFromSentence: [],
    };

    const { rerender } = render(
      <LearningScreenOverlayWordRail languageSelectedState={chinese} />,
    );

    expect(
      screen.queryByTestId('learning-screen-overlay-word-rail'),
    ).not.toBeInTheDocument();

    mockLearningScreenState.showWordHintsState = false;
    mockLearningScreenState.masterPlayComprehensive = {
      wordsFromSentence: savedWords,
    };
    rerender(
      <LearningScreenOverlayWordRail languageSelectedState={chinese} />,
    );

    expect(
      screen.queryByTestId('learning-screen-overlay-word-rail'),
    ).not.toBeInTheDocument();
  });

  it('stacks each saved word, its reading, and its meaning in that word’s color', () => {
    mockLearningScreenState.showWordHintsState = true;
    mockLearningScreenState.masterPlayComprehensive = {
      wordsFromSentence: savedWords,
    };

    render(
      <LearningScreenOverlayWordRail languageSelectedState={chinese} />,
    );

    const rail = screen.getByTestId('learning-screen-overlay-word-rail');
    expect(rail).toHaveClass(
      'left-[3%]',
      'top-[10%]',
      'bottom-[10%]',
      'items-start',
      'gap-1',
    );

    const items = screen.getAllByTestId('learning-screen-overlay-word-rail-item');
    expect(items).toHaveLength(3);

    const expected = [
      { surfaceForm: '好想', reading: 'hǎo xiǎng', meaning: 'really want to' },
      {
        surfaceForm: '在',
        reading: pinyin('在', { toneType: 'symbol', separator: '\u2009' }),
        meaning: 'at',
      },
      { surfaceForm: '现场', reading: 'xiànchǎng', meaning: 'on-site' },
    ];

    expected.forEach((word, index) => {
      const item = items[index];
      expect(item).toHaveClass(
        'w-[100px]',
        'max-w-[100px]',
        'items-center',
        'gap-0',
        'pointer-events-auto',
        'hover:w-[240px]',
        'hover:max-w-[240px]',
      );

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
      expect(reading?.textContent).toBe(word.reading);
      expect(meaning).toHaveTextContent(word.meaning);
      for (const line of [surface, reading, meaning]) {
        for (const className of PLAYBACK_CAPTION_PLATE_CLASS.split(' ')) {
          expect(line).toHaveClass(className);
        }
        expect(line).toHaveClass('w-full', 'text-center');
        expect(line).toHaveStyle({ color: getColorByIndex(index) });
      }
      expect(surface).toHaveClass('text-sm');
      expect(reading).toHaveClass('text-xs');
      expect(meaning).toHaveClass('text-xs');
      expect(surface?.nextElementSibling).toBe(reading);
      expect(reading?.nextElementSibling).toBe(meaning);
    });
  });

  it('truncates a meaning to forty characters', () => {
    const meaning =
      'priority seat (on public transport, for those in need)';
    mockLearningScreenState.showWordHintsState = true;
    mockLearningScreenState.masterPlayComprehensive = {
      wordsFromSentence: [savedWord('博爱座', meaning, 'bó ài zuò')],
    };

    render(
      <LearningScreenOverlayWordRail languageSelectedState={chinese} />,
    );

    const shown = screen.getByTestId(
      'learning-screen-overlay-word-rail-meaning',
    );
    expect(shown.textContent).toHaveLength(40);
    expect(shown.textContent).toBe(`${meaning.slice(0, 39)}…`);
    expect(shown).toHaveClass('group-hover:hidden');

    const expanded = screen.getByTestId(
      'learning-screen-overlay-word-rail-meaning-expanded',
    );
    expect(expanded).toHaveTextContent(meaning);
    expect(expanded).toHaveClass('hidden', 'group-hover:block');
    expect(
      screen.getByTestId('learning-screen-overlay-word-rail-item'),
    ).toHaveClass('hover:w-[240px]', 'hover:max-w-[240px]');
  });

  it('shows a Japanese word’s stored transliteration', () => {
    mockLearningScreenState.showWordHintsState = true;
    mockLearningScreenState.masterPlayComprehensive = {
      wordsFromSentence: [
        savedWord('天気予報', 'weather forecast', 'tenki yohou'),
        savedWord('です', 'is'),
      ],
    };

    render(
      <LearningScreenOverlayWordRail languageSelectedState={japanese} />,
    );

    const readings = screen.getAllByTestId(
      'learning-screen-overlay-word-rail-pinyin',
    );
    expect(readings).toHaveLength(1);
    expect(readings[0]).toHaveTextContent('tenki yohou');
    expect(
      screen.getAllByTestId('learning-screen-overlay-word-rail-surface')[1]
        .nextElementSibling,
    ).toHaveAttribute(
      'data-testid',
      'learning-screen-overlay-word-rail-meaning',
    );
  });

  it('omits pinyin when the language is not Chinese', () => {
    mockLearningScreenState.showWordHintsState = true;
    mockLearningScreenState.masterPlayComprehensive = {
      wordsFromSentence: [
        savedWord('bonjour', 'hello', 'bon-zhoor'),
        savedWord('le monde', 'the world'),
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
