import type { Snippet } from '@/app/types/content-types';
import type { OverlappingSnippetData } from '@/app/types/shared-types';

export const baseSnippetJapanese: Snippet = {
  id: 'snippet-review-story-001',
  baseLang: 'How are you? I hope things are going well lately.',
  targetLang: 'お元気ですか？最近はうまくいっていますか。',
  time: 4,
  suggestedFocusText: 'お元気ですか',
  isContracted: false,
};

export const baseSnippetChinese: Snippet = {
  id: 'snippet-review-story-002',
  baseLang: 'How are you? I hope things are going well lately.',
  targetLang: '你最近怎么样？希望一切都顺利。',
  time: 4,
  suggestedFocusText: '最近怎么样',
  isContracted: false,
};

export const baseOverlappingSnippetContentJapanese = {
  targetLang:
    'やっぱり他の党も無視できなくなってくるしそして当時は政界再編のときで8党連立政権だったんですけどだから必ずしも最大政党じゃなくても',
  baseLang:
    "Other parties can no longer be ignored, and at the time, political reform was underway.It was an eight-party coalition government, so it didn't necessarily have to be the largest party.",
  suggestedFocusText: '再編のとき8党連立政権だった',
};

export const baseOverlappingSnippetContentChinese = {
  targetLang:
    '其他政党也越来越不能忽视，当时正值政治重组时期，是八党联合政府，所以不一定必须是最大政党',
  baseLang:
    "Other parties can no longer be ignored, and at the time, political reform was underway. It was an eight-party coalition government, so it didn't necessarily have to be the largest party.",
  suggestedFocusText: '八党联合政府',
};

export const mockOverlappingSnippetDataMemoisedJapanese: OverlappingSnippetData[] =
  [
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
      targetLang:
        '8党連立政権だったんですけどだから必ずしも最大政党じゃなくても',
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

export const mockOverlappingSnippetDataMemoisedChinese: OverlappingSnippetData[] =
  [
    {
      id: '2f5e7b1a-9a9a-4a0a-9b3c-3b2e1c4c9b21',
      start: 98,
      end: 106,
      percentageOverlap: 21.35,
      targetLang: '其他政党也越来越不能忽视，当时正值政治重组时期',
      startPoint: 78.65,
      sentenceSeconds: [],
      overlappedSeconds: [],
      vocab: [
        {
          meaning: 'other parties',
          surfaceForm: '其他政党',
        },
        {
          meaning: 'also',
          surfaceForm: '也',
        },
        {
          meaning: 'increasingly',
          surfaceForm: '越来越',
        },
        {
          meaning: 'cannot be ignored',
          surfaceForm: '不能忽视',
        },
        {
          meaning: 'at that time',
          surfaceForm: '当时',
        },
        {
          meaning: 'political reorganization',
          surfaceForm: '政治重组',
        },
        {
          meaning: 'period',
          surfaceForm: '时期',
        },
      ],
    },
    {
      id: '4a8b9a0f-3c5c-4d6f-8a5b-1c2d3e4f5a6b',
      start: 106,
      end: 111,
      percentageOverlap: 25.84,
      targetLang: '是八党联合政府，所以不一定必须是最大政党',
      startPoint: 0,
      sentenceSeconds: [],
      overlappedSeconds: [],
      vocab: [
        {
          meaning: 'eight-party coalition government',
          surfaceForm: '八党联合政府',
        },
        {
          meaning: 'therefore',
          surfaceForm: '所以',
        },
        {
          meaning: 'not necessarily',
          surfaceForm: '不一定',
        },
        {
          meaning: 'must be',
          surfaceForm: '必须',
        },
        {
          meaning: 'largest party',
          surfaceForm: '最大政党',
        },
      ],
    },
  ];

export const testSquashedOverlappingSnippetDataJapanese: Snippet = {
  id: 'yah-dun-kno-snippet',
  time: 105,
  isContracted: false,
  isPreSnippet: true,
  ...baseOverlappingSnippetContentJapanese,
  vocab: [
    mockOverlappingSnippetDataMemoisedJapanese[0].vocab,
    mockOverlappingSnippetDataMemoisedJapanese[1].vocab,
  ].flat(),
};

export const testSquashedOverlappingSnippetDataChinese: Snippet = {
  id: 'yah-dun-kno-snippet-cn',
  time: 105,
  isContracted: false,
  isPreSnippet: true,
  ...baseOverlappingSnippetContentChinese,
  vocab: [
    mockOverlappingSnippetDataMemoisedChinese[0].vocab,
    mockOverlappingSnippetDataMemoisedChinese[1].vocab,
  ].flat(),
};
