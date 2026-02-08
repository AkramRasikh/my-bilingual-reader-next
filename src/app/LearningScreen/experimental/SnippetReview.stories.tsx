import type { Meta, StoryObj } from '@storybook/react';
import type { ReactNode } from 'react';
import { LearningScreenProvider } from '../LearningScreenProvider';
import { FetchDataContext } from '@/app/Providers/FetchDataProvider';
import type { Snippet } from '@/app/types/content-types';
import {
  buildMockFetchContextJapanese,
  mockSelectedContentJapanese,
} from '../LearningScreen.stories.mocks';
import SnippetReview from './SnippetReview';

const MockFetchProvider = ({ children }: { children: ReactNode }) => (
  <FetchDataContext.Provider
    value={buildMockFetchContextJapanese(mockSelectedContentJapanese)}
  >
    {children}
  </FetchDataContext.Provider>
);

interface StoryRootProps {
  snippetData: Snippet;
  isVideoPlaying?: boolean;
  threeSecondLoopState?: number | null;
  isReadyForQuickReview?: boolean;
}

const SnippetReviewStoryRoot = ({
  snippetData,
  isVideoPlaying = false,
  threeSecondLoopState = null,
  isReadyForQuickReview = false,
}: StoryRootProps) => (
  <MockFetchProvider>
    <LearningScreenProvider
      selectedContentStateMemoized={mockSelectedContentJapanese}
    >
      <div className='max-w-3xl p-4'>
        <SnippetReview
          snippetData={snippetData}
          handleLoopHere={({ time, isContracted }) => {
            console.log('Loop here', { time, isContracted });
          }}
          isVideoPlaying={isVideoPlaying}
          threeSecondLoopState={threeSecondLoopState}
          handleUpdateSnippetComprehensiveReview={async ({
            snippetData: updatedSnippet,
            isRemoveReview,
          }) => {
            console.log('Update snippet review', {
              updatedSnippet,
              isRemoveReview,
            });
          }}
          isReadyForQuickReview={isReadyForQuickReview}
        />
      </div>
    </LearningScreenProvider>
  </MockFetchProvider>
);

const baseSnippet: Snippet = {
  id: 'snippet-review-story-001',
  baseLang: 'How are you? I hope things are going well lately.',
  targetLang: 'お元気ですか？最近はうまくいっていますか。',
  time: 4,
  suggestedFocusText: 'お元気ですか',
  isContracted: false,
};

const mockJapanseseSnippet = {
  id: 'd7352814-64f0-4ada-88d7-8ecbd6789149',
  start: 488,
  end: 491,
  percentageOverlap: 10.95,
  targetLang: 'もちろんレアアースの禁輸なんて中国やるべきじゃないですよ',
  startPoint: 89.05,
  vocab: [
    {
      meaning: 'of course',
      surfaceForm: 'もちろん',
    },
    {
      meaning: 'rare earth',
      surfaceForm: 'レアアース',
    },
    {
      meaning: 'of',
      surfaceForm: 'の',
    },
    {
      meaning: 'export ban',
      surfaceForm: '禁輸',
    },
    {
      meaning: 'such as',
      surfaceForm: 'なんて',
    },
    {
      meaning: 'China',
      surfaceForm: '中国',
    },
    {
      meaning: 'to do',
      surfaceForm: 'やる',
    },
    {
      meaning: 'should',
      surfaceForm: 'べき',
    },
    {
      meaning: 'is not',
      surfaceForm: 'じゃない',
    },
    {
      meaning: 'you know',
      surfaceForm: 'ですよ',
    },
  ],
  sentenceStructure:
    'もちろん (of course) + レアアース (rare earth) + の (of) + 禁輸 (export ban) + なんて (such as) + 中国 (China) + やる (to do) + べき (should) + じゃない (is not) + ですよ (you know)',
  suggestedFocusText: '禁輸なんて中国やるべき',
  snippetId: '5114eb0e-e1e3-415d-bf17-f57bd537b0b7',
  time: 492.171405,
  isContracted: false,
  isPreSnippet: true,
  hasReview: true,
  reviewData: {
    difficulty: 7.17982408,
    due: '2026-02-07T05:00:00.000Z',
    ease: 2.5,
    elapsed_days: 2,
    interval: 0,
    lapses: 0,
    last_review: '2026-01-30T17:10:18.693Z',
    reps: 5,
    scheduled_days: 8,
    stability: 11.59421085,
    state: 2,
  },
};

const baseOverlappingSnippetContent = {
  targetLang:
    'やっぱり他の党も無視できなくなってくるしそして当時は政界再編のときで8党連立政権だったんですけどだから必ずしも最大政党じゃなくても',
  baseLang:
    "Other parties can no longer be ignored, and at the time, political reform was underway.It was an eight-party coalition government, so it didn't necessarily have to be the largest party.",
  suggestedFocusText: '再編のとき8党連立政権だった',
};

const mockOverlappingSnippetDataMemoised = [
  {
    id: '24482f68-b0cb-492f-8c97-144bf1543a91',
    start: 98,
    end: 106,
    percentageOverlap: 21.35,
    targetLang:
      'やっぱり他の党も無視できなくなってくるしそして当時は政界再編のときで',
    startPoint: 78.65,
    sentenceSeconds: [],
    overlappedSeconds: [],
    vocab: [
      {
        meaning: 'after all',
        surfaceForm: 'やっぱり',
      },
      {
        meaning: 'other parties',
        surfaceForm: '他の党',
      },
      {
        meaning: 'also',
        surfaceForm: 'も',
      },
      {
        meaning: 'can no longer be ignored',
        surfaceForm: '無視できなくなってくる',
      },
      {
        meaning: 'and',
        surfaceForm: 'し',
      },
      {
        meaning: 'and then',
        surfaceForm: 'そして',
      },
      {
        meaning: 'at that time',
        surfaceForm: '当時',
      },
      {
        meaning: 'marks the topic',
        surfaceForm: 'は',
      },
      {
        meaning: 'political reorganization',
        surfaceForm: '政界再編',
      },
      {
        meaning: 'of',
        surfaceForm: 'の',
      },
      {
        meaning: 'time',
        surfaceForm: 'とき',
      },
      {
        meaning: 'is',
        surfaceForm: 'で',
      },
    ],
  },
  {
    id: '1ac5dd91-0934-4d68-9bc8-94c23287c8f1',
    start: 106,
    end: 111,
    percentageOverlap: 25.84,
    targetLang: '8党連立政権だったんですけどだから必ずしも最大政党じゃなくても',
    startPoint: 0,
    sentenceSeconds: [],
    overlappedSeconds: [],
    vocab: [
      {
        meaning: '8-party coalition government',
        surfaceForm: '8党連立政権',
      },
      {
        meaning: 'it was, but',
        surfaceForm: 'だったんですけど',
      },
      {
        meaning: 'therefore',
        surfaceForm: 'だから',
      },
      {
        meaning: 'not necessarily',
        surfaceForm: '必ずしも',
      },
      {
        meaning: 'largest party',
        surfaceForm: '最大政党',
      },
      {
        meaning: "even if (it's) not",
        surfaceForm: 'じゃなくても',
      },
    ],
  },
];

const testSquashedOverlappingSnippetData = {
  id: 'yah-dun-kno-snippet',
  time: 105,
  isContracted: false,
  isPreSnippet: true,
  ...baseOverlappingSnippetContent,
  vocab: [
    mockOverlappingSnippetDataMemoised[0].vocab,
    mockOverlappingSnippetDataMemoised[1].vocab,
  ].flat(),
};

const meta = {
  title: 'LearningScreen/SnippetReview',
  component: SnippetReviewStoryRoot,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof SnippetReviewStoryRoot>;

export default meta;

type Story = StoryObj<typeof meta>;

export const PreSnippet: Story = {
  args: {
    snippetData: {
      ...baseSnippet,
    },
  },
};

export const FinalizedSnippet: Story = {
  args: {
    snippetData: {
      ...testSquashedOverlappingSnippetData,
    },
    isReadyForQuickReview: true,
  },
};
