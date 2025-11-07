const kanjiRegex = /[\u4E00-\u9FFF\u3400-\u4DBF]/g;

/**
 * Returns an array of all the kanji characters within the string
 */
export function extractKanji(str: string): string[] {
  const matches = str.match(kanjiRegex);
  return matches ? matches : [];
}
