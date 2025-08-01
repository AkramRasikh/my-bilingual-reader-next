function parseKanaIntoSyllables(kana: string): string[] {
  // Remove accents (') and phrase boundaries (/), and pause markers (_)
  return (
    kana
      .replace(/['/_]/g, '')
      .match(/[\u30A0-\u30FFー]+/g)
      ?.join('')
      .split('') || []
  );
}

export function mapKanaToTiming(audioQuery: any) {
  const kanaSyllables = parseKanaIntoSyllables(audioQuery.kana);
  const timings = [];
  let currentTime = 0;
  let kanaIndex = 0;

  for (const phrase of audioQuery.accent_phrases) {
    for (const mora of phrase.moras) {
      const text = mora.text;
      const duration = (mora.consonant_length || 0) + (mora.vowel_length || 0);
      const start = currentTime;
      const end = currentTime + duration;

      timings.push({
        kana: kanaSyllables[kanaIndex] || text, // fallback in case of mismatch
        start: parseFloat(start.toFixed(3)),
        end: parseFloat(end.toFixed(3)),
      });

      currentTime = end;
      kanaIndex++;
    }

    if (phrase.pause_mora) {
      currentTime += phrase.pause_mora.vowel_length || 0;
    }
  }

  return timings;
}
