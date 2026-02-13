import type { Meta, StoryObj } from '@storybook/react';
import type { ReactNode } from 'react';
import SnippetReviewChinese from './SnippetReviewChinese';
import { LearningScreenProvider } from '../LearningScreenProvider';
import { FetchDataContext } from '@/app/Providers/FetchDataProvider';
import type { FetchDataContextTypes } from '@/app/Providers/FetchDataProvider';
import { content } from '@/app/Providers/useFetchInitData';

// Mock data
const mockSnippets = [
  // ...existing mockSnippets...
  {
    baseLang: 'Thank youSeeing the audience at Washasuch enthusiastic applause',
    id: '8fc5bcab-1fb4-4be2-b0ab-c535961546d7',
    isContracted: false,
    isPreSnippet: true,
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
    suggestedFocusText: '看到瓦舍观众这么热情',
    targetLang: '谢谢看到瓦舍观众这么热情的鼓掌',
    time: 100.750102,
    vocab: [
      {
        surfaceForm: '谢谢',
        meaning: 'n/a',
        sentenceId: '3c83f8ce-7afd-4385-88b9-6bd7a1c0d9a1',
      },
      {
        surfaceForm: '看到瓦舍观众',
        meaning: 'n/a',
        sentenceId: '67607a90-5774-4b57-bb7a-f326e47fcb77',
      },
      {
        surfaceForm: '这么热情的鼓掌',
        meaning: 'n/a',
        sentenceId: '223f3bc9-8dfa-4a9c-b018-70fc748c427e',
      },
    ],
  },
  {
    baseLang: 'Teacher FengYou fucking gave me back my childhood',
    focusedText: '你他妈把我童年还',
    id: 'aa4d77e9-ebe5-4120-8bc1-abe5f76e1678',
    isContracted: false,
    isPreSnippet: false,
    reviewData: {
      difficulty: 8.41753986,
      due: '2026-02-13T05:00:00.000Z',
      ease: 2.5,
      elapsed_days: 2,
      interval: 0,
      lapses: 0,
      last_review: '2026-02-10T10:17:27.837Z',
      reps: 6,
      scheduled_days: 3,
      stability: 4.87460904,
      state: 2,
    },
    suggestedFocusText: '你他妈把',
    targetLang: '冯老师你他妈把我童年还来',
    time: 72.849603,
    vocab: [
      {
        surfaceForm: '冯老师',
        meaning: 'n/a',
        sentenceId: '355e307d-7d02-42e5-914f-2bb855016d48',
      },
      {
        meaning: 'you',
        surfaceForm: '你',
      },
      {
        meaning: "vulgar intensifier, similar to 'damn' or 'fucking'",
        surfaceForm: '他妈',
      },
      {
        meaning: 'grammatical particle indicating a disposal construction',
        surfaceForm: '把',
      },
      {
        meaning: 'my',
        surfaceForm: '我',
      },
      {
        meaning: 'childhood',
        surfaceForm: '童年',
      },
      {
        meaning: 'return (it) to me',
        surfaceForm: '还来',
      },
    ],
  },
  {
    baseLang: "Today I'll sing you aA tongue twister, okay?",
    focusedText: '段数来宝绕口令好不好',
    id: 'c0f3a3ec-afc2-4b45-a7c7-354c9000fdb6',
    isContracted: true,
    reviewData: {
      difficulty: 8.33753767,
      due: '2026-02-13T05:00:00.000Z',
      ease: 2.5,
      elapsed_days: 1,
      interval: 0,
      lapses: 0,
      last_review: '2026-02-10T10:17:43.811Z',
      reps: 6,
      scheduled_days: 3,
      stability: 4.11038388,
      state: 2,
    },
    suggestedFocusText: '数来宝绕',
    targetLang: '今天我给大家唱段数来宝绕口令好不好？',
    time: 93.725754,
    vocab: [
      {
        meaning: 'today',
        surfaceForm: '今天',
      },
      {
        meaning: 'I, me',
        surfaceForm: '我',
      },
      {
        meaning: 'for, to',
        surfaceForm: '给',
      },
      {
        meaning: 'everyone, all',
        surfaceForm: '大家',
      },
      {
        meaning: 'sing',
        surfaceForm: '唱',
      },
      {
        meaning:
          'a section, a piece (often used for performances like singing or storytelling)',
        surfaceForm: '段',
      },
      {
        meaning:
          'a traditional Chinese folk art form involving rhythmic storytelling or singing, often with bamboo clappers',
        surfaceForm: '数来宝',
      },
      {
        meaning: 'tongue twister',
        surfaceForm: '绕口令',
      },
      {
        meaning: 'good',
        surfaceForm: '好',
      },
      {
        meaning: 'not good, bad',
        surfaceForm: '不好',
      },
      {
        meaning: 'question mark',
        surfaceForm: '？',
      },
    ],
  },
];

const mockSnippetNoVocab = {
  baseLang: "Today I'll sing you aA tongue twister, okay?",
  id: 'c0f3a3ec-afc2-4b45-a7c7-354c9000fdb6',
  isPreSnippet: true,
  isContracted: true,
  reviewData: {
    difficulty: 8.33753767,
    due: '2026-02-13T05:00:00.000Z',
    ease: 2.5,
    elapsed_days: 1,
    interval: 0,
    lapses: 0,
    last_review: '2026-02-10T10:17:43.811Z',
    reps: 6,
    scheduled_days: 3,
    stability: 4.11038388,
    state: 2,
  },
  suggestedFocusText: '数来宝绕',
  targetLang: '今天我给大家唱段数来宝绕口令好不好？',
  time: 93.725754,
  vocab: [
    {
      meaning: 'n/a',
      surfaceForm: '今天我给大家唱段数来宝绕口令好不好？',
    },
  ],
};

const mockSnippetPartiallyBrokenDown = {
  baseLang: "Today I'll sing you aA tongue twister, okay?",
  id: 'c0f3a3ec-afc2-4b45-a7c7-354c9000fdb6',
  isPreSnippet: true,
  isContracted: true,
  reviewData: {
    difficulty: 8.33753767,
    due: '2026-02-13T05:00:00.000Z',
    ease: 2.5,
    elapsed_days: 1,
    interval: 0,
    lapses: 0,
    last_review: '2026-02-10T10:17:43.811Z',
    reps: 6,
    scheduled_days: 3,
    stability: 4.11038388,
    state: 2,
  },
  suggestedFocusText: '数来宝绕',
  targetLang: '今天我给大家唱段数来宝绕口令好不好？',
  time: 93.725754,
  vocab: [
    {
      meaning: 'n/a',
      surfaceForm: '今天我给大家唱段',
    },
    {
      meaning:
        'a traditional Chinese folk art form involving rhythmic storytelling or singing, often with bamboo clappers',
      surfaceForm: '数来宝',
    },
    {
      meaning: 'tongue twister',
      surfaceForm: '绕口令',
    },
    {
      meaning: 'good',
      surfaceForm: '好',
    },
    {
      meaning: 'not good, bad',
      surfaceForm: '不好',
    },
    {
      meaning: 'question mark',
      surfaceForm: '？',
    },
  ],
};

// Minimal mock fetch context for Chinese
const mockFetchContextChinese: FetchDataContextTypes = {
  languageSelectedState: 'chinese',
  wordsState: [],
  handleSaveWord: async () => {},
  handleDeleteWordDataProvider: async () => {},
  // ...add any other required fields for your component
};

const mockSelectedContentChinese = {
  id: 'mock-content-id',
  title: 'Mock Chinese Content',
  // Add fields to match SnippetReview.stories.tsx
  contentType: 'video',
  content: [
    {
      baseLang: 'Seeing the audience at Washa',
      id: '67607a90-5774-4b57-bb7a-f326e47fcb77',
      reviewData: {
        difficulty: 5.21822519,
        due: '2026-02-17T05:00:00.000Z',
        ease: 2.5,
        elapsed_days: 2,
        interval: 0,
        lapses: 0,
        last_review: '2026-02-12T14:20:47.456Z',
        reps: 4,
        scheduled_days: 5,
        stability: 20.53586152,
        state: 2,
      },
      targetLang: '看到瓦舍观众',
      time: 100,
    },
    {
      baseLang: 'such enthusiastic applause',
      id: '223f3bc9-8dfa-4a9c-b018-70fc748c427e',
      reviewData: {
        difficulty: 5.23249611,
        due: '2026-02-14T05:00:00.000Z',
        ease: 2.5,
        elapsed_days: 2,
        interval: 0,
        lapses: 0,
        last_review: '2026-02-10T10:20:33.593Z',
        reps: 3,
        scheduled_days: 4,
        stability: 16.76097946,
        state: 2,
      },
      targetLang: '这么热情的鼓掌',
      time: 101,
    },
    {
      baseLang: 'such a warm reaction',
      id: 'b95274cf-fe44-4cb8-9195-babe5f828754',
      targetLang: '这么热烈的反应',
      time: 103,
    },
    {
      baseLang: 'I could tell',
      id: '0c62b37d-889f-41ce-a9f4-b924724cae69',
      targetLang: '我就能看出来',
      time: 105,
    },
    {
      baseLang: " What do you see? You're so naive",
      id: '3ab9735c-8a80-4ca9-b12d-dd50b22a4555',
      meaning:
        "What do you see? You haven't seen the world (i.e., you lack experience or sophistication).",
      reviewData: {
        difficulty: 5.23249611,
        due: '2026-02-14T05:00:00.000Z',
        ease: 2.5,
        elapsed_days: 2,
        interval: 0,
        lapses: 0,
        last_review: '2026-02-10T10:20:39.796Z',
        reps: 3,
        scheduled_days: 4,
        stability: 16.76097946,
        state: 2,
      },
      sentenceStructure:
        '看出 (to perceive) + 什么 (what) + ? (question mark) + 没 (have not) + 见过 (have seen) + 世面 (the world)',
      targetLang: '看出什么?没见过世面',
      time: 106,
      vocab: [
        {
          meaning: 'to perceive, to see, to discern',
          surfaceForm: '看出',
        },
        {
          meaning: 'what',
          surfaceForm: '什么',
        },
        {
          meaning: 'question mark',
          surfaceForm: '?',
        },
        {
          meaning: 'not, have not',
          surfaceForm: '没',
        },
        {
          meaning: 'have seen, have experienced',
          surfaceForm: '见过',
        },
        {
          meaning: 'the world, experience, sophistication',
          surfaceForm: '世面',
        },
      ],
    },
    {
      baseLang: 'Hey',
      id: '91883d84-eb51-46d0-a437-5fc14a70f37e',
      targetLang: '欸',
      time: 109,
    },
    {
      baseLang: 'This "Fox Talk"',
      id: '1330dc28-5a6c-4ab7-81a3-a2572b4ae653',
      reviewData: {
        difficulty: 5.23249611,
        due: '2026-02-14T05:00:00.000Z',
        ease: 2.5,
        elapsed_days: 2,
        interval: 0,
        lapses: 0,
        last_review: '2026-02-10T10:20:43.994Z',
        reps: 3,
        scheduled_days: 4,
        stability: 16.76097946,
        state: 2,
      },
      targetLang: '这场《狐说》',
      time: 110,
    },
    {
      baseLang: "Don't come up here and talk nonsense, okay?",
      id: '75c1b999-c24d-46ef-b1fe-fb3edbd50960',
      reviewData: {
        difficulty: 5.21822519,
        due: '2026-02-17T05:00:00.000Z',
        ease: 2.5,
        elapsed_days: 2,
        interval: 0,
        lapses: 0,
        last_review: '2026-02-12T14:20:57.363Z',
        reps: 4,
        scheduled_days: 5,
        stability: 20.53586152,
        state: 2,
      },
      targetLang: '你可别上来胡说行吧',
      time: 111,
    },
    {
      baseLang: 'You',
      id: '21e6f55f-aa09-4d0a-ab2a-f78fc8ce738c',
      targetLang: '就你',
      time: 113,
    },
    {
      baseLang: 'want to',
      id: '8220b611-c651-4317-a14f-ccad192d03e4',
      targetLang: '想在我面前',
      time: 115,
    },
    {
      baseLang: 'sing a tongue twister in front of me?',
      id: '2874f840-d45b-4674-b058-d11fe40be653',
      reviewData: {
        difficulty: 5.21822519,
        due: '2026-02-17T05:00:00.000Z',
        ease: 2.5,
        elapsed_days: 2,
        interval: 0,
        lapses: 0,
        last_review: '2026-02-12T14:21:04.269Z',
        reps: 4,
        scheduled_days: 5,
        stability: 20.53586152,
        state: 2,
      },
      targetLang: '唱数来宝绕口令',
      time: 116,
    },
  ],

  // Add any other fields required by LearningScreenProvider
};

const MockFetchProvider = ({
  children,
  value,
}: {
  children: ReactNode;
  value: FetchDataContextTypes;
}) => (
  <FetchDataContext.Provider value={value}>
    {children}
  </FetchDataContext.Provider>
);

const SnippetReviewChineseStoryRoot = ({
  snippetData,
}: {
  snippetData: (typeof mockSnippets)[0];
}) => (
  <MockFetchProvider value={mockFetchContextChinese}>
    <LearningScreenProvider
      selectedContentStateMemoized={mockSelectedContentChinese}
    >
      <div className='max-w-3xl p-4'>
        <SnippetReviewChinese
          snippetData={snippetData}
          handleLoopHere={() => {}}
          isVideoPlaying={false}
          threeSecondLoopState={null}
          handleUpdateSnippetComprehensiveReview={async () => {}}
          isReadyForQuickReview={true}
          handleBreakdownSentence={() => {}}
        />
      </div>
    </LearningScreenProvider>
  </MockFetchProvider>
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

export const PreSnippet: Story = {
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
