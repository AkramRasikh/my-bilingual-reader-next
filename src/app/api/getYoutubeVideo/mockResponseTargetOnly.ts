import { v4 as uuidv4 } from 'uuid';

export const mockResponseJapaneseOnly = [
  {
    start: '00:00:14,260',
    end: '00:00:20,080',
    text: '樋口　世界の歴史キュレーションプログラム コテンラジオ',
  },
  {
    start: '00:00:20,080',
    end: '00:00:23,020',
    text: '樋口　世界の歴史キュレーションプログラムコテンラジオ',
  },
  {
    start: '00:00:23,020',
    end: '00:00:26,000',
    text: 'パーソナリティの株式会社ブック代表 樋口聖典です',
  },
  {
    start: '00:00:26,000',
    end: '00:00:29,060',
    text: '深井　はい株式会社コテンの深井龍ノ介です',
  },
  {
    start: '00:00:29,060',
    end: '00:00:32,340',
    text: 'ヤンヤン　同じく株式会社コテンの楊睿之です',
  },
  {
    start: '00:00:32,340',
    end: '00:00:37,560',
    text: '樋口　このラジオは歴史を愛し歴史の面白さを知り過ぎてしまった深井さんを代表とする',
  },
  {
    start: '00:00:37,560',
    end: '00:00:39,620',
    text: '株式会社コテンのお二人と一緒に',
  },
  {
    start: '00:00:39,700',
    end: '00:00:44,580',
    text: '学校の授業ではなかなか学べない国内外の歴史の 　面白さを学んじゃおうという番組です',
  },
  {
    start: '00:00:44,580',
    end: '00:00:47,160',
    text: 'よろしくお願いします',
  },
];

export const mockPublicUrl =
  '/audio/koten-radio-saicho-kukai-enlighten-men.mp3';
export const squashedMockResponseJapaneseOnly = [
  {
    id: uuidv4(),
    time: 14,
    targetLang: '樋口世界の歴史キュレーションプログラムコテンラジオ',
  },
  {
    id: uuidv4(),
    time: 20,
    targetLang: '樋口世界の歴史キュレーションプログラムコテンラジオ',
  },
  {
    id: uuidv4(),
    time: 23,
    targetLang: 'パーソナリティの株式会社ブック代表樋口聖典です',
  },
  {
    id: uuidv4(),
    time: 26,
    targetLang: '深井はい株式会社コテンの深井龍ノ介です',
  },
  {
    id: uuidv4(),
    time: 29,
    targetLang: 'ヤンヤン同じく株式会社コテンの楊睿之です',
  },
  {
    id: uuidv4(),
    time: 32,
    targetLang:
      '樋口このラジオは歴史を愛し歴史の面白さを知り過ぎてしまった深井さんを代表とする',
  },
  {
    id: uuidv4(),
    time: 37,
    targetLang: '株式会社コテンのお二人と一緒に',
  },
  {
    id: uuidv4(),
    time: 39,
    targetLang:
      '学校の授業ではなかなか学べない国内外の歴史の面白さを学んじゃおうという番組です',
  },
  {
    id: uuidv4(),
    time: 44,
    targetLang: 'よろしくお願いします',
  },
];
