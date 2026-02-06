import { ContentTypes } from '../types/content-types';
import { FetchDataContextTypes } from '../Providers/FetchDataProvider';
import { LanguageEnum } from '../languages';

export const mockSelectedContentJapanese: ContentTypes & { contentIndex: number } = {
  id: 'content-story-001',
  title: 'Learning Screen Story (Japanese)',
  contentIndex: 0,
  createdAt: new Date('2026-01-01'),
  hasAudio: true,
  url: 'https://example.com/story',
  content: [
    {
      id: 'sentence-1',
      baseLang: 'Hello world, it is a bright morning today.',
      targetLang: 'こんにちは世界、今日は明るい朝ですね。',
      time: 0,
    },
    {
      id: 'sentence-2',
      baseLang: 'How are you? I hope things are going well lately.',
      targetLang: 'お元気ですか？最近はうまくいっていますか。',
      time: 4,
    },
    {
      id: 'sentence-3',
      baseLang: 'Nice to meet you. I have been looking forward to this.',
      targetLang: 'はじめまして。お会いできるのを楽しみにしていました。',
      time: 8,
    },
    {
      id: 'sentence-4',
      baseLang: 'See you later, friend! Let us catch up again soon.',
      targetLang: 'またね、友達！近いうちにまた話そう。',
      time: 12,
    },
  ],
  snippets: [],
};

export const mockSelectedContentArabic: ContentTypes & { contentIndex: number } = {
  id: 'content-story-002',
  title: 'Learning Screen Story (Arabic)',
  contentIndex: 0,
  createdAt: new Date('2026-01-01'),
  hasAudio: true,
  url: 'https://example.com/story-ar',
  content: [
    {
      id: 'sentence-ar-1',
      baseLang: 'Hello world, it is a bright morning today.',
      targetLang: 'مرحبا بالعالم، هذا صباح مشرق اليوم.',
      time: 0,
    },
    {
      id: 'sentence-ar-2',
      baseLang: 'How are you? I hope things are going well lately.',
      targetLang: 'كيف حالك؟ آمل أن تسير الأمور على ما يرام مؤخرا.',
      time: 4,
    },
    {
      id: 'sentence-ar-3',
      baseLang: 'Nice to meet you. I have been looking forward to this.',
      targetLang: 'سعيد بلقائك. كنت أتطلع إلى هذا اللقاء.',
      time: 8,
    },
    {
      id: 'sentence-ar-4',
      baseLang: 'See you later, friend! Let us catch up again soon.',
      targetLang: 'أراك لاحقا يا صديقي! دعنا نتحدث مجددا قريبا.',
      time: 12,
    },
  ],
  snippets: [],
};

export const mockSelectedContentChinese: ContentTypes & { contentIndex: number } = {
  id: 'content-story-003',
  title: 'Learning Screen Story (Chinese)',
  contentIndex: 0,
  createdAt: new Date('2026-01-01'),
  hasAudio: true,
  url: 'https://example.com/story-zh',
  content: [
    {
      id: 'sentence-zh-1',
      baseLang: 'Hello world, it is a bright morning today.',
      targetLang: '你好，世界，今天是个明亮的早晨。',
      time: 0,
    },
    {
      id: 'sentence-zh-2',
      baseLang: 'How are you? I hope things are going well lately.',
      targetLang: '你好吗？希望你最近一切顺利。',
      time: 4,
    },
    {
      id: 'sentence-zh-3',
      baseLang: 'Nice to meet you. I have been looking forward to this.',
      targetLang: '很高兴见到你。我一直期待这次见面。',
      time: 8,
    },
    {
      id: 'sentence-zh-4',
      baseLang: 'See you later, friend! Let us catch up again soon.',
      targetLang: '回头见，朋友！我们很快再聊。',
      time: 12,
    },
  ],
  snippets: [],
};

export const mockSelectedContentFrench: ContentTypes & { contentIndex: number } = {
  id: 'content-story-004',
  title: 'Learning Screen Story (French)',
  contentIndex: 0,
  createdAt: new Date('2026-01-01'),
  hasAudio: true,
  url: 'https://example.com/story-fr',
  content: [
    {
      id: 'sentence-fr-1',
      baseLang: 'Hello world, it is a bright morning today.',
      targetLang: "Bonjour le monde, ce matin est lumineux aujourd'hui.",
      time: 0,
    },
    {
      id: 'sentence-fr-2',
      baseLang: 'How are you? I hope things are going well lately.',
      targetLang: "Comment ca va ? J'espere que tout se passe bien en ce moment.",
      time: 4,
    },
    {
      id: 'sentence-fr-3',
      baseLang: 'Nice to meet you. I have been looking forward to this.',
      targetLang: "Ravi de te rencontrer. J'attendais cette rencontre.",
      time: 8,
    },
    {
      id: 'sentence-fr-4',
      baseLang: 'See you later, friend! Let us catch up again soon.',
      targetLang: 'A plus tard, mon ami ! On se retrouve bientot.',
      time: 12,
    },
  ],
  snippets: [],
};

const buildMockFetchContextBase = (
  content: ContentTypes & { contentIndex: number },
  languageSelectedState: LanguageEnum,
): FetchDataContextTypes => ({
  languageSelectedState,
  setLanguageSelectedState: () => {},
  pureWordsMemoized: [],
  contentState: [content],
  sentencesState: [],
  wordsState: [],
  hasFetchedDataState: true,
  dispatchSentences: () => {},
  dispatchContent: () => {},
  dispatchWords: () => {},
  wordsForReviewMemoized: [],
  sentencesDueForReviewMemoized: [],
  breakdownSentence: async () => {},
  sentenceReviewBulk: async () => {},
  updateContentMetaData: () => {},
  toastMessageState: '',
  setToastMessageState: () => {},
  handleSaveWord: async () => {},
  handleDeleteWordDataProvider: async () => true,
  updateWordDataProvider: () => {},
  updateSentenceData: () => false,
  wordsToReviewOnMountState: 0,
  addImageDataProvider: () => {},
  wordsToReviewGivenOriginalContextId: {},
  deleteContent: () => {},
  deleteVideo: async () => false,
  handleSaveSnippetFetchProvider: async () => {},
  handleDeleteSnippetFetchProvider: async () => {},
});

export const buildMockFetchContextJapanese = (
  content: ContentTypes & { contentIndex: number },
): FetchDataContextTypes =>
  buildMockFetchContextBase(content, LanguageEnum.Japanese);

export const buildMockFetchContextArabic = (
  content: ContentTypes & { contentIndex: number },
): FetchDataContextTypes =>
  buildMockFetchContextBase(content, LanguageEnum.Arabic);

export const buildMockFetchContextChinese = (
  content: ContentTypes & { contentIndex: number },
): FetchDataContextTypes =>
  buildMockFetchContextBase(content, LanguageEnum.Chinese);

export const buildMockFetchContextFrench = (
  content: ContentTypes & { contentIndex: number },
): FetchDataContextTypes =>
  buildMockFetchContextBase(content, LanguageEnum.French);
