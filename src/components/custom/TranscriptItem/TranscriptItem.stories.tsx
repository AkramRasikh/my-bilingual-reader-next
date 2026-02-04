import type { Meta, StoryObj } from '@storybook/react';
import TranscriptItem from './index';
import { TranscriptItemProvider } from './TranscriptItemProvider';
import { FormattedTranscriptTypes, Snippet } from '@/app/types/content-types';
import { WordTypes } from '@/app/types/word-types';
import { OverlappingSnippetData } from '@/app/types/shared-types';

// Mock FormattedTranscriptTypes with Japanese content
const mockJapaneseContentItem: FormattedTranscriptTypes = {
  id: 'da4ecaaf-73c3-4a37-a2f3-91586f224336',
  baseLang: 'Hello, this is Toru Miyamoto.',
  targetLang: 'こんにちは宮本徹です',
  time: 0,
  meaning: 'Hello, I am Toru Miyamoto.',
  sentenceStructure:
    'こんにちは (hello) + 宮本 (Miyamoto) + 徹 (Toru) + です (is)',
  vocab: [
    {
      meaning: 'hello',
      surfaceForm: 'こんにちは',
    },
    {
      meaning: 'Miyamoto (a name)',
      surfaceForm: '宮本',
    },
    {
      meaning: 'Toru (a name)',
      surfaceForm: '徹',
    },
    {
      meaning: 'is (copula)',
      surfaceForm: 'です',
    },
  ],
  isDue: false,
  targetLangformatted: [
    {
      text: 'こんにちは',
      savedWords: [],
    },
    {
      text: '宮本',
      savedWords: [],
    },
    {
      text: '徹',
      savedWords: [],
    },
    {
      text: 'です',
      savedWords: [],
    },
  ],
  helperReviewSentence: false,
};

const mockJapaneseContentItemWithReview: FormattedTranscriptTypes = {
  id: '24f261a8-03c0-43ae-b6aa-6a28c81d4954',
  baseLang:
    "This statement goes far beyond the government's previous position, so it's become a major issue.",
  targetLang:
    'この発言がですね従来の政府見解を大きく乗り越えるものだということでですね',
  time: 56,
  meaning:
    'This statement greatly surpasses the traditional government viewpoint, it is said.',
  sentenceStructure:
    'この (this) + 発言 (statement) + が (subject marker) + ですね (affirmative ending) + 従来の (traditional) + 政府 (government) + 見解 (view) + を (object marker) + 大きく (greatly) + 乗り越える (overcome) + もの (thing) + だ (copula) + という (that is said) + ことで (as a matter of) + ですね (affirmative ending)',
  vocab: [
    {
      meaning: 'this',
      surfaceForm: 'この',
    },
    {
      meaning: 'statement',
      surfaceForm: '発言',
    },
    {
      meaning: '(subject marker)',
      surfaceForm: 'が',
    },
    {
      meaning: '(affirmative ending)',
      surfaceForm: 'ですね',
    },
    {
      meaning: 'traditional',
      surfaceForm: '従来の',
    },
    {
      meaning: 'government',
      surfaceForm: '政府',
    },
    {
      meaning: 'view',
      surfaceForm: '見解',
    },
  ],
  isDue: true,
  targetLangformatted: [
    {
      text: 'この',
      savedWords: [],
    },
    {
      text: '発言',
      savedWords: [],
    },
    {
      text: 'がですね',
      savedWords: [],
    },
    {
      text: '従来の',
      savedWords: [],
    },
    {
      text: '政府',
      savedWords: [],
    },
    {
      text: '見解',
      savedWords: [],
    },
    {
      text: 'を',
      savedWords: [],
    },
    {
      text: '大きく',
      savedWords: [],
    },
    {
      text: '乗り越えるものだということでですね',
      savedWords: [],
    },
  ],
  helperReviewSentence: false,
  reviewData: {
    interval: 1,
    repetition: 0,
    efactor: 2.5,
    dueDate: new Date('2026-01-01'),
  },
};

const mockJapaneseWeekly: FormattedTranscriptTypes = {
  id: '91d2d9cc-7c61-40fb-b7e3-a3126fa85285',
  baseLang: "This week's Toru Miyamoto Weekly",
  targetLang: '今週の週刊宮本徹は',
  time: 2,
  isDue: false,
  targetLangformatted: [
    {
      text: '今週の',
      savedWords: [],
    },
    {
      text: '週刊',
      savedWords: [],
    },
    {
      text: '宮本',
      savedWords: [],
    },
    {
      text: '徹',
      savedWords: [],
    },
    {
      text: 'は',
      savedWords: [],
    },
  ],
  helperReviewSentence: false,
};

// Mock Provider wrapper component
interface MockTranscriptItemWrapperProps {
  contentItem: FormattedTranscriptTypes;
  isInReviewMode?: boolean;
  isVideoPlaying?: boolean;
  savedSnippets?: Snippet[];
  wordsState?: WordTypes[];
  loopTranscriptState?: FormattedTranscriptTypes[];
}

const MockTranscriptItemWrapper = ({
  contentItem,
  isInReviewMode = false,
  isVideoPlaying = false,
  savedSnippets = [],
  wordsState = [],
  loopTranscriptState = [],
}: MockTranscriptItemWrapperProps) => {
  const mockProviderProps = {
    threeSecondLoopState: null,
    overlappingSnippetDataState: [] as OverlappingSnippetData[],
    contentItem,
    loopTranscriptState,
    masterPlay: null,
    isGenericItemsLoadingArrayState: [],
    snippetLoadingState: [],
    handleSaveWord: async () => {
      console.log('Save word clicked');
    },
    handleDeleteWordDataProvider: async () => {
      console.log('Delete word clicked');
      return true;
    },
    wordsState,
    isInReviewMode,
    onlyShowEngState: false,
    setLoopTranscriptState: () => {},
    handleReviewFunc: async () => {
      console.log('Review function called');
    },
    isVideoPlaying,
    handlePause: () => {
      console.log('Pause clicked');
    },
    handleFromHere: (time: number) => {
      console.log('Play from', time);
    },
    handleBreakdownSentence: async () => {
      console.log('Breakdown sentence');
    },
    isBreakingDownSentenceArrState: [],
    scrollToElState: null,
    wordsForSelectedTopic: [],
    languageSelectedState: 'Japanese',
    indexNum: 0,
    isComprehensiveMode: false,
    savedSnippetsMemoized: savedSnippets,
    handleDeleteSnippet: async () => {
      console.log('Delete snippet');
    },
    setThreeSecondLoopState: () => {},
    setContractThreeSecondLoopState: () => {},
    handlePlayFromHere: (time: number) => {
      console.log('Play from here', time);
    },
    biggestOverlappedSnippet: null,
    overlappingTextMemoized: null,
    handleSaveSnippet: async () => {
      console.log('Save snippet');
    },
    originalContext: '',
    isReadyForQuickReview: false,
  };

  return (
    <TranscriptItemProvider {...mockProviderProps}>
      <div className='max-w-4xl p-4'>
        <TranscriptItem />
      </div>
    </TranscriptItemProvider>
  );
};

const meta = {
  title: 'Components/TranscriptItem',
  component: MockTranscriptItemWrapper,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof MockTranscriptItemWrapper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    contentItem: mockJapaneseContentItem,
  },
};

export const WithVocabulary: Story = {
  args: {
    contentItem: mockJapaneseContentItem,
  },
};

export const WithSentenceStructure: Story = {
  args: {
    contentItem: mockJapaneseContentItemWithReview,
  },
};

export const SimpleTranscript: Story = {
  args: {
    contentItem: mockJapaneseWeekly,
  },
};

export const InReviewMode: Story = {
  args: {
    contentItem: mockJapaneseContentItemWithReview,
    isInReviewMode: true,
  },
};

export const WithLooping: Story = {
  args: {
    contentItem: mockJapaneseContentItem,
    loopTranscriptState: [mockJapaneseContentItem],
  },
};

export const VideoPlaying: Story = {
  args: {
    contentItem: mockJapaneseContentItem,
    isVideoPlaying: true,
  },
};

export const LongSentence: Story = {
  args: {
    contentItem: {
      id: 'long-sentence-id',
      baseLang:
        'The Japanese language is a fascinating and complex system with three writing systems: hiragana, katakana, and kanji. Each system serves a different purpose in written communication.',
      targetLang:
        '日本語はひらがな、カタカナ、漢字という3つの表記体系を持つ魅力的で複雑な言語です。それぞれの体系は書き言葉において異なる役割を果たしています。',
      time: 120,
      meaning:
        'Japanese is a fascinating and complex language with three writing systems.',
      sentenceStructure:
        '日本語 (Japanese) + は (topic marker) + ひらがな (hiragana) + カタカナ (katakana) + 漢字 (kanji) + という (called) + 3つの (three) + 表記 (writing) + 体系 (system) + を (object marker) + 持つ (have) + 魅力的 (fascinating) + で (and) + 複雑な (complex) + 言語 (language) + です (is)',
      vocab: [
        {
          meaning: 'Japanese language',
          surfaceForm: '日本語',
        },
        {
          meaning: 'hiragana',
          surfaceForm: 'ひらがな',
        },
        {
          meaning: 'katakana',
          surfaceForm: 'カタカナ',
        },
        {
          meaning: 'kanji',
          surfaceForm: '漢字',
        },
      ],
      isDue: false,
      targetLangformatted: [
        {
          text: '日本語',
          savedWords: [],
        },
        {
          text: 'は',
          savedWords: [],
        },
        {
          text: 'ひらがな、カタカナ、漢字',
          savedWords: [],
        },
        {
          text: 'という',
          savedWords: [],
        },
        {
          text: '3つの',
          savedWords: [],
        },
        {
          text: '表記',
          savedWords: [],
        },
        {
          text: '体系',
          savedWords: [],
        },
        {
          text: 'を',
          savedWords: [],
        },
        {
          text: '持つ',
          savedWords: [],
        },
        {
          text: '魅力的',
          savedWords: [],
        },
        {
          text: 'で',
          savedWords: [],
        },
        {
          text: '複雑な',
          savedWords: [],
        },
        {
          text: '言語',
          savedWords: [],
        },
        {
          text: 'です。',
          savedWords: [],
        },
      ],
      helperReviewSentence: false,
    },
  },
};

export const MultipleTranscriptItems: Story = {
  render: () => (
    <div className='space-y-4'>
      <MockTranscriptItemWrapper contentItem={mockJapaneseContentItem} />
      <MockTranscriptItemWrapper contentItem={mockJapaneseWeekly} />
      {/* <MockTranscriptItemWrapper
        contentItem={mockJapaneseContentItemWithReview}
      /> */}
    </div>
  ),
};
