export const normalizeKana = (kana: string): string => {
  if (kana === 'ハ') return 'ワ'; // special case for particle 'は'
  return kana.replace(/ヲ/g, 'オ').replace(/ウ/g, 'オ'); // Treat ウ as interchangeable with オ in phoneme alignment
};

// function normalizeKana(katakana) {
//   if (katakana === 'ハ') return 'ワ'; // special case for particle 'は'
//   return katakana
//     .replace(/ヲ/g, 'オ')
//     .replace(/ヴ/g, 'ウ')
//     .replace(/ー/g, '') // optional: retain if you want to do advanced duration mapping
//     .replace(/[。、！？・（）「」『』]/g, '') // remove Japanese punctuation
//     .replace(/\s+/g, '') // remove whitespace
//     .toUpperCase(); // in case any lowercase sneaks in
// }
