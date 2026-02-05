import type { Meta, StoryObj } from '@storybook/react';
import TranscriptItem from './index';
import { TranscriptItemProvider } from './TranscriptItemProvider';
import { FormattedTranscriptTypes, Snippet } from '@/app/types/content-types';
import { WordTypes } from '@/app/types/word-types';
import { OverlappingSnippetData } from '@/app/types/shared-types';
import { underlineWordsInSentence } from '@/utils/sentence-formatting/underline-words-in-sentences';
import { State } from 'ts-fsrs';

const mockHatsugenWord: WordTypes = {
  id: 'word-hatsugen-001',
  baseForm: '発言',
  surfaceForm: '発言',
  definition: 'statement; remark; utterance',
  phonetic: 'はつげん',
  transliteration: 'hatsugen',
  contexts: ['24f261a8-03c0-43ae-b6aa-6a28c81d4954'],
  originalContext:
    'この発言がですね従来の政府見解を大きく乗り越えるものだということでですね',
  isDue: false,
  reviewData: {
    due: new Date('2027-01-01'),
    stability: 1,
    difficulty: 5,
    elapsed_days: 0,
    scheduled_days: 1,
    reps: 1,
    lapses: 0,
    state: State.New,
    last_review: new Date('2026-01-15'),
  },
  time: 56,
};

const mockYataiRegionWord: WordTypes = {
  id: 'word-yatai-region-001',
  baseForm: '亚太地区',
  surfaceForm: '亚太地区',
  definition: 'Asia-Pacific region',
  phonetic: 'yatai diqu',
  transliteration: 'yatai diqu',
  contexts: ['8db44c79-9f0d-41ce-bfe1-6d8ab9d7e312'],
  originalContext:
    '台湾的地缘政治问题涉及中国对主权的主张、美国对台湾的支持，以及亚太地区权力平衡的复杂互动。',
  isDue: false,
  reviewData: {
    due: new Date('2027-01-01'),
    stability: 1,
    difficulty: 5,
    elapsed_days: 0,
    scheduled_days: 1,
    reps: 1,
    lapses: 0,
    state: State.New,
    last_review: new Date('2026-01-15'),
  },
  time: 12,
};

const mockTadakhulatWord: WordTypes = {
  id: 'word-tadakhulat-001',
  baseForm: 'التدخلات',
  surfaceForm: 'التدخلات',
  definition: 'interventions',
  phonetic: 'al-tadakhulat',
  transliteration: 'al-tadakhulat',
  contexts: ['f2e0f5e6-9fb1-4d5e-8a4d-6d29b6df1a2c'],
  originalContext:
    'الحرب في السودان أصبحت أكثر تعقيدًا بسبب التدخلات الإقليمية، بما في ذلك الدور المثير للجدل الذي تُتهم به الإمارات.',
  isDue: false,
  reviewData: {
    due: new Date('2027-01-01'),
    stability: 1,
    difficulty: 5,
    elapsed_days: 0,
    scheduled_days: 1,
    reps: 1,
    lapses: 0,
    state: State.New,
    last_review: new Date('2026-01-15'),
  },
  time: 18,
};

// Base mock object with common properties
const baseMockContentItem: FormattedTranscriptTypes = {
  id: '24f261a8-03c0-43ae-b6aa-6a28c81d4954',
  baseLang:
    "This statement goes far beyond the government's previous position, so it's become a major issue.",
  targetLang:
    'この発言がですね従来の政府見解を大きく乗り越えるものだということでですね',
  time: 56,
  isDue: false,
  targetLangformatted: underlineWordsInSentence(
    'この発言がですね従来の政府見解を大きく乗り越えるものだということでですね',
    [mockHatsugenWord],
  ),
  wordsFromSentence: [mockHatsugenWord],
  helperReviewSentence: false,
};

// Simple variant - just the base
const mockJapaneseContentItem = baseMockContentItem;

// Variant with full sentence breakdown (meaning, vocab, sentenceStructure)
const mockJapaneseContentItemWithBreakdown: FormattedTranscriptTypes = {
  ...baseMockContentItem,
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
      meaning: '(subject marker) + (affirmative ending)',
      surfaceForm: 'がですね',
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
    {
      meaning: '(object marker)',
      surfaceForm: 'を',
    },
    {
      meaning: 'greatly',
      surfaceForm: '大きく',
    },
    {
      meaning: 'overcome',
      surfaceForm: '乗り越える',
    },
    {
      meaning: 'thing',
      surfaceForm: 'もの',
    },
    {
      meaning: '(copula)',
      surfaceForm: 'だ',
    },
    {
      meaning: 'that is said',
      surfaceForm: 'という',
    },
    {
      meaning: 'as a matter of',
      surfaceForm: 'ことで',
    },
    {
      meaning: '(affirmative ending)',
      surfaceForm: 'ですね',
    },
  ],
};

// Variant with review data
const mockJapaneseContentItemWithReview: FormattedTranscriptTypes = {
  ...mockJapaneseContentItemWithBreakdown,
  isDue: true,
  reviewData: {
    due: new Date('2026-01-01'),
    stability: 1,
    difficulty: 5,
    elapsed_days: 0,
    scheduled_days: 1,
    reps: 1,
    lapses: 0,
    state: State.Review,
    last_review: new Date('2025-12-31'),
  },
};

const mockChineseContentItem: FormattedTranscriptTypes = {
  id: '8db44c79-9f0d-41ce-bfe1-6d8ab9d7e312',
  baseLang:
    'Taiwan’s geopolitical issue involves China’s claims of sovereignty, the United States’ support for Taiwan, and the complex interactions shaping the balance of power in the Asia-Pacific region.',
  targetLang:
    '台湾的地缘政治问题涉及中国对主权的主张、美国对台湾的支持，以及亚太地区权力平衡的复杂互动。',
  time: 12,
  isDue: false,
  meaning:
    'Taiwan’s geopolitical issue involves China’s claims of sovereignty, the United States’ support for Taiwan, and the complex interactions shaping the balance of power in the Asia-Pacific region.',
  sentenceStructure:
    '台湾的 (Taiwan’s) + 地缘政治问题 (geopolitical issue) + 涉及 (involves) + 中国对主权的主张 (China’s claims of sovereignty) + 、 (comma) + 美国对台湾的支持 (the United States’ support for Taiwan) + ， (comma) + 以及 (and) + 亚太地区 (Asia-Pacific region) + 权力平衡 (balance of power) + 的 (of) + 复杂互动 (complex interactions) + 。 (period)',
  vocab: [
    {
      meaning: 'Taiwan’s',
      surfaceForm: '台湾的',
    },
    {
      meaning: 'geopolitical issue',
      surfaceForm: '地缘政治问题',
    },
    {
      meaning: 'involves',
      surfaceForm: '涉及',
    },
    {
      meaning: 'China’s claims of sovereignty',
      surfaceForm: '中国对主权的主张',
    },
    {
      meaning: 'the United States’ support for Taiwan',
      surfaceForm: '美国对台湾的支持',
    },
    {
      meaning: 'Asia-Pacific region',
      surfaceForm: '亚太地区',
    },
    {
      meaning: 'balance of power',
      surfaceForm: '权力平衡',
    },
    {
      meaning: 'complex interactions',
      surfaceForm: '复杂互动',
    },
  ],
  targetLangformatted: underlineWordsInSentence(
    '台湾的地缘政治问题涉及中国对主权的主张、美国对台湾的支持，以及亚太地区权力平衡的复杂互动。',
    [mockYataiRegionWord],
  ),
  wordsFromSentence: [mockYataiRegionWord],
  helperReviewSentence: false,
};

const mockArabicContentItem: FormattedTranscriptTypes = {
  id: 'f2e0f5e6-9fb1-4d5e-8a4d-6d29b6df1a2c',
  baseLang:
    'The war in Sudan has become more complex due to regional interventions, including the controversial role that the UAE is accused of playing.',
  targetLang:
    'الحرب في السودان أصبحت أكثر تعقيدًا بسبب التدخلات الإقليمية، بما في ذلك الدور المثير للجدل الذي تُتهم به الإمارات.',
  time: 18,
  isDue: false,
  meaning:
    'The war in Sudan has become more complex due to regional interventions, including the controversial role that the UAE is accused of playing.',
  sentenceStructure:
    'الحرب (the war) + في (in) + السودان (Sudan) + أصبحت (has become) + أكثر (more) + تعقيدًا (complex) + بسبب (due to) + التدخلات (interventions) + الإقليمية (regional) + ، (comma) + بما في ذلك (including) + الدور (the role) + المثير (controversial) + للجدل (debated) + الذي (that) + تُتهم (is accused) + به (of) + الإمارات (the UAE) + 。 (period)',
  vocab: [
    {
      meaning: 'the war',
      surfaceForm: 'الحرب',
    },
    {
      meaning: 'in',
      surfaceForm: 'في',
    },
    {
      meaning: 'Sudan',
      surfaceForm: 'السودان',
    },
    {
      meaning: 'has become',
      surfaceForm: 'أصبحت',
    },
    {
      meaning: 'more',
      surfaceForm: 'أكثر',
    },
    {
      meaning: 'complex',
      surfaceForm: 'تعقيدًا',
    },
    {
      meaning: 'due to',
      surfaceForm: 'بسبب',
    },
    {
      meaning: 'interventions',
      surfaceForm: 'التدخلات',
    },
    {
      meaning: 'regional',
      surfaceForm: 'الإقليمية',
    },
    {
      meaning: 'including',
      surfaceForm: 'بما في ذلك',
    },
    {
      meaning: 'the role',
      surfaceForm: 'الدور',
    },
    {
      meaning: 'controversial',
      surfaceForm: 'المثير للجدل',
    },
    {
      meaning: 'that',
      surfaceForm: 'الذي',
    },
    {
      meaning: 'is accused',
      surfaceForm: 'تُتهم',
    },
    {
      meaning: 'of',
      surfaceForm: 'به',
    },
    {
      meaning: 'the UAE',
      surfaceForm: 'الإمارات',
    },
  ],
  targetLangformatted: underlineWordsInSentence(
    'الحرب في السودان أصبحت أكثر تعقيدًا بسبب التدخلات الإقليمية، بما في ذلك الدور المثير للجدل الذي تُتهم به الإمارات.',
    [mockTadakhulatWord],
  ),
  wordsFromSentence: [mockTadakhulatWord],
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
  isBreakingDownSentenceArrState?: string[];
  masterPlay?: string | null;
  languageSelectedState?: string;
}

const MockTranscriptItemWrapper = ({
  contentItem,
  isInReviewMode = false,
  isVideoPlaying = false,
  savedSnippets = [],
  wordsState = [],
  loopTranscriptState = [],
  isBreakingDownSentenceArrState = [],
  masterPlay = null,
  languageSelectedState = 'Japanese',
}: MockTranscriptItemWrapperProps) => {
  const mockProviderProps = {
    threeSecondLoopState: null,
    overlappingSnippetDataState: [] as OverlappingSnippetData[],
    contentItem,
    loopTranscriptState,
    masterPlay,
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
    isBreakingDownSentenceArrState,
    scrollToElState: null,
    wordsForSelectedTopic: [],
    languageSelectedState,
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
    wordsState: [mockHatsugenWord],
  },
};

export const WithSentenceBreakdown: Story = {
  args: {
    contentItem: mockJapaneseContentItemWithBreakdown,
  },
};

export const InReviewMode: Story = {
  args: {
    contentItem: mockJapaneseContentItemWithReview,
    isInReviewMode: true,
  },
};

export const Chinese: Story = {
  args: {
    contentItem: mockChineseContentItem,
    wordsState: [mockYataiRegionWord],
    languageSelectedState: 'Chinese',
  },
};

export const Arabic: Story = {
  args: {
    contentItem: mockArabicContentItem,
    wordsState: [mockTadakhulatWord],
    languageSelectedState: 'Arabic',
  },
};

export const Interactive: Story = {
  args: {
    isInReviewMode: false,
    isVideoPlaying: false,
    isLooping: false,
    isBreakingDown: false,
    isMasterPlay: false,
    reviewState: 'not-review',
    contentItem: mockJapaneseContentItem,
  },
  argTypes: {
    isInReviewMode: {
      control: 'boolean',
      description: 'Toggle review mode',
    },
    isVideoPlaying: {
      control: 'boolean',
      description: 'Toggle video playing state',
    },
    isLooping: {
      control: 'boolean',
      description: 'Toggle sentence looping',
    },
    isBreakingDown: {
      control: 'boolean',
      description: 'Toggle sentence breakdown loading state',
    },
    isMasterPlay: {
      control: 'boolean',
      description: 'Toggle if this sentence is currently being played',
    },
    reviewState: {
      control: 'radio',
      options: ['not-review', 'pending', 'due'],
      description: 'Review state of the transcript item',
    },
    loopTranscriptState: {
      table: { disable: true },
    },
    isBreakingDownSentenceArrState: {
      table: { disable: true },
    },
    masterPlay: {
      table: { disable: true },
    },
    contentItem: {
      table: { disable: true },
    },
  },
  render: (args) => {
    // Map boolean toggles to actual array values
    const loopTranscriptState = args.isLooping ? [args.contentItem] : [];
    const isBreakingDownSentenceArrState = args.isBreakingDown
      ? [args.contentItem.id]
      : [];
    const masterPlay = args.isMasterPlay ? args.contentItem.id : null;

    // Construct contentItem based on review state
    let contentItem = mockJapaneseContentItem;
    if (args.reviewState === 'pending') {
      contentItem = {
        ...mockJapaneseContentItem,
        isDue: false,
        reviewData: {
          due: new Date('2027-01-01'), // Future date
          stability: 1,
          difficulty: 5,
          elapsed_days: 0,
          scheduled_days: 1,
          reps: 1,
          lapses: 0,
          state: State.Review,
          last_review: new Date('2026-01-15'),
        },
      };
    } else if (args.reviewState === 'due') {
      contentItem = {
        ...mockJapaneseContentItem,
        isDue: true,
        reviewData: {
          due: new Date('2026-01-01'), // Past date
          stability: 1,
          difficulty: 5,
          elapsed_days: 5,
          scheduled_days: 1,
          reps: 1,
          lapses: 0,
          state: State.Review,
          last_review: new Date('2025-12-31'),
        },
      };
    }

    return (
      <div className='space-y-4'>
        <div className='p-4 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700'>
          <h3 className='font-bold mb-3 text-lg'>Current State</h3>
          <div className='grid grid-cols-3 gap-2 text-sm'>
            <div className='flex items-center gap-2'>
              <span
                className={`w-3 h-3 rounded-full ${
                  args.isInReviewMode ? 'bg-green-500' : 'bg-gray-400'
                }`}
              />
              <span>Review Mode</span>
            </div>
            <div className='flex items-center gap-2'>
              <span
                className={`w-3 h-3 rounded-full ${
                  args.isVideoPlaying ? 'bg-green-500' : 'bg-gray-400'
                }`}
              />
              <span>Video Playing</span>
            </div>
            <div className='flex items-center gap-2'>
              <span
                className={`w-3 h-3 rounded-full ${
                  args.isLooping ? 'bg-green-500' : 'bg-gray-400'
                }`}
              />
              <span>Looping</span>
            </div>
            <div className='flex items-center gap-2'>
              <span
                className={`w-3 h-3 rounded-full ${
                  args.isBreakingDown
                    ? 'bg-yellow-500 animate-pulse'
                    : 'bg-gray-400'
                }`}
              />
              <span>Breaking Down</span>
            </div>
            <div className='flex items-center gap-2'>
              <span
                className={`w-3 h-3 rounded-full ${
                  args.isMasterPlay ? 'bg-purple-500' : 'bg-gray-400'
                }`}
              />
              <span>Master Play</span>
            </div>
            <div className='flex items-center gap-2'>
              <span
                className={`w-3 h-3 rounded-full ${
                  args.reviewState === 'not-review'
                    ? 'bg-gray-400'
                    : args.reviewState === 'pending'
                      ? 'bg-blue-500'
                      : 'bg-red-500'
                }`}
              />
              <span>
                Review:{' '}
                {args.reviewState === 'not-review'
                  ? 'None'
                  : args.reviewState === 'pending'
                    ? 'Pending'
                    : 'Due'}
              </span>
            </div>
          </div>
        </div>
        <MockTranscriptItemWrapper
          contentItem={contentItem}
          isInReviewMode={args.isInReviewMode}
          isVideoPlaying={args.isVideoPlaying}
          loopTranscriptState={loopTranscriptState}
          isBreakingDownSentenceArrState={isBreakingDownSentenceArrState}
          masterPlay={masterPlay}
        />
      </div>
    );
  },
};
