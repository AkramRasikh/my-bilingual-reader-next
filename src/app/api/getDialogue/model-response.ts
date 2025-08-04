export const perfectResponse = {
  personA: {
    chunks: [
      {
        chunk: 'あなたの提案',
        reading: 'アナタノテイアン',
      },
      {
        chunk: 'は素晴らしい',
        reading: 'ハスバラシイ',
      },
      {
        chunk: '恩恵をもたらすかもしれない',
        reading: 'オンケイオモタラスカモシレナイ',
      },
    ],
    targetLang: 'あなたの提案は素晴らしい恩恵をもたらすかもしれない。',
    baseLang: 'Your suggestion might bring great benefits.',
  },
  personB: {
    chunks: [
      {
        chunk: 'でも',
        reading: 'デモ',
      },
      {
        chunk: '誤解が生じることがある',
        reading: 'ゴカイガショウジルコトガアル',
      },
      {
        chunk: 'ので注意が必要だ',
        reading: 'ノデチュウイガヒツヨウダ',
      },
    ],
    targetLang: 'でも誤解が生じることがあるので注意が必要だ。',
    baseLang: 'But misunderstandings can arise, so we need to be careful.',
  },
  wordIds: ['d13e7b21', 'f90c2a67', 'b76de043'],
  moodPersonA: 0,
  moodPersonB: 82,
  notes:
    "In this dialogue, Person A expresses a positive view of Person B's suggestion, emphasizing the potential benefits. Person B counters with a caution about the possibility of misunderstandings, reflecting a more serious mood. The use of '恩恵' emphasizes the positive outcomes, while '誤解' highlights the potential pitfalls in communication.",
  targetLang:
    'あなたの提案は素晴らしい恩恵をもたらすかもしれない。でも誤解が生じることがあるので注意が必要だ。',
  baseLang:
    'Your suggestion might bring great benefits. But misunderstandings can arise, so we need to be careful.',
};
