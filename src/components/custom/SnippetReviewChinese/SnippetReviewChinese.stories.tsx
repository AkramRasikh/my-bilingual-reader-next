import type { Meta, StoryObj } from '@storybook/react';
import SnippetReviewChinese from './index';
import { LanguageEnum } from '@/app/languages';

import {
  mockSnippets,
  mockSnippetNoVocab,
  mockSnippetPartiallyBrokenDown,
  mockSelectedContentChinese,
} from './SnippetReviewChinese.mocks';
import { testSquashedOverlappingSnippetDataJapanese } from '@/app/LearningScreen/experimental/SnippetReview.mocks';

type SnippetReviewChineseStoryRootProps = {
  snippetData: (typeof mockSnippets)[0];
  languageSelectedState?: LanguageEnum;
};

const SnippetReviewChineseStoryRoot = ({
  snippetData,
  languageSelectedState = LanguageEnum.Chinese,
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
    wordsState={[]}
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
