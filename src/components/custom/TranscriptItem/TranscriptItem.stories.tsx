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
