import type { Meta, StoryObj } from '@storybook/react';
import { useGamepad } from '@/app/LearningScreen/experimental/useGamePad';
import SnippetReviewChinese from './index';
import { LanguageEnum } from '@/app/languages';

import {
  mockSnippets,
  mockSnippetNoVocab,
  mockSnippetPartiallyBrokenDown,
  mockSnippetRepeatedSingular,
  mockSelectedContentChinese,
  mockArabicSnippet,
  mockFrenchSnippet,
} from './SnippetReview.mocks';
import { testSquashedOverlappingSnippetDataJapanese } from '@/app/LearningScreen/experimental/SnippetReview.mocks';
import { WordTypes } from '@/app/types/word-types';

type SnippetReviewChineseStoryRootProps = {
  snippetData: (typeof mockSnippets)[0];
  languageSelectedState?: LanguageEnum;
};

function bridgeStorybookGamepads() {
  if (typeof window === 'undefined' || window.parent === window) return;

  const nav = navigator as Navigator & { __snippetReviewPadsBridged?: boolean };
  if (nav.__snippetReviewPadsBridged) return;

  const original = navigator.getGamepads.bind(navigator);
  navigator.getGamepads = () => {
    const local = original();
    if (Array.from(local).some((pad) => pad !== null)) return local;

    try {
      const parentPads = window.parent.navigator.getGamepads();
      if (Array.from(parentPads).some((pad) => pad !== null)) return parentPads;
    } catch {
      return local;
    }

    return local;
  };
  nav.__snippetReviewPadsBridged = true;
}

function StorybookSnippetGamepad({ loopTime }: { loopTime: number }) {
  bridgeStorybookGamepads();
  useGamepad(() => {}, loopTime || 1, false, false);
  return null;
}

const SnippetReviewChineseStoryRoot = ({
  snippetData,
  languageSelectedState = LanguageEnum.Chinese,
  wordsState = [],
}: SnippetReviewChineseStoryRootProps) => (
  <SnippetReviewChinese
    snippetData={snippetData}
    handleLoopHere={() => {}}
    isVideoPlaying={false}
    threeSecondLoopState={null}
    handleUpdateSnippetComprehensiveReview={async () => {}}
    isReadyForQuickReview={true}
    handleBreakdownSentence={async () => {}}
    isBreakingDownSentenceArrState={[]}
    getSentenceDataOfOverlappingWordsDuringSave={() => null}
    selectedContentTitleState={mockSelectedContentChinese.title}
    sentenceMapMemoized={{}}
    languageSelectedState={languageSelectedState}
    wordsState={wordsState}
    handleSaveWord={async () => {}}
    handleDeleteWordDataProvider={async () => {}}
    currentTime={snippetData.time - 0.3}
  />
);

const meta = {
  title: 'LearningScreen/SnippetReviewChinese',
  component: SnippetReviewChineseStoryRoot,
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story, context) => {
      if (context.viewMode !== 'story') return <Story />;

      const snippetData = context.args.snippetData;
      const loopTime =
        snippetData && typeof snippetData.time === 'number' ? snippetData.time : 1;

      return (
        <>
          <p className='mb-3 text-xs text-muted-foreground'>
            Click this canvas once, then use the controller. Boundary moves, word
            selection, and the review buttons are live on this card.
          </p>
          <StorybookSnippetGamepad loopTime={loopTime} />
          <Story />
        </>
      );
    },
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof SnippetReviewChineseStoryRoot>;

export default meta;

type Story = StoryObj<typeof meta>;

export const DefaultSnippet: Story = {
  args: {
    snippetData: mockSnippets[0],
  },
};

export const FocusedSnippet: Story = {
  args: {
    snippetData: mockSnippets[1],
  },
};

export const ContractedSnippet: Story = {
  args: {
    snippetData: mockSnippets[2],
  },
};

export const RepeatedSingularCharacters: Story = {
  args: {
    snippetData: mockSnippetRepeatedSingular,
  },
};
export const SnippetNoVocab: Story = {
  args: {
    snippetData: mockSnippetNoVocab,
  },
};

export const SnippetPartiallyBrokenDown: Story = {
  args: {
    snippetData: mockSnippetPartiallyBrokenDown,
  },
};

export const DefaultJapanese: Story = {
  args: {
    snippetData: testSquashedOverlappingSnippetDataJapanese,
    languageSelectedState: LanguageEnum.Japanese,
  },
};

export const DefaultArabic: Story = {
  args: {
    snippetData: mockArabicSnippet,
    languageSelectedState: LanguageEnum.Arabic,
  },
};
export const DefaultFrench: Story = {
  args: {
    snippetData: mockFrenchSnippet,
    languageSelectedState: LanguageEnum.French,
    wordsState: [
      {
        id: 'word1',
        baseForm: 'enthousiaste',
        surfaceForm: 'enthousiaste',
        definition: 'enthusiastic',
        phonetic: 'ɑ̃tuzjast',
        transliteration: 'ɑ̃tuzjast',
        originalContext: 'sentence-1',
        reviewData: {
          difficulty: 6.70746009,
          due: '2026-02-13T05:00:00.000Z',
          ease: 2.5,
          elapsed_days: 2,
          interval: 0,
          lapses: 0,
          last_review: '2026-02-10T10:19:53.195Z',
          reps: 3,
          scheduled_days: 3,
          stability: 4.85428674,
          state: 2,
        },
      } as WordTypes,
    ],
  },
};
