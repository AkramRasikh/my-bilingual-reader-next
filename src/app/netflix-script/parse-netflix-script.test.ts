import { LanguageEnum } from '../languages';
import {
  applyLanguageFormatting,
  parseNetflixScript,
  timeStringToSeconds,
} from './parse-netflix-script';

const SAMPLE = `Time		Subtitle		Translation
00:00:03		 ( 目覚まし の ベル )   		This production features inappropriate dialogue and smoking scenes. 
00:00:06		 ( 市郎 ( いちろう ) ) おい ! 　 起きろ 　 ブス 　 盛り の つい た メスゴリラ !   		Hey! Wake up, ugly! You female gorilla in heat! 
00:00:09		 ( 純子 ( じゅんこ ) ) 分かっ てる よ   		I got it, okay? 
00:00:11		 ( 市郎 ) 　 ブス の くせ に 　 いつ まで 寝 て ん だ よ   		You sleep too much for someone ugly! 
00:00:12		 ( 純子 ) うっせえ な 　 クソじ じい !   		Shut up, you stupid geezer. 
`;

describe('timeStringToSeconds', () => {
  it('converts HH:MM:SS to seconds', () => {
    expect(timeStringToSeconds('00:00:03')).toBe(3);
    expect(timeStringToSeconds('01:02:03')).toBe(3723);
  });
});

describe('parseNetflixScript', () => {
  it('parses tab-separated Netflix script lines', () => {
    const result = parseNetflixScript(SAMPLE);

    expect(result).toHaveLength(5);
    expect(result[0]).toEqual({
      time: 3,
      targetLang: '( 目覚まし の ベル )',
      baseLang:
        'This production features inappropriate dialogue and smoking scenes.',
    });
    expect(result[1].time).toBe(6);
    expect(result[1].targetLang).toContain('市郎');
    expect(result[1].baseLang).toBe(
      'Hey! Wake up, ugly! You female gorilla in heat!',
    );
    expect(result[4].time).toBe(12);
    expect(result[4].baseLang).toBe('Shut up, you stupid geezer.');
  });

  it('returns empty array for header-only content', () => {
    expect(parseNetflixScript('Time\tSubtitle\tTranslation\n')).toEqual([]);
  });
});

describe('applyLanguageFormatting', () => {
  it('removes spaces from targetLang for japanese and chinese', () => {
    const entries = parseNetflixScript(SAMPLE);

    const japanese = applyLanguageFormatting(
      entries,
      LanguageEnum.Japanese,
    );
    expect(japanese[0].targetLang).toBe('(目覚ましのベル)');

    const chinese = applyLanguageFormatting(entries, LanguageEnum.Chinese);
    expect(chinese[1].targetLang).not.toContain(' ');
  });

  it('leaves targetLang unchanged for non-trimmed languages', () => {
    const entries = parseNetflixScript(SAMPLE);
    const french = applyLanguageFormatting(entries, LanguageEnum.French);

    expect(french).toEqual(entries);
  });
});
