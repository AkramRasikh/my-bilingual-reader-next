import { LanguageEnum } from '../languages';
import {
  BilingualEpubEntry,
  buildChapterXhtml,
  buildEpubPreviewSrcDoc,
  escapeHtml,
  languageEnumToEpubLang,
} from './build-netflix-epub';

describe('escapeHtml', () => {
  it('escapes special characters', () => {
    expect(escapeHtml('a & b < c > d "e"')).toBe(
      'a &amp; b &lt; c &gt; d &quot;e&quot;',
    );
  });
});

describe('languageEnumToEpubLang', () => {
  it('maps app languages to BCP 47 codes', () => {
    expect(languageEnumToEpubLang(LanguageEnum.Japanese)).toBe('ja');
    expect(languageEnumToEpubLang(LanguageEnum.Chinese)).toBe('zh');
  });
});

describe('buildChapterXhtml', () => {
  const entries: BilingualEpubEntry[] = [
    { time: 9, targetLang: '分かってるよ', baseLang: 'I got it.' },
    { time: 3, targetLang: 'ベル', baseLang: 'Bell rings.' },
  ];

  it('orders by time and puts targetLang before baseLang', () => {
    const html = buildChapterXhtml(entries, 'ja');

    const bellIndex = html.indexOf('ベル');
    const gotItIndex = html.indexOf('分かってるよ');
    expect(bellIndex).toBeLessThan(gotItIndex);

    expect(html).toMatch(
      /<p class="target-lang">ベル<\/p>\s*<p class="base-lang">Bell rings\.<\/p>/,
    );
    expect(html).toMatch(
      /<p class="target-lang">分かってるよ<\/p>\s*<p class="base-lang">I got it\.<\/p>/,
    );
  });
});

describe('buildEpubPreviewSrcDoc', () => {
  it('inlines EPUB styles for iframe preview', () => {
    const doc = buildEpubPreviewSrcDoc(
      [{ time: 0, targetLang: 'こんにちは', baseLang: 'Hello' }],
      'ja',
      { limit: 0 },
    );

    expect(doc).toContain('.target-lang');
    expect(doc).toContain('こんにちは');
    expect(doc).toContain('Hello');
  });
});
