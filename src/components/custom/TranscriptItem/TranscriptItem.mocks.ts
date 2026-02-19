import { FormattedTranscriptTypes } from '@/app/types/content-types';
import { WordTypes } from '@/app/types/word-types';
import { underlineWordsInSentence } from '@/utils/sentence-formatting/underline-words-in-sentences';
import { State } from 'ts-fsrs';

export const mockHatsugenWord: WordTypes = {
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

export const mockYataiRegionWord: WordTypes = {
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

export const mockTadakhulatWord: WordTypes = {
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

export const mockLiberaleEconomieWord: WordTypes = {
  id: 'word-liberale-economie-001',
  baseForm: 'libérale de l’économie',
  surfaceForm: 'libérale de l’économie',
  definition: 'liberal vision of the economy',
  phonetic: 'li-be-ral de le-ko-no-mi',
  transliteration: 'liberale de l economie',
  contexts: ['1f7d0f92-8aa6-4a5b-9e2d-3c45b6b7f7c1'],
  originalContext:
    'Le débat entre Emmanuel Macron et Jean-Luc Mélenchon illustre la profonde division entre une vision libérale de l’économie et une approche plus sociale et interventionniste de l’État.',
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
  time: 22,
};

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

export const mockJapaneseContentItem = baseMockContentItem;

export const mockJapaneseContentItemWithBreakdown: FormattedTranscriptTypes = {
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

export const mockJapaneseContentItemWithReview: FormattedTranscriptTypes = {
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

export const mockChineseContentItem: FormattedTranscriptTypes = {
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

export const mockArabicContentItem: FormattedTranscriptTypes = {
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

export const mockArabicContentItem2: FormattedTranscriptTypes = {
  id: 'a7c3d2b1-6e4f-4a91-9c3e-2b7d8f5a9e10',
  baseLang:
    'The economic crisis in Lebanon has worsened amid political instability and growing international pressure.',
  targetLang:
    'الأزمة الاقتصادية في لبنان تفاقمت وسط عدم الاستقرار السياسي والضغوط الدولية المتزايدة.',
  time: 21,
  isDue: false,
  meaning:
    'The economic crisis in Lebanon has worsened amid political instability and growing international pressure.',
  sentenceStructure:
    'الأزمة (the crisis) + الاقتصادية (economic) + في (in) + لبنان (Lebanon) + تفاقمت (has worsened) + وسط (amid) + عدم (lack of) + الاستقرار (stability) + السياسي (political) + و (and) + الضغوط (pressures) + الدولية (international) + المتزايدة (growing) + 。 (period)',
  vocab: [
    {
      meaning: 'the crisis',
      surfaceForm: 'الأزمة',
    },
    {
      meaning: 'economic',
      surfaceForm: 'الاقتصادية',
    },
    {
      meaning: 'in',
      surfaceForm: 'في',
    },
    {
      meaning: 'Lebanon',
      surfaceForm: 'لبنان',
    },
    {
      meaning: 'has worsened',
      surfaceForm: 'تفاقمت',
    },
    {
      meaning: 'amid',
      surfaceForm: 'وسط',
    },
    {
      meaning: 'lack of',
      surfaceForm: 'عدم',
    },
    {
      meaning: 'stability',
      surfaceForm: 'الاستقرار',
    },
    {
      meaning: 'political',
      surfaceForm: 'السياسي',
    },
    {
      meaning: 'and',
      surfaceForm: 'و',
    },
    {
      meaning: 'pressures',
      surfaceForm: 'الضغوط',
    },
    {
      meaning: 'international',
      surfaceForm: 'الدولية',
    },
    {
      meaning: 'growing',
      surfaceForm: 'المتزايدة',
    },
  ],
  targetLangformatted: underlineWordsInSentence(
    'الأزمة الاقتصادية في لبنان تفاقمت وسط عدم الاستقرار السياسي والضغوط الدولية المتزايدة.',
    [],
  ),
  wordsFromSentence: [],
  helperReviewSentence: false,
};

export const mockFrenchContentItem: FormattedTranscriptTypes = {
  id: '1f7d0f92-8aa6-4a5b-9e2d-3c45b6b7f7c1',
  baseLang:
    'The debate between Emmanuel Macron and Jean-Luc Mélenchon illustrates the deep divide between a liberal vision of the economy and a more social and interventionist approach to the state.',
  targetLang:
    'Le débat entre Emmanuel Macron et Jean-Luc Mélenchon illustre la profonde division entre une vision libérale de l’économie et une approche plus sociale et interventionniste de l’État.',
  time: 22,
  isDue: false,
  meaning:
    'The debate between Emmanuel Macron and Jean-Luc Mélenchon illustrates the deep divide between a liberal vision of the economy and a more social and interventionist approach to the state.',
  sentenceStructure:
    'Le débat (the debate) + entre (between) + Emmanuel Macron (Emmanuel Macron) + et (and) + Jean-Luc Mélenchon (Jean-Luc Mélenchon) + illustre (illustrates) + la profonde division (the deep divide) + entre (between) + une vision (a vision) + libérale de l’économie (liberal vision of the economy) + et (and) + une approche (an approach) + plus sociale (more social) + et (and) + interventionniste (interventionist) + de l’État (of the state) + . (period)',
  vocab: [
    {
      meaning: 'the debate',
      surfaceForm: 'Le débat',
    },
    {
      meaning: 'between',
      surfaceForm: 'entre',
    },
    {
      meaning: 'Emmanuel Macron',
      surfaceForm: 'Emmanuel Macron',
    },
    {
      meaning: 'and',
      surfaceForm: 'et',
    },
    {
      meaning: 'Jean-Luc Melenchon',
      surfaceForm: 'Jean-Luc Mélenchon',
    },
    {
      meaning: 'illustrates',
      surfaceForm: 'illustre',
    },
    {
      meaning: 'the deep divide',
      surfaceForm: 'la profonde division',
    },
    {
      meaning: 'between',
      surfaceForm: 'entre',
    },
    {
      meaning: 'a vision',
      surfaceForm: 'une vision',
    },
    {
      meaning: 'liberal vision of the economy',
      surfaceForm: 'libérale de l’économie',
    },
    {
      meaning: 'and',
      surfaceForm: 'et',
    },
    {
      meaning: 'an approach',
      surfaceForm: 'une approche',
    },
    {
      meaning: 'more social',
      surfaceForm: 'plus sociale',
    },
    {
      meaning: 'and',
      surfaceForm: 'et',
    },
    {
      meaning: 'interventionist',
      surfaceForm: 'interventionniste',
    },
    {
      meaning: 'of the state',
      surfaceForm: 'de l’État',
    },
  ],
  targetLangformatted: underlineWordsInSentence(
    'Le débat entre Emmanuel Macron et Jean-Luc Mélenchon illustre la profonde division entre une vision libérale de l’économie et une approche plus sociale et interventionniste de l’État.',
    [mockLiberaleEconomieWord],
  ),
  wordsFromSentence: [mockLiberaleEconomieWord],
  helperReviewSentence: false,
};

export const mockOverlappingSnippetData = [
  {
    id: mockJapaneseContentItem.id,
    percentageOverlap: 30,
    startPoint: 20,
    // start: 56, //
    // end: 59, // these two arent needed at the transcript item level as the contentItem already has the time
    // targetLang: mockJapaneseContentItem.targetLang,
    // sentenceSeconds: [],
    // overlappedSeconds: [],
  },
];

export const mockOverlappingSnippetDataArabic = [
  {
    id: mockArabicContentItem.id,
    percentageOverlap: 30,
    startPoint: 8,
  },
];
